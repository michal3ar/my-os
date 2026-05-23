import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { FilmedScreen } from "@/components/filmed/FilmedScreen";

export const dynamic = "force-dynamic";

export default async function FilmedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("filmed_content")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <AppShell>
      <FilmedScreen initialItems={items ?? []} />
    </AppShell>
  );
}
