/**
 * Parse a positive integer from free-form input (trimmed).
 * Returns null for empty or non-numeric / non-positive values.
 */
export function parsePositiveInt(s: string): number | null {
  const t = s.trim().replace(/[,_\s]/g, '')
  if (t === '') return null
  const n = Number.parseInt(t, 10)
  if (!Number.isFinite(n) || n < 1) return null
  return n
}

export function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}
