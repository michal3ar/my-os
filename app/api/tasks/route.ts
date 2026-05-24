import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
  // Verify identity using cookie-based client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...updates } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Use admin client to bypass RLS — user identity already verified above
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
