import type { DropItem } from '@/types/drop'
import { DropCard } from './DropCard'

interface Props {
  drops: DropItem[]
  totalUnfiltered: number
}

export function DropList({ drops, totalUnfiltered }: Props) {
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
    <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      {drops.map((drop, index) => (
        <DropCard key={drop.serial || drop.id} drop={drop} displayRank={index + 1} />
      ))}
    </div>
  )
}
