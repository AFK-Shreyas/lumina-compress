import { ImageResizerTool } from '../../components/tools/ImageResizerTool'
import { ToolSeoPage } from '../../components/tools/ToolSeoPage'
import { ROUTE_BREADCRUMBS } from '../../config/breadcrumbs'

export function YoutubeThumbnailResizerPage() {
  return (
    <ToolSeoPage
      title="YouTube thumbnail resizer — 1280×720 (16:9) online"
      description="Resize images to 1280×720 for YouTube thumbnails with aspect-locked controls, WebP/JPEG export, and client-side privacy — ideal for Indian creators and global channels."
      canonicalPath="/youtube-thumbnail-resizer"
      breadcrumb={ROUTE_BREADCRUMBS['/youtube-thumbnail-resizer']}
      keywords={[
        'youtube thumbnail size',
        '1280x720 thumbnail',
        'youtube banner resizer',
        'thumbnail maker online',
      ]}
      intro="YouTube recommends a 16:9 thumbnail canvas. Lock aspect ratio, drop your artwork, and export a crisp frame that reads well on mobile data saver screens."
      sections={[
        {
          heading: 'Design tips',
          body: [
            'Keep faces and titles inside the center safe zone — YouTube crops differently on TV vs mobile.',
            'Export WebP for smaller previews, or JPEG for maximum compatibility with older pipelines.',
          ],
        },
      ]}
      faq={[
        {
          q: 'Is 1280×720 still valid?',
          a: 'It remains a widely used HD thumbnail baseline; check YouTube Studio for any updated guidance.',
        },
        {
          q: 'Can I add text here?',
          a: 'This tool resizes pixels only — add typography in your design app before export.',
        },
        {
          q: 'Where do I upload?',
          a: 'Download the file, then upload via YouTube Studio on desktop or mobile.',
        },
      ]}
      related={[
        { to: '/instagram-image-resizer', label: 'Instagram sizes' },
        { to: '/crop-image', label: 'Crop image' },
        { to: '/compress-image-to-100kb', label: '100 KB compression' },
        { to: '/#compressor', label: 'Compressor' },
      ]}
    >
      <ImageResizerTool initialWidth={1280} initialHeight={720} lockAspectTo={16 / 9} />
    </ToolSeoPage>
  )
}
