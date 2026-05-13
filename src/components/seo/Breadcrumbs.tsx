import { Link } from 'react-router-dom'
import type { BreadcrumbItem } from './SEO'
import { cn } from '../../lib/cn'

type Props = {
  items: BreadcrumbItem[]
  /** Hide when only “Home” on the landing page */
  hideOnSingleHome?: boolean
}

export function Breadcrumbs({ items, hideOnSingleHome }: Props) {
  if (hideOnSingleHome && items.length === 1 && items[0]?.path === '/') {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.path}-${item.name}`} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden className="select-none text-slate-400 dark:text-slate-600">
                  /
                </span>
              )}
              {isLast ? (
                <span
                  className="font-medium text-slate-900 dark:text-white"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className={cn(
                    'rounded-md text-violet-700 underline-offset-2 transition hover:text-violet-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:text-violet-300 dark:hover:text-violet-200'
                  )}
                >
                  {item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
