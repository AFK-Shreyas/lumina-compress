import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AdPlaceholder } from '../ads/AdPlaceholder'
import { breadcrumbsForPath } from '../../config/breadcrumbs'
import { Breadcrumbs } from '../seo/Breadcrumbs'
import { GlobalSchemas } from '../seo/GlobalSchemas'
import { AnimatedOutlet } from './AnimatedOutlet'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { PageSkeleton } from './PageSkeleton'
import { useRouteScroll } from './useRouteScroll'

export function MainLayout() {
  const { pathname } = useLocation()
  useRouteScroll()
  const crumbs = breadcrumbsForPath(pathname)

  return (
    <div className="relative flex min-h-dvh flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
      <GlobalSchemas />
      <a
        href="#main-content"
        className="pointer-events-none fixed left-4 top-4 z-[100] -translate-y-16 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white opacity-0 transition focus:pointer-events-auto focus:translate-y-0 focus:opacity-100"
      >
        Skip to content
      </a>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(139,92,246,0.22),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_0%,rgba(244,114,182,0.12),transparent_45%),radial-gradient(ellipse_60%_40%_at_0%_100%,rgba(56,189,248,0.1),transparent_50%)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(139,92,246,0.35),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_0%,rgba(244,114,182,0.15),transparent_45%),radial-gradient(ellipse_60%_40%_at_0%_100%,rgba(56,189,248,0.12),transparent_50%)]"
      />
      <Navbar />

      {/* 1. Top banner — high viewability directly under navigation */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-3 sm:px-6 sm:pt-4">
        <AdPlaceholder variant="top-banner" slotKey="top-banner" className="shadow-sm" />
      </div>

      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:py-10"
      >
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_min(300px,32%)] lg:items-start lg:gap-8 xl:gap-10">
          <div className="min-w-0 space-y-6 lg:space-y-8">
            <Breadcrumbs items={crumbs} hideOnSingleHome />

            {/* 3. In-content — early in scroll path for balanced CTR without covering UI */}
            <AdPlaceholder variant="in-content" slotKey="in-content-primary" />

            <Suspense fallback={<PageSkeleton />}>
              <AnimatedOutlet>
                <Outlet />
              </AnimatedOutlet>
            </Suspense>
          </div>

          {/* 2. Sidebar — desktop only; sticky for persistent visibility while reading */}
          <aside
            className="mt-8 hidden min-w-0 lg:mt-0 lg:block"
            aria-label="Advertisement sidebar"
          >
            <div className="sticky top-24 space-y-6">
              <AdPlaceholder variant="sidebar" slotKey="sidebar-primary" />
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      {/* 4. Sticky mobile bottom — common high-CTR mobile placement; hidden on large screens */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/40 bg-white/85 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-slate-950/90 dark:shadow-[0_-8px_30px_rgba(0,0,0,0.45)] lg:hidden"
        role="complementary"
        aria-label="Mobile advertisement area"
      >
        <div className="mx-auto max-w-6xl px-4">
          <AdPlaceholder variant="mobile-sticky" slotKey="mobile-anchor" />
        </div>
      </div>
    </div>
  )
}
