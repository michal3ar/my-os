import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { InspirationScreen } from "@/components/inspiration/InspirationScreen";

export const dynamic = "force-dynamic";

export default async function InspirationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("inspirations")
    .select("*")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  return (
    <AppShell>
      <InspirationScreen initialItems={items ?? []} />
    </AppShell>
  );
}
