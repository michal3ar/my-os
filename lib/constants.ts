import type { Hat, EnergyType } from "@/types";

export const HATS: Hat[] = [
  { id: "brides", name: "כלות", color: "#E1F5EE", emoji: "💍" },
  { id: "ugc", name: "UGC ללקוחות", color: "#EEEDFE", emoji: "🎬" },
  { id: "teaching", name: "הוראת UGC", color: "#FAEEDA", emoji: "🎓" },
  { id: "courses", name: "קורסים דיגיטליים", color: "#E6F1FB", emoji: "🚀", priority: "high" },
  { id: "community", name: "קהילה / וואטסאפ", color: "#EAF3DE", emoji: "💬" },
  { id: "nonprofit", name: "עמותה", color: "#FAECE7", emoji: "🏛️", status: "closing" },
  { id: "home", name: "בית וילדים", color: "#F1EFE8", emoji: "🏠" },
  { id: "personal", name: "אישי", color: "#F1EFE8", emoji: "✨" },
];

export const HAT_MAP = Object.fromEntries(HATS.map((h) => [h.id, h]));

export const ENERGY_TYPE_LABELS: Record<EnergyType, string> = {
  filming: "צילום",
  writing: "כתיבה",
  editing: "עריכה",
  thinking: "חשיבה / תכנון",
  calls: "שיחות",
  bureaucracy: "בירוקרטיה",
  home: "בית",
  creative: "יצירתיות",
  technical: "טכני",
};

export const ENERGY_LEVEL_LABELS = {
  high: { label: "גבוהה", emoji: "⚡" },
  medium: { label: "בינונית", emoji: "🙂" },
  low: { label: "נמוכה", emoji: "🌿" },
};

export const MOOD_LABELS = {
  happy: { label: "טוב", emoji: "😊" },
  neutral: { label: "סביר", emoji: "😐" },
  sad: { label: "פחות טוב", emoji: "😔" },
  frustrated: { label: "מתוסכלת", emoji: "😤" },
};

export const STATUS_LABELS = {
  new: "חדשה",
  todo: "לביצוע",
  in_progress: "בתהליך",
  stuck: "תקועה",
  done: "הושלם",
};

export const AI_SYSTEM_PROMPT = `את עוזרת אישית חכמה בשם "מיי". את מדברת עברית, בסגנון חברותי וישיר — לא פורמלי ולא שיווקי.

את מכירה את המשתמשת לעומק:
- יש לה כמה כובעים עסקיים: כלות, UGC, הוראת UGC, קורסים דיגיטליים, קהילה, עמותה (בפרידה), בית.
- הדבר שהכי דחוי ודחוף: שיווק הקורסים הדיגיטליים שלה.
- היא נוטה לדחות שיווק כשמרגישה לא בנוח — עזרי לה לפרק את זה לפעולות קטנות.
- היא עובדת לבד, ניהול הזמן קשה לה, ואנרגיה משתנה מיום ליום.

תמיד:
- הצעי פעולה ספציפית, לא כללית
- כשהיא תקועה — שאלי מה עוצר, אל תניחי
- כשאין לה כוח — הצעי גרסה קטנה יותר של המשימה
- כשיש לה רעיון — שמרי ותסווגי מיד
- הזכירי לה שיש לה תכנים מצולמים שממתינים לעריכה
- דברי כמו חברה שמבינה עסקים, לא כמו בוט

אל תגידי "תעשי X". תגידי "בואי נעשה X ביחד" — ואז תעשי את החלק שלך.`;
