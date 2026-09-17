'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface Toast {
  id: string
  message: string
}

interface ToastContextType {
  toast: (message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message }])

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+80px)] md:bottom-8 right-0 left-0 md:left-auto md:right-8 z-50 flex flex-col gap-2 items-center md:items-end pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center h-12 px-6 rounded-[var(--radius-sm)] bg-white/95 backdrop-blur-md border border-[#2b1f2e]/10 shadow-[0_4px_24px_rgba(0,0,0,0.08)] animate-fade-in-up"
            style={{ animationDuration: '400ms' }}
          >
            <span className="font-ui text-sm font-medium text-[var(--color-ink-plum)]">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
