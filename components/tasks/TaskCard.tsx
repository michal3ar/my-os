"use client";
import { useState } from "react";
import type { Task } from "@/types";
import { HAT_MAP, ENERGY_TYPE_LABELS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";
import { updateTask as apiUpdateTask } from "@/lib/tasks";
import { Check, AlertCircle, CheckCircle2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditTaskDrawer } from "./EditTaskDrawer";

interface Props {
  task: Task;
  onDone?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Task>) => void;
}

const URGENCY_COLORS = [
  "",
  "bg-slate-100 text-slate-600",
  "bg-blue-100 text-blue-700",
  "bg-yellow-100 text-yellow-700",
  "bg-orange-100 text-orange-700",
  "bg-red-100 text-red-700",
];

export function TaskCard({ task, onDone, onUpdate }: Props) {
  const storeUpdate = useAppStore((s) => s.updateTask);
  const [editOpen, setEditOpen] = useState(false);

  async function markDone() {
    const updates: Partial<Task> = { status: "done", completed_at: new Date().toISOString() };
    const ok = await apiUpdateTask(task.id, updates);
    if (ok) {
      storeUpdate(task.id, updates);
      onDone?.(task.id);
    }
  }

  async function toggleStuck() {
    const newStatus: Task["status"] = task.status === "stuck" ? "todo" : "stuck";
    const ok = await apiUpdateTask(task.id, { status: newStatus });
    if (ok) {
      storeUpdate(task.id, { status: newStatus });
      onUpdate?.(task.id, { status: newStatus });
    }
  }

  return (
    <>
      <Card className={cn("transition-all", task.status === "stuck" && "border-orange-300 bg-orange-50/50")}>
        <CardContent className="pt-4 pb-3 space-y-3">
          {/* Title row */}
          <div className="flex items-start gap-3">
            <button
              onClick={markDone}
              title="סיימתי!"
              className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 border-muted-foreground/40 hover:border-green-500 hover:bg-green-50 flex items-center justify-center transition-all group"
            >
              <Check className="h-3.5 w-3.5 text-transparent group-hover:text-green-500 transition-colors" />
            </button>
            <div className="flex-1 space-y-1 min-w-0">
              <p className="font-medium leading-snug">{task.title}</p>
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
              )}
              {task.snoozed_until && (
                <p className="text-xs text-purple-600 bg-purple-50 rounded px-1.5 py-0.5 inline-block">
                  ⏰ נדחתה ל-{task.snoozed_until}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {task.urgency >= 4 && <AlertCircle className="h-4 w-4 text-red-500" />}
              <button
                onClick={() => setEditOpen(true)}
                title="עריכה"
                className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            {task.hats.map((hatId) => {
              const hat = HAT_MAP[hatId];
              return hat ? (
                <span
                  key={hatId}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: hat.color }}
                >
                  {hat.emoji} {hat.name}
                </span>
              ) : null;
            })}
            <Badge variant="outline" className="text-xs">
              {ENERGY_TYPE_LABELS[task.energy_type]}
            </Badge>
            {task.estimated_minutes && (
              <Badge variant="outline" className="text-xs">
                ⏱️ {task.estimated_minutes < 60
                  ? `${task.estimated_minutes} ד׳`
                  : `${Math.round(task.estimated_minutes / 60)} ש׳`}
              </Badge>
            )}
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", URGENCY_COLORS[task.urgency])}>
              עדיפות {task.urgency}
            </span>
          </div>

          {/* Stuck indicator */}
          {task.status === "stuck" && task.stuck_reason && (
            <p className="text-xs text-orange-600 bg-orange-100 rounded-md px-2 py-1.5">
              🚧 תקועה: {task.stuck_reason}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={toggleStuck}
              className={cn(
                "text-xs gap-1 flex-1",
                task.status === "stuck" && "border-orange-300 text-orange-600"
              )}
            >
              {task.status === "stuck" ? "↩ הוצאי מתקועה" : "🚧 תקועה"}
            </Button>
            <Button size="sm" onClick={markDone} className="text-xs gap-1 flex-1 bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-3 w-3" />
              סיימתי ✓
            </Button>
          </div>
        </CardContent>
      </Card>

      {editOpen && (
        <EditTaskDrawer task={task} onClose={() => setEditOpen(false)} />
      )}
    </>
  );
}
