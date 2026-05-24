import type { SortMode } from '../lib/sortDrops'
import { SORT_OPTIONS } from '../lib/sortDrops'

interface Props {
  value: SortMode
  onChange: (mode: SortMode) => void
}

export function SortBar({ value, onChange }: Props) {
  return (
    <label className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-accent-muted">Sırala:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortMode)}
        className="rounded-lg border border-panel-border bg-panel px-3 py-1.5 text-sm text-white focus:border-accent-gold focus:outline-none focus:ring-1 focus:ring-accent-gold"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
