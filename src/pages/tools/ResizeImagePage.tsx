import { ImageResizerTool } from '../../components/tools/ImageResizerTool'
import { ToolSeoPage } from '../../components/tools/ToolSeoPage'
import { ROUTE_BREADCRUMBS } from '../../config/breadcrumbs'

const RELATED = [
  { to: '/crop-image', label: 'Crop image online' },
  { to: '/compress-image-to-100kb', label: 'Compress to 100 KB' },
  { to: '/passport-photo-maker', label: 'Passport photo maker' },
  { to: '/#compressor', label: 'ZIP batch compressor' },
] as const

export function ResizeImagePage() {
  return (
    <ToolSeoPage
      title="Resize image online — JPG, PNG & WebP (free)"
      description="Resize image online for websites, forms, and social posts. Change width, height, percentage scale, and export WebP, JPEG, or PNG — all locally in your browser for India & global users."
      canonicalPath="/resize-image"
      breadcrumb={ROUTE_BREADCRUMBS['/resize-image']}
      keywords={[
        'resize image online',
        'image resizer',
        'resize jpg',
        'resize png',
        'resize webp',
        'photo resizer for forms',
      ]}
      intro="Upload a photo, set exact pixel width and height (or scale by percentage), keep aspect ratio when you want distortion-free results, then download — ideal when a portal asks for specific dimensions without installing software."
      sections={[
        {
          heading: 'Why a dedicated image resizer matters',
          body: [
            'Government and exam portals often publish maximum width/height or megapixel rules. Resizing before compression keeps faces readable and text sharp while shrinking bytes.',
            'Social networks also recommend pixel-perfect canvases. When you start from the right dimensions, later compression steps behave more predictably.',
          ],
        },
        {
          heading: 'Privacy & performance',
          body: [
            'Lumina runs as a static client-side app — your pixels stay on your device. That is helpful for Aadhaar-linked workflows where you still should avoid untrusted uploads.',
            'We keep the bundle lean: heavy work uses the browser canvas and decode APIs with lazy route loading so mobile users get fast first paint.',
          ],
        },
      ]}
      faq={[
        {
          q: 'Will resizing reduce quality?',
          a: 'Shrinking dimensions can look sharper because pixels are downsampled. Upscaling may soften detail — avoid enlarging beyond the original when possible.',
        },
        {
          q: 'Can I resize WebP and PNG with transparency?',
          a: 'Yes. PNG alpha is preserved when exporting PNG. JPEG flattens onto a white background. WebP supports transparency when the source has alpha.',
        },
        {
          q: 'Does this work on mobile?',
          a: 'Yes — controls are touch-friendly and previews adapt to small screens.',
        },
      ]}
      related={[...RELATED]}
    >
      <ImageResizerTool />
    </ToolSeoPage>
  )
}
