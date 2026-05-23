"use client";
import { useState, useRef } from "react";
import type { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, X, Zap } from "lucide-react";

interface Props {
  userId: string;
  onTaskCreated: (task: Task) => void;
  onClose: () => void;
}

export function BrainDump({ userId, onTaskCreated, onClose }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  function toggleRecording() {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      alert("הדפדפן שלך לא תומך בזיהוי קול. נסי ב-Chrome.");
      return;
    }

    const recognition = new SR();
    recognition.lang = "he-IL";
    recognition.continuous = true;
    recognition.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript;
        }
      }
      if (final) setText((prev) => prev + final);
    };

    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  async function handleAnalyze() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/brain-dump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, userId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "שגיאה בניתוח");
      }
      const { task } = await res.json();
      onTaskCreated(task);
    } catch (err) {
      setError(err instanceof Error ? err.message : "משהו השתבש. נסי שוב.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Brain Dump — פרוקי את הראש
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          כתבי או דברי בחופשיות — מה שעולה לך. ה-AI יהפוך את זה למשימה מסודרת.
        </p>

        <div className="relative">
          <Textarea
            placeholder="לדוגמה: צריך לענות ללקוחה של ה-UGC, להכין הצעת מחיר, לפרסם פוסט על הקורס..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="pl-12 rtl:pr-12 rtl:pl-3"
          />
          <button
            onClick={toggleRecording}
            className={`absolute bottom-3 left-3 rtl:left-auto rtl:right-3 p-1.5 rounded-full transition-colors ${
              recording
                ? "text-red-500 animate-pulse"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {recording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
        </div>

        {recording && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span className="animate-pulse">●</span> מקשיבה...
          </p>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            ⚠️ {error}
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={!text.trim() || loading}
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              מנתחת ויוצרת משימה...
            </span>
          ) : (
            "✨ הפכי למשימה מסודרת"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
