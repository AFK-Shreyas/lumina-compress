/** Base site URL for canonicals and JSON-LD (set `VITE_SITE_URL` in production). */
export function getSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
}

/** Absolute URL for a path like `/about` including Vite `base`. */
export function absoluteUrl(path: string): string {
  const origin = getSiteOrigin()
  const base = import.meta.env.BASE_URL || '/'
  const baseNorm = base === '/' ? '' : base.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  if (!origin) return `${baseNorm}${p}`
  return `${origin}${baseNorm}${p}`
}

/** Root URL without trailing slash, for Schema.org `@id` fragments. */
export function siteRootForSchema(): string {
  return absoluteUrl('/').replace(/\/+$/, '')
}

export function schemaIdWebsite(): string {
  return `${siteRootForSchema()}#website`
}

export function schemaIdSoftware(): string {
  return `${siteRootForSchema()}#software`
}
