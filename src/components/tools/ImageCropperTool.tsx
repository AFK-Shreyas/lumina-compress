import { useCallback, useEffect, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { AdPlaceholder } from '../ads/AdPlaceholder'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { DownloadInterstitial } from '../home/DownloadInterstitial'
import { cn } from '../../lib/cn'
import { isSupportedImageFile } from '../../lib/compressImage'
import { getCroppedImageBlob } from '../../lib/cropExport'
import { useDownloadGate } from '../../hooks/useDownloadGate'
import { useNotify } from '../../context/useNotify'

const MODES = [
  { id: 'free', label: 'Free', aspect: undefined as number | undefined },
  { id: '1-1', label: 'Square 1:1', aspect: 1 },
  { id: '4-5', label: 'Portrait 4:5', aspect: 4 / 5 },
  { id: '16-9', label: 'Landscape 16:9', aspect: 16 / 9 },
  { id: '3-4', label: 'Passport 35×45', aspect: 35 / 45 },
] as const

type ImageCropperToolProps = {
  /** Fixed aspect (overrides mode chips) */
  forcedAspect?: number
  /** When true, use round crop mask */
  defaultRound?: boolean
  onCroppedFile?: (file: File) => void
}

export function ImageCropperTool({ forcedAspect, defaultRound, onCroppedFile }: ImageCropperToolProps) {
  const { notify } = useNotify()
  const { gate, open, dismiss, confirm } = useDownloadGate()
  const [image, setImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState('image')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [mode, setMode] = useState<(typeof MODES)[number]['id']>('16-9')
  const [croppedPixels, setCroppedPixels] = useState<Area | null>(null)
  const [round, setRound] = useState(defaultRound ?? false)
  const [busy, setBusy] = useState(false)
  const [outMime, setOutMime] = useState<'image/webp' | 'image/jpeg' | 'image/png'>('image/webp')
  const [quality, setQuality] = useState(0.92)

  const aspect = forcedAspect ?? MODES.find((m) => m.id === mode)?.aspect

  const onPick = useCallback(
    (list: FileList | null) => {
      const f = list?.[0]
      if (!f || !isSupportedImageFile(f)) {
        notify('Use JPG, PNG, or WebP.', 'info')
        return
      }
      setFileName(f.name.replace(/\.[^.]+$/, '') || 'image')
      setImage(URL.createObjectURL(f))
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setRotation(0)
      setCroppedPixels(null)
    },
    [notify]
  )

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image)
    }
  }, [image])

  const onCropComplete = useCallback((_a: Area, px: Area) => {
    setCroppedPixels(px)
  }, [])

  const buildCrop = useCallback(async () => {
    if (!image || !croppedPixels) {
      notify('Adjust the crop area first.', 'info')
      return
    }
    setBusy(true)
    try {
      const blob = await getCroppedImageBlob(
        image,
        croppedPixels,
        rotation,
        { horizontal: flipH, vertical: flipV },
        outMime,
        quality,
        round ? 'round' : 'rect'
      )
      const ext = outMime === 'image/webp' ? 'webp' : outMime === 'image/png' ? 'png' : 'jpg'
      const file = new File([blob], `${fileName}-crop.${ext}`, { type: outMime })
      onCroppedFile?.(file)
      const url = URL.createObjectURL(blob)
      open('image', url, `${fileName}-crop.${ext}`)
    } catch {
      notify('Could not crop this image.', 'error')
    } finally {
      setBusy(false)
    }
  }, [
    image,
    croppedPixels,
    rotation,
    flipH,
    flipV,
    outMime,
    quality,
    round,
    fileName,
    notify,
    open,
    onCroppedFile,
  ])

  return (
    <Card title="Image cropper" description="Drag the frame, zoom, rotate, flip — export WebP, JPEG, or PNG." className="[contain:layout]">
      <div className="space-y-5">
        <AdPlaceholder variant="in-content" slotKey="crop-inline" className="!min-h-[100px]" />

        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="sr-only"
          id="crop-file"
          onChange={(e) => onPick(e.target.files)}
        />
        <Button type="button" glass onClick={() => document.getElementById('crop-file')?.click()}>
          Upload image
        </Button>

        {!forcedAspect && (
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <Button
                key={m.id}
                type="button"
                size="sm"
                variant={mode === m.id ? 'primary' : 'outline'}
                glass
                onClick={() => setMode(m.id)}
              >
                {m.label}
              </Button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" glass onClick={() => setRound((r) => !r)}>
            {round ? 'Switch to rectangle' : 'Switch to circle'}
          </Button>
          <Button type="button" size="sm" variant="outline" glass onClick={() => setFlipH((v) => !v)}>
            Flip H
          </Button>
          <Button type="button" size="sm" variant="outline" glass onClick={() => setFlipV((v) => !v)}>
            Flip V
          </Button>
          <Button type="button" size="sm" variant="outline" glass onClick={() => setRotation((r) => (r + 90) % 360)}>
            Rotate 90°
          </Button>
        </div>

        {image && (
          <>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/40 bg-slate-900/20 dark:border-white/10">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                {...(aspect !== undefined ? { aspect } : {})}
                cropShape={round ? 'round' : 'rect'}
                showGrid={!round}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <label className="block space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-violet-600"
              />
            </label>
          </>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Format</span>
            <select
              value={outMime}
              onChange={(e) => setOutMime(e.target.value as typeof outMime)}
              className="mt-1 w-full rounded-xl border border-slate-200/80 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-slate-900/60 dark:text-white"
            >
              <option value="image/webp">WebP</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quality</span>
            <input
              type="range"
              min={50}
              max={100}
              value={Math.round(quality * 100)}
              onChange={(e) => setQuality(Number(e.target.value) / 100)}
              className="mt-1 w-full accent-violet-600"
            />
          </label>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Align important content inside the frame. For government uploads, follow the latest official pixel/size
          notice on the portal you are using.
        </p>

        <div
          className={cn(
            'sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-30 flex flex-wrap gap-2 rounded-2xl border border-white/40 bg-white/85 p-3 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90 lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none'
          )}
        >
          <Button glass type="button" disabled={!image || busy} onClick={() => void buildCrop()}>
            Crop & download
          </Button>
        </div>

        <AdPlaceholder variant="after-download" slotKey="crop-after" />
      </div>

      {gate && <DownloadInterstitial key={gate.url} variant={gate.variant} onClose={dismiss} onContinue={confirm} />}
    </Card>
  )
}
