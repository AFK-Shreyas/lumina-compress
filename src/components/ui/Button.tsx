import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'
import { cn } from '../../lib/cn'

const variants = {
  primary:
    'bg-violet-600 text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500 active:scale-[0.98] dark:bg-violet-500 dark:hover:bg-violet-400',
  secondary:
    'bg-white/80 text-slate-900 ring-1 ring-slate-200/80 hover:bg-white dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/15',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-900/5 dark:text-slate-200 dark:hover:bg-white/10',
  outline:
    'border border-slate-300/80 bg-white/40 text-slate-800 hover:border-violet-400/60 hover:bg-white/70 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-violet-400/40 dark:hover:bg-white/10',
} as const

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-base gap-2 rounded-xl',
} as const

type Shared = {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  children: ReactNode
  glass?: boolean
  className?: string
}

export type ButtonProps = Shared &
  (
    | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined })
    | (Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & { href: string })
  )

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  glass,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center font-medium tracking-tight transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    glass && 'backdrop-blur-md',
    'href' in props && props.href && 'no-underline',
    className
  )

  if ('href' in props && props.href) {
    const { href, download, ...anchorProps } = props
    return (
      <a href={href} download={download} className={classes} {...anchorProps}>
        {children}
      </a>
    )
  }

  const { type = 'button', ...buttonProps } = props as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  )
}
