const STORAGE_KEY = 'lumina-compress-history-v1'
const MAX_ENTRIES = 15

export type CompressionHistoryEntry = {
  id: string
  name: string
  ts: number
  originalBytes: number
  compressedBytes: number
  reducedPct: number
  width: number
  height: number
  mimeType: string
  /** Tiny JPEG data URL for strip UI (~2–8 KB each, capped by count) */
  thumbDataUrl?: string
}

function readRaw(): CompressionHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (e): e is CompressionHistoryEntry =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as CompressionHistoryEntry).id === 'string' &&
        typeof (e as CompressionHistoryEntry).name === 'string'
    )
  } catch {
    return []
  }
}

export function getCompressionHistory(): CompressionHistoryEntry[] {
  return readRaw()
}

export function clearCompressionHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export async function thumbDataUrlFromBlob(blob: Blob, maxEdge = 96): Promise<string | undefined> {
  try {
    const bmp = await createImageBitmap(blob)
    try {
      const { width: w0, height: h0 } = bmp
      const scale = Math.min(1, maxEdge / Math.max(w0, h0))
      const w = Math.max(1, Math.round(w0 * scale))
      const h = Math.max(1, Math.round(h0 * scale))
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')
      if (!ctx) return undefined
      ctx.drawImage(bmp, 0, 0, w, h)
      return c.toDataURL('image/jpeg', 0.55)
    } finally {
      bmp.close()
    }
  } catch {
    return undefined
  }
}

export function appendCompressionHistory(entry: CompressionHistoryEntry): void {
  try {
    const prev = readRaw().filter((e) => e.id !== entry.id)
    const next = [entry, ...prev].slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('lumina-history-updated'))
  } catch {
    /* ignore quota */
  }
}
