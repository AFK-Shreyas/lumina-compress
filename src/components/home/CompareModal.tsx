import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { ViewportModal } from '../ui/ViewportModal'
import { cn } from '../../lib/cn'

type SliderProps = {
  beforeSrc: string
  afterSrc: string
  beforeLabel: string
  afterLabel: string
}

export function ComparisonSlider({ beforeSrc, afterSrc, beforeLabel, afterLabel }: SliderProps) {
  const [pct, setPct] = useState(50)
  const labelId = useId()

  const onInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPct(Number(e.target.value))
  }, [])

  return (
    <div
      className="relative w-full select-none touch-pan-y"
      style={{ aspectRatio: '16 / 10' }}
      aria-labelledby={labelId}
    >
      <p id={labelId} className="sr-only">
        Drag horizontally to compare before and after images
      </p>
      <img
        src={beforeSrc}
        alt={beforeLabel}
        className="absolute inset-0 h-full w-full rounded-lg bg-slate-900/10 object-contain dark:bg-black/40"
        draggable={false}
        decoding="async"
      />
      <div
        className="absolute inset-0 overflow-hidden rounded-lg"
        style={{ clipPath: `inset(0 0 0 ${pct}%)` }}
      >
        <img
          src={afterSrc}
          alt={afterLabel}
          className="h-full w-full object-contain"
          draggable={false}
          decoding="async"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-md ring-1 ring-black/20"
        style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
        aria-hidden
      />
      <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
        Before
      </div>
      <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
        After
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={onInput}
        className="absolute inset-0 z-10 h-full w-full cursor-ew-resize opacity-0"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Compare before and after"
      />
    </div>
  )
}

type ModalProps = {
  open: boolean
  title: string
  beforeSrc: string
  afterSrc: string
  fileName: string
  onClose: () => void
}

export function CompareModal({ open, title, beforeSrc, afterSrc, fileName, onClose }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const id = window.requestAnimationFrame(() => {
      closeRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(id)
  }, [open])

  return (
    <ViewportModal
      open={open}
      onClose={onClose}
      panelMaxWidthClass="max-w-3xl"
      ariaLabelledBy="compare-modal-title"
      backdropLabel="Close comparison"
      panelClassName={cn(
        'border-white/50 bg-white/95 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 sm:p-6'
      )}
      backdropClassName="bg-slate-950/60"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="compare-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400" title={fileName}>
            {fileName}
          </p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
        >
          Close
        </button>
      </div>
      <ComparisonSlider
        beforeSrc={beforeSrc}
        afterSrc={afterSrc}
        beforeLabel={`Original: ${fileName}`}
        afterLabel={`Compressed: ${fileName}`}
      />
    </ViewportModal>
  )
}
