import { useCallback, useEffect, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { AdPlaceholder } from '../ads/AdPlaceholder'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { DownloadInterstitial } from '../home/DownloadInterstitial'
import { isSupportedImageFile } from '../../lib/compressImage'
import { getCroppedImageBlob } from '../../lib/cropExport'
import { useDownloadGate } from '../../hooks/useDownloadGate'
import { useNotify } from '../../context/useNotify'

const OUT_W = 413
const OUT_H = 531
const ASPECT = 35 / 45

type Bg = 'white' | 'blue' | 'transparent'

function compositePassport(
  blob: Blob,
  bg: Bg
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = OUT_W
      c.height = OUT_H
      const ctx = c.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('canvas'))
        return
      }
      if (bg === 'white') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, OUT_W, OUT_H)
      } else if (bg === 'blue') {
        ctx.fillStyle = '#1e3a5f'
        ctx.fillRect(0, 0, OUT_W, OUT_H)
      } else {
        ctx.clearRect(0, 0, OUT_W, OUT_H)
      }
      const scale = Math.max(OUT_W / img.width, OUT_H / img.height)
      const dw = img.width * scale
      const dh = img.height * scale
      const dx = (OUT_W - dw) / 2
      const dy = (OUT_H - dh) / 2
      ctx.drawImage(img, dx, dy, dw, dh)
      const mime = bg === 'transparent' ? 'image/png' : 'image/jpeg'
      c.toBlob(
        (b) => {
          URL.revokeObjectURL(url)
          if (b) resolve(b)
          else reject(new Error('blob'))
        },
        mime,
        mime === 'image/jpeg' ? 0.94 : undefined
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('img'))
    }
    img.src = url
  })
}

function buildSheet(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const cols = 2
      const rows = 3
      const pad = 16
      const cellW = OUT_W
      const cellH = OUT_H
      const c = document.createElement('canvas')
      c.width = cols * cellW + pad * (cols + 1)
      c.height = rows * cellH + pad * (rows + 1)
      const ctx = c.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('canvas'))
        return
      }
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(0, 0, c.width, c.height)
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = pad + x * (cellW + pad)
          const py = pad + y * (cellH + pad)
          ctx.drawImage(img, px, py, cellW, cellH)
        }
      }
      c.toBlob(
        (b) => {
          URL.revokeObjectURL(url)
          if (b) resolve(b)
          else reject(new Error('blob'))
        },
        'image/jpeg',
        0.92
      )
    }
    img.src = url
  })
}

