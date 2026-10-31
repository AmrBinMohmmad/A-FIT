import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { Toast, type ToastItem, type ToastType } from "@/components/ui/Toast";

interface ToastContextValue {
  show: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * One toast at a time, replaced by the newest. The QueryProvider's MutationCache calls
 * `show` through the registered bridge so every mutation surfaces exactly one message.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToast((current) => (current?.id === id ? null : current));
  }, []);

  const show = useCallback((type: ToastType, message: string) => {
    counter.current += 1;
    setToast({ id: String(counter.current), type, message });
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (m) => show("success", m),
      error: (m) => show("error", m),
      info: (m) => show("info", m),
      dismiss,
    }),
    [show, dismiss],
  );

  useEffect(() => {
    toastBridge.current = value;
    return () => {
      toastBridge.current = null;
    };
  }, [value]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <Toast toast={toast} onDismiss={dismiss} /> : null}
    </ToastContext.Provider>
  );
}

/** Non-React access for the QueryProvider's mutation cache (set when the provider mounts). */
export const toastBridge: { current: ToastContextValue | null } = { current: null };

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
