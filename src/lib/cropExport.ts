import type { Area } from 'react-easy-crop'

function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180
}

function rotateSize(width: number, height: number, rotation: number): { width: number; height: number } {
  const rotRad = getRadianAngle(rotation)
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (e) => reject(e))
    image.src = src
  })
}

/**
 * Export cropped region from an image URL (e.g. object URL) with rotation & flip.
 * @param cropShape when `round`, applies circular mask (square pixel crop first).
 */
export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip: { horizontal: boolean; vertical: boolean } = { horizontal: false, vertical: false },
  mimeType: 'image/webp' | 'image/jpeg' | 'image/png' = 'image/webp',
  quality = 0.92,
  cropShape: 'rect' | 'round' = 'rect'
): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  const rotRad = getRadianAngle(rotation)
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation)

  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)
  ctx.drawImage(image, 0, 0)

  const croppedCanvas = document.createElement('canvas')
  const croppedCtx = croppedCanvas.getContext('2d')
  if (!croppedCtx) throw new Error('Canvas not supported')

  croppedCanvas.width = pixelCrop.width
  croppedCanvas.height = pixelCrop.height

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  if (cropShape === 'round') {
    const d = Math.min(pixelCrop.width, pixelCrop.height)
    const out = document.createElement('canvas')
    out.width = d
    out.height = d
    const ox = (pixelCrop.width - d) / 2
    const oy = (pixelCrop.height - d) / 2
    const octx = out.getContext('2d')
    if (!octx) throw new Error('Canvas not supported')
    octx.beginPath()
    octx.arc(d / 2, d / 2, d / 2, 0, Math.PI * 2)
    octx.closePath()
    octx.clip()
    octx.drawImage(croppedCanvas, ox, oy, d, d, 0, 0, d, d)
    return new Promise((resolve, reject) => {
      if (mimeType === 'image/png') {
        out.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), mimeType)
      } else {
        out.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), mimeType, quality)
      }
    })
  }

  return new Promise((resolve, reject) => {
    if (mimeType === 'image/png') {
      croppedCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), mimeType)
    } else {
      croppedCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), mimeType, quality)
    }
  })
}
