"use client";
import { useState } from "react";
import type { FilmedContent, HatId, FilmedStatus, MissingItem } from "@/types";
import { HATS, HAT_MAP } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Camera, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<FilmedStatus, { label: string; color: string }> = {
  filmed: { label: "צולם", color: "bg-blue-100 text-blue-700" },
  needs_edit: { label: "צריך עריכה", color: "bg-yellow-100 text-yellow-700" },
  in_edit: { label: "בעריכה", color: "bg-orange-100 text-orange-700" },
  ready: { label: "מוכן לפרסום", color: "bg-green-100 text-green-700" },
  published: { label: "פורסם", color: "bg-gray-100 text-gray-600" },
};

const STATUS_ORDER: FilmedStatus[] = ["filmed", "needs_edit", "in_edit", "ready", "published"];

const MISSING_OPTIONS: { id: MissingItem; label: string }[] = [
  { id: "editing", label: "עריכה" },
  { id: "voiceover", label: "קריינות" },
  { id: "subtitles", label: "כתוביות" },
  { id: "cover", label: "תמונת כיסוי" },
  { id: "caption", label: "כיתוב" },
  { id: "cta", label: "CTA" },
];

interface Props {
  initialItems: FilmedContent[];
}

export function FilmedScreen({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    description: "",
    hats: [] as HatId[],
    location: "gallery" as FilmedContent["location"],
    location_detail: "",
    missing_for_publish: [] as MissingItem[],
    urgency: 3 as FilmedContent["urgency"],
    potential: "medium" as FilmedContent["potential"],
    status: "filmed" as FilmedStatus,
  });

  function toggleHat(hat: HatId) {
    setForm(f => ({
      ...f,
      hats: f.hats.includes(hat) ? f.hats.filter(h => h !== hat) : [...f.hats, hat],
    }));
  }

  function toggleMissing(item: MissingItem) {
    setForm(f => ({
      ...f,
      missing_for_publish: f.missing_for_publish.includes(item)
        ? f.missing_for_publish.filter(m => m !== item)
        : [...f.missing_for_publish, item],
    }));
  }

  async function save() {
    if (!form.description.trim()) return;
    setSaving(true);
    const res = await fetch("/api/filmed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, description: form.description.trim() }),
    });
    const { item } = await res.json();
    if (item) setItems([item, ...items]);
    setForm({ description: "", hats: [], location: "gallery", location_detail: "", missing_for_publish: [], urgency: 3, potential: "medium", status: "filmed" });
    setAdding(false);
    setSaving(false);
  }

  async function updateStatus(id: string, status: FilmedStatus) {
    await fetch("/api/filmed", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setItems(items.map(i => i.id === id ? { ...i, status } : i));
  }

  const pending = items.filter(i => i.status !== "published");
  const grouped = STATUS_ORDER.filter(s => s !== "published").map(status => ({
    status,
    items: pending.filter(i => i.status === status),
  })).filter(g => g.items.length > 0);

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">תכנים מצולמים</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pending.length} ממתינים לעריכה/פרסום
          </p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)} className="gap-2">
          <Camera className="h-4 w-4" />
          צולמתי
        </Button>
      </div>

      {adding && (
        <Card className="border-primary/40">
          <CardContent className="pt-4 space-y-3">
            <Textarea
              placeholder="מה צילמתי? (לדוגמה: טיפ על איך לצלם תוכן UGC עם תאורה טובה)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              autoFocus
            />

            <div>
              <p className="text-xs text-muted-foreground mb-1.5">כובע</p>
              <div className="flex flex-wrap gap-1.5">
                {HATS.map(hat => (
                  <button
                    key={hat.id}
                    onClick={() => toggleHat(hat.id)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full border transition-all",
                      form.hats.includes(hat.id)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:border-primary/50"
                    )}
                  >
                    {hat.emoji} {hat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">איפה החומר?</p>
                <select
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value as FilmedContent["location"] }))}
                  className="w-full text-sm border border-border rounded-md px-2 py-1.5 bg-background"
                >
                  <option value="gallery">גלריה</option>
                  <option value="folder">תיקייה</option>
                  <option value="cloud">ענן</option>
                  <option value="link">לינק</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">פוטנציאל</p>
                <select
                  value={form.potential}
                  onChange={e => setForm(f => ({ ...f, potential: e.target.value as FilmedContent["potential"] }))}
                  className="w-full text-sm border border-border rounded-md px-2 py-1.5 bg-background"
                >
                  <option value="high">🔥 גבוה</option>
                  <option value="medium">🙂 בינוני</option>
                  <option value="low">📌 נמוך</option>
                </select>
              </div>
            </div>

            {(form.location === "folder" || form.location === "link" || form.location === "cloud") && (
              <Input
                placeholder={form.location === "link" ? "הדביקי לינק..." : "שם תיקייה / מיקום..."}
                value={form.location_detail}
                onChange={e => setForm(f => ({ ...f, location_detail: e.target.value }))}
                className="text-sm"
              />
            )}

            <div>
              <p className="text-xs text-muted-foreground mb-1.5">מה חסר לפרסום?</p>
              <div className="flex flex-wrap gap-1.5">
                {MISSING_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => toggleMissing(opt.id)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full border transition-all",
                      form.missing_for_publish.includes(opt.id)
                        ? "border-orange-400 bg-orange-100 text-orange-700"
                        : "border-border bg-background hover:border-orange-300"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setAdding(false)} className="flex-1">ביטול</Button>
              <Button size="sm" onClick={save} disabled={saving || !form.description.trim()} className="flex-1">
                {saving ? "שומר..." : "שמרי"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!adding && items.length === 0 && (
        <div className="text-center py-16 space-y-3 text-muted-foreground">
          <Camera className="h-12 w-12 mx-auto opacity-30" />
          <p className="font-medium">אין תכנים מצולמים עדיין</p>
          <p className="text-sm">אחרי כל צילום — לחצי "צולמתי" כדי לא לשכוח</p>
        </div>
      )}

      <div className="space-y-4">
        {grouped.map(({ status, items: groupItems }) => (
          <div key={status}>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_CONFIG[status].color)}>
                {STATUS_CONFIG[status].label}
              </span>
              <span className="text-xs text-muted-foreground">{groupItems.length}</span>
            </div>
            <div className="space-y-2">
              {groupItems.map(item => (
                <Card key={item.id} className="overflow-hidden">
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="w-full flex items-start gap-3 p-3 text-right"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{item.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.hats.map(h => {
                          const hat = HAT_MAP[h];
                          return hat ? (
                            <span key={h} className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: hat.color }}>
                              {hat.emoji}
                            </span>
                          ) : null;
                        })}
                        {item.missing_for_publish.length > 0 && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600">
                            חסר: {item.missing_for_publish.length}
                          </span>
                        )}
                        {item.potential === "high" && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">🔥</span>
                        )}
                      </div>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform", expandedId === item.id && "rotate-180")} />
                  </button>

                  {expandedId === item.id && (
                    <CardContent className="pt-0 pb-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mt-2 mb-3">
                        📍 {item.location}{item.location_detail ? ` — ${item.location_detail}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">עדכן סטטוס:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {STATUS_ORDER.map(s => (
                          <button
                            key={s}
                            onClick={() => updateStatus(item.id, s)}
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 transition-all",
                              item.status === s
                                ? cn("border-transparent font-medium", STATUS_CONFIG[s].color)
                                : "border-border hover:border-primary/40 bg-background"
                            )}
                          >
                            {item.status === s && <Check className="h-3 w-3" />}
                            {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
