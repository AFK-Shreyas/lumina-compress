import { ImageCompressor } from '../components/home/ImageCompressor'
import { HomeSeoContent } from '../components/home/HomeSeoContent'
import { ToolsDiscoverySection } from '../components/home/ToolsDiscoverySection'
import { SEO } from '../components/seo/SEO'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ROUTE_BREADCRUMBS } from '../config/breadcrumbs'
import { useNavigate } from 'react-router-dom'

const HOME_KEYWORDS_EXTRA = [
  'webp compressor',
  'compress photos online',
  'shrink images',
  'resize image online',
  'crop image online',
  'passport photo maker',
  'compress image to 50kb',
  'instagram image resizer',
] as const

export function Home() {
  const navigate = useNavigate()

  return (
    <article aria-labelledby="page-heading" className="space-y-10 sm:space-y-14">
      <SEO
        title="Free image compressor online — JPG, PNG & WebP"
        description="Lumina Compress is a fast image compressor and photo compressor you can use in your browser: compress image online, reduce image size, and export optimized JPG, PNG, or WebP files with optional ZIP download — no uploads, no backend."
        canonicalPath="/"
        breadcrumb={ROUTE_BREADCRUMBS['/']}
        keywords={HOME_KEYWORDS_EXTRA}
      />
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6 motion-safe:animate-[fade-up_0.55s_cubic-bezier(0.22,1,0.36,1)_both] [contain:layout]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
            Private · Fast · Free
          </p>
          <h1
            id="page-heading"
            className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white"
          >
            Free image compressor online — reduce image size for JPG, PNG, and WebP
          </h1>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
            Compress image online with a responsive, mobile-first tool: a practical{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">jpg compressor</strong>,{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">png compressor</strong>, and{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">photo compressor</strong> that
            keeps files on your device. Built for static hosting and Core Web Vitals–friendly delivery.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              glass
              onClick={() => {
                const el = document.getElementById('compressor')
                if (!el) return
                const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
                el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
              }}
            >
              Start compressing
            </Button>
            <Button variant="outline" glass type="button" onClick={() => navigate('/about')}>
              How it works
            </Button>
          </div>
        </div>
        <Card
          className="transition-transform duration-300 hover:-translate-y-0.5 motion-safe:animate-[fade-up_0.65s_cubic-bezier(0.22,1,0.36,1)_0.08s_both] [contain:layout]"
          title="Why use this image compressor?"
          description="Designed for speed, accessibility, and privacy-first SEO."
        >
          <ul className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" aria-hidden />
              No server uploads — ideal when you need to compress image online without sharing originals.
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-fuchsia-500" aria-hidden />
              Mobile-friendly controls and reduced-motion–aware animations for better usability and mobile SEO.
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
              Semantic pages, structured data, and internal links help search engines understand this free image
              compressor.
            </li>
          </ul>
        </Card>
      </section>

      <section id="compressor" className="scroll-mt-28 [contain:layout]" aria-labelledby="compressor-heading">
        <h2
          id="compressor-heading"
          className="mb-4 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-white"
        >
          Online photo compressor
        </h2>
        <ImageCompressor />
      </section>

      <ToolsDiscoverySection />

      <HomeSeoContent />
    </article>
  )
}
