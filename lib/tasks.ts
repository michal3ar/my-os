export async function updateTask(id: string, updates: Record<string, unknown>): Promise<boolean> {
  const res = await fetch("/api/tasks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...updates }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    console.error("updateTask failed:", error);
    return false;
  }
  return true;
}
