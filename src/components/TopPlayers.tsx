interface PlayerStat {
  name: string
  count: number
}

interface Props {
  players: PlayerStat[]
}

const medals = ['🥇', '🥈', '🥉']

export function TopPlayers({ players }: Props) {
  if (players.length === 0) return null

  return (
    <section className="mb-6">
      <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-accent-muted">
        En çok drop alanlar
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {players.map((p, i) => (
          <div
            key={p.name}
            className="flex items-center gap-3 rounded-xl border border-panel-border bg-panel-elevated px-4 py-3"
          >
            <span className="text-2xl" aria-hidden>
              {medals[i] ?? `#${i + 1}`}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{p.name}</p>
              <p className="text-sm text-accent-gold">
                {p.count} drop{p.count !== 1 ? '' : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
