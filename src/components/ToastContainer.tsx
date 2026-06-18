"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/stores/toastStore";

function toastBorder(type: string) {
  switch (type) {
    case "success": return "border-accent-green";
    case "error": return "border-accent-red";
    case "warning": return "border-accent-orange";
    default: return "border-accent-blue";
  }
}

function toastText(type: string) {
  switch (type) {
    case "success": return "text-accent-green";
    case "error": return "text-accent-red";
    case "warning": return "text-accent-orange";
    default: return "text-accent-blue";
  }
}

function toastIcon(type: string) {
  switch (type) {
    case "success": return "✓";
    case "error": return "✕";
    case "warning": return "▲";
    default: return "ℹ";
  }
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="fixed top-4 right-4 z-[9998] space-y-2 w-[320px]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className={`border ${toastBorder(toast.type)} bg-surface p-3 shadow-lg flex items-start gap-2`}
          >
            <span className={`text-sm font-bold ${toastText(toast.type)}`}>{toastIcon(toast.type)}</span>
            <p className="text-xs text-foreground flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs text-muted hover:text-foreground"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
