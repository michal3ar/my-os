import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import Link from "next/link";
import { Camera, Sparkles, FileText, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { count: filmedCount },
    { count: inspirationCount },
    { count: contentCount },
    { count: coursesCount },
  ] = await Promise.all([
    supabase.from("filmed_content").select("*", { count: "exact", head: true }).eq("user_id", user.id).neq("status", "published"),
    supabase.from("inspirations").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("content_items").select("*", { count: "exact", head: true }).eq("user_id", user.id).neq("status", "archived"),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const sections = [
    {
      href: "/filmed",
      icon: Camera,
      title: "תכנים מצולמים",
      description: "תיעוד של מה שצילמת וסטטוס העריכה",
      count: filmedCount ?? 0,
      countLabel: "ממתינים",
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600 bg-blue-100",
      badge: (filmedCount ?? 0) > 0 ? "🎬" : null,
    },
    {
      href: "/inspiration",
      icon: Sparkles,
      title: "ספריית השראות",
      description: "לינקים ורעיונות מטיקטוק ואינסטגרם",
      count: inspirationCount ?? 0,
      countLabel: "שמורות",
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600 bg-purple-100",
      badge: null,
    },
    {
      href: "/content",
      icon: FileText,
      title: "מאגר תוכן",
      description: "הוקים, CTAים, תסריטים, רעיונות",
      count: contentCount ?? 0,
      countLabel: "פריטים",
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600 bg-green-100",
      badge: null,
    },
    {
      href: "/courses",
      icon: BookOpen,
      title: "קורסים ומדריכים",
      description: "בסיס הידע של ה-AI לשיווק",
      count: coursesCount ?? 0,
      countLabel: "קורסים",
      color: "bg-amber-50 border-amber-200",
      iconColor: "text-amber-600 bg-amber-100",
      badge: null,
    },
  ];

  return (
    <AppShell>
      <div className="py-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold">הספריות שלי</h1>
          <p className="text-sm text-muted-foreground mt-0.5">כל התוכן במקום אחד</p>
        </div>

        <div className="space-y-3">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <Link key={section.href} href={section.href}>
                <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-sm ${section.color}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${section.iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{section.title}</p>
                      {section.badge && <span>{section.badge}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <p className="text-lg font-bold">{section.count}</p>
                    <p className="text-xs text-muted-foreground">{section.countLabel}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
