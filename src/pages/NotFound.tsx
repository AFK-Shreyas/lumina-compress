import { useNavigate } from 'react-router-dom'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col bg-[#0f172a] text-slate-200">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="flex w-full max-w-lg flex-col items-center text-center motion-safe:animate-[fade-in_0.65s_ease_both] motion-reduce:animate-none">
          <div className="mb-10 flex items-center gap-2.5 sm:mb-12">
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-[#0f172a] shadow-lg shadow-amber-500/25"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                focusable="false"
              >
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                <path d="M8 22h12a2 2 0 002-2V4a2 2 0 00-2-2H8" />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-100 sm:text-base">Lumina Compress</span>
          </div>

          <p
            aria-hidden
            className="select-none text-[clamp(5rem,22vw,10rem)] font-black leading-none tracking-tighter text-[#f59e0b] drop-shadow-[0_0_32px_rgba(245,158,11,0.45)] sm:drop-shadow-[0_0_48px_rgba(245,158,11,0.4)]"
          >
            404
          </p>

          <h1 className="mt-6 max-w-md text-xl font-semibold tracking-tight text-slate-100 sm:mt-8 sm:text-2xl">
            Oops! This page doesn&apos;t exist.
          </h1>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
            Looks like this page got compressed a little too much 😄
          </p>

          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="mt-10 rounded-xl bg-[#f59e0b] px-6 py-3 text-sm font-semibold text-[#0f172a] shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 active:scale-[0.98] sm:mt-12 sm:px-8 sm:text-base"
          >
            Back to Home
          </button>
        </div>
      </main>
    </div>
  )
}
