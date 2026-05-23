export type HatId =
  | "brides"
  | "ugc"
  | "teaching"
  | "courses"
  | "community"
  | "nonprofit"
  | "home"
  | "personal";

export interface Hat {
  id: HatId;
  name: string;
  color: string;
  emoji: string;
  priority?: "high";
  status?: "closing";
}

export type EnergyLevel = "high" | "medium" | "low";
export type MoodLevel = "happy" | "neutral" | "sad" | "frustrated";

export interface DailyCheckin {
  id: string;
  user_id: string;
  date: string;
  schedule_notes: string;
  free_hours: number;
  energy: EnergyLevel;
  mood: MoodLevel;
  has_urgent: boolean;
  urgent_details?: string;
  ai_plan?: DayPlan;
  created_at: string;
}

export interface DayPlan {
  main_tasks: string[];
  strategic_task: string;
  quick_wins: string[];
  reminders: string[];
  avoid_today: string[];
  filmed_reminder?: string;
}

export type TaskStatus = "new" | "todo" | "in_progress" | "stuck" | "done";
export type EnergyType =
  | "filming"
  | "writing"
  | "editing"
  | "thinking"
  | "calls"
  | "bureaucracy"
  | "home"
  | "creative"
  | "technical";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  hats: HatId[];
  urgency: 1 | 2 | 3 | 4 | 5;
  importance: 1 | 2 | 3 | 4 | 5;
  deadline?: string;
  estimated_minutes?: number;
  energy_type: EnergyType;
  status: TaskStatus;
  is_recurring: boolean;
  recurrence_pattern?: string;
  is_strategic: boolean;
  stuck_reason?: string;
  stuck_since?: string;
  snoozed_until?: string;
  created_at: string;
  completed_at?: string;
}

export type CourseType = "course" | "guide" | "workshop";

export interface Course {
  id: string;
  user_id: string;
  name: string;
  tagline?: string;
  target_audience?: string;
  pain_points?: string;
  main_outcome?: string;
  type: CourseType;
  created_at: string;
  modules?: CourseModule[];
}

export interface CourseModule {
  id: string;
  course_id: string;
  user_id: string;
  title: string;
  description?: string;
  order_index: number;
  lessons?: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  module_id: string;
  course_id: string;
  user_id: string;
  title: string;
  summary?: string;
  transcript?: string;
  order_index: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export type FilmedLocation = "gallery" | "folder" | "cloud" | "link";
export type FilmedStatus = "filmed" | "needs_edit" | "in_edit" | "ready" | "published";
export type FilmedPotential = "high" | "medium" | "low";
export type MissingItem = "editing" | "voiceover" | "subtitles" | "cover" | "caption" | "cta";

export interface FilmedContent {
  id: string;
  user_id: string;
  description: string;
  hats: HatId[];
  location: FilmedLocation;
  location_detail?: string;
  missing_for_publish: MissingItem[];
  urgency: 1 | 2 | 3 | 4 | 5;
  potential: FilmedPotential;
  status: FilmedStatus;
  filmed_at: string;
  published_at?: string;
  created_at: string;
}

export type InspirationPlatform = "tiktok" | "instagram" | "other";
export type InspirationCategory = "hook" | "filming" | "editing" | "story" | "reel" | "product" | "campaign" | "sound" | "cta" | "visual" | "trend";
export type InspirationStatus = "saved" | "analyzed" | "ready_to_use" | "used";

export interface Inspiration {
  id: string;
  user_id: string;
  url?: string;
  platform: InspirationPlatform;
  title?: string;
  why_saved: string;
  categories: InspirationCategory[];
  relevant_hats: HatId[];
  status: InspirationStatus;
  notes?: string;
  saved_at: string;
}

export type ContentType = "hook" | "cta" | "script" | "reel_idea" | "story_idea" | "published" | "pending";
export type ContentStatus = "draft" | "ready" | "used" | "archived";

export interface ContentItem {
  id: string;
  user_id: string;
  type: ContentType;
  title?: string;
  content: string;
  hats: HatId[];
  notes?: string;
  performance_rating?: 1 | 2 | 3 | 4 | 5;
  status: ContentStatus;
  created_at: string;
}
