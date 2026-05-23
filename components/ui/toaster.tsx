"use client";
import * as React from "react";

interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
}

const ToastContext = React.createContext<{
  toast: (message: string, type?: Toast["type"]) => void;
} | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within Toaster");
  return ctx;
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 rtl:right-auto rtl:left-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-fade-in rounded-lg px-4 py-3 text-sm shadow-lg text-white ${
              t.type === "error"
                ? "bg-destructive"
                : t.type === "success"
                ? "bg-green-600"
                : "bg-foreground"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
