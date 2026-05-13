import { useContext } from 'react'
import { NotifyContext } from './notify-context'

export function useNotify() {
  const ctx = useContext(NotifyContext)
  if (!ctx) throw new Error('useNotify must be used within NotifyProvider')
  return ctx
}
