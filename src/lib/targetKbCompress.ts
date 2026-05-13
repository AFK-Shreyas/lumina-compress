import { compressImageBitmap, pickOutputMime, type CompressFormat } from './compressImage'

export type TargetKbResult = {
  ok: boolean
  blob: Blob
  width: number
  height: number
  mimeType: string
  targetBytes: number
  actualBytes: number
  iterations: number
}

/**
 * Binary search on quality at stepped resolutions until output ≤ targetBytes (lossy formats).
 * PNG / lossless: only a single encode attempt — tight byte targets may be unreachable.
 */
export async function compressToTargetKb(
  bitmap: ImageBitmap,
  targetBytes: number,
  options: {
    format: CompressFormat
    onProgress?: (t: number) => void
  }
): Promise<TargetKbResult> {
  const fmt = pickOutputMime(options.format)
  const lossy = fmt === 'image/jpeg' || fmt === 'image/webp'
  let iterations = 0

  if (!lossy) {
    const r = await compressImageBitmap(bitmap, {
      maxEdge: Math.max(bitmap.width, bitmap.height),
      quality: 1,
      format: fmt,
    })
    iterations += 1
    return {
      ok: r.blob.size <= targetBytes,
      blob: r.blob,
      width: r.width,
      height: r.height,
      mimeType: r.mimeType,
      targetBytes,
      actualBytes: r.blob.size,
      iterations,
    }
  }

  let maxEdge = Math.max(bitmap.width, bitmap.height)
  let bestOver: Awaited<ReturnType<typeof compressImageBitmap>> | null = null

  for (let round = 0; round < 16; round++) {
    options.onProgress?.(round / 16)

    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    const rw = Math.max(1, Math.round(bitmap.width * scale))
    const rh = Math.max(1, Math.round(bitmap.height * scale))
    const scaled = await createImageBitmap(bitmap, {
      resizeWidth: rw,
      resizeHeight: rh,
      resizeQuality: 'high',
    })

    let lo = 0.06
    let hi = 0.98
    let bestUnder: Awaited<ReturnType<typeof compressImageBitmap>> | null = null

    for (let i = 0; i < 14; i++) {
      const q = (lo + hi) / 2
      const res = await compressImageBitmap(scaled, {
        maxEdge: Math.max(rw, rh),
        quality: q,
        format: fmt,
      })
      iterations += 1
      if (res.blob.size <= targetBytes) {
        bestUnder = res
        lo = q
      } else {
        hi = q
        if (!bestOver || res.blob.size < bestOver.blob.size) bestOver = res
      }
      await new Promise((r) => requestAnimationFrame(r))
    }

    scaled.close()

    if (bestUnder) {
      options.onProgress?.(1)
      return {
        ok: true,
        blob: bestUnder.blob,
        width: bestUnder.width,
        height: bestUnder.height,
        mimeType: bestUnder.mimeType,
        targetBytes,
        actualBytes: bestUnder.blob.size,
        iterations,
      }
    }

    maxEdge = Math.max(96, Math.floor(maxEdge * 0.84))
    if (maxEdge <= 96 && round > 4) break
  }

  const fallback =
    bestOver ??
    (await compressImageBitmap(bitmap, {
      maxEdge: 320,
      quality: 0.35,
      format: fmt,
    }))
  if (!bestOver) iterations += 1

  return {
    ok: fallback.blob.size <= targetBytes,
    blob: fallback.blob,
    width: fallback.width,
    height: fallback.height,
    mimeType: fallback.mimeType,
    targetBytes,
    actualBytes: fallback.blob.size,
    iterations,
  }
}
