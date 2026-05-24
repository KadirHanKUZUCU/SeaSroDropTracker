import type { DropItem } from '../types/drop'
import { itemDetailUrl } from '../types/drop'
import { tierBadgeClass } from '../lib/itemFormat'

interface Props {
  drop: DropItem
  /** Liste sırası (verideki rank çakışmasını önler) */
  displayRank?: number
}

export function DropCard({ drop, displayRank }: Props) {
  const href = drop.serial ? itemDetailUrl(drop.serial) : drop.itemUrl

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 rounded-xl border border-panel-border bg-panel-elevated p-4 transition hover:border-accent-gold/40 hover:shadow-lg hover:shadow-accent-gold/5"
      title={`Detay: ${drop.itemName}`}
    >
      <div className="relative shrink-0">
        <span className="absolute -left-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded bg-panel-elevated text-[10px] font-bold text-accent-gold">
          {displayRank ?? drop.rank}
        </span>
        <div className="rounded-lg border-2 border-slate-700 bg-slate-900/80 p-1">
          <img
            src={drop.iconUrl}
            alt=""
            className="h-14 w-14 object-contain"
            loading="lazy"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = '/placeholder-item.png'
            }}
          />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-semibold leading-snug text-white group-hover:text-accent-gold">
          {drop.displayName}
        </p>
        <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500">{drop.itemName}</p>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-accent-muted">
          <img
            src={`https://110cap.seasro.com/Image/Game/CharPortrait/${drop.playerName}.webp`}
            alt=""
            className="h-4 w-4 rounded-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <span>{drop.playerName}</span>
        </p>
        <p className="mt-2 text-xs font-medium text-cyan-400">{drop.timeText}</p>
        <p className="mt-1 font-mono text-[10px] text-slate-600">#{drop.serial}</p>
        {drop.tier ? (
          <span
            className={`mt-2 inline-block rounded border px-2 py-0.5 text-xs font-semibold ${tierBadgeClass(drop.tier)}`}
          >
            {drop.tier}
          </span>
        ) : null}
      </div>
    </a>
  )
}
