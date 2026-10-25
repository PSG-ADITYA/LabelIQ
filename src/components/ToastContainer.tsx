import React from 'react';
import { useLabel } from '../context/LabelContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLabel();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full no-print">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-forest-700 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-300 bg-emerald-50 text-emerald-950',
          error: 'border-rose-300 bg-rose-50 text-rose-950',
          warning: 'border-amber-300 bg-amber-50 text-amber-950',
          info: 'border-forest-200 bg-cream-50 text-forest-950',
        };

        return (
          <div
            key={toast.id}
            className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-slide-in ${borders[toast.type]}`}
          >
            <div className="flex items-start gap-2.5">
              {icons[toast.type]}
              <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
