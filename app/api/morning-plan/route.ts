import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai/claude";
import { AI_SYSTEM_PROMPT } from "@/lib/constants";
import type { DayPlan } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const anthropic = getAnthropicClient();
    const { checkin, openTasks } = await request.json();

    const energyLabels = { high: "גבוהה", medium: "בינונית", low: "נמוכה" };
    const moodLabels = { happy: "טוב", neutral: "סביר", sad: "פחות טוב", frustrated: "מתוסכלת" };

    let tasksSection = "";
    if (openTasks && openTasks.length > 0) {
      const lines = openTasks
        .map((t: { title: string; urgency: number; is_strategic: boolean; status: string; energy_type: string }) =>
          `- ${t.title} (עדיפות ${t.urgency}/5${t.is_strategic ? ", אסטרטגית" : ""}${t.status === "stuck" ? " ⚠️ תקועה" : ""}, סוג: ${t.energy_type})`
        )
        .join("\n");
      tasksSection = `\n\nמשימות פתוחות ברשימה שלי (חובה לשלב אותן בתוכנית!):\n${lines}`;
    }

    const userMessage = `
נתוני הצ'ק-אין של היום:
- לוז: ${checkin.schedule_notes || "ללא פגישות מיוחדות"}
- שעות פנויות לעבודה: ${checkin.free_hours}
- רמת אנרגיה: ${energyLabels[checkin.energy as keyof typeof energyLabels]}
- מצב רוח: ${moodLabels[checkin.mood as keyof typeof moodLabels]}
- יש משהו דחוף: ${checkin.has_urgent ? `כן — ${checkin.urgent_details}` : "לא"}${tasksSection}

תבני לי תוכנית יום ריאלית שמבוססת על המשימות הפתוחות שלי. main_tasks ו-quick_wins חייבים להיות מתוך רשימת המשימות הפתוחות שלי (או לפחות לכלול אותן). החזירי JSON בדיוק בפורמט הזה:
{
  "main_tasks": ["משימה 1", "משימה 2", "משימה 3"],
  "strategic_task": "המשימה האסטרטגית הכי חשובה — בד״כ קשורה לשיווק הקורסים",
  "quick_wins": ["פעולה קצרה 1", "פעולה קצרה 2"],
  "reminders": ["תזכורת בית/אישי 1"],
  "avoid_today": ["מה לא לעשות 1", "מה לא לעשות 2"],
  "filmed_reminder": "אם רלוונטי — תזכורת על תכנים מצולמים שממתינים, אחרת null"
}

רק JSON, ללא טקסט נוסף.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: AI_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    // Extract JSON — handle possible markdown code blocks
    const jsonText = content.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const plan: DayPlan = JSON.parse(jsonText);

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Morning plan error:", error);
    return NextResponse.json({ error: "שגיאה ביצירת תוכנית יום" }, { status: 500 });
  }
}
