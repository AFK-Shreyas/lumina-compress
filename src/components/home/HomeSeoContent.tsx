import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { absoluteUrl } from '../../lib/absolute-url'
import { SITE_NAME } from '../../lib/seo-constants'
import { cn } from '../../lib/cn'

const HOWTO_LD_ID = 'ld-json-home-howto'

const howToSteps = [
  {
    name: 'Add images',
    text: 'Drag and drop JPG, JPEG, PNG, or WebP files into the compressor, or use the upload button to select one or more images from your device.',
  },
  {
    name: 'Choose settings',
    text: 'Pick a preset or set quality, maximum edge length, and output format (WebP, JPEG, or PNG) to match your publishing goal.',
  },
  {
    name: 'Compress',
    text: 'Run compression in your browser. Progress updates show while each image is processed — no uploads to a remote server.',
  },
  {
    name: 'Download',
    text: 'Download individual optimized files or export everything as a ZIP archive when you are satisfied with previews and file sizes.',
  },
] as const

function Section({
  id,
  title,
  children,
  className,
}: {
  id: string
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        'rounded-2xl border border-white/45 bg-white/40 p-6 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/35 sm:p-8',
        className
      )}
    >
      <h2 id={`${id}-heading`} className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.65rem] dark:text-white">
        {title}
      </h2>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">{children}</div>
    </section>
  )
}

