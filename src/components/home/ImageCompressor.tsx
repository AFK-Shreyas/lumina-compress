import { memo, useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { AdPlaceholder } from '../ads/AdPlaceholder'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { DownloadInterstitial } from './DownloadInterstitial'
import {
  compressImageFile,
  extensionForMime,
  isSupportedImageFile,
  type CompressFormat,
  type CompressResult,
} from '../../lib/compressImage'
import {
  appendCompressionHistory,
  thumbDataUrlFromBlob,
} from '../../lib/compressionHistory'
import { cn } from '../../lib/cn'
import { triggerFileDownload } from '../../lib/triggerDownload'
import { useNotify } from '../../context/useNotify'
import { useTheme } from '../../context/useTheme'
import { CompareModal } from './CompareModal'
import { CompressionHistoryPanel } from './CompressionHistoryPanel'

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}

/** Positive = smaller than original (good). */
function percentReduced(original: number, compressed: number): number {
  if (original <= 0) return 0
  return Math.round((1 - compressed / original) * 100)
}

const PRESETS = {
  low: { quality: 0.52, maxEdge: 1280, label: 'Low', hint: 'Smallest files' },
  medium: { quality: 0.78, maxEdge: 1920, label: 'Medium', hint: 'Balanced' },
  high: { quality: 0.92, maxEdge: 2800, label: 'High', hint: 'Best quality' },
} as const

type PresetId = keyof typeof PRESETS | 'custom'

type ItemStatus = 'idle' | 'compressing' | 'done' | 'error'

type ImageItem = {
  id: string
  file: File
  previewUrl: string
  status: ItemStatus
  progress: number
  compressed?: CompressResult
  error?: string
}

function useObjectUrl(blob: Blob | undefined): string | undefined {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : undefined), [blob])
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])
  return url
}

