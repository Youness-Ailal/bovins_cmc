"use client";

import Icon from "@/components/ui/Icon";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmCls =
    variant === "danger"
      ? "bg-danger text-white hover:bg-danger/90"
      : "bg-primary text-white hover:bg-primary-hover";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-label/40" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-[420px] rounded-[12px] border border-border-light bg-card p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${variant === "danger" ? "bg-danger/10" : "bg-primary-light"}`}>
            <Icon name={variant === "danger" ? "triangle-alert" : "check-circle"} size={20} className={variant === "danger" ? "text-danger" : "text-primary"} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-dm-sans text-base font-bold text-label">{title}</span>
            <span className="font-inter text-[13px] leading-relaxed text-subtle">{message}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-[6px] px-4 py-2 font-dm-sans text-[13px] font-semibold transition-colors ${confirmCls}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
