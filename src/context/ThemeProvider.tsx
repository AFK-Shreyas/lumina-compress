import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme, type ThemeContextValue } from './theme-context'

const STORAGE_KEY = 'lumina-theme'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
  } catch {
    /* ignore */
  }
  return null
}

function readResolvedFromDom(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(readResolvedFromDom)
  const [userTheme, setUserTheme] = useState<Theme | null>(readStoredTheme)

  const apply = useCallback((next: Theme, stored: Theme | null) => {
    document.documentElement.classList.toggle('dark', next === 'dark')
    setResolvedTheme(next)
    setUserTheme(stored)
  }, [])

  const setTheme = useCallback(
    (theme: Theme | 'system') => {
      if (theme === 'system') {
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* ignore */
        }
        apply(getSystemTheme(), null)
        return
      }
      try {
        localStorage.setItem(STORAGE_KEY, theme)
      } catch {
        /* ignore */
      }
      apply(theme, theme)
    },
    [apply]
  )

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  const value = useMemo<ThemeContextValue>(
    () => ({ resolvedTheme, userTheme, setTheme, toggleTheme }),
    [resolvedTheme, userTheme, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
