'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = 'error', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 进入动画
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // 自动消失
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // 与动画时长匹配
  };

  const bgColor = {
    error: 'bg-destructive/10 border-destructive/20',
    success: 'bg-green-500/10 border-green-500/20',
    info: 'bg-blue-500/10 border-blue-500/20',
  }[type];

  const textColor = {
    error: 'text-destructive',
    success: 'text-green-600 dark:text-green-400',
    info: 'text-blue-600 dark:text-blue-400',
  }[type];

  return (
    <div
      className={`
        fixed left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4
        transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'top-4 opacity-100' : '-top-20 opacity-0'}
      `}
    >
      <div
        className={`
          flex items-start gap-3 rounded-md border p-4 shadow-lg backdrop-blur-sm
          ${bgColor}
        `}
      >
        <div className="flex-1">
          <p className={`text-sm leading-relaxed ${textColor}`}>
            {message}
          </p>
        </div>
        <button
          onClick={handleClose}
          className={`flex-shrink-0 transition-colors hover:opacity-70 ${textColor}`}
        >
          <X strokeWidth={1.5} className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Toast 容器组件
export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {children}
    </div>
  );
}
