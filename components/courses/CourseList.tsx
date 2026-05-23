"use client";
import type { Course } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plus, BookOpen, FileText, Wrench } from "lucide-react";
import { useState } from "react";
import { AddCourseForm } from "./AddCourseForm";

const TYPE_LABELS = { course: "קורס", guide: "מדריך", workshop: "וורקשופ" };
const TYPE_ICONS = { course: BookOpen, guide: FileText, workshop: Wrench };

interface Props {
  courses: Course[];
  userId: string;
}

export function CourseList({ courses, userId }: Props) {
  const [adding, setAdding] = useState(false);
  const [list, setList] = useState(courses);

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">הקורסים שלי</h1>
          <p className="text-sm text-muted-foreground mt-0.5">בסיס הידע של ה-AI לשיווק</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          הוסיפי קורס
        </Button>
      </div>

      {adding && (
        <AddCourseForm
          userId={userId}
          onCreated={(c) => { setList([...list, c]); setAdding(false); }}
          onClose={() => setAdding(false)}
        />
      )}

      {list.length === 0 && !adding && (
        <div className="text-center py-16 space-y-3 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto opacity-30" />
          <p className="font-medium">עוד אין קורסים</p>
          <p className="text-sm">הוסיפי את הקורס הראשון כדי שה-AI יכיר את התוכן שלך</p>
        </div>
      )}

      <div className="space-y-3">
        {list.map((course) => {
          const Icon = TYPE_ICONS[course.type];
          return (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="hover:border-primary/40 transition-all cursor-pointer">
                <CardContent className="pt-4 pb-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{course.name}</p>
                    {course.tagline && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{course.tagline}</p>
                    )}
                    <span className="text-xs text-muted-foreground">{TYPE_LABELS[course.type]}</span>
                  </div>
                  <span className="text-muted-foreground text-lg">←</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
