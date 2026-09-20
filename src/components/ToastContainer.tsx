import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div
      id="toast-notifications-container"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const icon =
            toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            );

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl backdrop-blur-md bg-slate-900/90 dark:bg-slate-900/95 border border-slate-700/60 dark:border-slate-800 shadow-xl shadow-black/25 text-slate-100"
            >
              {icon}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 leading-tight">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
