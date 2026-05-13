const STORAGE_KEY = 'lumina_recent_tools_v1'
const MAX = 6

export function recordToolVisit(path: string): void {
  try {
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[]
    const next = [path, ...prev.filter((p) => p !== path)].slice(0, MAX)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

export function readRecentTools(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}
