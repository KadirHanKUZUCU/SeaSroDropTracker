interface Props {
  name: string
  className?: string
}

export function PlayerAvatar({ name, className = 'h-4 w-4 text-[9px]' }: Props) {
  const initial = (name.trim()[0] || '?').toUpperCase()
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-panel-border bg-slate-800 font-bold text-accent-gold ${className}`}
      aria-hidden
    >
      {initial}
    </span>
  )
}
