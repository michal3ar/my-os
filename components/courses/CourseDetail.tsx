"use client";
import { useState } from "react";
import type { Course, CourseModule, CourseLesson } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ChevronDown, ChevronLeft, ArrowRight, FileText, Pencil, Check, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PdfUploader } from "./PdfUploader";

interface Props {
  course: Course;
  modules: (CourseModule & { lessons: CourseLesson[] })[];
  userId: string;
}

export function CourseDetail({ course, modules: initialModules, userId }: Props) {
  const [modules, setModules] = useState(initialModules);
  const [openModules, setOpenModules] = useState<Set<string>>(new Set(initialModules.map((m) => m.id)));
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingLessonFor, setAddingLessonFor] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");
  const [editingLessonTitleId, setEditingLessonTitleId] = useState<string | null>(null);
  const [editingLessonTitleValue, setEditingLessonTitleValue] = useState("");

  function toggleModule(id: string) {
    const next = new Set(openModules);
    next.has(id) ? next.delete(id) : next.add(id);
    setOpenModules(next);
  }

  async function addModule() {
    if (!newModuleTitle.trim()) return;
    setSaving(true);
    const res = await fetch("/api/courses/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_id: course.id, title: newModuleTitle.trim(), order_index: modules.length }),
    });
    const { module: mod } = await res.json();
    if (mod) {
      setModules([...modules, { ...mod, lessons: [] }]);
      setOpenModules(new Set([...openModules, mod.id]));
    }
    setNewModuleTitle("");
    setAddingModule(false);
    setSaving(false);
  }

  async function addLesson(moduleId: string) {
    if (!newLessonTitle.trim()) return;
    setSaving(true);
    const mod = modules.find((m) => m.id === moduleId)!;
    const res = await fetch("/api/courses/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module_id: moduleId, course_id: course.id, title: newLessonTitle.trim(), order_index: mod.lessons.length }),
    });
    const { lesson } = await res.json();
    if (lesson) {
      setModules(modules.map((m) => m.id === moduleId ? { ...m, lessons: [...m.lessons, lesson] } : m));
    }
    setNewLessonTitle("");
    setAddingLessonFor(null);
    setSaving(false);
  }

  async function saveModuleTitle(moduleId: string) {
    if (!editingModuleTitle.trim()) return;
    setSaving(true);
    await fetch("/api/courses/modules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: moduleId, title: editingModuleTitle.trim() }),
    });
    setModules(modules.map((m) => m.id === moduleId ? { ...m, title: editingModuleTitle.trim() } : m));
    setEditingModuleId(null);
    setSaving(false);
  }

  async function saveLessonTitle(lessonId: string, moduleId: string) {
    if (!editingLessonTitleValue.trim()) return;
    setSaving(true);
    await fetch("/api/courses/lessons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lessonId, title: editingLessonTitleValue.trim() }),
    });
    setModules(modules.map((m) => m.id === moduleId
      ? { ...m, lessons: m.lessons.map((l) => l.id === lessonId ? { ...l, title: editingLessonTitleValue.trim() } : l) }
      : m
    ));
    setEditingLessonTitleId(null);
    setSaving(false);
  }

  async function saveLesson(lesson: CourseLesson) {
    setSaving(true);
    await fetch("/api/courses/lessons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lesson.id, summary: lesson.summary, transcript: lesson.transcript }),
    });
    setModules(modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l) => l.id === lesson.id ? lesson : l),
    })));
    setEditingLesson(null);
    setSaving(false);
  }

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const withTranscript = modules.reduce((s, m) => s + m.lessons.filter((l) => l.transcript).length, 0);

  return (
    <div className="py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/courses" className="text-muted-foreground hover:text-foreground">
          <ArrowRight className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{course.name}</h1>
          {course.tagline && <p className="text-sm text-muted-foreground">{course.tagline}</p>}
        </div>
      </div>

      {/* PDF upload for guide type */}
      {course.type === "guide" && modules.length === 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">העלי את קובץ המדריך</p>
          <PdfUploader
            courseId={course.id}
            onDone={() => window.location.reload()}
          />
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-3 text-sm">
        <span className="bg-secondary rounded-full px-3 py-1">{modules.length} מודולים</span>
        <span className="bg-secondary rounded-full px-3 py-1">{totalLessons} שיעורים</span>
        <span className={cn("rounded-full px-3 py-1", withTranscript > 0 ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")}>
          {withTranscript}/{totalLessons} עם תמליל
        </span>
      </div>

      {/* Course context */}
      {(course.target_audience || course.pain_points || course.main_outcome) && (
        <Card>
          <CardContent className="pt-4 pb-4 space-y-2 text-sm">
            {course.target_audience && (
              <div><span className="font-medium">👤 קהל יעד: </span><span className="text-muted-foreground">{course.target_audience}</span></div>
            )}
            {course.pain_points && (
              <div><span className="font-medium">😣 כאבים: </span><span className="text-muted-foreground">{course.pain_points}</span></div>
            )}
            {course.main_outcome && (
              <div><span className="font-medium">✨ תוצאה: </span><span className="text-muted-foreground">{course.main_outcome}</span></div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modules */}
      <div className="space-y-3">
        {modules.map((mod, mi) => (
          <Card key={mod.id}>
            <div className="w-full flex items-center gap-3 p-4">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold flex-shrink-0">
                {mi + 1}
              </span>
              {editingModuleId === mod.id ? (
                <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={editingModuleTitle}
                    onChange={(e) => setEditingModuleTitle(e.target.value)}
                    className="text-sm h-7 flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveModuleTitle(mod.id);
                      if (e.key === "Escape") setEditingModuleId(null);
                    }}
                  />
                  <button onClick={() => saveModuleTitle(mod.id)} disabled={saving} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEditingModuleId(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <button onClick={() => toggleModule(mod.id)} className="flex-1 flex items-center gap-2 text-right">
                  <span className="flex-1 font-medium text-sm">{mod.title}</span>
                  <span className="text-xs text-muted-foreground">{mod.lessons.length} שיעורים</span>
                </button>
              )}
              {editingModuleId !== mod.id && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingModuleId(mod.id); setEditingModuleTitle(mod.title); }}
                    className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => toggleModule(mod.id)}>
                    {openModules.has(mod.id) ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronLeft className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </>
              )}
            </div>

            {openModules.has(mod.id) && (
              <CardContent className="pt-0 pb-4 space-y-2">
                {mod.lessons.map((lesson, li) => (
                  <div key={lesson.id}>
                    {editingLessonTitleId === lesson.id ? (
                      <div className="flex items-center gap-2 px-3 py-2">
                        <span className="text-xs text-muted-foreground w-5">{li + 1}.</span>
                        <Input
                          value={editingLessonTitleValue}
                          onChange={(e) => setEditingLessonTitleValue(e.target.value)}
                          className="text-sm h-7 flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveLessonTitle(lesson.id, mod.id);
                            if (e.key === "Escape") setEditingLessonTitleId(null);
                          }}
                        />
                        <button onClick={() => saveLessonTitle(lesson.id, mod.id)} disabled={saving} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></button>
                        <button onClick={() => setEditingLessonTitleId(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <div className="relative group">
                        <button
                          onClick={() => setEditingLesson(editingLesson?.id === lesson.id ? null : lesson)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 text-right transition-all"
                        >
                          <span className="text-xs text-muted-foreground w-5">{li + 1}.</span>
                          <span className="flex-1 text-sm">{lesson.title}</span>
                          {lesson.transcript ? (
                            <FileText className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-muted-foreground/30 flex-shrink-0" />
                          )}
                        </button>
                        <button
                          onClick={() => { setEditingLessonTitleId(lesson.id); setEditingLessonTitleValue(lesson.title); }}
                          className="absolute left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {editingLesson?.id === lesson.id && (
                      <div className="mx-3 mt-2 space-y-3 p-3 bg-secondary/30 rounded-xl">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">סיכום קצר (אופציונלי)</label>
                          <Textarea
                            value={editingLesson.summary ?? ""}
                            onChange={(e) => setEditingLesson({ ...editingLesson, summary: e.target.value })}
                            placeholder="במשפט-שניים — על מה השיעור?"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs text-muted-foreground flex items-center justify-between">
                            <span>תמליל / תוכן השיעור</span>
                            <span className={editingLesson.transcript ? "text-green-600" : "text-muted-foreground"}>
                              {editingLesson.transcript ? "✓ קיים" : "· ריק"}
                            </span>
                          </label>

                          {/* PDF upload for this lesson */}
                          <PdfUploader
                            courseId={course.id}
                            lessonId={editingLesson.id}
                            onDone={() => window.location.reload()}
                          />

                          <Textarea
                            value={editingLesson.transcript ?? ""}
                            onChange={(e) => setEditingLesson({ ...editingLesson, transcript: e.target.value })}
                            placeholder="או הדביקי את התמליל ידנית..."
                            rows={editingLesson.transcript ? 8 : 3}
                            className="text-xs font-mono"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingLesson(null)} className="flex-1">ביטול</Button>
                          <Button size="sm" onClick={() => saveLesson(editingLesson)} disabled={saving} className="flex-1">
                            {saving ? "שומר..." : "שמור"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {addingLessonFor === mod.id ? (
                  <div className="flex gap-2 px-3 pt-1">
                    <Input
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder="שם השיעור..."
                      className="text-sm"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && addLesson(mod.id)}
                    />
                    <Button size="sm" onClick={() => addLesson(mod.id)} disabled={saving}>הוסיפי</Button>
                    <Button size="sm" variant="outline" onClick={() => setAddingLessonFor(null)}>ביטול</Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingLessonFor(mod.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    הוסיפי שיעור
                  </button>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {addingModule ? (
        <div className="flex gap-2">
          <Input
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            placeholder="שם המודול..."
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && addModule()}
          />
          <Button onClick={addModule} disabled={saving}>הוסיפי</Button>
          <Button variant="outline" onClick={() => setAddingModule(false)}>ביטול</Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setAddingModule(true)} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          הוסיפי מודול
        </Button>
      )}
    </div>
  );
}
