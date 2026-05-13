import { useEffect } from 'react'
import { absoluteUrl, schemaIdSoftware, schemaIdWebsite } from '../../lib/absolute-url'
import { SEO_KEYWORDS_STRING, SITE_NAME, SUPPORT_EMAIL } from '../../lib/seo-constants'

const SCRIPT_ID = 'ld-json-global-schemas'

/** Sitewide WebSite + SoftwareApplication (injected once). */
export function GlobalSchemas() {
  useEffect(() => {
    const home = absoluteUrl('/')
    const websiteId = schemaIdWebsite()
    const softwareId = schemaIdSoftware()

    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': websiteId,
          url: home,
          name: SITE_NAME,
          description:
            'Free online image compressor to reduce image size for JPG, PNG, and WebP — compress photos in your browser with no upload.',
          inLanguage: 'en',
          publisher: { '@id': softwareId },
        },
        {
          '@type': 'SoftwareApplication',
          '@id': softwareId,
          name: SITE_NAME,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          description:
            'Client-side image compressor and photo compressor. Compress image online, reduce file size, and download JPG, PNG, or WebP without a backend.',
          featureList: [
            'image compressor',
            'compress image online',
            'reduce image size',
            'jpg compressor',
            'png compressor',
            'photo compressor',
            'ZIP download',
          ],
          keywords: SEO_KEYWORDS_STRING,
          url: home,
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: SUPPORT_EMAIL,
            url: home,
          },
        },
      ],
    }

    const existing = document.getElementById(SCRIPT_ID)
    existing?.remove()

    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = SCRIPT_ID
    el.setAttribute('data-seo-managed', 'true')
    el.textContent = JSON.stringify(graph)
    document.head.appendChild(el)

    return () => {
      el.remove()
    }
  }, [])

  return null
}
