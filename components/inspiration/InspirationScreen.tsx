"use client";
import { useState } from "react";
import type { Inspiration, InspirationCategory, HatId } from "@/types";
import { HATS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<InspirationCategory, string> = {
  hook: "הוק",
  filming: "צילום",
  editing: "עריכה",
  story: "סטורי",
  reel: "ריל",
  product: "מוצר",
  campaign: "קמפיין",
  sound: "סאונד",
  cta: "CTA",
  visual: "ויז׳ואל",
  trend: "טרנד",
};

const PLATFORM_ICONS: Record<string, string> = {
  tiktok: "🎵",
  instagram: "📸",
  other: "🔗",
};

const FILTER_CATEGORIES: { id: InspirationCategory | "all"; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "hook", label: "הוקים" },
  { id: "filming", label: "צילום" },
  { id: "editing", label: "עריכה" },
  { id: "reel", label: "רילס" },
  { id: "story", label: "סטוריז" },
  { id: "visual", label: "ויז׳ואל" },
  { id: "trend", label: "טרנדים" },
];

interface Props {
  initialItems: Inspiration[];
}

export function InspirationScreen({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [filterCat, setFilterCat] = useState<InspirationCategory | "all">("all");

  const [form, setForm] = useState({ url: "", why_saved: "", relevant_hats: [] as HatId[] });

  function toggleHat(hat: HatId) {
    setForm(f => ({
      ...f,
      relevant_hats: f.relevant_hats.includes(hat)
        ? f.relevant_hats.filter(h => h !== hat)
        : [...f.relevant_hats, hat],
    }));
  }

  async function save() {
    if (!form.why_saved.trim()) return;
    setSaving(true);

    const res = await fetch("/api/inspiration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: form.url.trim() || null,
        why_saved: form.why_saved.trim(),
        relevant_hats: form.relevant_hats,
        platform: "other",
        categories: [],
        status: "saved",
      }),
    });
    const { item } = await res.json();

    if (item) {
      setItems([item, ...items]);
      setAnalyzing(true);

      const analyzeRes = await fetch("/api/inspiration/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, url: form.url.trim(), why_saved: form.why_saved.trim() }),
      });
      const analyzed = await analyzeRes.json();

      setItems(prev => prev.map(i => i.id === item.id
        ? { ...i, platform: analyzed.platform, categories: analyzed.categories, title: analyzed.title, status: "analyzed" }
        : i
      ));
      setAnalyzing(false);
    }

    setForm({ url: "", why_saved: "", relevant_hats: [] });
    setAdding(false);
    setSaving(false);
  }

  const filtered = filterCat === "all"
    ? items
    : items.filter(i => i.categories.includes(filterCat));

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">ספריית השראות</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} השראות שמורות</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          הוסיפי
        </Button>
      </div>

      {adding && (
        <Card className="border-primary/40">
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder="לינק מטיקטוק / אינסטגרם (אופציונלי)"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              dir="ltr"
            />
            <Textarea
              placeholder="למה שמרתי את זה? מה אהבתי? (הוק חזק, צילום יפה, אנרגיה...)"
              value={form.why_saved}
              onChange={e => setForm(f => ({ ...f, why_saved: e.target.value }))}
              rows={2}
              autoFocus
            />
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">רלוונטי לכובע</p>
              <div className="flex flex-wrap gap-1.5">
                {HATS.map(hat => (
                  <button
                    key={hat.id}
                    onClick={() => toggleHat(hat.id)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full border transition-all",
                      form.relevant_hats.includes(hat.id)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {hat.emoji} {hat.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setAdding(false)} className="flex-1">ביטול</Button>
              <Button size="sm" onClick={save} disabled={saving || !form.why_saved.trim()} className="flex-1 gap-2">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {saving ? "שומר..." : "שמרי + סווגי"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {analyzing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-xl px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          קלוד מסווגת את ההשראה...
        </div>
      )}

      {/* Category filter */}
      {items.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTER_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full whitespace-nowrap border transition-all flex-shrink-0",
                filterCat === cat.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-background hover:border-primary/40"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 && !adding && (
        <div className="text-center py-16 space-y-3 text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto opacity-30" />
          <p className="font-medium">אין השראות עדיין</p>
          <p className="text-sm">כשרואים משהו שאוהבים — שמרי אותו כאן</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(item => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">{PLATFORM_ICONS[item.platform]}</span>
                <div className="flex-1 min-w-0">
                  {item.title && (
                    <p className="text-sm font-medium mb-1">{item.title}</p>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.why_saved}</p>

                  {item.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.categories.map(cat => (
                        <span key={cat} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {CATEGORY_LABELS[cat] ?? cat}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      פתחי לינק
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && items.length > 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">אין השראות בקטגוריה זו</p>
        )}
      </div>
    </div>
  );
}
