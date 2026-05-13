/** Route transition shell — lightweight skeleton, avoids blank flashes. */
export function PageSkeleton() {
  return (
    <div
      className="flex min-h-[14rem] flex-col gap-4 rounded-2xl border border-white/40 bg-white/40 p-6 dark:border-white/10 dark:bg-slate-900/40"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading page</span>
      <div className="mx-auto flex h-9 w-9 animate-pulse rounded-full bg-violet-400/35 motion-reduce:animate-none dark:bg-violet-400/25" aria-hidden />
      <div className="mx-auto w-full max-w-md space-y-3">
        <div className="h-3 w-48 max-w-[85%] animate-pulse rounded-md bg-slate-200/90 motion-reduce:animate-none dark:bg-white/10" />
        <div className="h-3 w-full animate-pulse rounded-md bg-slate-200/70 motion-reduce:animate-none dark:bg-white/10" />
        <div className="h-3 max-w-[95%] animate-pulse rounded-md bg-slate-200/60 motion-reduce:animate-none dark:bg-white/10" />
        <div className="h-3 w-4/5 animate-pulse rounded-md bg-slate-200/50 motion-reduce:animate-none dark:bg-white/10" />
      </div>
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">Loading…</p>
    </div>
  )
}
