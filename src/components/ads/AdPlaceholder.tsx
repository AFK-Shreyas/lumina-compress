import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const SLOT_LABEL = 'Google AdSense Ad Slot'

export type AdPlaceholderVariant =
  | 'top-banner'
  | 'sidebar'
  | 'in-content'
  | 'mobile-sticky'
  | 'after-download'

type Props = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  variant: AdPlaceholderVariant
  /** Optional slot name for your AdSense dashboard / future script hooks */
  slotKey?: string
}

const shell =
  'flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-center transition-colors'

const variantClass: Record<AdPlaceholderVariant, string> = {
  'top-banner':
    'w-full min-h-[52px] sm:min-h-[90px] border-slate-300/70 bg-slate-50/60 dark:border-white/15 dark:bg-slate-900/40',
  sidebar:
    'w-full max-w-[300px] min-h-[250px] border-slate-300/70 bg-slate-50/60 dark:border-white/15 dark:bg-slate-900/40 lg:max-w-none',
  'in-content':
    'w-full min-h-[250px] max-w-[min(100%,728px)] border-slate-300/70 bg-slate-50/60 dark:border-white/15 dark:bg-slate-900/40',
  'mobile-sticky':
    'w-full min-h-[50px] max-h-[60px] border-slate-300/80 bg-white/80 dark:border-white/15 dark:bg-slate-950/80',
  'after-download':
    'w-full min-h-[100px] sm:min-h-[120px] max-w-[min(100%,728px)] border-slate-300/70 bg-slate-50/50 dark:border-white/15 dark:bg-slate-900/35',
}

/**
 * Empty responsive container for future Google AdSense units.
 * Do not load ad scripts here — only mount your AdSense snippet inside this node when ready.
 */
export function AdPlaceholder({ variant, slotKey, className, ...props }: Props) {
  const id = slotKey ? `ad-slot-${slotKey}` : `ad-slot-${variant}`

  return (
    <div
      id={id}
      role="region"
      data-ad-placeholder={variant}
      data-ad-slot-key={slotKey ?? variant}
      aria-label={`Advertisement placeholder: ${SLOT_LABEL}`}
      className={cn(shell, variantClass[variant], className)}
      {...props}
    >
      <span className="select-none px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 sm:text-xs">
        {SLOT_LABEL}
      </span>
      <span className="hidden px-3 text-[10px] text-slate-400 dark:text-slate-500 sm:inline sm:text-xs">
        Reserved space — insert AdSense code when your account is approved
      </span>
    </div>
  )
}
