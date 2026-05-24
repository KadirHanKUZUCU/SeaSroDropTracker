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
      return list.sort((a, b) => a.rank - b.rank)
  }
}