export function HomeSeoContent() {
  useEffect(() => {
    const pageUrl = absoluteUrl('/')
    const graph = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      '@id': `${pageUrl}#howto-compress`,
      name: `How to compress images with ${SITE_NAME}`,
      description: `Step-by-step guide to compress image online, reduce image size, and export JPG, PNG, or WebP using the browser-based ${SITE_NAME} tool.`,
      totalTime: 'PT2M',
      step: howToSteps.map((step, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: step.name,
        text: step.text,
      })),
    }

    document.getElementById(HOWTO_LD_ID)?.remove()
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = HOWTO_LD_ID
    el.setAttribute('data-seo-managed', 'true')
    el.textContent = JSON.stringify(graph)
    document.head.appendChild(el)

    return () => {
      el.remove()
    }
  }, [])

  return (
    <div className="mx-auto max-w-3xl space-y-10 sm:space-y-12">
      <div className="text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
          Guides &amp; explainers
        </p>
        <p className="mt-2 text-lg font-medium tracking-tight text-slate-900 dark:text-white">
          Straightforward answers if you are new to image compression
        </p>
      </div>

      <Section id="what-is-image-compression" title="What is image compression?">
        <p>
          Image compression is the process of making an image file smaller while keeping it useful for its purpose.
          That might mean fewer megabytes for faster downloads, smoother scrolling on mobile, or easier sharing in
          email and chat. A practical <strong className="font-medium text-slate-800 dark:text-slate-200">image compressor</strong>{' '}
          helps you balance file size against how crisp the picture needs to look on real screens.
        </p>
        <p>
          There are two broad families people talk about: <strong className="font-medium text-slate-800 dark:text-slate-200">lossy</strong>{' '}
          compression (like JPEG and many WebP settings), where some detail is discarded to save space, and{' '}
          <strong className="font-medium text-slate-800 dark:text-slate-200">lossless</strong> compression (like typical PNG workflows),
          where pixels are preserved but redundancy in the data is squeezed out. The “best” choice depends on whether
          you are optimizing a portrait, a screenshot, a logo, or a transparent overlay.
        </p>
        <p>
          Tools such as {SITE_NAME} focus on <strong className="font-medium text-slate-800 dark:text-slate-200">compress image online</strong>{' '}
          workflows without routing your files through a stranger’s server — helpful when privacy matters as much as
          performance.
        </p>
      </Section>

      <Section id="how-image-compression-works" title="How image compression works">
        <p>
          In a browser-based tool, compression usually follows a simple pipeline: your image is decoded into pixels,
          optionally resized to a smaller maximum width or height, then re-encoded into a target format with chosen
          quality settings. Along the way, the app can show progress so you know the work is moving forward, especially
          when you batch several photos.
        </p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">What you control</h3>
        <p>
          Common controls include output format (for example WebP or JPEG), a quality slider for lossy exports, and a
          maximum edge length so oversized camera photos do not stay wider than your layout needs. Together, these
          knobs determine how aggressively you <strong className="font-medium text-slate-800 dark:text-slate-200">reduce image size</strong>{' '}
          for each asset.
        </p>
        <p>
          If you are comparing approaches, think in terms of “where the bytes go.” Big images cost time: time to
          download, time to decode, and sometimes time to resize in the browser. A thoughtful{' '}
          <strong className="font-medium text-slate-800 dark:text-slate-200">photo compressor</strong> workflow trims those costs early, before
          you publish.
        </p>
      </Section>

      <Section id="why-reduce-image-size" title="Why reduce image size?">
        <p>
          Smaller images load faster, especially on mobile networks and mid-range devices. That matters for visitors
          who bounce when a page feels sluggish, and it matters for teams who care about Core Web Vitals and overall
          user experience. When you <strong className="font-medium text-slate-800 dark:text-slate-200">reduce image size</strong> responsibly,
          you often improve Largest Contentful Paint without making the page look “cheap.”
        </p>
        <p>
          There are practical wins beyond speed: less storage in CMS libraries, cheaper bandwidth bills at scale, and
          quicker backups. Even for personal projects — portfolios, blogs, landing pages — lighter media makes iteration
          easier because you are not pushing giant originals through every deploy.
        </p>
        <p>
          The goal is not “smallest file at any cost.” The goal is a file that looks right in context — sharp where it
          should be, small enough to feel instant, and honest about what the format can do.
        </p>
      </Section>

      <Section id="jpg-vs-png-compression" title="JPG vs PNG compression">
        <p>
          JPEG (often shown as JPG) is the classic choice for photographs and complex scenes with gradients. A{' '}
          <strong className="font-medium text-slate-800 dark:text-slate-200">jpg compressor</strong> leans on lossy encoding, which is why you
          can usually shrink a photo dramatically if you accept a little softness in fine texture.
        </p>
        <p>
          PNG is different. It is a strong fit for screenshots, UI elements, diagrams, and anything needing crisp edges
          or transparency. A <strong className="font-medium text-slate-800 dark:text-slate-200">png compressor</strong> may not always produce
          a smaller file than JPEG for real-world photos, but it can be the right call when fidelity and alpha channels
          matter more than squeezing the last kilobyte.
        </p>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">A simple rule of thumb</h3>
        <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-400">
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Choose JPEG or WebP</strong> for most photos where transparency is not
            required.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Choose PNG</strong> when you need lossless detail, hard edges, or
            transparency.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Experiment lightly</strong>: compare at 100% zoom on a phone and a
            laptop before you commit to a publish pipeline.
          </li>
        </ul>
      </Section>

      <Section id="best-image-format-for-websites" title="Best image format for websites">
        <p>
          Modern sites often standardize on <strong className="font-medium text-slate-800 dark:text-slate-200">WebP</strong> for a strong
          mix of quality and size, with JPEG as a dependable fallback where WebP support is limited. Some teams also
          adopt AVIF where tooling and CDN support make sense, but WebP remains a practical sweet spot for many static
          sites and component libraries.
        </p>
        <p>
          The “best format” is rarely one-size-fits-all. Marketing pages might prioritize hero clarity, while thumbnail
          grids prioritize density. A healthy workflow picks a default (often WebP), documents exceptions (PNG for
          transparency, SVG for icons), and keeps originals archived separately from what you ship publicly.
        </p>
        <p>
          If you are building with {SITE_NAME}, you can export WebP or JPEG for lossy delivery and PNG when your design
          truly needs lossless pixels — then use the ZIP option when you are packaging a batch for handoff or upload.
        </p>
      </Section>

      <Section id="benefits-of-image-optimization" title="Benefits of image optimization">
        <p>
          Image optimization is the discipline around choosing formats, dimensions, compression settings, and delivery
          patterns so users get a fast page without surprises. When you pair a good tool with sensible defaults, you
          spend less time manually fixing oversized uploads.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-400">
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Faster perceived performance</strong>, especially on mobile networks.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Lower data usage</strong> for readers on capped plans — a respectful,
            trustworthy improvement.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Cleaner publishing workflows</strong> when authors can compress locally
            before CMS upload.
          </li>
          <li>
            <strong className="text-slate-800 dark:text-slate-200">Better accessibility outcomes</strong> when huge images do not fight the
            browser for memory and main-thread time.
          </li>
        </ul>
        <p>
          Want a deeper technical angle? Read{' '}
          <Link to="/about" className="font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-300">
            how {SITE_NAME} works
          </Link>
          , or jump back to the{' '}
          <Link to="/#compressor" className="font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-300">
            compressor tool
          </Link>{' '}
          and try a small batch with conservative quality first.
        </p>
      </Section>
    </div>
  )
}
