import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Render Portal */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          const Icon = isSuccess 
            ? CheckCircle2 
            : isError 
            ? XCircle 
            : isWarning 
            ? AlertTriangle 
            : Info;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl shadow-lg border transition-all duration-200 animate-in slide-in-from-bottom-2 ${
                isSuccess
                  ? 'bg-white border-emerald-200 text-slate-800 shadow-emerald-900/5'
                  : isError
                  ? 'bg-white border-red-200 text-slate-800 shadow-red-900/5'
                  : isWarning
                  ? 'bg-white border-amber-200 text-slate-800 shadow-amber-900/5'
                  : 'bg-white border-slate-200 text-slate-800 shadow-slate-900/5'
              }`}
            >
              <div className={`p-1 rounded-lg shrink-0 ${
                isSuccess
                  ? 'bg-emerald-50 text-emerald-600'
                  : isError
                  ? 'bg-red-50 text-red-600'
                  : isWarning
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h5 className="text-xs font-semibold text-slate-900 leading-tight">
                    {toast.title}
                  </h5>
                )}
                {toast.message && (
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 -mt-1"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback safe dummy if used outside provider
    return {
      addToast: () => {},
      removeToast: () => {}
    };
  }
  return context;
}
