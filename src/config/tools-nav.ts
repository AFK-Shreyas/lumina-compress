export const TOOL_NAV = [
  { to: '/resize-image', label: 'Resize image' },
  { to: '/crop-image', label: 'Crop image' },
  { to: '/compress-image-to-20kb', label: 'Compress to 20 KB' },
  { to: '/compress-image-to-50kb', label: 'Compress to 50 KB' },
  { to: '/compress-image-to-100kb', label: 'Compress to 100 KB' },
  { to: '/compress-image-to-200kb', label: 'Compress to 200 KB' },
  { to: '/passport-photo-maker', label: 'Passport photo maker' },
  { to: '/instagram-image-resizer', label: 'Instagram resizer' },
  { to: '/youtube-thumbnail-resizer', label: 'YouTube thumbnail' },
] as const

export const POPULAR_TOOLS = TOOL_NAV.slice(0, 6)

export function labelForToolPath(path: string): string {
  return TOOL_NAV.find((t) => t.to === path)?.label ?? path
}
