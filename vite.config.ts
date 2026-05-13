import fs from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin, ResolvedConfig } from 'vite'
import { defineConfig } from 'vite'
function seoStaticPlugin(): Plugin {
  let resolved: ResolvedConfig
  return {
    name: 'seo-static-files',
    configResolved(c) {
      resolved = c
    },
    closeBundle() {
      const outDir = path.resolve(resolved.root, resolved.build.outDir)
      const site = (process.env.VITE_SITE_URL || 'https://luminacompress.netlify.app').replace(/\/$/, '')
      const base = resolved.base || '/'
      const baseSeg = base === '/' ? '' : base.replace(/\/$/, '')
      const root = `${site}${baseSeg}`.replace(/\/+$/, '')
      const loc = (route: string) => (route === '/' ? `${root}/` : `${root}${route}`)
      const routes = ['/', '/about', '/privacy', '/terms', '/compress-image', '/resize-image', '/crop-image', '/passport-photo-maker', '/instagram-image-resizer', '/youtube-thumbnail-resizer', '/compress-image-to-20kb', '/compress-image-to-50kb', '/compress-image-to-100kb', '/compress-image-to-200kb']
      const urlEntries = routes
        .map(
          (r) => `  <url>
    <loc>${loc(r)}</loc>
    <changefreq>weekly</changefreq>
    <priority>${r === '/' ? '1.0' : '0.75'}</priority>
  </url>`
        )
        .join('\n')
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`
      const sitemapUrl = `${root}/sitemap.xml`.replace(/([^:])\/{2,}/g, '$1/')
      const robots = `User-agent: *
Allow: /
Sitemap: ${sitemapUrl}
`
      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap, 'utf8')
      fs.writeFileSync(path.join(outDir, 'robots.txt'), robots, 'utf8')
    },
  }
}
// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), seoStaticPlugin()],
  base: '/',
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react'
          return undefined
        },
      },
    },
  },
})
