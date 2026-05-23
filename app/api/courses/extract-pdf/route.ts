import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai/claude";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const courseId = formData.get("course_id") as string;
    const lessonId = formData.get("lesson_id") as string | null;

    if (!file || !courseId) return NextResponse.json({ error: "Missing file or course_id" }, { status: 400 });

    // Convert PDF to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Send to Claude — reads text AND images
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64,
              },
            } as any,
            {
              type: "text",
              text: `עברי על כל עמוד במסמך הזה ותעתיקי את התוכן המלא שלו.
חשוב מאוד: עברי על כל העמודים עד הסוף, אל תדלגי על שום עמוד.
כללי: כל טקסט, כל כותרת, כל רשימה, כל מה שכתוב על תמונות או גרפים, כל טבלה.
ארגני לפי עמודים/סעיפים עם כותרות ברורות.
המטרה: שמירה של כל המידע כדי שניתן יהיה לכתוב תוכן שיווקי מבוסס על התוכן האמיתי.`,
            },
          ],
        },
      ],
    });

    const extractedContent = (response.content[0] as { type: string; text: string }).text;

    if (lessonId) {
      // Update specific lesson
      await supabase
        .from("course_lessons")
        .update({ transcript: extractedContent })
        .eq("id", lessonId)
        .eq("user_id", user.id);
    } else {
      // Guide-type course: create a module + lesson automatically
      const { data: mod } = await supabase
        .from("course_modules")
        .insert({ course_id: courseId, user_id: user.id, title: "תוכן המדריך", order_index: 0 })
        .select()
        .single();

      if (mod) {
        await supabase
          .from("course_lessons")
          .insert({
            module_id: mod.id,
            course_id: courseId,
            user_id: user.id,
            title: file.name.replace(".pdf", ""),
            transcript: extractedContent,
            order_index: 0,
          });
      }
    }

    return NextResponse.json({ ok: true, preview: extractedContent.slice(0, 300) });
  } catch (error) {
    console.error("PDF extract error:", error);
    return NextResponse.json({ error: "שגיאה בעיבוד ה-PDF" }, { status: 500 });
  }
}
