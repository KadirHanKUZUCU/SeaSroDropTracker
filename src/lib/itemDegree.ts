/** Silkroad item kodundan degree (ör. 08 → 8, 11 → 11) çıkarır */
export function parseItemDegree(itemName: string): number | null {
  const upper = itemName.toUpperCase()
  const typeDegree =
    /_(?:HEAVY|LIGHT|MEDIUM|ROBE|SPEAR|SWORD|BLADE|BOW|TBLADE|WAND|HARP|RING|EARRING|NECKLACE|SHIELD|CLOTHES|HAT|ATTACHMENT)_(\d{1,2})_/i.exec(
      upper,
    )
  if (typeDegree) {
    const n = parseInt(typeDegree[1], 10)
    if (n >= 1 && n <= 15) return n
  }

  const beforeRare = upper.split('_RARE')[0] ?? upper
  const parts = beforeRare.split('_')
  for (let i = parts.length - 1; i >= 0; i--) {
    const n = parseInt(parts[i], 10)
    if (!Number.isNaN(n) && n >= 1 && n <= 15) return n
  }
  return null
}

export function formatDegree(d: number): string {
  return `${d}D`
}
