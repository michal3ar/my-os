"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  courseId: string;
  lessonId?: string;
  onDone: (preview: string) => void;
}

type State = "idle" | "uploading" | "done" | "error";

export function PdfUploader({ courseId, lessonId, onDone }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>("idle");
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleFile(file: File) {
    if (!file.name.endsWith(".pdf")) {
      setErrorMsg("נא להעלות קובץ PDF בלבד");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("הקובץ גדול מדי (מקסימום 20MB)");
      return;
    }

    setFileName(file.name);
    setState("uploading");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("course_id", courseId);
    if (lessonId) formData.append("lesson_id", lessonId);

    const res = await fetch("/api/courses/extract-pdf", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const { preview } = await res.json();
      setState("done");
      onDone(preview);
    } else {
      setState("error");
      setErrorMsg("שגיאה בעיבוד ה-PDF — נסי שוב");
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {state === "idle" && (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center gap-3 p-6 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">גררי PDF לכאן או לחצי לבחירה</p>
            <p className="text-xs text-muted-foreground mt-1">קלוד יקרא את הטקסט והתמונות — לוקח עד 2 דקות</p>
          </div>
        </button>
      )}

      {state === "uploading" && (
        <div className="flex flex-col items-center gap-3 p-6 bg-primary/5 rounded-xl">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <div className="text-center">
            <p className="text-sm font-medium">מנתח את הקובץ...</p>
            <p className="text-xs text-muted-foreground">{fileName}</p>
            <p className="text-xs text-muted-foreground mt-1">קלוד קורא את הטקסט והתמונות — עד 2 דקות, אל תסגרי את הדף</p>
          </div>
        </div>
      )}

      {state === "done" && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800">התוכן נשמר בהצלחה</p>
            <p className="text-xs text-muted-foreground truncate">{fileName}</p>
          </div>
          <button
            onClick={() => { setState("idle"); setFileName(""); }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            החלפה
          </button>
        </div>
      )}

      {state === "error" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-xl text-sm text-destructive">
            {errorMsg}
          </div>
          <Button variant="outline" size="sm" onClick={() => setState("idle")}>נסי שוב</Button>
        </div>
      )}
    </div>
  );
}
