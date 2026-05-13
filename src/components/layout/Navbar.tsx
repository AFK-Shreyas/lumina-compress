import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTheme } from '../../context/useTheme'
import { TOOL_NAV } from '../../config/tools-nav'
import { SITE_NAME } from '../../lib/seo-constants'
import { cn } from '../../lib/cn'

const nav = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
] as const

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-4">
      <span
        className={cn(
          'absolute left-0 top-0 h-0.5 w-4 rounded-full bg-current transition-transform duration-200',
          open && 'translate-y-1.5 rotate-45'
        )}
      />
      <span
        className={cn(
          'absolute left-0 top-1.5 h-0.5 w-4 rounded-full bg-current transition-opacity duration-200',
          open && 'opacity-0'
        )}
      />
      <span
        className={cn(
          'absolute left-0 top-3 h-0.5 w-4 rounded-full bg-current transition-transform duration-200',
          open && '-translate-y-1.5 -rotate-45'
        )}
      />
    </span>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { resolvedTheme, toggleTheme } = useTheme()
  const labelId = useId()
  const toolsDetailsRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const el = toolsDetailsRef.current
      if (!el?.open) return
      const t = e.target
      if (!(t instanceof Node) || !el.contains(t)) {
        el.open = false
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-white/55 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-950/55">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to="/"
          aria-label={`${SITE_NAME} — home`}
          className="group flex items-center gap-2 rounded-lg outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500"
        >
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-600/30 transition-transform duration-200 group-hover:scale-105"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
              focusable="false"
            >
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
              <path d="M8 22h12a2 2 0 002-2V4a2 2 0 00-2-2H8" />
            </svg>
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white sm:text-base">
            Lumina Compress
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium tracking-tight transition-colors duration-200',
                  isActive
                    ? 'bg-violet-600/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200'
                    : 'text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                )
              }
              end={to === '/'}
            >
              {label}
            </NavLink>
          ))}

          <details ref={toolsDetailsRef} className="group relative">
            <summary className="cursor-pointer list-none rounded-lg px-3 py-2 text-sm font-medium tracking-tight text-slate-600 marker:content-none hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white [&::-webkit-details-marker]:hidden">
              Tools
            </summary>
            <div className="absolute right-0 top-full z-[60] mt-1 max-h-[min(70vh,420px)] w-60 overflow-y-auto rounded-xl border border-white/40 bg-white/95 py-2 text-sm shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Image utilities</p>
              <ul className="space-y-0.5">
                {TOOL_NAV.map((t) => (
                  <li key={t.to}>
                    <Link
                      to={t.to}
                      className="block px-3 py-2 text-slate-700 hover:bg-violet-500/10 hover:text-violet-800 dark:text-slate-200 dark:hover:bg-violet-500/15 dark:hover:text-violet-100"
                    >
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/60 text-slate-800 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {resolvedTheme === 'dark' ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm5.657 2.343a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM18 11a1 1 0 110 2h-1a1 1 0 110-2h1zm-2.05 6.657a1 1 0 01-1.414 0l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 010 1.414zM12 18a1 1 0 01-1 1v-1a1 1 0 112 0v1a1 1 0 01-1 1zm-6.657-2.343a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM6 13a1 1 0 110-2H5a1 1 0 110 2h1zm2.343-8.657a1 1 0 011.414 0l.707.707A1 1 0 118.05 6.464l-.707-.707a1 1 0 010-1.414zM12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/60 text-slate-800 transition hover:bg-white md:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            aria-expanded={open}
            aria-controls={labelId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      <div
        id={labelId}
        className={cn(
          'border-t border-white/20 bg-white/70 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-950/80 md:hidden',
          open ? 'max-h-[min(85vh,640px)] overflow-y-auto opacity-100' : 'pointer-events-none max-h-0 overflow-hidden opacity-0'
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3" aria-label="Mobile">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-violet-600/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200'
                    : 'text-slate-700 hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/10'
                )
              }
              end={to === '/'}
            >
              {label}
            </NavLink>
          ))}
          <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tools</p>
          {TOOL_NAV.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
