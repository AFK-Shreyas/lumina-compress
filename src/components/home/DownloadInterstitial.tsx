import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../ui/Button'
import { ViewportModal } from '../ui/ViewportModal'

const COUNTDOWN_MS = 3000

type DownloadInterstitialProps = {
  variant: 'image' | 'zip'
  onClose: () => void
  onContinue: () => void
}

/**
 * Mount only while a download is gated (`key` on parent should change per session).
 * Placeholder interstitial — no real ad scripts.
 */
export function DownloadInterstitial({ variant, onClose, onContinue }: DownloadInterstitialProps) {
  const titleId = useId()
  const descId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)

  const headline =
    variant === 'zip' ? 'Your archive is ready' : 'Your compressed image is ready'

  useEffect(() => {
    let frame = 0
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      frame = requestAnimationFrame(() => {
        setProgress(100)
        setReady(true)
      })
      return () => cancelAnimationFrame(frame)
    }

    const started = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / COUNTDOWN_MS)
      setProgress(t * 100)
      if (t >= 1) {
        setReady(true)
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLButtonElement>('[data-modal-cancel]')?.focus()
    })
  }, [])

  useEffect(() => {
    if (!ready) return
    requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLButtonElement>('[data-continue-download]')?.focus()
    })
  }, [ready])

  return (
    <ViewportModal
      open
      onClose={onClose}
      panelRef={panelRef}
      ariaLabelledBy={titleId}
      ariaDescribedBy={descId}
      backdropLabel="Close download dialog"
      panelOverflowClass="overflow-hidden overscroll-contain"
      panelClassName="flex flex-col p-0"
    >
      <div className="border-b border-slate-200/80 px-6 pb-4 pt-6 dark:border-white/10">
        <h2 id={titleId} className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {headline}
        </h2>
        <p id={descId} className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Please review the placeholder below. A short wait keeps downloads sustainable when ads are enabled.
        </p>
        <p className="sr-only" aria-live="polite">
          {ready ? 'You can continue with your download.' : 'Please wait for the countdown to finish.'}
        </p>
      </div>

      <div className="space-y-4 px-6 py-5">
        <div
          className="flex min-h-[120px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/90 bg-slate-50/90 px-4 py-8 text-center dark:border-white/15 dark:bg-slate-950/40"
          aria-label="Advertisement placeholder"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Reserved slot
          </span>
          <p className="mt-2 max-w-sm text-sm font-medium text-slate-700 dark:text-slate-200">
            Google AdSense Interstitial Ad Slot
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Placeholder only — no ad script loaded.</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>Preparing download</span>
            <span aria-hidden>{ready ? '0s' : `${Math.max(0, Math.ceil((1 - progress / 100) * 3))}s`}</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-slate-200/90 dark:bg-white/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Download preparation progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-[width] duration-75 ease-linear motion-reduce:transition-none"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-200/80 bg-slate-50/80 px-6 py-4 dark:border-white/10 dark:bg-slate-950/50 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          glass
          data-modal-cancel
          onClick={onClose}
          className="sm:min-w-[7rem]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          glass
          data-continue-download
            disabled={!ready}
            onClick={() => onContinue()}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-600/30 sm:min-w-[11rem]"
          >
          Continue download
        </Button>
      </div>
    </ViewportModal>
  )
}
