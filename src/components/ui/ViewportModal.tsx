import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'

export type ViewportModalProps = {
  /** When false, nothing is rendered (no portal). */
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Max width utility for the panel (Tailwind). */
  panelMaxWidthClass?: string
  /** Applied to the centered panel (radius, padding, etc.). */
  panelClassName?: string
  /** Applied to the fullscreen backdrop button layer. */
  backdropClassName?: string
  /** `aria-labelledby` on the dialog panel. */
  ariaLabelledBy?: string
  /** `aria-describedby` on the dialog panel. */
  ariaDescribedBy?: string
  /** Accessible label for the invisible backdrop dismiss control. */
  backdropLabel?: string
  /** Lock document scroll while open (default true). */
  lockScroll?: boolean
  /** Extra classes on the fixed viewport root (e.g. z-index). */
  rootClassName?: string
  /** Forwarded to the scrollable dialog panel for focus queries. */
  panelRef?: React.RefObject<HTMLDivElement | null>
  /** Optional key handler on the panel (e.g. Escape) — Escape is also handled globally when `onClose` is set. */
  onPanelKeyDown?: (e: ReactKeyboardEvent<HTMLDivElement>) => void
  /** Panel overflow utilities (Tailwind). Default allows vertical scroll for tall dialogs. */
  panelOverflowClass?: string
  /** When false, skip overlay + panel enter animations. */
  animateEnter?: boolean
}

/**
 * Viewport-centered modal: `fixed` + flex center, rendered via **portal to `document.body`**
 * so parent `transform` / `filter` / `contain` cannot offset `position: fixed`.
 */
export function ViewportModal({
  open,
  onClose,
  children,
  panelMaxWidthClass,
  panelClassName,
  backdropClassName,
  ariaLabelledBy,
  ariaDescribedBy,
  backdropLabel = 'Close dialog',
  lockScroll = true,
  rootClassName,
  panelRef,
  onPanelKeyDown,
  panelOverflowClass,
  animateEnter = true,
}: ViewportModalProps) {
  const internalPanelRef = useRef<HTMLDivElement>(null)
  const panelEl = panelRef ?? internalPanelRef
  const maxW = panelMaxWidthClass ?? 'max-w-lg'
  const overflow = panelOverflowClass ?? 'overflow-y-auto overscroll-contain'

  useEffect(() => {
    if (!open || !lockScroll) return
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    const prevBodyPadding = body.style.paddingRight
    const scrollbar = window.innerWidth - html.clientWidth
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`
    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      body.style.paddingRight = prevBodyPadding
    }
  }, [open, lockScroll])

  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handlePanelKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      onPanelKeyDown?.(e)
    },
    [onPanelKeyDown]
  )

  useEffect(() => {
    if (!open) return
    const id = window.requestAnimationFrame(() => {
      panelEl.current?.focus()
    })
    return () => window.cancelAnimationFrame(id)
  }, [open, panelEl])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className={cn(
        'pointer-events-auto fixed inset-0 box-border flex items-center justify-center p-3 sm:p-6 md:p-8 lg:p-10',
        'z-[1400]',
        rootClassName
      )}
      role="presentation"
    >
      <button
        type="button"
        className={cn(
          'absolute inset-0 border-0 bg-slate-950/55 backdrop-blur-sm',
          animateEnter &&
            'motion-safe:animate-[modal-overlay-in_0.22s_ease-out_both] motion-reduce:animate-none',
          backdropClassName
        )}
        aria-label={backdropLabel}
        onClick={onClose}
      />
      <div
        ref={panelEl}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
        onKeyDown={handlePanelKeyDown}
        className={cn(
          'relative z-10 box-border w-full max-h-[min(92dvh,52rem)] min-h-0 rounded-2xl border border-white/40 bg-white/95 shadow-2xl outline-none dark:border-white/10 dark:bg-slate-900/95 sm:rounded-3xl',
          overflow,
          animateEnter &&
            'motion-safe:animate-[modal-panel-in_0.28s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none',
          maxW,
          panelClassName
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}
