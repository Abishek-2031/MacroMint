'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

let toastQueue: ((toast: Omit<Toast, 'id'>) => void)[] = [];

export function toast(message: string, type: Toast['type'] = 'info') {
  toastQueue.forEach(fn => fn({ message, type }));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const addToast = (t: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).slice(2);
      setToasts(prev => [...prev, { ...t, id }]);
      setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), 4000);
    };
    toastQueue.push(addToast);
    return () => { toastQueue = toastQueue.filter(fn => fn !== addToast); };
  }, []);

  const icons = { success: CheckCircle, error: XCircle, info: Info };
  const colors = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => {
          const Icon = icons[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl border shadow-lg min-w-64 max-w-sm ${colors[t.type]}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{t.message}</p>
              <button onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}>
                <X className="w-4 h-4 opacity-60 hover:opacity-100" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

