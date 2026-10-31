'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, PlusCircle, AlertCircle, X, Sparkles, Check } from 'lucide-react';

export type ToastType = 'add' | 'edit' | 'delete' | 'success' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

export function showAdminToast(type: ToastType, message: string, customTitle?: string) {
  if (typeof window === 'undefined') return;

  let title = customTitle;
  if (!title) {
    if (type === 'add') title = 'Berhasil Menambahkan';
    else if (type === 'edit') title = 'Berhasil Diubah';
    else if (type === 'delete') title = 'Berhasil Dihapus';
    else if (type === 'error') title = 'Terjadi Kendala';
    else title = 'Berhasil';
  }

  const detail: ToastItem = {
    id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    title,
    message,
  };

  window.dispatchEvent(new CustomEvent('alyatama-toast', { detail }));
}

export default function AdminToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ToastItem>;
      if (customEvent.detail) {
        setToasts((prev) => [...prev, customEvent.detail]);

        // Auto remove after 4.5 seconds
        setTimeout(() => {
          setToasts((current) => current.filter((t) => t.id !== customEvent.detail.id));
        }, 4500);
      }
    };

    window.addEventListener('alyatama-toast', handleToastEvent);
    return () => window.removeEventListener('alyatama-toast', handleToastEvent);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      role="region"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isAdd = toast.type === 'add';
        const isEdit = toast.type === 'edit';
        const isDelete = toast.type === 'delete';
        const isError = toast.type === 'error';

        // Badge styling
        let borderClass = 'border-emerald-300';
        let bgClass = 'bg-white';
        let headerColor = 'text-emerald-800';
        let iconBg = 'bg-emerald-100 text-emerald-700';

        if (isAdd) {
          borderClass = 'border-emerald-400 border-2';
          bgClass = 'bg-emerald-50/95';
          headerColor = 'text-emerald-900';
          iconBg = 'bg-emerald-600 text-white';
        } else if (isEdit) {
          borderClass = 'border-emerald-400 border-2';
          bgClass = 'bg-emerald-50/95';
          headerColor = 'text-emerald-900';
          iconBg = 'bg-emerald-600 text-white';
        } else if (isDelete) {
          borderClass = 'border-rose-400 border-2';
          bgClass = 'bg-rose-50/95';
          headerColor = 'text-rose-900';
          iconBg = 'bg-rose-600 text-white';
        } else if (isError) {
          borderClass = 'border-rose-300';
          bgClass = 'bg-white';
          headerColor = 'text-rose-800';
          iconBg = 'bg-rose-100 text-rose-700';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-xl border ${borderClass} ${bgClass} backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-3 fade-in flex items-start gap-3 relative`}
          >
            {/* Leading Icon with Badge */}
            <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-xs mt-0.5`}>
              {isAdd ? (
                <PlusCircle className="w-5 h-5" />
              ) : isEdit ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isDelete ? (
                <X className="w-5 h-5" />
              ) : isError ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <Check className="w-5 h-5" />
              )}
            </div>

            {/* Content Text */}
            <div className="flex-1 pr-6 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-black uppercase tracking-wider ${headerColor}`}>
                  {toast.title}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-xs font-medium text-stone-700 leading-snug">
                {toast.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-200/50 transition cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
