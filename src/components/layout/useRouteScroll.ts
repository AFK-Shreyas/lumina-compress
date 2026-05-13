import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scroll to #compressor on home, otherwise smooth scroll to top on navigation. */
export function useRouteScroll() {
  const location = useLocation()

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (location.pathname === '/' && location.hash === '#compressor') {
      requestAnimationFrame(() => {
        document.getElementById('compressor')?.scrollIntoView({
          behavior: reduce ? 'auto' : 'smooth',
          block: 'start',
        })
      })
      return
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: reduce ? 'auto' : 'smooth',
    })
  }, [location.pathname, location.hash, location.key])
}
