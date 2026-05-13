import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { absoluteUrl } from '../../lib/absolute-url'
import { SEO, type BreadcrumbItem } from '../seo/SEO'
import { Card } from '../ui/Card'
import { AdPlaceholder } from '../ads/AdPlaceholder'
import { recordToolVisit } from '../../lib/recentTools'

export type FaqItem = { q: string; a: string }

type ToolSeoPageProps = {
  title: string
  description: string
  canonicalPath: string
  breadcrumb: BreadcrumbItem[]
  keywords?: readonly string[]
  /** Short intro under H1 */
  intro: string
  /** Rich paragraphs (HTML strings avoided — plain strings) */
  sections: { heading: string; body: string[] }[]
  faq: FaqItem[]
  related: { to: string; label: string }[]
  children: ReactNode
}

const FAQ_LD = 'ld-json-tool-faq'

export function ToolSeoPage({
  title,
  description,
  canonicalPath,
  breadcrumb,
  keywords,
  intro,
  sections,
  faq,
  related,
  children,
}: ToolSeoPageProps) {
  useEffect(() => {
    recordToolVisit(canonicalPath)
  }, [canonicalPath])

  useEffect(() => {
    const pageUrl = absoluteUrl(canonicalPath)
    const graph = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    }
    document.getElementById(FAQ_LD)?.remove()
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = FAQ_LD
    el.setAttribute('data-seo-managed', 'true')
    el.textContent = JSON.stringify(graph)
    document.head.appendChild(el)
    return () => el.remove()
  }, [canonicalPath, faq])

  return (
    <article className="space-y-10" aria-labelledby="tool-heading">
      <SEO
        title={title}
        description={description}
        canonicalPath={canonicalPath}
        breadcrumb={breadcrumb}
        keywords={keywords}
        ogType="article"
      />

      <header className="space-y-3">
        <h1 id="tool-heading" className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {title}
        </h1>
        <p className="max-w-3xl text-pretty text-base leading-relaxed text-slate-600 dark:text-slate-400">{intro}</p>
      </header>

      <AdPlaceholder variant="in-content" slotKey={`tool-top-${canonicalPath}`} className="!min-h-[120px]" />

      {children}

      <div className="space-y-6">
        {sections.map((s) => (
          <Card key={s.heading} title={s.heading}>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card title="Frequently asked questions">
        <div className="divide-y divide-slate-200/80 dark:divide-white/10">
          {faq.map((item) => (
            <details key={item.q} className="group py-4 first:pt-0 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-left text-sm font-semibold text-slate-900 outline-none dark:text-white [&:focus-visible]:ring-2 [&:focus-visible]:ring-violet-500">
                {item.q}
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-200/80 text-slate-500 transition group-open:rotate-45 dark:border-white/10 dark:text-slate-400"
                >
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.a}</p>
            </details>
          ))}
        </div>
      </Card>

      <Card title="Related tools">
        <ul className="flex flex-wrap gap-3 text-sm">
          {related.map((r) => (
            <li key={r.to}>
              <Link className="font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-300" to={r.to}>
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <AdPlaceholder variant="after-download" slotKey={`tool-bottom-${canonicalPath}`} />
    </article>
  )
}
