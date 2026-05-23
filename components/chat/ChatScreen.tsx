"use client";
import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface OpenTask {
  title: string;
  hats: string[];
  urgency: number;
  status: string;
  is_strategic: boolean;
}

interface Props {
  userId: string;
  openTasks: OpenTask[];
}

const QUICK_PROMPTS = [
  "יש לי רק שעה, מה לעשות?",
  "מה נפל בין הכיסאות?",
  "אני תקועה, עזרי לי",
  "תבני לי תוכנית להיום",
  "אין לי כוח, מה הגרסה הקטנה?",
];

export function ChatScreen({ openTasks }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "היי! אני מיי 👋 איך אני יכולה לעזור היום?",
      created_at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function toggleRecording() {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = "he-IL";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transcript = Array.from(e.results).map((res: any) => res[0].transcript).join("");
      setInput(transcript);
    };
    r.onend = () => setRecording(false);
    recognitionRef.current = r;
    r.start();
    setRecording(true);
  }

  async function sendMessage(text?: string) {
    const content = text ?? input.trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          openTasks,
        }),
      });

      if (!res.ok) throw new Error("שגיאה");
      const { reply } = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_ai",
          role: "assistant",
          content: reply,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          role: "assistant",
          content: "אופס, משהו השתבש. נסי שוב?",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="py-4 border-b">
        <h1 className="text-2xl font-bold">צ׳אט עם מיי</h1>
        <p className="text-sm text-muted-foreground mt-0.5">העוזרת האישית שלך</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Quick prompts — shown only at start */}
        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">שאלות מהירות:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors text-right"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tl-sm rtl:rounded-tl-2xl rtl:rounded-tr-sm"
                  : "bg-card border rounded-tr-sm rtl:rounded-tr-2xl rtl:rounded-tl-sm"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border rounded-2xl rounded-tr-sm rtl:rounded-tr-2xl rtl:rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="animate-bounce delay-0 w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                <span className="animate-bounce delay-150 w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                <span className="animate-bounce delay-300 w-1.5 h-1.5 bg-muted-foreground rounded-full" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="py-3 border-t">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="כתבי הודעה..."
              rows={1}
              className="resize-none max-h-32 pe-10 rtl:pe-10 rtl:ps-3"
              style={{ minHeight: "42px" }}
            />
            <button
              onClick={toggleRecording}
              className={cn(
                "absolute bottom-2.5 left-3 rtl:left-auto rtl:right-3 transition-colors",
                recording ? "text-red-500 animate-pulse" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>
          <Button
            size="icon"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="h-10 w-10 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 text-center">
          Enter לשליחה · Shift+Enter לשורה חדשה
        </p>
      </div>
    </div>
  );
}
