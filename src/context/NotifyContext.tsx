import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '../lib/cn'
import { NotifyContext, type ToastType } from './notify-context'

type Toast = { id: string; message: string; type: ToastType }

const DURATION_MS = 4200

export function NotifyProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const remove = useCallback((id: string) => {
    const t = timers.current.get(id)
    if (t) clearTimeout(t)
    timers.current.delete(id)
    setToasts((list) => list.filter((x) => x.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = crypto.randomUUID()
      setToasts((list) => [...list.filter((_, i) => i < 4), { id, message, type }])
      const t = setTimeout(() => remove(id), DURATION_MS)
      timers.current.set(id, t)
    },
    [remove]
  )

  useEffect(() => {
    const map = timers.current
    return () => {
      map.forEach((t) => clearTimeout(t))
      map.clear()
    }
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <NotifyContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-3 top-16 z-[110] flex max-w-[min(100vw-1.5rem,20rem)] flex-col gap-2 sm:right-5 sm:top-20"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto rounded-xl border px-3 py-2.5 text-sm font-medium shadow-lg backdrop-blur-md motion-safe:animate-[toast-in_0.35s_cubic-bezier(0.22,1,0.36,1)_both]',
              t.type === 'success' &&
                'border-emerald-200/90 bg-emerald-50/95 text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/90 dark:text-emerald-50',
              t.type === 'error' &&
                'border-red-200/90 bg-red-50/95 text-red-950 dark:border-red-900/40 dark:bg-red-950/90 dark:text-red-50',
              t.type === 'info' &&
                'border-slate-200/90 bg-white/95 text-slate-900 dark:border-white/15 dark:bg-slate-900/95 dark:text-slate-50'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="min-w-0 flex-1 leading-snug">{t.message}</span>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="shrink-0 rounded-md p-0.5 text-current opacity-60 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet-500"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotifyContext.Provider>
  )
}
