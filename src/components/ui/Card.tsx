import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  title?: string
  description?: string
  /** Softer padding for dense areas */
  dense?: boolean
}

export function Card({
  className,
  children,
  title,
  description,
  dense,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/40 bg-white/55 p-6 shadow-[var(--shadow-glow)] backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/40 dark:shadow-[var(--shadow-glow-dark)]',
        dense && 'p-4 sm:p-5',
        'motion-safe:animate-[fade-in_0.5s_ease_both]',
        className
      )}
      {...props}
    >
      {(title || description) && (
        <header className="mb-4 space-y-1">
          {title && (
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}
        </header>
      )}
      {children}
    </div>
  )
}
