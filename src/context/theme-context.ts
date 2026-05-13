import { createContext } from 'react'

export type Theme = 'light' | 'dark'

export type ThemeContextValue = {
  resolvedTheme: Theme
  userTheme: Theme | null
  setTheme: (theme: Theme | 'system') => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
