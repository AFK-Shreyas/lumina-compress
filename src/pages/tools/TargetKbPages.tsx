import { TargetKbCompressTool } from '../../components/tools/TargetKbCompressTool'
import { ToolSeoPage } from '../../components/tools/ToolSeoPage'
import { ROUTE_BREADCRUMBS } from '../../config/breadcrumbs'

function Page({ kb }: { kb: 20 | 50 | 100 | 200 }) {
  const path = `/compress-image-to-${kb}kb` as const
  return (
    <ToolSeoPage
      title={`Compress image to ${kb}KB online — passport & form uploads`}
      description={`Free client-side compressor to reach ~${kb}KB for JPG/PNG/WebP. Built for Indian exam forms, passport portals, and government uploads — shows target vs actual size.`}
      canonicalPath={path}
        breadcrumb={ROUTE_BREADCRUMBS[path as keyof typeof ROUTE_BREADCRUMBS]}
      keywords={[
        `compress image to ${kb}kb`,
        'reduce image size for upload',
        'passport photo kb limit',
        'form photo compress',
        'compress jpg online',
      ]}
      intro={`Need about ${kb}KB for an upload field? This tool searches quality and dimensions client-side to approach your budget while keeping detail as high as the format allows.`}
      sections={[
        {
          heading: 'How the intelligent loop works',
          body: [
            'We binary-search quality on a scaled canvas, then gently shrink resolution if the encoder still cannot reach your target. PNG targets may be impossible for very small KB — switch to WebP or JPEG for best results.',
            'Always compare the preview on the official portal before final submission — each site may recompress differently.',
          ],
        },
        {
          heading: 'India-specific use cases',
          body: [
            'Competitive exams, state recruitment boards, and passport services frequently cap photo sizes. Start from a well-lit source, crop to the requested ratio, then run this exact-KB tool.',
          ],
        },
      ]}
      faq={[
        {
          q: `Will my file be exactly ${kb}KB?`,
          a: 'Browsers encode lossy formats with small variance. We aim under or on target when possible and show the actual output size.',
        },
        {
          q: 'Why does PNG fail tight targets?',
          a: 'PNG is lossless — small KB values often require switching to WebP or JPEG.',
        },
        {
          q: 'Is data sent to Lumina servers?',
          a: 'No — processing stays in your browser for privacy.',
        },
      ]}
      related={[
        { to: '/crop-image', label: 'Crop before compressing' },
        { to: '/passport-photo-maker', label: 'Passport photo maker' },
        { to: '/resize-image', label: 'Resize image' },
        { to: '/#compressor', label: 'General compressor' },
      ]}
    >
      <TargetKbCompressTool key={kb} defaultTargetKb={kb} />
    </ToolSeoPage>
  )
}

export function Compress20KbPage() {
  return <Page kb={20} />
}
export function Compress50KbPage() {
  return <Page kb={50} />
}
export function Compress100KbPage() {
  return <Page kb={100} />
}
export function Compress200KbPage() {
  return <Page kb={200} />
}
