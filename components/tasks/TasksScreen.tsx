"use client";
import { useState, useRef } from "react";
import type { Task } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { BrainDump } from "./BrainDump";
import { TaskList } from "./TaskList";
import { AddTaskForm } from "./AddTaskForm";
import { Button } from "@/components/ui/button";
import { Plus, Zap } from "lucide-react";

interface Props {
  initialTasks: Task[];
  userId: string;
}

export function TasksScreen({ initialTasks, userId }: Props) {
  const setTasks = useAppStore((s) => s.setTasks);
  const addTask = useAppStore((s) => s.addTask);
  const storeTasks = useAppStore((s) => s.tasks);

  const hydrated = useRef(false);
  if (!hydrated.current) {
    hydrated.current = true;
    setTasks(initialTasks);
  }

  const tasks = storeTasks.length > 0 ? storeTasks : initialTasks;

  const [view, setView] = useState<"list" | "add" | "braindump">("list");

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">משימות</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView(view === "braindump" ? "list" : "braindump")}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            Brain Dump
          </Button>
          <Button
            size="sm"
            onClick={() => setView(view === "add" ? "list" : "add")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            חדשה
          </Button>
        </div>
      </div>

      {view === "braindump" && (
        <BrainDump
          userId={userId}
          onTaskCreated={(task) => {
            addTask(task);
            setView("list");
          }}
          onClose={() => setView("list")}
        />
      )}

      {view === "add" && (
        <AddTaskForm
          userId={userId}
          onTaskCreated={(task) => {
            addTask(task);
            setView("list");
          }}
          onClose={() => setView("list")}
        />
      )}

      {view === "list" && <TaskList tasks={tasks} userId={userId} />}
    </div>
  );
}
