import type { DropItem } from '../types/drop'

export type SortMode = 'newest' | 'degree-desc' | 'degree-asc' | 'player-asc'

export const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: 'newest', label: 'En yeni' },
  { id: 'degree-desc', label: 'Derece (yüksek → düşük)' },
  { id: 'degree-asc', label: 'Derece (düşük → yüksek)' },
  { id: 'player-asc', label: 'Oyuncu (A → Z)' },
]

export function sortDrops(drops: DropItem[], mode: SortMode): DropItem[] {
  const list = [...drops]
  switch (mode) {
    case 'degree-desc':
      return list.sort((a, b) => (b.degree ?? -1) - (a.degree ?? -1))
    case 'degree-asc':
      return list.sort((a, b) => (a.degree ?? 99) - (b.degree ?? 99))
    case 'player-asc':
      return list.sort((a, b) => a.playerName.localeCompare(b.playerName, 'tr'))
    case 'newest':
    default:
      return list.sort((a, b) => {
        const seen = String(b.lastSeenAt ?? '').localeCompare(String(a.lastSeenAt ?? ''))
        if (seen !== 0) return seen
        const live = (a.liveRank ?? a.rank) - (b.liveRank ?? b.rank)
        if (live !== 0) return live
        return a.rank - b.rank
      })
  }
}
