import { useEffect } from 'react'
import { absoluteUrl, schemaIdWebsite } from '../../lib/absolute-url'
import { DEFAULT_OG_TYPE, SEO_KEYWORDS_STRING, SITE_NAME } from '../../lib/seo-constants'

const PAGE_LD_ID = 'ld-json-page'

export type BreadcrumbItem = {
  name: string
  /** Path starting with `/`, e.g. `/about` */
  path: string
}

export type SEOProps = {
  title: string
  /** Primary meta description (unique per page). */
  description: string
  /** Path for canonical, e.g. `/` or `/about` */
  canonicalPath: string
  /** Visible + structured breadcrumb trail (include current page). */
  breadcrumb: BreadcrumbItem[]
  /** Extra keywords merged with sitewide defaults. */
  keywords?: readonly string[]
  noindex?: boolean
  /** Absolute URL for Open Graph / Twitter image */
  ogImage?: string
  ogType?: 'website' | 'article'
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string, extraAttrs?: Record<string, string>) {
  const sel = `link[rel="${rel}"]`
  let el = document.querySelector(sel) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
  if (extraAttrs) {
    for (const [k, v] of Object.entries(extraAttrs)) {
      el.setAttribute(k, v)
    }
  }
}

function removeTwitterMeta() {
  document.querySelectorAll('meta[name^="twitter:"]').forEach((n) => n.remove())
}

function buildKeywords(extra?: readonly string[]): string {
  if (!extra?.length) return SEO_KEYWORDS_STRING
  const merged = [...new Set([...SEO_KEYWORDS_STRING.split(', '), ...extra])]
  return merged.join(', ')
}

export function SEO({
  title,
  description,
  canonicalPath,
  breadcrumb,
  keywords: extraKeywords,
  noindex,
  ogImage,
  ogType = DEFAULT_OG_TYPE,
}: SEOProps) {
  useEffect(() => {
    const pageTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
    document.title = pageTitle

    upsertMeta('name', 'description', description)
    upsertMeta('name', 'keywords', buildKeywords(extraKeywords))

    const canonical = absoluteUrl(canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`)
    upsertLink('canonical', canonical)

    const ogImg =
      ogImage ||
      (typeof import.meta.env.VITE_OG_IMAGE === 'string' && import.meta.env.VITE_OG_IMAGE) ||
      ''

    upsertMeta('property', 'og:type', ogType)
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:title', pageTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:locale', 'en_US')
    if (ogImg) {
      upsertMeta('property', 'og:image', ogImg)
      upsertMeta('property', 'og:image:alt', `${SITE_NAME} — ${title}`)
    } else {
      document.querySelector('meta[property="og:image"]')?.remove()
      document.querySelector('meta[property="og:image:alt"]')?.remove()
    }

    removeTwitterMeta()
    const twCard = ogImg ? 'summary_large_image' : 'summary'
    upsertMeta('name', 'twitter:card', twCard)
    upsertMeta('name', 'twitter:title', pageTitle)
    upsertMeta('name', 'twitter:description', description)
    if (ogImg) {
      upsertMeta('name', 'twitter:image', ogImg)
      upsertMeta('name', 'twitter:image:alt', `${SITE_NAME} — ${title}`)
    }

    upsertLink('sitemap', absoluteUrl('/sitemap.xml'), {
      type: 'application/xml',
      title: 'Sitemap',
    })

    if (noindex) {
      upsertMeta('name', 'robots', 'noindex, nofollow')
    } else {
      upsertMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    }

    const websiteId = schemaIdWebsite()
    const pageUrl = canonical
    const pageId = `${pageUrl}#webpage`
    const crumbId = `${pageUrl}#breadcrumb`

    const itemListElement = breadcrumb.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    }))

    const pageGraph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': pageId,
          url: pageUrl,
          name: pageTitle,
          description,
          isPartOf: { '@id': websiteId },
          breadcrumb: { '@id': crumbId },
          inLanguage: 'en',
        },
        {
          '@type': 'BreadcrumbList',
          '@id': crumbId,
          itemListElement,
        },
      ],
    }

    document.getElementById(PAGE_LD_ID)?.remove()
    const ld = document.createElement('script')
    ld.type = 'application/ld+json'
    ld.id = PAGE_LD_ID
    ld.setAttribute('data-seo-managed', 'true')
    ld.textContent = JSON.stringify(pageGraph)
    document.head.appendChild(ld)

    return () => {
      ld.remove()
    }
  }, [title, description, canonicalPath, breadcrumb, extraKeywords, noindex, ogImage, ogType])

  return null
}
