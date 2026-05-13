import { Link } from 'react-router-dom'
import { SUPPORT_EMAIL } from '../../lib/seo-constants'
import { TOOL_NAV } from '../../config/tools-nav'

const footerLinks = [{ to: '/about', label: 'About' }] as const

const legalLinks = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
] as const

const toolLinks = [
  { to: '/#compressor', label: 'Batch compressor' },
  { to: '/resize-image', label: 'Resize image' },
  { to: '/crop-image', label: 'Crop image' },
  { to: '/passport-photo-maker', label: 'Passport photo' },
] as const

const moreTools = TOOL_NAV.filter((t) => !toolLinks.some((x) => x.to === t.to))

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/25 bg-white/40 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:justify-between">
        <div className="max-w-md space-y-3">
          <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">Lumina Compress</p>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Free image compressor in your browser — reduce image size for JPG, PNG, and WebP without uploading
            originals. Built for privacy, mobile SEO, and static hosting.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-medium text-slate-800 dark:text-slate-200">Support:</span>{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
            >
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
          <nav className="flex flex-col gap-2" aria-label="Footer">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Site
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {footerLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm font-medium text-slate-600 transition hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
          <nav className="flex flex-col gap-2" aria-label="Legal">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Legal
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {legalLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm font-medium text-slate-600 transition hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
          <nav className="flex flex-col gap-2" aria-label="Image tools">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tools
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {toolLinks.map(({ to, label }) => (
                <Link
                  key={label}
                  to={to}
                  className="text-sm font-medium text-slate-600 transition hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300"
                >
                  {label}
                </Link>
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              More tools
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              {moreTools.map((t) => (
                <Link
                  key={t.to}
                  to={t.to}
                  className="text-xs font-medium text-slate-600 transition hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300"
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
      <div className="border-t border-white/20 py-4 text-center text-xs text-slate-500 dark:border-white/10 dark:text-slate-500">
        © {new Date().getFullYear()} Lumina Compress. All rights reserved.
      </div>
    </footer>
  )
}
