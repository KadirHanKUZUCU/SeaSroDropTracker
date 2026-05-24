interface Props {
  count: number
  onDismiss: () => void
}

export function NewDropsBadge({ count, onDismiss }: Props) {
  if (count <= 0) return null

  return (
    <button
      type="button"
      onClick={onDismiss}
      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-900/60"
      title="Tıkla — görüldü olarak işaretle"
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
      +{count} yeni drop
    </button>
  )
}
