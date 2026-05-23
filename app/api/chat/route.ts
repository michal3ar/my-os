import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai/claude";
import { createClient } from "@/lib/supabase/server";
import { AI_SYSTEM_PROMPT, HAT_MAP } from "@/lib/constants";

async function buildCourseContext(userId: string): Promise<string> {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", userId);

  if (!courses || courses.length === 0) return "";

  const parts: string[] = ["\n\n---\nהקורסים והמדריכים של המשתמשת (השתמשי בידע הזה לשיווק):"];

  for (const course of courses) {
    parts.push(`\n## ${course.name} (${course.type})`);
    if (course.tagline) parts.push(`סלוגן: ${course.tagline}`);
    if (course.target_audience) parts.push(`קהל יעד: ${course.target_audience}`);
    if (course.pain_points) parts.push(`כאבים שפותר: ${course.pain_points}`);
    if (course.main_outcome) parts.push(`תוצאה עיקרית: ${course.main_outcome}`);

    const { data: modules } = await supabase
      .from("course_modules")
      .select("*, lessons:course_lessons(*)")
      .eq("course_id", course.id)
      .order("order_index");

    if (modules && modules.length > 0) {
      parts.push("\nמבנה הקורס:");
      for (const mod of modules) {
        parts.push(`\n### מודול: ${mod.title}`);
        if (mod.description) parts.push(mod.description);
        const lessons = [...(mod.lessons ?? [])].sort((a, b) => a.order_index - b.order_index);
        for (const lesson of lessons) {
          parts.push(`\n#### שיעור: ${lesson.title}`);
          if (lesson.summary) parts.push(`סיכום: ${lesson.summary}`);
          if (lesson.transcript) parts.push(`תמליל:\n${lesson.transcript}`);
        }
      }
    }
  }

  parts.push("\n---");
  return parts.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const anthropic = getAnthropicClient();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { messages, openTasks } = await request.json();

    let tasksContext = "";
    if (openTasks && openTasks.length > 0) {
      const taskLines = openTasks
        .slice(0, 10)
        .map((t: { title: string; hats: string[]; urgency: number; status: string; is_strategic: boolean }) => {
          const hatNames = (t.hats as string[])
            .map((h) => HAT_MAP[h as keyof typeof HAT_MAP]?.name ?? h)
            .join(", ");
          return `- ${t.title} [${hatNames}] (עדיפות: ${t.urgency}/5${t.is_strategic ? ", אסטרטגית" : ""}${t.status === "stuck" ? " ⚠️ תקועה" : ""})`;
        })
        .join("\n");
      tasksContext = `\n\nמשימות פתוחות כרגע:\n${taskLines}`;
    }

    const courseContext = user ? await buildCourseContext(user.id) : "";

    const systemWithContext = AI_SYSTEM_PROMPT + tasksContext + courseContext;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      system: systemWithContext,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected type");

    return NextResponse.json({ reply: content.text });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "שגיאה בצ׳אט" }, { status: 500 });
  }
}
