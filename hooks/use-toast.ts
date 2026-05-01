'use client';

import { useState, useCallback } from 'react';

export interface ToastOptions {
  message: string;
  type?: 'error' | 'success' | 'info';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastOptions & { id: string }>>([]);

  const showToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...options, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
  };
}
