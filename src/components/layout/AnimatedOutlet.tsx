import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

/** Lightweight route enter animation (CSS only, respects motion-reduce). */
export function AnimatedOutlet({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  return (
    <div
      key={pathname}
      className="motion-safe:animate-[page-enter_0.34s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none"
    >
      {children}
    </div>
  )
}
