import { createContext } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export type NotifyContextValue = {
  notify: (message: string, type?: ToastType) => void
}

export const NotifyContext = createContext<NotifyContextValue | null>(null)
