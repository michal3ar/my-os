"use client";
import { useState } from "react";
import type { DailyCheckin, Task } from "@/types";
import { CheckInForm } from "./CheckInForm";
import { DayPlanView } from "./DayPlanView";

interface Props {
  initialCheckin: DailyCheckin | null;
  userId: string;
  openTasks: Pick<Task, "id" | "title" | "urgency" | "is_strategic" | "energy_type" | "status" | "hats">[];
  hiddenTitles: string[];
  filmedCount: number;
}

export function MorningScreen({ initialCheckin, userId, openTasks, hiddenTitles, filmedCount }: Props) {
  const [checkin, setCheckin] = useState<DailyCheckin | null>(initialCheckin);

  const today = new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (checkin?.ai_plan) {
    return (
      <div className="py-6 space-y-6 animate-fade-in">
        <div>
          <p className="text-muted-foreground text-sm">{today}</p>
          <h1 className="text-2xl font-bold mt-1">בוקר טוב ✨</h1>
        </div>
        <DayPlanView checkin={checkin} onRedo={() => setCheckin(null)} openTasks={openTasks} hiddenTitles={hiddenTitles} filmedCount={filmedCount} />
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6 animate-fade-in">
      <div>
        <p className="text-muted-foreground text-sm">{today}</p>
        <h1 className="text-2xl font-bold mt-1">בוקר טוב ✨</h1>
        <p className="text-muted-foreground mt-1">כמה שאלות קצרות לתכנן את היום</p>
      </div>
      <CheckInForm userId={userId} onComplete={setCheckin} />
    </div>
  );
}
