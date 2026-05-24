"use client";
import { useState } from "react";
import type { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/useAppStore";
import { updateTask as apiUpdateTask } from "@/lib/tasks";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  task: Task;
  onClose: () => void;
}

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function nextWeekday(day: number): string {
  // day: 0=Sun, 1=Mon, ...
  const d = new Date();
  const diff = (day - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

const SNOOZE_OPTIONS = [
  { label: "מחר", value: () => addDays(1) },
  { label: "עוד יומיים", value: () => addDays(2) },
  { label: "ראשון הקרוב", value: () => nextWeekday(0) },
  { label: "שני הקרוב", value: () => nextWeekday(1) },
];

export function EditTaskDrawer({ task, onClose }: Props) {
  const updateTask = useAppStore((s) => s.updateTask);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [saving, setSaving] = useState(false);
  const [snoozeDate, setSnoozeDate] = useState(task.snoozed_until ?? "");
  const [tab, setTab] = useState<"edit" | "snooze">("edit");

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    const updates: Partial<Task> = {
      title: title.trim(),
      description: description.trim() || undefined,
      snoozed_until: snoozeDate || undefined,
    };
    const ok = await apiUpdateTask(task.id, updates);
    if (ok) updateTask(task.id, updates);
    setSaving(false);
    onClose();
  }

  async function applySnooze(dateStr: string) {
    setSaving(true);
    const ok = await apiUpdateTask(task.id, { snoozed_until: dateStr });
    if (ok) updateTask(task.id, { snoozed_until: dateStr });
    setSaving(false);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-card rounded-t-2xl shadow-2xl p-5 space-y-4 animate-slide-up max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base truncate flex-1 ml-3">{task.title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b pb-1">
          {(["edit", "snooze"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "text-sm pb-1.5 px-1 transition-all",
                tab === t
                  ? "border-b-2 border-primary font-medium text-primary"
                  : "text-muted-foreground"
              )}
            >
              {t === "edit" ? "✏️ עריכה" : "⏰ דחייה לתאריך"}
            </button>
          ))}
        </div>

        {/* Edit tab */}
        {tab === "edit" && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">כותרת</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">פירוט (אופציונלי)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="מה בדיוק צריך לעשות..."
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={onClose} className="flex-1">ביטול</Button>
              <Button onClick={save} disabled={saving || !title.trim()} className="flex-1">
                {saving ? "שומר..." : "שמור"}
              </Button>
            </div>
          </div>
        )}

        {/* Snooze tab */}
        {tab === "snooze" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              המשימה תיעלם מהרשימה עד לתאריך שתבחרי — אז היא תחזור אוטומטית.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SNOOZE_OPTIONS.map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => applySnooze(value())}
                  disabled={saving}
                  className="py-3 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 text-sm font-medium transition-all"
                >
                  {label}
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {value()}
                  </span>
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">או בחרי תאריך ספציפי</label>
              <Input
                type="date"
                value={snoozeDate}
                min={addDays(1)}
                onChange={(e) => setSnoozeDate(e.target.value)}
              />
            </div>
            {snoozeDate && (
              <Button onClick={() => applySnooze(snoozeDate)} disabled={saving} className="w-full">
                {saving ? "שומר..." : `דחי למ-${snoozeDate}`}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
