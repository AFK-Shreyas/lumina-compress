import { ImageResizerTool } from '../../components/tools/ImageResizerTool'
import { ToolSeoPage } from '../../components/tools/ToolSeoPage'
import { ROUTE_BREADCRUMBS } from '../../config/breadcrumbs'
import { SOCIAL_PRESETS } from '../../lib/socialPresets'

const ig = SOCIAL_PRESETS.filter((p) => p.platform === 'Instagram')

export function InstagramImageResizerPage() {
  return (
    <ToolSeoPage
      title="Instagram image resizer — post, story & reel cover sizes"
      description="Resize photos for Instagram post (1080×1080), story/reel vertical (1080×1920), and learn recommended aspect ratios — free browser tool with glass UI."
      canonicalPath="/instagram-image-resizer"
      breadcrumb={ROUTE_BREADCRUMBS['/instagram-image-resizer']}
      keywords={[
        'instagram image resizer',
        'instagram post size',
        'instagram story dimensions',
        '1080x1080 image',
        '9:16 story',
      ]}
      intro="Creators in India and worldwide use predictable pixel sizes to avoid unexpected crops. Start from the preset that matches your deliverable, keep aspect lock on, then download WebP or JPEG."
      sections={[
        {
          heading: 'Preset reference',
          body: ig.map((p) => `${p.label}: ${p.width}×${p.height}px — ${p.blurb}`),
        },
        {
          heading: 'Workflow',
          body: [
            'Resize here, optionally crop on the crop tool for fine composition, then compress on the home compressor if you need smaller uploads.',
          ],
        },
      ]}
      faq={[
        {
          q: 'Is 1080px still enough?',
          a: 'Many creators still export 1080px on the short edge for feed posts; verify Instagram’s latest guidance for ads and reels.',
        },
        {
          q: 'Will Instagram recompress my file?',
          a: 'Most platforms re-encode uploads. Starting from a clean master reduces visible artifacts.',
        },
        {
          q: 'Does this post to Instagram?',
          a: 'No — you download a file to upload inside the Instagram app or scheduler.',
        },
      ]}
      related={[
        { to: '/youtube-thumbnail-resizer', label: 'YouTube thumbnail' },
        { to: '/crop-image', label: 'Crop image' },
        { to: '/resize-image', label: 'Custom resize' },
        { to: '/#compressor', label: 'Compressor' },
      ]}
    >
      <ImageResizerTool initialWidth={1080} initialHeight={1080} lockAspectTo={1} />
    </ToolSeoPage>
  )
}
