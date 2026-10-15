import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastNotification } from '../types';

interface ToastContextType {
  toasts: ToastNotification[];
  showToast: (toast: Omit<ToastNotification, 'id'>) => string;
  dismissToast: (id: string) => void;
  showSuccess: (title: string, message?: string) => string;
  showError: (title: string, message?: string, onRetry?: () => void) => string;
  showWarning: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toastData: Omit<ToastNotification, 'id'>) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newToast: ToastNotification = {
      ...toastData,
      id,
      durationMs: toastData.durationMs !== undefined ? toastData.durationMs : (toastData.type === 'danger' ? 0 : 5000),
    };

    setToasts(prev => [...prev, newToast]);

    if (newToast.durationMs && newToast.durationMs > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, newToast.durationMs);
    }

    return id;
  }, [dismissToast]);

  const showSuccess = useCallback((title: string, message?: string) => {
    return showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string, onRetry?: () => void) => {
    return showToast({
      type: 'danger',
      title,
      message,
      durationMs: 0, // sticky until manually dismissed
      actionLabel: onRetry ? 'تلاش مجدد' : undefined,
      onAction: onRetry,
    });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    return showToast({ type: 'warning', title, message });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    return showToast({ type: 'info', title, message });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
