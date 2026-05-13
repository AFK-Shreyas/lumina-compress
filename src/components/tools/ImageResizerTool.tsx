import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdPlaceholder } from '../ads/AdPlaceholder'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { DownloadInterstitial } from '../home/DownloadInterstitial'
import { cn } from '../../lib/cn'
import { isSupportedImageFile } from '../../lib/compressImage'
import { clampInt, parsePositiveInt } from '../../lib/integerInput'
import { useDownloadGate } from '../../hooks/useDownloadGate'
import { useNotify } from '../../context/useNotify'

const PRESET_DIMS = [
  { w: 1920, h: 1080, label: 'FHD 1920×1080' },
  { w: 1280, h: 720, label: 'HD 1280×720' },
  { w: 1080, h: 1080, label: 'Square 1080' },
  { w: 800, h: 800, label: 'Web 800' },
] as const

const MAX_PX = 16384

async function resizeToBlob(
  bitmap: ImageBitmap,
  outW: number,
  outH: number,
  mime: 'image/webp' | 'image/jpeg' | 'image/png',
  quality: number
): Promise<Blob> {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(outW))
  c.height = Math.max(1, Math.round(outH))
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('Canvas unsupported')
  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, c.width, c.height)
  } else {
    ctx.clearRect(0, 0, c.width, c.height)
  }
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, 0, 0, c.width, c.height)
  return new Promise((resolve, reject) => {
    if (mime === 'image/png') {
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), mime)
    } else {
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), mime, quality)
    }
  })
}

type ImageResizerToolProps = {
  /** When set, pre-fills dimensions (e.g. social SEO pages) */
  initialWidth?: number
  initialHeight?: number
  /** Lock aspect to this ratio (w/h) when provided */
  lockAspectTo?: number
}

