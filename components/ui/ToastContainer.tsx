"use client";

import { useToast, Toast, ToastType } from "@/contexts/ToastContext";
import { X, CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const toastStyles: Record<
  ToastType,
  { bg: string; border: string; icon: React.ReactNode; iconColor: string }
> = {
  success: {
    bg: "bg-green-50 dark:bg-green-950",
    border: "border-green-200 dark:border-green-800",
    icon: <CheckCircle className="h-5 w-5" />,
    iconColor: "text-green-600 dark:text-green-400",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-950",
    border: "border-red-200 dark:border-red-800",
    icon: <XCircle className="h-5 w-5" />,
    iconColor: "text-red-600 dark:text-red-400",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-950",
    border: "border-yellow-200 dark:border-yellow-800",
    icon: <AlertTriangle className="h-5 w-5" />,
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    icon: <Info className="h-5 w-5" />,
    iconColor: "text-blue-600 dark:text-blue-400",
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { dismiss } = useToast();
  const style = toastStyles[toast.type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg",
        "animate-in slide-in-from-top-5 fade-in",
        style.bg,
        style.border
      )}
      dir="rtl"
    >
      <div className={cn("flex-shrink-0", style.iconColor)}>{style.icon}</div>
      <p className="flex-1 text-sm font-medium text-foreground">
        {toast.message}
      </p>
      <button
        onClick={() => dismiss(toast.id)}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="סגור"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm"
      role="region"
      aria-label="התראות"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
