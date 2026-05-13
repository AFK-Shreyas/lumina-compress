import { SEO } from '../components/seo/SEO'
import { Card } from '../components/ui/Card'
import { ROUTE_BREADCRUMBS } from '../config/breadcrumbs'
import { SUPPORT_EMAIL } from '../lib/seo-constants'
import { Link } from 'react-router-dom'

export function Privacy() {
  return (
    <article aria-labelledby="page-heading" className="mx-auto max-w-3xl space-y-8">
      <SEO
        title="Privacy Policy"
        description="Privacy policy for Lumina Compress, the browser-based image compressor: local processing, optional theme storage, and how we treat data when you compress image online."
        canonicalPath="/privacy"
        breadcrumb={ROUTE_BREADCRUMBS['/privacy']}
      />
      <header className="space-y-3">
        <h1 id="page-heading" className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: May 12, 2026</p>
      </header>
      <Card title="Summary">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Lumina Compress runs as a static web application. When you use this image compressor or photo compressor,
          processing happens entirely in your browser. We do not receive your images when you use the tool as
          shipped in this repository. Read our{' '}
          <Link to="/terms" className="font-medium text-violet-600 underline-offset-2 hover:underline dark:text-violet-300">
            terms of service
          </Link>{' '}
          or return to the{' '}
          <Link to="/" className="font-medium text-violet-600 underline-offset-2 hover:underline dark:text-violet-300">
            home image compressor
          </Link>
          .
        </p>
      </Card>
      <Card title="Local storage">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Theme preference (light or dark) may be stored in your browser&apos;s local storage to keep the UI
          consistent between visits. You can clear site data in your browser settings at any time.
        </p>
      </Card>
      <Card title="Hosting & analytics">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          If you deploy this app yourself, your hosting or analytics provider may collect standard server or usage
          logs according to their own policies. This template does not include analytics by default.
        </p>
      </Card>
      <Card title="Contact">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Questions about this policy? Email{' '}
          <a
            className="font-medium text-violet-600 underline-offset-2 hover:underline dark:text-violet-300"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </Card>
    </article>
  )
}
