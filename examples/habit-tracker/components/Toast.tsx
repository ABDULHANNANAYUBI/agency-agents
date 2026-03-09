'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToastMessage } from '@/lib/types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    info: <Info className="w-4 h-4 text-blue-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />,
  };

  const styles = {
    success: 'border-emerald-200 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-900/20',
    info: 'border-blue-200 dark:border-blue-700/50 bg-blue-50 dark:bg-blue-900/20',
    error: 'border-red-200 dark:border-red-700/50 bg-red-50 dark:bg-red-900/20',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full',
        'bg-white dark:bg-slate-800',
        styles[toast.type],
        exiting ? 'toast-exit' : 'toast-enter'
      )}
      role="alert"
      aria-live="polite"
    >
      {icons[toast.type]}
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">
        {toast.message}
      </p>
      <button
        onClick={() => {
          setExiting(true);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  function addToast(message: string, type: ToastMessage['type'] = 'success') {
    const id = Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return { toasts, addToast, removeToast };
}
