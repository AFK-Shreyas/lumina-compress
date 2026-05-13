export type SocialPreset = {
  id: string
  label: string
  platform: string
  width: number
  height: number
  /** Optional crop aspect (w/h) when using crop-first flow */
  aspect: number
  blurb: string
}

export const SOCIAL_PRESETS: SocialPreset[] = [
  {
    id: 'ig-post',
    label: 'Instagram post',
    platform: 'Instagram',
    width: 1080,
    height: 1080,
    aspect: 1,
    blurb: 'Square 1080×1080 — ideal feed post.',
  },
  {
    id: 'ig-story',
    label: 'Instagram story',
    platform: 'Instagram',
    width: 1080,
    height: 1920,
    aspect: 9 / 16,
    blurb: '9:16 vertical 1080×1920.',
  },
  {
    id: 'ig-reel',
    label: 'Reel cover',
    platform: 'Instagram',
    width: 1080,
    height: 1920,
    aspect: 9 / 16,
    blurb: 'Same canvas as Stories/Reels thumbnails.',
  },
  {
    id: 'yt-thumb',
    label: 'YouTube thumbnail',
    platform: 'YouTube',
    width: 1280,
    height: 720,
    aspect: 16 / 9,
    blurb: '16:9 HD thumbnail — widely recommended.',
  },
  {
    id: 'wa-dp',
    label: 'WhatsApp profile',
    platform: 'WhatsApp',
    width: 500,
    height: 500,
    aspect: 1,
    blurb: 'Square 500×500 — safe for profile photos.',
  },
  {
    id: 'wa-status',
    label: 'WhatsApp status',
    platform: 'WhatsApp',
    width: 1080,
    height: 1920,
    aspect: 9 / 16,
    blurb: 'Full-screen vertical status.',
  },
  {
    id: 'fb-cover',
    label: 'Facebook cover',
    platform: 'Facebook',
    width: 820,
    height: 312,
    aspect: 820 / 312,
    blurb: 'Classic desktop cover ratio — verify current FB guidelines when publishing.',
  },
  {
    id: 'li-banner',
    label: 'LinkedIn banner',
    platform: 'LinkedIn',
    width: 1584,
    height: 396,
    aspect: 1584 / 396,
    blurb: 'Personal profile banner — check LinkedIn’s latest spec before upload.',
  },
  {
    id: 'x-header',
    label: 'X / Twitter header',
    platform: 'X',
    width: 1500,
    height: 500,
    aspect: 3,
    blurb: '3:1 header — keep critical content centered; crop safe zones vary by client.',
  },
]

export function presetById(id: string): SocialPreset | undefined {
  return SOCIAL_PRESETS.find((p) => p.id === id)
}
