/** Geçerli drop anahtarı yalnızca serial (aynı item tekrar etmesin). */
export function dropKey(d) {
  const serial = String(d?.serial ?? '').trim()
  return serial || null
}

function richness(d) {
  let n = 0
  if (d.timeText) n += 4
  if (d.playerName) n += 2
  if (d.iconUrl) n += 1
  if (d.tier) n += 1
  return n
}

/** Serial olmayan / rank-N hayalet kayıtları atar; aynı serial için en dolu kaydı tutar. */
export function dedupeDrops(drops) {
  const bySerial = new Map()
  for (const d of drops) {
    const key = dropKey(d)
    if (!key) continue
    const prev = bySerial.get(key)
    if (!prev || richness(d) > richness(prev)) {
      bySerial.set(key, { ...d, id: key, serial: key })
    }
  }
  return [...bySerial.values()]
    .sort((a, b) => {
      const ra = a.rank ?? Number.MAX_SAFE_INTEGER
      const rb = b.rank ?? Number.MAX_SAFE_INTEGER
      if (ra !== rb) return ra - rb
      return String(b.timeText).localeCompare(String(a.timeText))
    })
    .map((d, i) => ({ ...d, rank: i + 1 }))
}

export function mergeDrops(existing, incoming) {
  return dedupeDrops([...(existing ?? []), ...(incoming ?? [])])
}
