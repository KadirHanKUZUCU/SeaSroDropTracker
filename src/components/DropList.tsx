import { useEffect, useState } from 'react'
import type { DropItem } from '../types/drop'
import { DropCard } from './DropCard'

const PAGE_SIZE = 50

interface Props {
  drops: DropItem[]
  totalUnfiltered: number
  onPlayerClick?: (playerName: string) => void
}

export function DropList({ drops, totalUnfiltered, onPlayerClick }: Props) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [drops])

  const totalPages = Math.max(1, Math.ceil(drops.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const pageDrops = drops.slice(start, start + PAGE_SIZE)

  if (drops.length === 0) {
    return (
      <div className="rounded-xl border border-panel-border bg-panel-elevated p-12 text-center text-accent-muted">
        <p>Gösterilecek drop bulunamadı.</p>
        {totalUnfiltered > 0 && (
          <p className="mt-2 text-sm">Toplam {totalUnfiltered} kayıt içinden 0 eşleşti.</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {pageDrops.map((drop, index) => (
          <DropCard
            key={drop.serial || drop.id}
            drop={drop}
            displayRank={start + index + 1}
            onPlayerClick={onPlayerClick}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-panel-border pt-4">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-panel-border px-3 py-1.5 text-sm text-slate-300 disabled:opacity-40 hover:border-accent-gold/50"
          >
            ← Önceki
          </button>
          <span className="px-2 text-sm text-slate-400">
            Sayfa {safePage} / {totalPages}
            <span className="text-slate-600"> · {start + 1}–{Math.min(start + PAGE_SIZE, drops.length)}</span>
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-panel-border px-3 py-1.5 text-sm text-slate-300 disabled:opacity-40 hover:border-accent-gold/50"
          >
            Sonraki →
          </button>
        </div>
      )}
    </div>
  )
}
