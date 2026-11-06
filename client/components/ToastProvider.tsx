"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  type ComponentType,
} from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { CheckCircle, AlertCircle, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const STYLES: Record<ToastType, string> = {
  success: "bg-white border-success-200 text-neutral-800",
  error: "bg-white border-danger-200 text-neutral-800",
  info: "bg-white border-primary-200 text-neutral-800",
};

const ICON_COLORS: Record<ToastType, string> = {
  success: "text-success-600",
  error: "text-danger-600",
  info: "text-primary-600",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ToastContext.Provider value={{ addToast }}>
        {children}
        <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => {
              const Icon = ICONS[toast.type];
              return (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, x: 40, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 40, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg ${STYLES[toast.type]}`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 mt-0.5 ${ICON_COLORS[toast.type]}`}
                  />
                  <p className="text-sm font-medium flex-1">{toast.message}</p>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="shrink-0 p-0.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ToastContext.Provider>
    </MotionConfig>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
