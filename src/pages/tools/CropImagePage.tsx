import { useState } from 'react'
import { ImageCropperTool } from '../../components/tools/ImageCropperTool'
import { TargetKbCompressTool } from '../../components/tools/TargetKbCompressTool'
import { ToolSeoPage } from '../../components/tools/ToolSeoPage'
import { ROUTE_BREADCRUMBS } from '../../config/breadcrumbs'

const RELATED = [
  { to: '/resize-image', label: 'Resize image' },
  { to: '/compress-image-to-50kb', label: '50 KB compression' },
  { to: '/instagram-image-resizer', label: 'Instagram sizes' },
  { to: '/#compressor', label: 'Main compressor' },
] as const

export function CropImagePage() {
  const [croppedFile, setCroppedFile] = useState<File | null>(null)

  return (
    <ToolSeoPage
      title="Crop image online — free, ratio presets & circle export"
      description="Advanced image cropper with free, square, 4:5, 16:9, zoom, rotate, flip, and circle export. Compress to exact KB after cropping — client-side for Indian government & social workflows."
      canonicalPath="/crop-image"
      breadcrumb={ROUTE_BREADCRUMBS['/crop-image']}
      keywords={[
        'crop image online',
        'photo cropper',
        'circle crop',
        'passport crop ratio',
        'instagram crop',
      ]}
      intro="Drag the crop window, zoom into details, rotate passport scans, and export to WebP, JPEG, or PNG. After cropping you can jump straight into exact-KB compression for strict upload limits."
      sections={[
        {
          heading: 'Crop modes explained',
          body: [
            'Free mode removes aspect locking so you can slice banners or UI shots. Presets match common social and portrait ratios used across India and global platforms.',
            'Circle export masks to a round PNG/WebP/JPEG — useful for profile photos when the destination applies its own circular mask.',
          ],
        },
        {
          heading: 'Combine with exact-KB compression',
          body: [
            'Many exam forms require both correct framing and a maximum file size. Crop first, then use the embedded exact-KB tool on this page to approach the portal limit.',
          ],
        },
      ]}
      faq={[
        {
          q: 'Is my photo uploaded to a server?',
          a: 'No. Cropping and encoding happen entirely in your browser tab.',
        },
        {
          q: 'Can I rotate a scanned document?',
          a: 'Yes — use the rotate control in 90° steps before exporting.',
        },
        {
          q: 'What format should I export for smallest size?',
          a: 'WebP usually offers the best quality-to-size ratio; JPEG is safest for legacy portals.',
        },
      ]}
      related={[...RELATED]}
    >
      <ImageCropperTool onCroppedFile={(f) => setCroppedFile(f)} />
      {croppedFile && (
        <div className="mt-10 space-y-3 motion-safe:animate-[fade-up_0.45s_ease_both]">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Continue: exact KB compression</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your latest crop is loaded below. Adjust target KB and format, then compress.
          </p>
          <TargetKbCompressTool
            key={`${croppedFile.name}-${croppedFile.size}-${croppedFile.lastModified}`}
            initialFile={croppedFile}
            embedded
            defaultTargetKb={100}
          />
        </div>
      )}
    </ToolSeoPage>
  )
}
