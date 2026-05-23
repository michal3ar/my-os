"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, CheckSquare, MessageCircle, Library } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/morning", label: "בוקר", icon: Sun },
  { href: "/tasks", label: "משימות", icon: CheckSquare },
  { href: "/library", label: "ספריות", icon: Library },
  { href: "/chat", label: "צ׳אט", icon: MessageCircle },
];

const LIBRARY_PATHS = ["/library", "/filmed", "/inspiration", "/content", "/courses"];

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/library") return LIBRARY_PATHS.some(p => pathname.startsWith(p));
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
