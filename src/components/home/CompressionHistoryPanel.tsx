import { useCallback, useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import {
  clearCompressionHistory,
  getCompressionHistory,
  type CompressionHistoryEntry,
} from '../../lib/compressionHistory'
import { cn } from '../../lib/cn'

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}

export function CompressionHistoryPanel() {
  const [rows, setRows] = useState<CompressionHistoryEntry[]>(() => getCompressionHistory())

  useEffect(() => {
    const onUpd = () => setRows(getCompressionHistory())
    window.addEventListener('lumina-history-updated', onUpd)
    return () => window.removeEventListener('lumina-history-updated', onUpd)
  }, [])

  const clear = useCallback(() => {
    clearCompressionHistory()
    setRows([])
  }, [])

  if (rows.length === 0) {
    return (
      <section
        aria-labelledby="history-heading"
        className="rounded-2xl border border-dashed border-slate-300/70 bg-white/30 p-6 text-center dark:border-white/15 dark:bg-white/5"
      >
        <h2 id="history-heading" className="text-base font-semibold text-slate-800 dark:text-slate-100">
          Compression history
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Successful compressions appear here with a thumbnail strip. Nothing saved yet — your history stays on this
          device.
        </p>
      </section>
    )
  }

  const recent = rows.slice(0, 5)

  return (
    <section aria-labelledby="history-heading" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="history-heading" className="text-base font-semibold text-slate-900 dark:text-white">
            Recently compressed
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Latest {recent.length} shown · stored locally</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={clear} className="!text-xs">
          Clear history
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {recent.map((e) => (
          <figure
            key={e.id}
            className="w-20 shrink-0 overflow-hidden rounded-xl border border-white/50 bg-white/50 dark:border-white/10 dark:bg-slate-900/50"
          >
            {e.thumbDataUrl ? (
              <img src={e.thumbDataUrl} alt="" className="aspect-square h-20 w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-20 items-center justify-center bg-slate-200/50 text-[10px] text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                No thumb
              </div>
            )}
            <figcaption className="truncate px-1 py-0.5 text-center text-[9px] text-slate-600 dark:text-slate-400">
              {e.reducedPct >= 0 ? `${e.reducedPct}%` : `+${-e.reducedPct}%`}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/40 dark:border-white/10">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-white/50 text-slate-500 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400">
            <tr>
              <th className="px-3 py-2 font-semibold">File</th>
              <th className="px-3 py-2 font-semibold">When</th>
              <th className="px-3 py-2 font-semibold">Original</th>
              <th className="px-3 py-2 font-semibold">Compressed</th>
              <th className="px-3 py-2 font-semibold">Δ</th>
              <th className="px-3 py-2 font-semibold">Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
            {rows.map((e) => (
              <tr key={e.id} className="bg-white/30 dark:bg-slate-900/30">
                <td className="max-w-[140px] truncate px-3 py-2 font-medium text-slate-800 dark:text-slate-100" title={e.name}>
                  {e.name}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-600 dark:text-slate-400">
                  {new Date(e.ts).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-600 dark:text-slate-400">
                  {formatBytes(e.originalBytes)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-600 dark:text-slate-400">
                  {formatBytes(e.compressedBytes)}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span
                    className={cn(
                      'font-semibold',
                      e.reducedPct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    )}
                  >
                    {e.reducedPct >= 0 ? `${e.reducedPct}%` : `${-e.reducedPct}%`}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-600 dark:text-slate-400">
                  {e.width}×{e.height}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
