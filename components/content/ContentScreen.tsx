"use client";
import { useState } from "react";
import type { ContentItem, ContentType, HatId } from "@/types";
import { HATS, HAT_MAP } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Copy, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: { id: ContentType; label: string; emoji: string; placeholder: string }[] = [
  { id: "hook", label: "הוקים", emoji: "🎣", placeholder: "כתבי הוק שעובד לך (פתיחת סרטון, שורה ראשונה...)" },
  { id: "cta", label: "CTAים", emoji: "📣", placeholder: "קריאה לפעולה שממירה אצלך..." },
  { id: "script", label: "תסריטים", emoji: "📝", placeholder: "תסריט מלא לסרטון..." },
  { id: "reel_idea", label: "רעיונות ריל", emoji: "🎬", placeholder: "רעיון לסרטון — נושא, זווית, אנגל..." },
  { id: "story_idea", label: "רעיונות סטורי", emoji: "📱", placeholder: "רעיון לסטורי — מה תגידי, מה תראי..." },
  { id: "published", label: "פורסמו", emoji: "✅", placeholder: "תוכן שפרסמת ורוצה לתעד..." },
  { id: "pending", label: "ממתינים", emoji: "⏳", placeholder: "תוכן מוכן שעוד לא פרסמת..." },
];

interface Props {
  initialItems: ContentItem[];
}

export function ContentScreen({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [activeTab, setActiveTab] = useState<ContentType>("hook");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [form, setForm] = useState<{ title: string; content: string; hats: HatId[]; notes: string }>({
    title: "", content: "", hats: [], notes: "",
  });

  function toggleHat(hat: HatId) {
    setForm(f => ({
      ...f,
      hats: f.hats.includes(hat) ? f.hats.filter(h => h !== hat) : [...f.hats, hat],
    }));
  }

  async function save() {
    if (!form.content.trim()) return;
    setSaving(true);
    const res = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: activeTab,
        title: form.title.trim() || null,
        content: form.content.trim(),
        hats: form.hats,
        notes: form.notes.trim() || null,
      }),
    });
    const { item } = await res.json();
    if (item) setItems([item, ...items]);
    setForm({ title: "", content: "", hats: [], notes: "" });
    setAdding(false);
    setSaving(false);
  }

  async function archive(id: string) {
    await fetch("/api/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setItems(items.filter(i => i.id !== id));
  }

  async function copy(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const currentTab = TABS.find(t => t.id === activeTab)!;
  const filtered = items.filter(i => i.type === activeTab);

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">מאגר תוכן</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{items.length} פריטים</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          הוסיפי
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setAdding(false); }}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full whitespace-nowrap border transition-all flex-shrink-0 flex items-center gap-1",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-background hover:border-primary/40"
            )}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
            {items.filter(i => i.type === tab.id).length > 0 && (
              <span className={cn(
                "text-xs rounded-full px-1 min-w-[16px] text-center",
                activeTab === tab.id ? "bg-primary-foreground/20" : "bg-muted"
              )}>
                {items.filter(i => i.type === tab.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {adding && (
        <Card className="border-primary/40">
          <CardContent className="pt-4 space-y-3">
            <Input
              placeholder={`כותרת קצרה (אופציונלי)`}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="text-sm"
            />
            <Textarea
              placeholder={currentTab.placeholder}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={4}
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
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {hat.emoji} {hat.name}
                  </button>
                ))}
              </div>
            </div>
            <Input
              placeholder="הערות (אופציונלי) — איפה השתמשתי, מה עבד..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="text-sm"
            />
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setAdding(false)} className="flex-1">ביטול</Button>
              <Button size="sm" onClick={save} disabled={saving || !form.content.trim()} className="flex-1">
                {saving ? "שומר..." : "שמרי"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 && !adding && (
        <div className="text-center py-12 space-y-2 text-muted-foreground">
          <span className="text-4xl">{currentTab.emoji}</span>
          <p className="font-medium">אין {currentTab.label} עדיין</p>
          <p className="text-sm">הוסיפי את הראשון</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(item => (
          <Card key={item.id} className="overflow-hidden group">
            <CardContent className="pt-3 pb-3">
              {item.title && (
                <p className="text-xs font-semibold text-muted-foreground mb-1">{item.title}</p>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>

              {item.notes && (
                <p className="text-xs text-muted-foreground mt-2 italic">{item.notes}</p>
              )}

              <div className="flex items-center justify-between mt-2.5">
                <div className="flex flex-wrap gap-1">
                  {item.hats.map(h => {
                    const hat = HAT_MAP[h];
                    return hat ? (
                      <span key={h} className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: hat.color }}>
                        {hat.emoji} {hat.name}
                      </span>
                    ) : null;
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copy(item.content, item.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied === item.id
                      ? <span className="text-xs text-green-600">הועתק ✓</span>
                      : <Copy className="h-4 w-4" />
                    }
                  </button>
                  <button
                    onClick={() => archive(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
