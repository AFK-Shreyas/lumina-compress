import { PassportPhotoTool } from '../../components/tools/PassportPhotoTool'
import { ToolSeoPage } from '../../components/tools/ToolSeoPage'
import { ROUTE_BREADCRUMBS } from '../../config/breadcrumbs'

export function PassportPhotoPage() {
  return (
    <ToolSeoPage
      title="Passport photo maker online — India & ICAO-style layout"
      description="Create 413×531 style passport photos with white, blue, or transparent backgrounds, print sheet preview, and client-side export — optimized for government-style uploads."
      canonicalPath="/passport-photo-maker"
      breadcrumb={ROUTE_BREADCRUMBS['/passport-photo-maker']}
      keywords={[
        'passport photo maker online',
        'passport size photo india',
        '413x531 photo',
        'passport photo white background',
        'print passport photo sheet',
      ]}
      intro="Upload a clear portrait, align the face inside the 35×45 style frame, pick a background, and export a single image or a 2×3 print sheet. Face auto-detection is omitted to keep downloads fast — you stay in control of alignment."
      sections={[
        {
          heading: 'Official sizing reminders',
          body: [
            'Passport Seva, VFS, and state police verification portals update their specs periodically. Use this tool to get a crisp baseline, then double-check the latest millimetre and pixel rules published by the authority you are applying through.',
          ],
        },
        {
          heading: 'Photography tips',
          body: [
            'Use even lighting, neutral expression unless the notice says otherwise, and keep both ears visible when required. Export JPEG for most uploads; PNG with transparent background is available when the portal supports it.',
          ],
        },
      ]}
      faq={[
        {
          q: 'Does this auto-detect my face?',
          a: 'No — we use a lightweight canvas pipeline so you can position features precisely with zoom and drag.',
        },
        {
          q: 'Can I print at a shop?',
          a: 'Download the 2×3 sheet JPEG and share it with a print kiosk; verify dimensions before printing.',
        },
        {
          q: 'Is this official government software?',
          a: 'No. It is an independent helper — always follow the issuing authority’s latest instructions.',
        },
      ]}
      related={[
        { to: '/compress-image-to-50kb', label: 'Compress to 50 KB' },
        { to: '/crop-image', label: 'Crop image' },
        { to: '/resize-image', label: 'Resize image' },
        { to: '/#compressor', label: 'Main compressor' },
      ]}
    >
      <PassportPhotoTool />
    </ToolSeoPage>
  )
}
