"use client";
import { useState } from "react";
import type { DailyCheckin, EnergyLevel, MoodLevel } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ENERGY_LEVEL_LABELS, MOOD_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
  onComplete: (checkin: DailyCheckin) => void;
}

type Step = 0 | 1 | 2 | 3 | 4;

export function CheckInForm({ userId, onComplete }: Props) {
  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);

  const [scheduleNotes, setScheduleNotes] = useState("");
  const [freeHours, setFreeHours] = useState(4);
  const [energy, setEnergy] = useState<EnergyLevel>("medium");
  const [mood, setMood] = useState<MoodLevel>("neutral");
  const [hasUrgent, setHasUrgent] = useState(false);
  const [urgentDetails, setUrgentDetails] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const STEPS = 5;
  const progress = ((step + 1) / STEPS) * 100;

  async function handleSubmit() {
    setLoading(true);
    setSubmitError(null);
    try {
      const today = new Date().toISOString().split("T")[0];
      const supabase = createClient();

      const checkinData = {
        user_id: userId,
        date: today,
        schedule_notes: scheduleNotes,
        free_hours: freeHours,
        energy,
        mood,
        has_urgent: hasUrgent,
        urgent_details: hasUrgent ? urgentDetails : null,
      };

      // Save check-in
      const { data: savedCheckin, error: saveError } = await supabase
        .from("daily_checkins")
        .upsert(checkinData, { onConflict: "user_id,date" })
        .select()
        .single();

      if (saveError) throw saveError;

      // Fetch open tasks to include in plan
      const { data: openTasks } = await supabase
        .from("tasks")
        .select("title, hats, urgency, is_strategic, status, energy_type")
        .eq("user_id", userId)
        .in("status", ["todo", "stuck"])
        .order("urgency", { ascending: false })
        .limit(15);

      // Generate AI plan
      const res = await fetch("/api/morning-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkin: checkinData, openTasks: openTasks ?? [] }),
      });

      if (!res.ok) throw new Error("שגיאה ביצירת תוכנית יום");
      const { plan } = await res.json();

      // Save plan back
      await supabase
        .from("daily_checkins")
        .update({ ai_plan: plan })
        .eq("id", savedCheckin.id);

      onComplete({ ...savedCheckin, ai_plan: plan });
    } catch (err) {
      console.error(err);
      setSubmitError(err instanceof Error ? err.message : "משהו השתבש. נסי שוב.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{Math.round(progress)}%</span>
          <span>שאלה {step + 1} מתוך {STEPS}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step 0: Schedule */}
      {step === 0 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">מה הלוז שלך היום?</h2>
              <p className="text-sm text-muted-foreground">פגישות, מחויבויות, ילדים — מה שרלוונטי</p>
            </div>
            <Textarea
              placeholder="לדוגמה: פגישת זום ב-11, איסוף ילדים ב-16..."
              value={scheduleNotes}
              onChange={(e) => setScheduleNotes(e.target.value)}
              rows={4}
              autoFocus
            />
            <Button onClick={() => setStep(1)} className="w-full">המשך</Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Free hours */}
      {step === 1 && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">כמה שעות פנויות לעבודה?</h2>
              <p className="text-sm text-muted-foreground">בלי הפגישות והמחויבויות</p>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-4xl font-bold text-primary">{freeHours}</span>
                <span className="text-lg text-muted-foreground mr-1">שעות</span>
              </div>
              <Slider
                min={1}
                max={8}
                step={0.5}
                value={[freeHours]}
                onValueChange={([v]) => setFreeHours(v)}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>שעה אחת</span>
                <span>8 שעות</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1">חזרה</Button>
              <Button onClick={() => setStep(2)} className="flex-1">המשך</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Energy */}
      {step === 2 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">מה מצב האנרגיה שלך?</h2>
              <p className="text-sm text-muted-foreground">בכנות — זה ישפיע על התוכנית</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(ENERGY_LEVEL_LABELS) as [EnergyLevel, { label: string; emoji: string }][]).map(
                ([key, { label, emoji }]) => (
                  <button
                    key={key}
                    onClick={() => setEnergy(key)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      energy === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                )
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">חזרה</Button>
              <Button onClick={() => setStep(3)} className="flex-1">המשך</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Mood */}
      {step === 3 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">מה מצב הרוח?</h2>
              <p className="text-sm text-muted-foreground">ג׳וסט לדעת</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(MOOD_LABELS) as [MoodLevel, { label: string; emoji: string }][]).map(
                ([key, { label, emoji }]) => (
                  <button
                    key={key}
                    onClick={() => setMood(key)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                      mood === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                )
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">חזרה</Button>
              <Button onClick={() => setStep(4)} className="flex-1">המשך</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Urgent */}
      {step === 4 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">יש משהו דחוף שנכנס היום?</h2>
              <p className="text-sm text-muted-foreground">משהו שלא תכנתת ומשפיע על היום</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setHasUrgent(false)}
                className={cn(
                  "flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                  !hasUrgent
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                לא, אין
              </button>
              <button
                onClick={() => setHasUrgent(true)}
                className={cn(
                  "flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                  hasUrgent
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-border hover:border-destructive/50"
                )}
              >
                כן, יש
              </button>
            </div>
            {hasUrgent && (
              <Input
                placeholder="מה נכנס?"
                value={urgentDetails}
                onChange={(e) => setUrgentDetails(e.target.value)}
                autoFocus
              />
            )}
            {submitError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                ⚠️ {submitError}
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">חזרה</Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    מכינה תוכנית...
                  </span>
                ) : (
                  "בואי נתכנן את היום ✨"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
