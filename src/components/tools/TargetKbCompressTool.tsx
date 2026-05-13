import { useCallback, useState } from 'react'
import { AdPlaceholder } from '../ads/AdPlaceholder'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { DownloadInterstitial } from '../home/DownloadInterstitial'
import { compressToTargetKb } from '../../lib/targetKbCompress'
import { extensionForMime, isSupportedImageFile, pickOutputMime, type CompressFormat } from '../../lib/compressImage'
import { clampInt, parsePositiveInt } from '../../lib/integerInput'
import { useDownloadGate } from '../../hooks/useDownloadGate'
import { useNotify } from '../../context/useNotify'

const PRESETS_KB = [20, 50, 100, 200] as const
const MIN_KB = 5
const MAX_KB = 2048

type Props = {
  defaultTargetKb?: number
  initialFile?: File | null
  /** Compact card when embedded under cropper */
  embedded?: boolean
}

export function TargetKbCompressTool({ defaultTargetKb = 100, initialFile, embedded }: Props) {
  const { notify } = useNotify()
  const { gate, open, dismiss, confirm } = useDownloadGate()
  const [file, setFile] = useState<File | null>(() => initialFile ?? null)
  const initialKb = clampInt(defaultTargetKb, MIN_KB, MAX_KB)
  const [lastKb, setLastKb] = useState(initialKb)
  const [targetKbStr, setTargetKbStr] = useState(String(initialKb))
  const [format, setFormat] = useState<CompressFormat>('image/webp')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{
    ok: boolean
    actualKb: number
    mime: string
    blob: Blob
    requestedKb: number
  } | null>(null)

  const onPick = useCallback(
    (list: FileList | null) => {
      const f = list?.[0]
      if (!f || !isSupportedImageFile(f)) {
        notify('Use JPG, PNG, or WebP.', 'info')
        return
      }
      setFile(f)
      setResult(null)
    },
    [notify]
  )

  const commitTargetKbBlur = useCallback(() => {
    const parsed = parsePositiveInt(targetKbStr)
    if (parsed == null || parsed < MIN_KB) {
      setTargetKbStr(String(lastKb))
      return
    }
    const c = clampInt(parsed, MIN_KB, MAX_KB)
    setLastKb(c)
    setTargetKbStr(String(c))
  }, [lastKb, targetKbStr])

  const run = useCallback(async () => {
    if (!file) return
    const parsed = parsePositiveInt(targetKbStr)
    if (parsed == null || parsed < MIN_KB) {
      notify(`Enter target size in KB (${MIN_KB}–${MAX_KB}).`, 'info')
      return
    }
    const targetKb = clampInt(parsed, MIN_KB, MAX_KB)
    setBusy(true)
    setProgress(0)
    setResult(null)
    try {
      const bitmap = await createImageBitmap(file)
      const targetBytes = targetKb * 1024
      const fmt = pickOutputMime(format)
      const out = await compressToTargetKb(bitmap, targetBytes, {
        format: fmt,
        onProgress: setProgress,
      })
      bitmap.close()
      setLastKb(targetKb)
      setTargetKbStr(String(targetKb))
      setResult({
        ok: out.ok,
        actualKb: out.actualBytes / 1024,
        mime: out.mimeType,
        blob: out.blob,
        requestedKb: targetKb,
      })
      if (out.ok) notify('Target size reached (within search limits).', 'success')
      else notify('Could not reach target under current format — try WebP or lower KB.', 'info')
    } catch {
      notify('Compression failed.', 'error')
    } finally {
      setBusy(false)
      setProgress(1)
    }
  }, [file, format, notify, targetKbStr])

  const download = useCallback(() => {
    if (!result) return
    const ext = extensionForMime(result.mime)
    const url = URL.createObjectURL(result.blob)
    open(
      'image',
      url,
      `${(file?.name ?? 'image').replace(/\.[^.]+$/, '') || 'image'}-target-${result.requestedKb}kb.${ext}`
    )
  }, [file?.name, open, result])

  return (
    <Card
      title={embedded ? 'Exact file size (KB)' : 'Exact KB image compression'}
      description="Passport forms, exam portals, and government uploads often require strict file sizes — tuned client-side."
      className={embedded ? 'border-violet-200/50 dark:border-violet-500/20' : ''}
    >
      <div className="space-y-5">
        <AdPlaceholder variant="in-content" slotKey="kb-target-inline" className="!min-h-[90px]" />

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="sr-only"
          id="kb-file"
          onChange={(e) => onPick(e.target.files)}
        />
        <Button type="button" glass onClick={() => document.getElementById('kb-file')?.click()}>
          {file ? 'Change image' : 'Upload image'}
        </Button>

        <div className="flex flex-wrap gap-2">
          {PRESETS_KB.map((k) => (
            <Button
              key={k}
              type="button"
              size="sm"
              variant="outline"
              glass
              onClick={() => {
                setLastKb(k)
                setTargetKbStr(String(k))
              }}
            >
              {k} KB
            </Button>
          ))}
        </div>

        <label className="block max-w-xs text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Custom target (KB)</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            aria-label="Target file size in kilobytes"
            placeholder={`${MIN_KB}–${MAX_KB}`}
            value={targetKbStr}
            onChange={(e) => setTargetKbStr(e.target.value)}
            onBlur={() => commitTargetKbBlur()}
            className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
          />
        </label>

        <label className="block max-w-xs text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Format</span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as CompressFormat)}
            className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
          >
            <option value="image/webp">WebP (recommended)</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG (may miss tight targets)</option>
          </select>
        </label>

        {busy && (
          <div className="space-y-1 rounded-xl border border-white/40 bg-white/40 p-3 dark:border-white/10 dark:bg-slate-900/40">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Searching quality &amp; scale…</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-[width]"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {result && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              result.ok
                ? 'border-emerald-300/80 bg-emerald-50/80 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-100'
                : 'border-amber-300/80 bg-amber-50/80 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100'
            }`}
            role="status"
          >
            <p className="font-semibold">{result.ok ? 'Within target (best effort)' : 'Under target not reached'}</p>
            <p className="mt-1 text-xs opacity-90">
              Target {result.requestedKb} KB · Actual {result.actualKb.toFixed(1)} KB · {result.mime}
            </p>
          </div>
        )}

        <div
          className={`flex flex-wrap gap-2 ${embedded ? '' : 'sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-30 rounded-2xl border border-white/40 bg-white/85 p-3 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90 lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none'}`}
        >
          <Button glass type="button" disabled={!file || busy} onClick={() => void run()}>
            Compress to target
          </Button>
          <Button type="button" variant="outline" glass disabled={!result || busy} onClick={download}>
            Download result
          </Button>
        </div>

        <AdPlaceholder variant="after-download" slotKey="kb-after" />
      </div>

      {gate && <DownloadInterstitial key={gate.url} variant={gate.variant} onClose={dismiss} onContinue={confirm} />}
    </Card>
  )
}
