export async function updateTask(id: string, updates: Record<string, unknown>): Promise<boolean> {
  const res = await fetch("/api/tasks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...updates }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("updateTask failed:", body.error ?? res.status);
    return false;
  }
  return true;
}
