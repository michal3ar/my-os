"use client";
import { useState } from "react";
import type { Course, CourseType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
  onCreated: (course: Course) => void;
  onClose: () => void;
}

const TYPES: { value: CourseType; label: string; desc: string }[] = [
  { value: "guide", label: "מדריך", desc: "PDF קצר או מסמך" },
  { value: "course", label: "קורס", desc: "מודולים ושיעורים" },
  { value: "workshop", label: "וורקשופ", desc: "מפגש חד פעמי" },
];

export function AddCourseForm({ userId, onCreated, onClose }: Props) {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [type, setType] = useState<CourseType>("course");
  const [targetAudience, setTargetAudience] = useState("");
  const [painPoints, setPainPoints] = useState("");
  const [mainOutcome, setMainOutcome] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), tagline, type, target_audience: targetAudience, pain_points: painPoints, main_outcome: mainOutcome }),
    });
    const { course } = await res.json();
    if (course) onCreated(course);
    setSaving(false);
  }

  return (
    <Card>
      <CardContent className="pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">קורס / מדריך חדש</h2>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs transition-all",
                type === t.value ? "border-primary bg-primary/5 font-medium" : "border-border"
              )}
            >
              <span className="font-medium">{t.label}</span>
              <span className="text-muted-foreground">{t.desc}</span>
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">שם הקורס *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="לדוגמה: קורס הצילום של מיכל" autoFocus />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">סלוגן קצר</label>
          <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="משפט שמסכם את הקורס" />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">למי זה מיועד?</label>
          <Textarea value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="מי הלקוח האידיאלי? גיל, מצב, רקע..." rows={2} />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">מה הכאב / הבעיה שהקורס פותר?</label>
          <Textarea value={painPoints} onChange={(e) => setPainPoints(e.target.value)}
            placeholder="מה מציק להם? מה הם מנסים לפתור?" rows={2} />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">מה התוצאה שהם יוצאים איתה?</label>
          <Textarea value={mainOutcome} onChange={(e) => setMainOutcome(e.target.value)}
            placeholder="מה הם יודעים / מסוגלים לעשות אחרי הקורס?" rows={2} />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">ביטול</Button>
          <Button onClick={save} disabled={saving || !name.trim()} className="flex-1">
            {saving ? "שומר..." : "צרי קורס"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
