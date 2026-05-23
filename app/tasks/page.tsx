import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TasksScreen } from "@/components/tasks/TasksScreen";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "done")
    .or(`snoozed_until.is.null,snoozed_until.lte.${today}`)
    .order("urgency", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <AppShell>
      <TasksScreen initialTasks={tasks ?? []} userId={user.id} />
    </AppShell>
  );
}
