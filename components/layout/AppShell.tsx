"use client";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-20 max-w-2xl mx-auto w-full px-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
