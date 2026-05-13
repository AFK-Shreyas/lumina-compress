import { SEO } from '../components/seo/SEO'
import { Card } from '../components/ui/Card'
import { ROUTE_BREADCRUMBS } from '../config/breadcrumbs'
import { Link } from 'react-router-dom'

const ABOUT_KEYWORDS = ['browser image compressor', 'offline image compression'] as const

export function About() {
  return (
    <article aria-labelledby="page-heading" className="mx-auto max-w-3xl space-y-8">
      <SEO
        title="About — how our image compressor works"
        description="Learn how Lumina Compress runs as a client-side image compressor so you can compress image online, reduce image size for JPG or PNG, and keep photos private with no backend."
        canonicalPath="/about"
        breadcrumb={ROUTE_BREADCRUMBS['/about']}
        keywords={ABOUT_KEYWORDS}
      />
      <header className="space-y-3">
        <h1 id="page-heading" className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          About this free image compressor
        </h1>
        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
          Lumina Compress is a small, production-minded front end focused on privacy and speed. Images are processed
          with the browser Canvas API; nothing is sent to our servers because there are no servers in the
          compression path — a practical choice when you want a{' '}
          <Link to="/" className="font-medium text-violet-600 underline-offset-2 hover:underline dark:text-violet-300">
            jpg compressor or png compressor
          </Link>{' '}
          without uploads.
        </p>
      </header>
      <Card title="Our approach">
        <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          <p>
            We ship a static bundle you can host on any CDN or object storage. Routing is client-side, so you may
            want a SPA fallback rule on your host for deep links. For the fastest path to compress photos, jump to
            the{' '}
            <Link
              to="/#compressor"
              className="font-medium text-violet-600 underline-offset-2 hover:underline dark:text-violet-300"
            >
              online photo compressor
            </Link>
            .
          </p>
          <p>
            Accessibility and reduced-motion preferences are first-class: animations are gated with{' '}
            <code className="rounded bg-slate-900/5 px-1.5 py-0.5 text-xs dark:bg-white/10">motion-safe:</code>{' '}
            where it matters — supporting clearer focus outlines and keyboard-friendly navigation for all users.
          </p>
        </div>
      </Card>
    </article>
  )
}
