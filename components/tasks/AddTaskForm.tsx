"use client";
import { useState } from "react";
import type { Task, HatId, EnergyType, TaskStatus } from "@/types";
import { HATS, ENERGY_TYPE_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
  onTaskCreated: (task: Task) => void;
  onClose: () => void;
}

export function AddTaskForm({ userId, onTaskCreated, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedHats, setSelectedHats] = useState<HatId[]>([]);
  const [urgency, setUrgency] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [importance, setImportance] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [energyType, setEnergyType] = useState<EnergyType>("thinking");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [isStrategic, setIsStrategic] = useState(false);

  function toggleHat(hatId: HatId) {
    setSelectedHats((prev) =>
      prev.includes(hatId) ? prev.filter((h) => h !== hatId) : [...prev, hatId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: userId,
          title: title.trim(),
          description: description.trim() || null,
          hats: selectedHats,
          urgency,
          importance,
          energy_type: energyType,
          status: "todo" as TaskStatus,
          is_recurring: false,
          is_strategic: isStrategic,
          estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
        })
        .select()
        .single();

      if (error) throw error;
      onTaskCreated(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <CardTitle className="text-base">משימה חדשה</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>כותרת המשימה *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="מה צריך לעשות?"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>פירוט (אופציונלי)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="הסבר נוסף, קישורים, הקשר..."
              rows={2}
            />
          </div>

          {/* Hats */}
          <div className="space-y-2">
            <Label>כובע/ים</Label>
            <div className="flex flex-wrap gap-2">
              {HATS.map((hat) => (
                <button
                  key={hat.id}
                  type="button"
                  onClick={() => toggleHat(hat.id)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border-2 transition-all",
                    selectedHats.includes(hat.id) ? "border-primary" : "border-transparent"
                  )}
                  style={{ backgroundColor: hat.color }}
                >
                  {hat.emoji} {hat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency + Importance */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>דחיפות</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {([
                  { value: 2, label: "נמוכה" },
                  { value: 3, label: "בינונית" },
                  { value: 4, label: "גבוהה" },
                  { value: 5, label: "🔥 דחוף" },
                ] as { value: 1|2|3|4|5; label: string }[]).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setUrgency(value)}
                    className={cn(
                      "py-2 rounded-lg text-xs font-medium transition-all border-2",
                      urgency === value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary border-transparent hover:border-primary/40"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>חשיבות</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { value: 2, label: "נמוכה" },
                  { value: 3, label: "בינונית" },
                  { value: 5, label: "⭐ גבוהה" },
                ] as { value: 1|2|3|4|5; label: string }[]).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setImportance(value)}
                    className={cn(
                      "py-2 rounded-lg text-xs font-medium transition-all border-2",
                      importance === value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary border-transparent hover:border-primary/40"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Energy type */}
          <div className="space-y-1.5">
            <Label>סוג אנרגיה נדרשת</Label>
            <Select value={energyType} onValueChange={(v) => setEnergyType(v as EnergyType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(ENERGY_TYPE_LABELS) as [EnergyType, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>זמן משוער (דקות)</Label>
              <Input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="30"
                min={1}
              />
            </div>
            <div className="space-y-1.5">
              <Label>אסטרטגית?</Label>
              <button
                type="button"
                onClick={() => setIsStrategic(!isStrategic)}
                className={cn(
                  "w-full h-10 rounded-md border text-sm font-medium transition-all",
                  isStrategic ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input hover:bg-secondary"
                )}
              >
                {isStrategic ? "✅ כן, אסטרטגית" : "לא"}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading || !title.trim()} className="w-full">
            {loading ? "שומרת..." : "הוספת משימה"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
