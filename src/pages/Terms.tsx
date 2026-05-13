import { SEO } from '../components/seo/SEO'
import { Card } from '../components/ui/Card'
import { ROUTE_BREADCRUMBS } from '../config/breadcrumbs'
import { Link } from 'react-router-dom'

export function Terms() {
  return (
    <article aria-labelledby="page-heading" className="mx-auto max-w-3xl space-y-8">
      <SEO
        title="Terms of Service"
        description="Terms for using Lumina Compress, the client-side image compressor to compress image online and reduce image size for JPG, PNG, or WebP."
        canonicalPath="/terms"
        breadcrumb={ROUTE_BREADCRUMBS['/terms']}
      />
      <header className="space-y-3">
        <h1 id="page-heading" className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: May 12, 2026</p>
      </header>
      <Card title="Use of the service">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Lumina Compress is provided &quot;as is&quot; for lawful personal and commercial use. You are responsible
          for the images you process and for complying with applicable laws and third-party rights when using this
          photo compressor or any similar tool.
        </p>
      </Card>
      <Card title="No warranty">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          We do not warrant that the service will be error-free or uninterrupted. Output quality and file sizes
          depend on your browser, settings, and source material when you reduce image size with lossy formats.
        </p>
      </Card>
      <Card title="Limitation of liability">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          To the maximum extent permitted by law, Lumina Compress and its contributors are not liable for indirect
          or consequential damages arising from your use of the site.
        </p>
      </Card>
      <Card title="Changes">
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          We may update these terms from time to time. Continued use after changes constitutes acceptance of the
          revised terms. See also our{' '}
          <Link className="font-medium text-violet-600 underline-offset-2 hover:underline dark:text-violet-300" to="/privacy">
            Privacy Policy
          </Link>{' '}
          or open the{' '}
          <Link className="font-medium text-violet-600 underline-offset-2 hover:underline dark:text-violet-300" to="/">
            image compressor
          </Link>
          .
        </p>
      </Card>
    </article>
  )
}