export function PassportPhotoTool() {
  const { notify } = useNotify()
  const { gate, open, dismiss, confirm } = useDownloadGate()
  const [image, setImage] = useState<string | null>(null)
  const [name, setName] = useState('passport')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [pixels, setPixels] = useState<Area | null>(null)
  const [bg, setBg] = useState<Bg>('white')
  const [busy, setBusy] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image)
    }
  }, [image])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const onPick = useCallback(
    (list: FileList | null) => {
      const f = list?.[0]
      if (!f || !isSupportedImageFile(f)) {
        notify('Upload JPG / PNG / WebP.', 'info')
        return
      }
      setName(f.name.replace(/\.[^.]+$/, '') || 'passport')
      setImage(URL.createObjectURL(f))
      setPixels(null)
      setPreviewUrl(null)
    },
    [notify]
  )

  const onCropComplete = useCallback((_a: Area, px: Area) => setPixels(px), [])

  const exportPhoto = useCallback(async () => {
    if (!image || !pixels) {
      notify('Position the crop first.', 'info')
      return
    }
    setBusy(true)
    try {
      const cropped = await getCroppedImageBlob(image, pixels, rotation, { horizontal: false, vertical: false }, 'image/png', 1, 'rect')
      const finalBlob = await compositePassport(cropped, bg)
      const u = URL.createObjectURL(finalBlob)
      setPreviewUrl(u)
      const ext = bg === 'transparent' ? 'png' : 'jpg'
      open('image', u, `${name}-passport-${OUT_W}x${OUT_H}.${ext}`)
    } catch {
      notify('Export failed.', 'error')
    } finally {
      setBusy(false)
    }
  }, [bg, image, name, notify, open, pixels, rotation])

  const exportSheet = useCallback(async () => {
    if (!image || !pixels) return
    setBusy(true)
    try {
      const cropped = await getCroppedImageBlob(image, pixels, rotation, { horizontal: false, vertical: false }, 'image/png', 1, 'rect')
      const finalBlob = await compositePassport(cropped, bg)
      const sheet = await buildSheet(finalBlob)
      const u = URL.createObjectURL(sheet)
      open('image', u, `${name}-passport-sheet.jpg`)
    } catch {
      notify('Sheet export failed.', 'error')
    } finally {
      setBusy(false)
    }
  }, [bg, image, name, notify, open, pixels, rotation])

  return (
    <Card
      title="Passport photo maker"
      description={`Frame to ${OUT_W}×${OUT_H}px (35×45 mm style @ ~300 DPI). Center the face using zoom and drag — auto face detection is not loaded to keep the bundle light.`}
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-sky-200/80 bg-sky-50/60 px-3 py-2 text-xs text-sky-950 dark:border-sky-500/30 dark:bg-sky-950/40 dark:text-sky-100">
          Align eyes near the horizontal guide; keep ears visible if your issuing authority requires it. Always verify
          dimensions on the official portal (UPSC, SSC, passport Seva, etc.).
        </div>

        <AdPlaceholder variant="in-content" slotKey="passport-inline" className="!min-h-[90px]" />

        <input type="file" accept="image/*" className="sr-only" id="pp-file" onChange={(e) => onPick(e.target.files)} />
        <Button type="button" glass onClick={() => document.getElementById('pp-file')?.click()}>
          Upload portrait
        </Button>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'white' as const, label: 'White background' },
              { id: 'blue' as const, label: 'Blue background' },
              { id: 'transparent' as const, label: 'Transparent (PNG)' },
            ] as const
          ).map((b) => (
            <Button
              key={b.id}
              type="button"
              size="sm"
              variant={bg === b.id ? 'primary' : 'outline'}
              glass
              onClick={() => setBg(b.id)}
            >
              {b.label}
            </Button>
          ))}
        </div>

        {image && (
          <>
            <div className="pointer-events-none relative mb-[-12px] flex justify-center">
              <span className="z-10 h-0 w-[72%] border-t-2 border-dashed border-violet-500/70" aria-hidden />
            </div>
            <div className="relative aspect-[3/4] w-full max-w-lg overflow-hidden rounded-2xl border border-white/40 bg-slate-900/25 dark:border-white/10">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={ASPECT}
                cropShape="rect"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
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
            <Button type="button" size="sm" variant="outline" glass onClick={() => setRotation((r) => (r + 90) % 360)}>
              Rotate 90°
            </Button>
          </>
        )}

        {previewUrl && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Print preview (single)</p>
            <img src={previewUrl} alt="Passport preview" className="max-h-48 rounded-lg border border-white/40 object-contain" />
          </div>
        )}

        <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-30 flex flex-wrap gap-2 rounded-2xl border border-white/40 bg-white/85 p-3 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90 lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          <Button glass type="button" disabled={!image || busy} onClick={() => void exportPhoto()}>
            Export {OUT_W}×{OUT_H}
          </Button>
          <Button type="button" variant="outline" glass disabled={!image || busy} onClick={() => void exportSheet()}>
            Download print sheet (2×3)
          </Button>
        </div>

        <AdPlaceholder variant="after-download" slotKey="passport-after" />
      </div>

      {gate && <DownloadInterstitial key={gate.url} variant={gate.variant} onClose={dismiss} onContinue={confirm} />}
    </Card>
  )
}
