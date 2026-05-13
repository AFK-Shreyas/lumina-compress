export type CompressFormat = 'image/webp' | 'image/jpeg' | 'image/png'

export type CompressOptions = {
  maxEdge: number
  quality: number
  /** Lossy formats only; PNG ignores this. */
  format: CompressFormat
  /** Called with approximate progress 0–1 for UI feedback */
  onProgress?: (t: number) => void
}

export type CompressResult = {
  blob: Blob
  width: number
  height: number
  mimeType: string
}

/** One shared canvas — avoids allocating a new canvas per image (sequential use only). */
let workCanvas: HTMLCanvasElement | null = null

function getWorkCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  if (!workCanvas) workCanvas = document.createElement('canvas')
  if (workCanvas.width !== w || workCanvas.height !== h) {
    workCanvas.width = w
    workCanvas.height = h
  }
  const ctx = workCanvas.getContext('2d', {
    alpha: true,
    desynchronized: true,
    willReadFrequently: false,
  })
  if (!ctx) throw new Error('Canvas not supported')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  return { canvas: workCanvas, ctx }
}

/** Release GPU backing store between compressions (canvas reset on next use). */
function releaseCanvasMemory(): void {
  if (workCanvas) {
    workCanvas.width = 0
    workCanvas.height = 0
  }
}

function supportsMime(mime: CompressFormat): boolean {
  try {
    const c = document.createElement('canvas')
    c.width = 1
    c.height = 1
    const url = c.toDataURL(mime, mime === 'image/png' ? undefined : 0.92)
    return url.startsWith(`data:${mime}`)
  } catch {
    return false
  }
}

export function pickOutputMime(preferred: CompressFormat): CompressFormat {
  if (preferred === 'image/png') {
    return supportsMime('image/png') ? 'image/png' : 'image/jpeg'
  }
  if (preferred === 'image/webp') {
    return supportsMime('image/webp') ? 'image/webp' : 'image/jpeg'
  }
  return 'image/jpeg'
}

function yieldToBrowser(): Promise<void> {
  return new Promise((r) => requestAnimationFrame(() => r()))
}

/** Try decode+downscale in one step (lower peak memory on large photos). */
async function tryDecodeAtTargetSize(
  file: File,
  dw: number,
  dh: number
): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(file, {
      resizeWidth: dw,
      resizeHeight: dh,
      resizeQuality: 'high',
    })
  } catch {
    return null
  }
}

export async function compressImageBitmap(
  bitmap: ImageBitmap,
  options: CompressOptions
): Promise<CompressResult> {
  const { onProgress, maxEdge: maxEdgeOpt, quality, format: formatPref } = options
  const maxEdge = Math.max(320, maxEdgeOpt)
  const mimeType = pickOutputMime(formatPref)
  const lossy = mimeType === 'image/jpeg' || mimeType === 'image/webp'
  const encodeQuality = lossy ? Math.min(1, Math.max(0.05, quality)) : undefined

  onProgress?.(0.1)
  await yieldToBrowser()

  const sw = bitmap.width
  const sh = bitmap.height
  const scale = Math.min(1, maxEdge / Math.max(sw, sh))
  const dw = Math.max(1, Math.round(sw * scale))
  const dh = Math.max(1, Math.round(sh * scale))

  const { canvas, ctx } = getWorkCanvas(dw, dh)

  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, dw, dh)
  } else {
    ctx.clearRect(0, 0, dw, dh)
  }

  ctx.drawImage(bitmap, 0, 0, sw, sh, 0, 0, dw, dh)

  onProgress?.(0.55)
  await yieldToBrowser()

  const blob = await new Promise<Blob>((resolve, reject) => {
    if (mimeType === 'image/png') {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Encoding failed'))), mimeType)
    } else {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Encoding failed'))),
        mimeType,
        encodeQuality
      )
    }
  })

  onProgress?.(1)
  await yieldToBrowser()

  releaseCanvasMemory()
  return { blob, width: dw, height: dh, mimeType }
}

export async function compressImageFile(
  file: File,
  options: CompressOptions
): Promise<CompressResult> {
  const { onProgress, maxEdge: maxEdgeOpt, quality, format: formatPref } = options
  const maxEdge = Math.max(320, maxEdgeOpt)
  const mimeType = pickOutputMime(formatPref)
  const lossy = mimeType === 'image/jpeg' || mimeType === 'image/webp'
  const encodeQuality = lossy ? Math.min(1, Math.max(0.05, quality)) : undefined

  onProgress?.(0.06)
  await yieldToBrowser()

  let bitmap = await createImageBitmap(file)
  try {
    onProgress?.(0.2)
    await yieldToBrowser()

    const sw = bitmap.width
    const sh = bitmap.height
    const scale = Math.min(1, maxEdge / Math.max(sw, sh))
    const dw = Math.max(1, Math.round(sw * scale))
    const dh = Math.max(1, Math.round(sh * scale))

    const srcPixels = sw * sh
    const dstPixels = dw * dh
    const tryResizeDecode = srcPixels > dstPixels * 2.2 && scale < 0.97

    if (tryResizeDecode) {
      const resized = await tryDecodeAtTargetSize(file, dw, dh)
      if (resized) {
        bitmap.close()
        bitmap = resized
      }
      onProgress?.(resized ? 0.42 : 0.32)
    } else {
      onProgress?.(0.32)
    }
    await yieldToBrowser()

    const bw = bitmap.width
    const bh = bitmap.height
    const { canvas, ctx } = getWorkCanvas(dw, dh)

    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, dw, dh)
    } else {
      ctx.clearRect(0, 0, dw, dh)
    }

    ctx.drawImage(bitmap, 0, 0, bw, bh, 0, 0, dw, dh)

    onProgress?.(0.62)
    await yieldToBrowser()

    const blob = await new Promise<Blob>((resolve, reject) => {
      if (mimeType === 'image/png') {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Encoding failed'))), mimeType)
      } else {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Encoding failed'))),
          mimeType,
          encodeQuality
        )
      }
    })

    onProgress?.(0.92)
    await yieldToBrowser()

    onProgress?.(1)
    await yieldToBrowser()

    return { blob, width: dw, height: dh, mimeType }
  } finally {
    try {
      bitmap.close()
    } catch {
      /* ignore */
    }
    releaseCanvasMemory()
  }
}

export function extensionForMime(mime: string): string {
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  return 'img'
}

/** Client-side only: JPG / JPEG / PNG / WebP by MIME or extension. */
export function isSupportedImageFile(file: File): boolean {
  const t = file.type.toLowerCase()
  if (t === 'image/jpeg' || t === 'image/png' || t === 'image/webp') return true
  if (t === 'image/jpg') return true
  const n = file.name.toLowerCase()
  return /\.(jpe?g|png|webp)$/i.test(n)
}
