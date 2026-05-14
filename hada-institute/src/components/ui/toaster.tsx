"use client";

import { X } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

const ToastContext = createContext<{
  toast: (toast: Omit<Toast, "id">) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((nextToast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...nextToast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 grid w-[min(380px,calc(100vw-2rem))] gap-3">
        {toasts.map((item) => (
          <div
            className={cn(
              "rounded-lg border bg-white p-4 shadow-lg",
              item.variant === "destructive" && "border-red-200 bg-red-50",
            )}
            key={item.id}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.title}</p>
                {item.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <Button
                aria-label="Dismiss notification"
                className="size-8"
                onClick={() =>
                  setToasts((current) =>
                    current.filter((toastItem) => toastItem.id !== item.id),
                  )
                }
                size="icon"
                type="button"
                variant="ghost"
              >
                <X className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function Toaster() {
  return null;
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
