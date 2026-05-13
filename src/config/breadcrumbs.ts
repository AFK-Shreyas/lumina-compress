import type { BreadcrumbItem } from '../components/seo/SEO'

const H: BreadcrumbItem = { name: 'Home', path: '/' }

/** Central map for visible breadcrumbs + reuse in `<SEO breadcrumb={...} />`. */
export const ROUTE_BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
  '/': [H],
  '/about': [H, { name: 'About', path: '/about' }],
  '/privacy': [H, { name: 'Privacy Policy', path: '/privacy' }],
  '/terms': [H, { name: 'Terms of Service', path: '/terms' }],
  '/resize-image': [H, { name: 'Resize image online', path: '/resize-image' }],
  '/crop-image': [H, { name: 'Crop image online', path: '/crop-image' }],
  '/compress-image-to-20kb': [H, { name: 'Compress image to 20KB', path: '/compress-image-to-20kb' }],
  '/compress-image-to-50kb': [H, { name: 'Compress image to 50KB', path: '/compress-image-to-50kb' }],
  '/compress-image-to-100kb': [H, { name: 'Compress image to 100KB', path: '/compress-image-to-100kb' }],
  '/compress-image-to-200kb': [H, { name: 'Compress image to 200KB', path: '/compress-image-to-200kb' }],
  '/passport-photo-maker': [H, { name: 'Passport photo maker', path: '/passport-photo-maker' }],
  '/instagram-image-resizer': [H, { name: 'Instagram image resizer', path: '/instagram-image-resizer' }],
  '/youtube-thumbnail-resizer': [H, { name: 'YouTube thumbnail resizer', path: '/youtube-thumbnail-resizer' }],
}

export function breadcrumbsForPath(pathname: string): BreadcrumbItem[] {
  return ROUTE_BREADCRUMBS[pathname] ?? ROUTE_BREADCRUMBS['/']
}
