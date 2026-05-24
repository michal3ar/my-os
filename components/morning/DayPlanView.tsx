"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DailyCheckin, Task } from "@/types";
import { HAT_MAP } from "@/lib/constants";
import { updateTask as apiUpdateTask } from "@/lib/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ENERGY_LEVEL_LABELS, MOOD_LABELS } from "@/lib/constants";
import { RefreshCw, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface Props {
  checkin: DailyCheckin;
  onRedo: () => void;
  openTasks: Pick<Task, "id" | "title" | "urgency" | "is_strategic" | "energy_type" | "status" | "hats">[];
  hiddenTitles?: string[];
  filmedCount?: number;
}

function CheckItem({
  text,
  checked,
  onToggle,
  index,
}: {
  text: string;
  checked: boolean;
  onToggle: () => void;
  index?: number;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-lg text-right transition-all",
        checked ? "bg-muted/40 opacity-50" : "bg-secondary/50 hover:bg-secondary"
      )}
    >
      {index !== undefined ? (
        <span
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold transition-all",
            checked
              ? "bg-green-500 text-white"
              : "bg-primary text-primary-foreground"
          )}
        >
          {checked ? "✓" : index + 1}
        </span>
      ) : (
        <span className="flex-shrink-0 mt-0.5 text-muted-foreground">
          {checked ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </span>
      )}
      <p className={cn("text-sm leading-relaxed text-right", checked && "line-through text-muted-foreground")}>
        {text}
      </p>
    </button>
  );
}


export function DayPlanView({ checkin, onRedo, openTasks, hiddenTitles, filmedCount = 0 }: Props) {
  const plan = checkin.ai_plan!;
  const energyInfo = ENERGY_LEVEL_LABELS[checkin.energy];
  const moodInfo = MOOD_LABELS[checkin.mood];

  const router = useRouter();
  const [checkedMain, setCheckedMain] = useState<Set<string>>(new Set());
  const [strategicDone, setStrategicDone] = useState(false);
  const [localTasks, setLocalTasks] = useState(openTasks);

  const mainDone = checkedMain.size;
  const mainTotal = localTasks.length || plan.main_tasks.length;

  async function handleTaskCheck(taskId: string) {
    const isChecked = checkedMain.has(taskId);
    const next = new Set(checkedMain);
    if (isChecked) {
      next.delete(taskId);
      setCheckedMain(next);
    } else {
      next.add(taskId);
      setCheckedMain(next);
      // Mark as done in DB and remove from list
      const ok = await apiUpdateTask(taskId, { status: "done", completed_at: new Date().toISOString() });
      if (ok) {
        setTimeout(() => {
          setLocalTasks(prev => prev.filter(t => t.id !== taskId));
          setCheckedMain(prev => { const s = new Set(prev); s.delete(taskId); return s; });
          router.refresh();
        }, 600);
      }
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Status bar */}
      <div className="flex gap-3 text-sm flex-wrap">
        <span className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1">
          {energyInfo.emoji} אנרגיה {energyInfo.label}
        </span>
        <span className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1">
          {moodInfo.emoji} {moodInfo.label}
        </span>
        <span className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1">
          ⏱️ {checkin.free_hours} שעות
        </span>
      </div>

      {/* Main tasks — from live task list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>🎯</span> משימות פתוחות היום
            </span>
            {mainDone > 0 && (
              <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                {mainDone}/{mainTotal} ✓
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {localTasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">✨ כל המשימות הושלמו!</p>
          )}
          {localTasks.map((task, i) => (
            <button
              key={task.id}
              onClick={() => handleTaskCheck(task.id)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg text-right transition-all",
                checkedMain.has(task.id) ? "bg-muted/40 opacity-50" : "bg-secondary/50 hover:bg-secondary"
              )}
            >
              <span className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold transition-all",
                checkedMain.has(task.id) ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"
              )}>
                {checkedMain.has(task.id) ? "✓" : i + 1}
              </span>
              <div className="flex-1 text-right min-w-0">
                <p className={cn("text-sm leading-relaxed", checkedMain.has(task.id) && "line-through text-muted-foreground")}>
                  {task.title}
                </p>
                {task.hats.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {task.hats.slice(0, 2).map(h => {
                      const hat = HAT_MAP[h];
                      return hat ? (
                        <span key={h} className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: hat.color }}>
                          {hat.emoji} {hat.name}
                        </span>
                      ) : null;
                    })}
                    {task.is_strategic && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">🚀 אסטרטגית</span>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Strategic task */}
      <Card className={cn("border-primary/30 transition-all", strategicDone ? "bg-muted/30 opacity-60" : "bg-primary/5")}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span>🚀</span> המשימה האסטרטגית שחייבת לזוז
          </CardTitle>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => setStrategicDone(!strategicDone)}
            className="w-full flex items-start gap-3 text-right"
          >
            <span className="flex-shrink-0 mt-0.5">
              {strategicDone ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
            </span>
            <p className={cn("text-sm leading-relaxed font-medium", strategicDone && "line-through text-muted-foreground")}>
              {plan.strategic_task}
            </p>
          </button>
        </CardContent>
      </Card>


      {/* Avoid */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span>🚫</span> מה לא לעשות היום
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {plan.avoid_today.map((a, i) => (
            <div key={i} className="flex items-center gap-2 py-1">
              <span className="text-orange-400">×</span>
              <p className="text-sm">{a}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Filmed reminder — live count */}
      {filmedCount > 0 && (
        <Link href="/filmed">
          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-900 hover:border-purple-400 transition-colors cursor-pointer">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <span className="text-2xl">🎬</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  יש לך {filmedCount} {filmedCount === 1 ? "תוכן מצולם" : "תכנים מצולמים"} שממתינים לעריכה
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                  אולי היום לערוך במקום לצלם חדש? ←
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onRedo}
        className="w-full gap-2 text-muted-foreground"
      >
        <RefreshCw className="h-4 w-4" />
        לעשות צ׳ק-אין מחדש
      </Button>
    </div>
  );
}
