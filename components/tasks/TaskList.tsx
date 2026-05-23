"use client";
import { useState } from "react";
import type { Task, HatId } from "@/types";
import { TaskCard } from "./TaskCard";
import { HATS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

type FilterView = "all" | "hat" | "urgency" | "stuck";

interface Props {
  tasks: Task[];
  userId?: string;
}

export function TaskList({ tasks }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const activeTasks = tasks.filter(
    (t) => t.status !== "done" && (!t.snoozed_until || t.snoozed_until <= today)
  );
  const [filter, setFilter] = useState<FilterView>("all");
  const [selectedHat, setSelectedHat] = useState<HatId | null>(null);

  const displayTasks = (() => {
    if (filter === "stuck") return activeTasks.filter((t) => t.status === "stuck");
    if (filter === "urgency") return [...activeTasks].sort((a, b) => b.urgency - a.urgency);
    if (filter === "hat" && selectedHat) return activeTasks.filter((t) => t.hats.includes(selectedHat));
    return activeTasks;
  })();

  const stuckCount = activeTasks.filter((t) => t.status === "stuck").length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: "all", label: "הכל" },
          { key: "urgency", label: "לפי עדיפות" },
          { key: "hat", label: "לפי כובע" },
          { key: "stuck", label: `תקועות${stuckCount > 0 ? ` (${stuckCount})` : ""}` },
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            className="whitespace-nowrap text-xs"
            onClick={() => setFilter(key as FilterView)}
          >
            {label}
          </Button>
        ))}
      </div>

      {filter === "hat" && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {HATS.map((hat) => (
            <button
              key={hat.id}
              onClick={() => setSelectedHat(hat.id === selectedHat ? null : hat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border-2 ${
                selectedHat === hat.id ? "border-primary" : "border-transparent"
              }`}
              style={{ backgroundColor: hat.color }}
            >
              {hat.emoji} {hat.name}
            </button>
          ))}
        </div>
      )}

      {displayTasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground space-y-2">
          <p className="text-4xl">✨</p>
          <p className="font-medium">
            {filter === "stuck" ? "אין משימות תקועות — כל הכבוד!" : "אין משימות. הוסיפי אחת!"}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {displayTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
