import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { POPULAR_TOOLS, TOOL_NAV, labelForToolPath } from '../../config/tools-nav'
import { readRecentTools } from '../../lib/recentTools'

export function ToolsDiscoverySection() {
  const recentPaths = readRecentTools().filter((p) => p !== '/')

  return (
    <section className="grid gap-6 lg:grid-cols-2" aria-labelledby="tools-hub-heading">
      <h2 id="tools-hub-heading" className="sr-only">
        Popular and recent tools
      </h2>
      <Card title="Popular tools" description="Fast paths for creators and form uploads.">
        <ul className="grid gap-2 sm:grid-cols-2">
          {POPULAR_TOOLS.map((t) => (
            <li key={t.to}>
              <Link
                to={t.to}
                className="flex rounded-xl border border-white/40 bg-white/35 px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:border-violet-300/60 hover:bg-white/55 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:border-violet-400/40"
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </Card>
      <Card
        title="Recent tools"
        description="Based on this browser — clears if you reset site data."
      >
        {recentPaths.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">Visit any tool page to build your history.</p>
        ) : (
          <ul className="space-y-2">
            {recentPaths.map((path) => (
              <li key={path}>
                <Link
                  to={path}
                  className="text-sm font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
                >
                  {labelForToolPath(path)}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
          All tools:{' '}
          {TOOL_NAV.map((t, i) => (
            <span key={t.to}>
              {i > 0 ? ' · ' : ''}
              <Link to={t.to} className="font-medium text-violet-700 hover:underline dark:text-violet-300">
                {t.label}
              </Link>
            </span>
          ))}
        </p>
      </Card>
    </section>
  )
}
