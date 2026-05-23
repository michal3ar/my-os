import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { MorningScreen } from "@/components/morning/MorningScreen";

export const dynamic = "force-dynamic";

export default async function MorningPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  const [{ data: checkin }, { data: openTasks }, { count: filmedCount }] = await Promise.all([
    supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle(),
    supabase
      .from("tasks")
      .select("id, title, urgency, is_strategic, energy_type, status, hats, snoozed_until")
      .eq("user_id", user.id)
      .order("urgency", { ascending: false })
      .limit(30),
    supabase
      .from("filmed_content")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("status", ["filmed", "needs_edit", "in_edit"]),
  ]);

  const validCheckin = checkin?.ai_plan ? checkin : null;
  const allTasks = openTasks ?? [];
  const activeTasks = allTasks.filter(
    (t) => t.status !== "done" && (!t.snoozed_until || t.snoozed_until <= today)
  );
  const hiddenTitles = allTasks
    .filter((t) => t.status === "done" || (t.snoozed_until && t.snoozed_until > today))
    .map((t) => t.title.toLowerCase());

  return (
    <AppShell>
      <MorningScreen
        initialCheckin={validCheckin}
        userId={user.id}
        openTasks={activeTasks}
        hiddenTitles={hiddenTitles}
        filmedCount={filmedCount ?? 0}
      />
    </AppShell>
  );
}
