import { useCallback, useState } from 'react'
import { triggerFileDownload } from '../lib/triggerDownload'

export type DownloadGate = { variant: 'image' | 'zip'; url: string; filename: string } | null

export function useDownloadGate() {
  const [gate, setGate] = useState<DownloadGate>(null)

  const open = useCallback((variant: 'image' | 'zip', url: string, filename: string) => {
    setGate({ variant, url, filename })
  }, [])

  const dismiss = useCallback(() => {
    setGate((g) => {
      if (g?.variant === 'zip') URL.revokeObjectURL(g.url)
      return null
    })
  }, [])

  const confirm = useCallback(() => {
    setGate((g) => {
      if (!g) return null
      triggerFileDownload(g.url, g.filename)
      if (g.variant === 'zip') window.setTimeout(() => URL.revokeObjectURL(g.url), 1500)
      return null
    })
  }, [])

  return { gate, open, dismiss, confirm }
}
