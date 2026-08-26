import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastItem, ToastType } from '@/components/ui/Toast';

interface ShowToastOptions {
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  show: (options: ShowToastOptions) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(({ type, message, title, duration }: ShowToastOptions) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast: ToastItem = {
      id,
      type,
      message,
      title,
      duration,
    };
    // Keep at most 1 active toast at top for ultra clean UX
    setToasts([newToast]);
  }, []);

  const success = useCallback((message: string, title?: string) => {
    show({ type: 'success', message, title });
  }, [show]);

  const error = useCallback((message: string, title?: string) => {
    show({ type: 'error', message, title });
  }, [show]);

  const warning = useCallback((message: string, title?: string) => {
    show({ type: 'warning', message, title });
  }, [show]);

  const info = useCallback((message: string, title?: string) => {
    show({ type: 'info', message, title });
  }, [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, warning, info, dismiss }}>
      {children}
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
