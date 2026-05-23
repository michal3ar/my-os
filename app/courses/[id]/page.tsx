import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { CourseDetail } from "@/components/courses/CourseDetail";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!course) notFound();

  const { data: modules } = await supabase
    .from("course_modules")
    .select("*, lessons:course_lessons(*)")
    .eq("course_id", course.id)
    .order("order_index", { ascending: true });

  // sort lessons within each module
  const modulesWithSorted = (modules ?? []).map((m) => ({
    ...m,
    lessons: [...(m.lessons ?? [])].sort((a, b) => a.order_index - b.order_index),
  }));

  return (
    <AppShell>
      <CourseDetail course={course} modules={modulesWithSorted} userId={user.id} />
    </AppShell>
  );
}
