"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TYPE_CONFIG: Record<ToastType, { icon: string; bar: string; iconColor: string }> = {
  success: { icon: "check-circle", bar: "bg-success", iconColor: "text-success" },
  error: { icon: "triangle-alert", bar: "bg-danger", iconColor: "text-danger" },
  info: { icon: "bell", bar: "bg-info", iconColor: "text-info" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, type, message }]);
  }, []);

  const value: ToastContextValue = {
    toast,
    success: (m) => toast(m, "success"),
    error: (m) => toast(m, "error"),
    info: (m) => toast(m, "info"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast viewport */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5">
        {items.map((t) => (
          <ToastCard key={t.id} item={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const cfg = TYPE_CONFIG[item.type];

  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="pointer-events-auto flex w-[340px] items-center gap-3 overflow-hidden rounded-[10px] border border-border-light bg-card shadow-lg">
      <div className={`h-full w-1 self-stretch ${cfg.bar}`} />
      <Icon name={cfg.icon} size={18} className={`shrink-0 ${cfg.iconColor}`} />
      <span className="flex-1 py-3 font-inter text-[13px] font-medium text-label">{item.message}</span>
      <button onClick={onClose} className="mr-3 text-placeholder hover:text-label transition-colors">
        <Icon name="x" size={15} />
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback no-op so components don't crash outside provider
    return {
      toast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return ctx;
}