export function ImageResizerTool({ initialWidth, initialHeight, lockAspectTo }: ImageResizerToolProps) {
  const { notify } = useNotify()
  const { gate, open, dismiss, confirm } = useDownloadGate()
  const [file, setFile] = useState<File | null>(null)
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  const [natural, setNatural] = useState({ w: 0, h: 0 })
  const initialW = initialWidth ?? 800
  const initialH = initialHeight ?? 600
  const [widthStr, setWidthStr] = useState(String(initialW))
  const [heightStr, setHeightStr] = useState(String(initialH))
  const [lastValid, setLastValid] = useState({ w: initialW, h: initialH })
  const [keepAspect, setKeepAspect] = useState(true)
  const [pct, setPct] = useState(100)
  const [format, setFormat] = useState<'image/webp' | 'image/jpeg' | 'image/png'>('image/webp')
  const [quality, setQuality] = useState(0.9)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  useEffect(() => {
    if (!preview) {
      queueMicrotask(() => setNatural({ w: 0, h: 0 }))
      return
    }
    const img = new Image()
    img.onload = () => {
      const nw = img.naturalWidth
      const nh = img.naturalHeight
      setNatural({ w: nw, h: nh })
      const nextW = initialWidth ?? nw
      const nextH = initialHeight ?? nh
      if (!initialWidth) setWidthStr(String(nextW))
      if (!initialHeight) setHeightStr(String(nextH))
      setLastValid({ w: nextW, h: nextH })
      setPct(100)
    }
    img.src = preview
  }, [preview, initialWidth, initialHeight])

  const onPick = useCallback((list: FileList | null) => {
    const f = list?.[0]
    if (!f || !isSupportedImageFile(f)) {
      notify('Choose a JPG, PNG, or WebP image.', 'info')
      return
    }
    setFile(f)
  }, [notify])

  const applyPct = useCallback(
    (p: number) => {
      if (!natural.w) return
      const s = p / 100
      const w = clampInt(Math.round(natural.w * s), 1, MAX_PX)
      const h = clampInt(Math.round(natural.h * s), 1, MAX_PX)
      setWidthStr(String(w))
      setHeightStr(String(h))
      setLastValid({ w, h })
      setPct(p)
    },
    [natural.h, natural.w]
  )

  const syncHeightFromWidth = useCallback(
    (w: number) => {
      if (lockAspectTo) return clampInt(Math.round(w / lockAspectTo), 1, MAX_PX)
      if (natural.w) return clampInt(Math.round((w / natural.w) * natural.h), 1, MAX_PX)
      return lastValid.h
    },
    [lockAspectTo, lastValid.h, natural.h, natural.w]
  )

  const syncWidthFromHeight = useCallback(
    (h: number) => {
      if (lockAspectTo) return clampInt(Math.round(h * lockAspectTo), 1, MAX_PX)
      if (natural.h) return clampInt(Math.round((h / natural.h) * natural.w), 1, MAX_PX)
      return lastValid.w
    },
    [lockAspectTo, lastValid.w, natural.h, natural.w]
  )

  const commitWidthBlur = useCallback(() => {
    const parsed = parsePositiveInt(widthStr)
    if (parsed == null) {
      setWidthStr(String(lastValid.w))
      setHeightStr(String(lastValid.h))
      return
    }
    const w = clampInt(parsed, 1, MAX_PX)
    setWidthStr(String(w))
    if (keepAspect) {
      const h = syncHeightFromWidth(w)
      setHeightStr(String(h))
      setLastValid({ w, h })
    } else {
      const hp = parsePositiveInt(heightStr)
      const h = hp != null ? clampInt(hp, 1, MAX_PX) : lastValid.h
      setHeightStr(String(h))
      setLastValid({ w, h })
    }
  }, [heightStr, keepAspect, lastValid.h, lastValid.w, syncHeightFromWidth, widthStr])

  const commitHeightBlur = useCallback(() => {
    const parsed = parsePositiveInt(heightStr)
    if (parsed == null) {
      setWidthStr(String(lastValid.w))
      setHeightStr(String(lastValid.h))
      return
    }
    const h = clampInt(parsed, 1, MAX_PX)
    setHeightStr(String(h))
    if (keepAspect) {
      const w = syncWidthFromHeight(h)
      setWidthStr(String(w))
      setLastValid({ w, h })
    } else {
      const wp = parsePositiveInt(widthStr)
      const w = wp != null ? clampInt(wp, 1, MAX_PX) : lastValid.w
      setWidthStr(String(w))
      setLastValid({ w, h })
    }
  }, [heightStr, keepAspect, lastValid.h, lastValid.w, syncWidthFromHeight, widthStr])

  const displayAspect =
    lockAspectTo ?? (natural.w && natural.h ? natural.w / natural.h : lastValid.w / Math.max(1, lastValid.h))

  const outMime = format
  const ext = outMime === 'image/webp' ? 'webp' : outMime === 'image/png' ? 'png' : 'jpg'

  const runDownload = useCallback(async () => {
    if (!file || !preview || !natural.w) return
    const wp = parsePositiveInt(widthStr)
    const hp = parsePositiveInt(heightStr)
    if (wp == null || hp == null) {
      notify('Enter width and height in pixels (positive numbers).', 'info')
      return
    }
    const width = clampInt(wp, 1, MAX_PX)
    const height = clampInt(hp, 1, MAX_PX)
    setBusy(true)
    try {
      const bitmap = await createImageBitmap(file)
      const blob = await resizeToBlob(bitmap, width, height, format, quality)
      bitmap.close()
      const url = URL.createObjectURL(blob)
      const base = file.name.replace(/\.[^.]+$/, '') || 'image'
      open('image', url, `${base}-resized-${width}x${height}.${ext}`)
      setTimeout(() => URL.revokeObjectURL(url), 120_000)
    } catch {
      notify('Could not resize this image.', 'error')
    } finally {
      setBusy(false)
    }
  }, [file, preview, natural.w, widthStr, heightStr, format, quality, ext, notify, open])

  const liveLabel = useMemo(() => {
    const w = parsePositiveInt(widthStr)
    const h = parsePositiveInt(heightStr)
    if (w && h) return `${w} × ${h}px`
    if (w) return `${w} × …px`
    if (h) return `… × ${h}px`
    return '… × …px'
  }, [widthStr, heightStr])

  return (
    <Card
      title="Image resizer"
      description="Resize JPG, PNG, or WebP in your browser — aspect lock, presets, and quality controls."
      className="[contain:layout]"
    >
      <div className="space-y-6">
        <AdPlaceholder variant="in-content" slotKey="resizer-inline" className="!min-h-[100px]" />

        <div className="flex flex-wrap gap-3">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="sr-only"
            id="resizer-file"
            onChange={(e) => onPick(e.target.files)}
          />
          <Button glass type="button" onClick={() => document.getElementById('resizer-file')?.click()}>
            Upload image
          </Button>
        </div>

        {preview && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Original
              </p>
              <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/30 dark:border-white/10 dark:bg-slate-900/40">
                <img src={preview} alt="" className="max-h-64 w-full object-contain" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Natural {natural.w}×{natural.h}px
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Live output size
              </p>
              <div className="flex aspect-video max-h-64 items-center justify-center rounded-2xl border border-dashed border-violet-300/60 bg-violet-500/5 text-center dark:border-violet-500/30 dark:bg-violet-500/10">
                <p className="text-lg font-semibold text-violet-800 dark:text-violet-200">{liveLabel}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Width (px)</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              aria-label="Width in pixels"
              placeholder={String(lastValid.w)}
              value={widthStr}
              onChange={(e) => setWidthStr(e.target.value)}
              onBlur={() => commitWidthBlur()}
              className="w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Height (px)</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              aria-label="Height in pixels"
              placeholder={String(lastValid.h)}
              value={heightStr}
              onChange={(e) => setHeightStr(e.target.value)}
              onBlur={() => commitHeightBlur()}
              className="w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 text-slate-900 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={keepAspect}
            onChange={(e) => setKeepAspect(e.target.checked)}
            className="rounded border-slate-300 accent-violet-600"
          />
          Maintain aspect ratio ({displayAspect.toFixed(3)} : 1)
        </label>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Scale %</span>
          <input
            type="range"
            min={10}
            max={200}
            value={pct}
            onChange={(e) => applyPct(Number(e.target.value))}
            className="w-full accent-violet-600"
          />
          <p className="text-xs text-slate-500">{pct}% of original edge lengths</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_DIMS.map((p) => (
            <Button
              key={p.label}
              type="button"
              variant="outline"
              size="sm"
              glass
              disabled={!natural.w}
              onClick={() => {
                setWidthStr(String(p.w))
                setHeightStr(String(p.h))
                setLastValid({ w: p.w, h: p.h })
                setKeepAspect(false)
                setPct(Math.round((p.w / natural.w) * 100))
              }}
            >
              {p.label}
            </Button>
          ))}
        </div>

        <label className="block max-w-xs space-y-1 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Output format</span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as typeof format)}
            className="w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
          >
            <option value="image/webp">WebP</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
          </select>
        </label>

        <label className="block max-w-md space-y-2 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quality (lossy)</span>
          <input
            type="range"
            min={50}
            max={100}
            value={Math.round(quality * 100)}
            onChange={(e) => setQuality(Number(e.target.value) / 100)}
            className="w-full accent-violet-600"
          />
        </label>

        <div
          className={cn(
            'sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-30 flex flex-wrap gap-2 rounded-2xl border border-white/40 bg-white/80 p-3 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-900/85 lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none'
          )}
        >
          <Button glass type="button" disabled={!file || busy} onClick={() => void runDownload()}>
            Download resized
          </Button>
        </div>

        <AdPlaceholder variant="after-download" slotKey="resizer-after" />
      </div>

      {gate && (
        <DownloadInterstitial key={`${gate.url}`} variant={gate.variant} onClose={dismiss} onContinue={confirm} />
      )}
    </Card>
  )
}
