import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X, RefreshCw } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-[1080] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      role="status"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'danger';
        return (
          <div
            key={toast.id}
            role={isError ? 'alert' : 'status'}
            aria-live={isError ? 'assertive' : 'polite'}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 dark:bg-slate-950/95'
                : toast.type === 'danger'
                ? 'bg-slate-900/95 border-rose-500/50 text-slate-100 dark:bg-slate-950/95'
                : toast.type === 'warning'
                ? 'bg-slate-900/95 border-amber-500/40 text-slate-100 dark:bg-slate-950/95'
                : 'bg-slate-900/95 border-sky-500/40 text-slate-100 dark:bg-slate-950/95'
            }`}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'danger' && <XCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-tight text-slate-100">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  {toast.message}
                </p>
              )}
              {toast.actionLabel && toast.onAction && (
                <button
                  onClick={() => {
                    toast.onAction?.();
                    dismissToast(toast.id);
                  }}
                  className="mt-2 text-xs font-semibold px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  {toast.actionLabel}
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
              aria-label="بستن اعلان"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
