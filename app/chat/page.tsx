import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ChatScreen } from "@/components/chat/ChatScreen";

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Load open tasks as context for AI
  const { data: tasks } = await supabase
    .from("tasks")
    .select("title, hats, urgency, status, is_strategic")
    .eq("user_id", user.id)
    .neq("status", "done")
    .order("urgency", { ascending: false })
    .limit(20);

  return (
    <AppShell>
      <ChatScreen userId={user.id} openTasks={tasks ?? []} />
    </AppShell>
  );
}
