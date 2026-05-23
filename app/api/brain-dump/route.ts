import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai/claude";
import { createClient } from "@/lib/supabase/server";
import { AI_SYSTEM_PROMPT } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const anthropic = getAnthropicClient();
    const { text, userId } = await request.json();

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: AI_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `עשי Brain Dump analysis לטקסט הבא וצרי ממנו משימה מסודרת אחת (הכי עיקרית):

"${text}"

החזירי JSON בדיוק בפורמט הזה:
{
  "title": "כותרת קצרה וברורה למשימה",
  "description": "פירוט מה בדיוק צריך לעשות",
  "hats": ["hat_id1"],
  "urgency": 3,
  "importance": 3,
  "energy_type": "thinking",
  "estimated_minutes": 30,
  "is_strategic": false
}

hat_ids אפשריים: brides, ugc, teaching, courses, community, nonprofit, home, personal
energy_type אפשריים: filming, writing, editing, thinking, calls, bureaucracy, home, creative, technical

רק JSON, ללא טקסט נוסף.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected type");

    const jsonText = content.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const taskData = JSON.parse(jsonText);

    // Save to DB
    const supabase = await createClient();
    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        ...taskData,
        status: "todo",
        is_recurring: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Brain dump error:", error);
    return NextResponse.json({ error: "שגיאה בניתוח" }, { status: 500 });
  }
}
