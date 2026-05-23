import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/ai/claude";

function detectPlatform(url: string): "tiktok" | "instagram" | "other" {
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com") || url.includes("instagr.am")) return "instagram";
  return "other";
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, url, why_saved } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const platform = url ? detectPlatform(url) : "other";

  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 400,
    messages: [{
      role: "user",
      content: `תנתחי את ההשראה הזו וקיבעי קטגוריות ריק-JSON בלבד.

URL: ${url || "—"}
למה שמרתי: ${why_saved}

קטגוריות אפשריות: hook, filming, editing, story, reel, product, campaign, sound, cta, visual, trend

החזירי JSON תקני בלבד (ללא markdown):
{
  "categories": ["..."],
  "title": "כותרת קצרה של 5-8 מילים בעברית"
}`,
    }],
  });

  let categories: string[] = [];
  let title = "";
  try {
    const parsed = JSON.parse((response.content[0] as { text: string }).text.trim());
    categories = parsed.categories ?? [];
    title = parsed.title ?? "";
  } catch {
    categories = [];
  }

  await supabase
    .from("inspirations")
    .update({ platform, categories, title, status: "analyzed" })
    .eq("id", id)
    .eq("user_id", user.id);

  return NextResponse.json({ platform, categories, title });
}