const ProgressBar = memo(function ProgressBar({ value }: { value: number }) {
  return (
    <div
      className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-[width] duration-200 ease-out motion-reduce:transition-none"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
})

type ImagePreviewCardProps = {
  item: ImageItem
  busy: boolean
  sortable: boolean
  isSortSource: boolean
  isSortOver: boolean
  onRemove: (id: string) => void
  onRecompress: (id: string) => void
  onSortDragStart: (id: string) => void
  onSortDragEnd: () => void
  onSortDragOver: (id: string, e: DragEvent) => void
  onSortDrop: (id: string, e: DragEvent) => void
  onCompare: (id: string) => void
  onCopyStats: (id: string) => void
  onRequestDownload: (url: string, filename: string) => void
}

function previewPropsEqual(prev: ImagePreviewCardProps, next: ImagePreviewCardProps): boolean {
  return (
    prev.onRequestDownload === next.onRequestDownload &&
    prev.onRemove === next.onRemove &&
    prev.onRecompress === next.onRecompress &&
    prev.onSortDragStart === next.onSortDragStart &&
    prev.onSortDragEnd === next.onSortDragEnd &&
    prev.onSortDragOver === next.onSortDragOver &&
    prev.onSortDrop === next.onSortDrop &&
    prev.onCompare === next.onCompare &&
    prev.onCopyStats === next.onCopyStats &&
    prev.busy === next.busy &&
    prev.sortable === next.sortable &&
    prev.isSortSource === next.isSortSource &&
    prev.isSortOver === next.isSortOver &&
    prev.item.id === next.item.id &&
    prev.item.status === next.item.status &&
    prev.item.progress === next.item.progress &&
    prev.item.previewUrl === next.item.previewUrl &&
    prev.item.file.name === next.item.file.name &&
    prev.item.file.size === next.item.file.size &&
    prev.item.compressed === next.item.compressed &&
    prev.item.error === next.item.error
  )
}

const ImagePreviewCard = memo(function ImagePreviewCard({
  item,
  busy,
  sortable,
  isSortSource,
  isSortOver,
  onRemove,
  onRecompress,
  onSortDragStart,
  onSortDragEnd,
  onSortDragOver,
  onSortDrop,
  onCompare,
  onCopyStats,
  onRequestDownload,
}: ImagePreviewCardProps) {
  const downloadUrl = useObjectUrl(item.compressed?.blob)
  const baseName = item.file.name.replace(/\.[^.]+$/, '') || 'image'
  const ext = item.compressed ? extensionForMime(item.compressed.mimeType) : 'webp'
  const reduced =
    item.compressed && item.file.size > 0
      ? percentReduced(item.file.size, item.compressed.blob.size)
      : null

  const prevStatusRef = useRef<ItemStatus>(item.status)
  const [celebrate, setCelebrate] = useState(false)
  useEffect(() => {
    const prev = prevStatusRef.current
    prevStatusRef.current = item.status
    if (prev !== 'done' && item.status === 'done') {
      setCelebrate(true)
      const t = window.setTimeout(() => setCelebrate(false), 750)
      return () => window.clearTimeout(t)
    }
  }, [item.status])

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/45 shadow-[var(--shadow-glow)] backdrop-blur-xl transition-all duration-300 [contain:layout] dark:border-white/10 dark:bg-slate-900/45 dark:shadow-[var(--shadow-glow-dark)]',
        celebrate && 'motion-safe:animate-[compress-success_0.75s_ease-out]',
        'motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-violet-300/50 motion-safe:hover:shadow-lg motion-safe:hover:shadow-violet-500/10 dark:motion-safe:hover:border-violet-500/25',
        isSortOver && 'ring-2 ring-violet-500/70 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-950',
        isSortSource && 'opacity-80'
      )}
      onDragOver={(e) => {
        if (sortable && !busy) onSortDragOver(item.id, e)
      }}
      onDrop={(e) => {
        if (sortable && !busy) onSortDrop(item.id, e)
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-900/5 dark:bg-black/30">
        {sortable && !busy && (
          <div
            title="Drag to reorder"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/x-lumina-id', item.id)
              e.dataTransfer.effectAllowed = 'move'
              onSortDragStart(item.id)
            }}
            onDragEnd={onSortDragEnd}
            className="absolute left-2 top-2 z-20 flex h-9 w-9 cursor-grab touch-none items-center justify-center rounded-lg border border-white/50 bg-black/45 text-white shadow-md backdrop-blur-sm active:cursor-grabbing dark:border-white/15"
          >
            <span className="sr-only">Drag to reorder image in list</span>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="opacity-90">
              <circle cx="5" cy="4" r="1.2" fill="currentColor" />
              <circle cx="11" cy="4" r="1.2" fill="currentColor" />
              <circle cx="5" cy="8" r="1.2" fill="currentColor" />
              <circle cx="11" cy="8" r="1.2" fill="currentColor" />
              <circle cx="5" cy="12" r="1.2" fill="currentColor" />
              <circle cx="11" cy="12" r="1.2" fill="currentColor" />
            </svg>
          </div>
        )}
        <img
          src={item.previewUrl}
          alt={`Original preview: ${item.file.name}`}
          className="h-full w-full object-cover motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 320px"
        />
        {item.status === 'compressing' && (
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-3">
            <p className="mb-1.5 text-xs font-medium text-white">Compressing…</p>
            <ProgressBar value={item.progress} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white" title={item.file.name}>
            {item.file.name}
          </p>
          <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
            <dt className="text-slate-500 dark:text-slate-500">Original</dt>
            <dd className="text-right font-medium text-slate-800 dark:text-slate-200">
              {formatBytes(item.file.size)}
            </dd>
            <dt className="text-slate-500 dark:text-slate-500">Compressed</dt>
            <dd className="text-right font-medium text-slate-800 dark:text-slate-200">
              {item.compressed ? formatBytes(item.compressed.blob.size) : '—'}
            </dd>
            <dt className="text-slate-500 dark:text-slate-500">Reduced</dt>
            <dd className="text-right">
              {reduced === null ? (
                <span className="text-slate-400">—</span>
              ) : (
                <span
                  className={cn(
                    'font-semibold',
                    reduced >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  )}
                >
                  {reduced >= 0 ? `${reduced}%` : `${-reduced}% larger`}
                </span>
              )}
            </dd>
          </dl>
        </div>

        {item.status === 'error' && item.error && (
          <p className="rounded-lg border border-red-200/80 bg-red-50/90 px-2 py-1.5 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/50 dark:text-red-200">
            {item.error}
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onRemove(item.id)}
            className="rounded-lg border border-slate-200/90 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-red-300/80 hover:bg-red-50/80 hover:text-red-700 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-red-500/40 dark:hover:bg-red-950/30 dark:hover:text-red-300"
          >
            Remove
          </button>
          {item.status === 'done' && downloadUrl && (
            <>
              <Button
                size="sm"
                variant="secondary"
                glass
                type="button"
                disabled={busy}
                onClick={() => onRequestDownload(downloadUrl, `${baseName}-compressed.${ext}`)}
                className="!px-3 !py-1.5 !text-xs"
              >
                Download
              </Button>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                disabled={busy}
                onClick={() => onRecompress(item.id)}
                className="!px-3 !py-1.5 !text-xs"
              >
                Re-run
              </Button>
              <Button
                size="sm"
                variant="outline"
                type="button"
                glass
                disabled={busy}
                onClick={() => onCompare(item.id)}
                className="!px-3 !py-1.5 !text-xs"
              >
                Compare
              </Button>
              <Button
                size="sm"
                variant="outline"
                type="button"
                glass
                disabled={busy}
                onClick={() => onCopyStats(item.id)}
                className="!px-3 !py-1.5 !text-xs"
              >
                Copy stats
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}, previewPropsEqual)

export function ImageCompressor() {
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const itemsRef = useRef<ImageItem[]>([])
  const [items, setItems] = useState<ImageItem[]>([])

  useEffect(() => {
    itemsRef.current = items
  }, [items])
  const [quality, setQuality] = useState<number>(PRESETS.medium.quality)
  const [maxEdge, setMaxEdge] = useState<number>(PRESETS.medium.maxEdge)
  const [preset, setPreset] = useState<PresetId>('medium')
  const [format, setFormat] = useState<CompressFormat>('image/webp')
  const [globalBusy, setGlobalBusy] = useState(false)
  const [zipBusy, setZipBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragDepth, setDragDepth] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)
  const { notify } = useNotify()
  const { toggleTheme, resolvedTheme } = useTheme()
  const [compareId, setCompareId] = useState<string | null>(null)
  const [dragSortId, setDragSortId] = useState<string | null>(null)
  const [dragOverSortId, setDragOverSortId] = useState<string | null>(null)
  const [downloadGate, setDownloadGate] = useState<
    null | { variant: 'image' | 'zip'; url: string; filename: string }
  >(null)

  const openDownloadGate = useCallback((variant: 'image' | 'zip', url: string, filename: string) => {
    setDownloadGate({ variant, url, filename })
  }, [])

  const dismissDownloadGate = useCallback(() => {
    setDownloadGate((current) => {
      if (current?.variant === 'zip') URL.revokeObjectURL(current.url)
      return null
    })
  }, [])

  const confirmDownloadGate = useCallback(() => {
    setDownloadGate((current) => {
      if (!current) return null
      triggerFileDownload(current.url, current.filename)
      if (current.variant === 'zip') {
        const u = current.url
        window.setTimeout(() => URL.revokeObjectURL(u), 1500)
      }
      return null
    })
  }, [])

  const requestFileDownload = useCallback(
    (url: string, filename: string) => {
      openDownloadGate('image', url, filename)
    },
    [openDownloadGate]
  )

  const compareItem = useMemo(
    () => items.find((i) => i.id === compareId && i.status === 'done' && i.compressed),
    [items, compareId]
  )
  const compareAfterUrl = useObjectUrl(compareItem?.compressed?.blob)

  const isDragging = dragDepth > 0

  const revokeItem = useCallback((it: ImageItem) => {
    URL.revokeObjectURL(it.previewUrl)
  }, [])

  const addFiles = useCallback((list: FileList | null) => {
    if (!list?.length) return
    const images = Array.from(list).filter(isSupportedImageFile)
    if (images.length === 0) {
      setError('No supported images found. Use JPG, JPEG, PNG, or WebP.')
      return
    }
    setError(null)
    setItems((prev) => [
      ...prev,
      ...images.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'idle' as const,
        progress: 0,
      })),
    ])
  }, [])

  const removeItem = useCallback(
    (id: string) => {
      if (globalBusy) return
      setCompareId((c) => (c === id ? null : c))
      setItems((prev) => {
        const it = prev.find((i) => i.id === id)
        if (it) revokeItem(it)
        return prev.filter((i) => i.id !== id)
      })
    },
    [globalBusy, revokeItem]
  )

  const resetAll = useCallback(() => {
    abortRef.current?.abort()
    setItems((prev) => {
      prev.forEach(revokeItem)
      return []
    })
    setError(null)
    setOverallProgress(0)
    setGlobalBusy(false)
    setCompareId(null)
    setDragSortId(null)
    setDragOverSortId(null)
  }, [revokeItem])

  useEffect(() => {
    return () => {
      for (const it of itemsRef.current) {
        URL.revokeObjectURL(it.previewUrl)
      }
    }
  }, [])

  const applyPreset = useCallback((id: keyof typeof PRESETS) => {
    const p = PRESETS[id]
    setPreset(id)
    setQuality(p.quality)
    setMaxEdge(p.maxEdge)
  }, [])

  const onQualitySlider = useCallback((v: number) => {
    setQuality(v)
    setPreset('custom')
  }, [])

  const onMaxEdgeSlider = useCallback((v: number) => {
    setMaxEdge(v)
    setPreset('custom')
  }, [])

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setDragDepth(0)
      addFiles(e.dataTransfer.files)
    },
    [addFiles]
  )

  const compressOne = useCallback(
    async (item: ImageItem, signal: AbortSignal): Promise<boolean> => {
      const { id } = item

      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: 'compressing' as const, progress: 0, error: undefined } : i
        )
      )

      try {
        const result = await compressImageFile(item.file, {
          maxEdge,
          quality,
          format,
          onProgress: (t) => {
            if (signal.aborted) return
            setItems((prev) =>
              prev.map((i) => (i.id === id ? { ...i, progress: Math.round(t * 100) } : i))
            )
          },
        })
        if (signal.aborted) return false
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, status: 'done' as const, progress: 100, compressed: result, error: undefined }
              : i
          )
        )
        void (async () => {
          try {
            const thumb = await thumbDataUrlFromBlob(result.blob)
            appendCompressionHistory({
              id: crypto.randomUUID(),
              name: item.file.name,
              ts: Date.now(),
              originalBytes: item.file.size,
              compressedBytes: result.blob.size,
              reducedPct: percentReduced(item.file.size, result.blob.size),
              width: result.width,
              height: result.height,
              mimeType: result.mimeType,
              thumbDataUrl: thumb,
            })
          } catch {
            /* ignore thumb/history */
          }
        })()
        return true
      } catch {
        if (signal.aborted) return false
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: 'error' as const,
                  progress: 0,
                  compressed: undefined,
                  error: 'Could not compress this file.',
                }
              : i
          )
        )
        return false
      }
    },
    [maxEdge, quality, format]
  )

  const compressAll = useCallback(async () => {
    const snapshot = itemsRef.current
    if (snapshot.length === 0) return
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    const { signal } = ac

    setGlobalBusy(true)
    setError(null)
    setOverallProgress(0)

    const total = snapshot.length
    let succeeded = 0

    try {
      for (let n = 0; n < snapshot.length; n++) {
        if (signal.aborted) break
        if (await compressOne(snapshot[n], signal)) succeeded += 1
        if (!signal.aborted) {
          setOverallProgress(Math.round(((n + 1) / total) * 100))
        }
      }
    } finally {
      if (!signal.aborted) {
        setGlobalBusy(false)
        setOverallProgress(100)
        if (succeeded > 0) {
          notify(
            succeeded === 1 ? '1 image compressed.' : `${succeeded} images compressed.`,
            'success'
          )
        }
      } else {
        setGlobalBusy(false)
        setOverallProgress(0)
        setItems((prev) =>
          prev.map((i) =>
            i.status === 'compressing' ? { ...i, status: 'idle' as const, progress: 0 } : i
          )
        )
      }
    }
  }, [compressOne, notify])

  const recompressOne = useCallback(
    async (id: string) => {
      if (globalBusy) return
      const item = itemsRef.current.find((i) => i.id === id)
      if (!item) return
      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac
      setGlobalBusy(true)
      try {
        const ok = await compressOne(item, ac.signal)
        if (ok) notify('Image compressed.', 'success')
      } finally {
        setGlobalBusy(false)
      }
    },
    [globalBusy, compressOne, notify]
  )

  const reorderItems = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return
    setItems((prev) => {
      const i = prev.findIndex((x) => x.id === fromId)
      const j = prev.findIndex((x) => x.id === toId)
      if (i < 0 || j < 0) return prev
      const next = [...prev]
      const [row] = next.splice(i, 1)
      next.splice(j, 0, row)
      return next
    })
  }, [])

  const onSortDragStart = useCallback((id: string) => {
    setDragSortId(id)
  }, [])

  const onSortDragEnd = useCallback(() => {
    setDragSortId(null)
    setDragOverSortId(null)
  }, [])

  const onSortDragOver = useCallback(
    (id: string, e: DragEvent) => {
      if (!dragSortId || dragSortId === id) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDragOverSortId(id)
    },
    [dragSortId]
  )

  const onSortDrop = useCallback(
    (targetId: string, e: DragEvent) => {
      e.preventDefault()
      const fromId = e.dataTransfer.getData('application/x-lumina-id')
      if (fromId) reorderItems(fromId, targetId)
      setDragSortId(null)
      setDragOverSortId(null)
    },
    [reorderItems]
  )

  const openCompare = useCallback((id: string) => {
    const it = itemsRef.current.find((i) => i.id === id)
    if (it?.status === 'done' && it.compressed) setCompareId(id)
  }, [])

  const closeCompare = useCallback(() => setCompareId(null), [])

  const copyStatsForId = useCallback(
    async (id: string) => {
      const it = items.find((i) => i.id === id)
      if (!it?.compressed) return
      const reduced = percentReduced(it.file.size, it.compressed.blob.size)
      const text = [
        `File: ${it.file.name}`,
        `Original: ${formatBytes(it.file.size)}`,
        `Compressed: ${formatBytes(it.compressed.blob.size)}`,
        `Change: ${reduced >= 0 ? `${reduced}% smaller` : `${-reduced}% larger`}`,
        `Dimensions: ${it.compressed.width}×${it.compressed.height}`,
        `MIME: ${it.compressed.mimeType}`,
      ].join('\n')
      try {
        await navigator.clipboard.writeText(text)
        notify('Stats copied.', 'success')
      } catch {
        notify('Could not copy to clipboard.', 'error')
      }
    },
    [items, notify]
  )

  const copyAllStats = useCallback(async () => {
    const blocks: string[] = []
    for (const it of items) {
      if (it.status !== 'done' || !it.compressed) continue
      const reduced = percentReduced(it.file.size, it.compressed.blob.size)
      blocks.push(
        [
          `File: ${it.file.name}`,
          `Original: ${formatBytes(it.file.size)}`,
          `Compressed: ${formatBytes(it.compressed.blob.size)}`,
          `Change: ${reduced >= 0 ? `${reduced}% smaller` : `${-reduced}% larger`}`,
          `Dimensions: ${it.compressed.width}×${it.compressed.height}`,
          `MIME: ${it.compressed.mimeType}`,
        ].join('\n')
      )
    }
    if (blocks.length === 0) {
      notify('No compressed files to copy yet.', 'info')
      return
    }
    try {
      await navigator.clipboard.writeText(blocks.join('\n\n—\n\n'))
      notify(`Copied stats for ${blocks.length} file${blocks.length === 1 ? '' : 's'}.`, 'success')
    } catch {
      notify('Could not copy to clipboard.', 'error')
    }
  }, [items, notify])

  const shareTool = useCallback(async () => {
    const url = window.location.href
    const title = document.title
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title,
          text: 'Lumina image compressor — runs entirely in your browser.',
          url,
        })
        notify('Thanks for sharing.', 'success')
        return
      }
    } catch (e) {
      if ((e as { name?: string }).name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(url)
      notify('Link copied to clipboard.', 'success')
    } catch {
      notify('Could not share or copy the link.', 'error')
    }
  }, [notify])

  const downloadZip = useCallback(async () => {
    const done = items.filter((i) => i.status === 'done' && i.compressed)
    if (done.length === 0) return

    setZipBusy(true)
    setError(null)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      for (const i of done) {
        if (!i.compressed) continue
        const ext = extensionForMime(i.compressed.mimeType)
        const base = i.file.name.replace(/\.[^.]+$/, '') || 'image'
        zip.file(`${base}-compressed.${ext}`, i.compressed.blob)
      }
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
        streamFiles: true,
      })
      const url = URL.createObjectURL(blob)
      openDownloadGate('zip', url, `lumina-compressed-${Date.now()}.zip`)
    } catch {
      setError('Could not build the ZIP archive. Try downloading files individually.')
    } finally {
      setZipBusy(false)
    }
  }, [items, openDownloadGate])

  const doneCount = items.filter((i) => i.status === 'done').length

  return (
    <Card
      title="Image compressor"
      description="Client-side compression for JPG, JPEG, PNG, and WebP — resize, encode, track progress, download or ZIP — no server."
      className="motion-safe:animate-[fade-up_0.55s_cubic-bezier(0.22,1,0.36,1)_both] [contain:layout]"
    >
      <div className="space-y-8">
        {/* Drop zone + CTAs */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <div
            role="presentation"
            onDragEnter={(e) => {
              e.preventDefault()
              setDragDepth((d) => d + 1)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setDragDepth((d) => Math.max(0, d - 1))
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className={cn(
              'relative flex min-h-[180px] flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 sm:min-h-[200px] sm:p-8',
              isDragging
                ? 'scale-[1.01] border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20 dark:border-violet-400 dark:bg-violet-500/15'
                : 'border-slate-300/90 bg-white/35 hover:border-violet-400/70 hover:bg-white/55 dark:border-white/15 dark:bg-white/5 dark:hover:border-violet-400/50 dark:hover:bg-white/10'
            )}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
            tabIndex={0}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(e) => {
                addFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <span className="mb-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-md shadow-violet-600/30">
              Drop images here
            </span>
            <p className="max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              JPG, JPEG, PNG, and WebP — processed entirely in your browser. Multi-file upload supported.
            </p>
          </div>

          <div className="flex shrink-0 flex-col justify-center gap-3 sm:flex-row lg:w-56 lg:flex-col">
            <Button
              type="button"
              size="lg"
              glass
              disabled={globalBusy}
              onClick={() => inputRef.current?.click()}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-600/35 transition hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-500/40 sm:flex-1 lg:flex-none"
            >
              Upload images
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              glass
              disabled={globalBusy || items.length === 0}
              onClick={resetAll}
              className="w-full sm:flex-1 lg:flex-none"
            >
              Reset all
            </Button>
          </div>
        </div>

        {/* Presets + quality */}
        <div className="space-y-5 rounded-2xl border border-white/40 bg-white/35 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/5 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Compression preset
            </span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  disabled={globalBusy}
                  onClick={() => applyPreset(id)}
                  className={cn(
                    'rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-50',
                    preset === id
                      ? 'border-violet-500 bg-violet-600 text-white shadow-md shadow-violet-600/25 dark:border-violet-400 dark:bg-violet-500'
                      : 'border-slate-200/80 bg-white/60 text-slate-800 hover:border-violet-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:border-violet-400/50'
                  )}
                >
                  <span className="block leading-tight">{PRESETS[id].label}</span>
                  <span className="block text-[10px] font-normal opacity-80">{PRESETS[id].hint}</span>
                </button>
              ))}
              {preset === 'custom' && (
                <span className="self-center rounded-lg bg-slate-900/5 px-2 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  Custom
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {format === 'image/png' ? 'Quality (PNG is lossless)' : `Quality (${Math.round(quality * 100)}%)`}
              </span>
              <input
                type="range"
                min={45}
                max={98}
                disabled={globalBusy || format === 'image/png'}
                value={Math.round(quality * 100)}
                onChange={(e) => onQualitySlider(Number(e.target.value) / 100)}
                className="w-full accent-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
              />
              {format === 'image/png' && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Switch to WebP or JPEG to adjust lossy quality.
                </span>
              )}
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Max edge ({maxEdge}px)
              </span>
              <input
                type="range"
                min={640}
                max={4096}
                step={80}
                disabled={globalBusy}
                value={maxEdge}
                onChange={(e) => onMaxEdgeSlider(Number(e.target.value))}
                className="w-full accent-violet-600 disabled:opacity-50"
              />
            </label>
          </div>

          <label className="block max-w-md space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Output format
            </span>
            <select
              value={format}
              disabled={globalBusy}
              onChange={(e) => setFormat(e.target.value as CompressFormat)}
              className="w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-violet-500/40 transition focus:ring-2 disabled:opacity-50 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
            >
              <option value="image/webp">WebP (recommended)</option>
              <option value="image/jpeg">JPEG / JPG</option>
              <option value="image/png">PNG (lossless)</option>
            </select>
          </label>
        </div>

        {/* Global actions + progress */}
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              size="lg"
              glass
              disabled={globalBusy || items.length === 0}
              onClick={compressAll}
              className="min-w-[160px] bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-600/35 hover:from-violet-500 hover:to-fuchsia-500"
            >
              {globalBusy ? 'Compressing…' : 'Compress all'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              glass
              disabled={zipBusy || globalBusy || doneCount === 0}
              onClick={downloadZip}
            >
              {zipBusy ? 'Building ZIP…' : 'Download all (ZIP)'}
            </Button>
          </div>
          {items.length > 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">{items.length}</span> file
              {items.length !== 1 ? 's' : ''}
              {doneCount > 0 && (
                <>
                  {' '}
                  ·{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{doneCount}</span> ready
                </>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-white/40 bg-white/30 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick actions
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              glass
              disabled={globalBusy}
              onClick={() => void shareTool()}
              className="!text-xs"
            >
              Share tool
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              glass
              disabled={globalBusy || doneCount === 0}
              onClick={() => void copyAllStats()}
              className="!text-xs"
            >
              Copy all stats
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              glass
              disabled={globalBusy}
              onClick={toggleTheme}
              className="!text-xs"
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
            </Button>
          </div>
        </div>

        {/* 5. After-download — natural pause point after primary actions */}
        <div className="mx-auto w-full max-w-[728px]">
          <AdPlaceholder variant="after-download" slotKey="after-download" />
        </div>

        {globalBusy && items.length > 0 && (
          <div className="space-y-2 rounded-xl border border-white/40 bg-white/40 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
              <span>Overall progress</span>
              <span>{overallProgress}%</span>
            </div>
            <ProgressBar value={overallProgress} />
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        )}

        {/* Preview grid */}
        {items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ImagePreviewCard
                key={item.id}
                item={item}
                busy={globalBusy}
                sortable={!globalBusy && items.length > 1}
                isSortSource={dragSortId === item.id}
                isSortOver={dragOverSortId === item.id}
                onRemove={removeItem}
                onRecompress={recompressOne}
                onSortDragStart={onSortDragStart}
                onSortDragEnd={onSortDragEnd}
                onSortDragOver={onSortDragOver}
                onSortDrop={onSortDrop}
                onCompare={openCompare}
                onCopyStats={copyStatsForId}
                onRequestDownload={requestFileDownload}
              />
            ))}
          </div>
        )}

        <CompressionHistoryPanel />
      </div>

      {downloadGate && (
        <DownloadInterstitial
          key={`${downloadGate.variant}-${downloadGate.url}`}
          variant={downloadGate.variant}
          onClose={dismissDownloadGate}
          onContinue={confirmDownloadGate}
        />
      )}

      <CompareModal
        open={Boolean(compareId && compareItem && compareAfterUrl)}
        title="Before & after"
        beforeSrc={compareItem?.previewUrl ?? ''}
        afterSrc={compareAfterUrl ?? ''}
        fileName={compareItem?.file.name ?? ''}
        onClose={closeCompare}
      />
    </Card>
  )
}
