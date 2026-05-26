import { dropSortScore, parseDropTimeMs } from './dropTime.js'

export { parseDropTimeMs, dropSortScore } from './dropTime.js'

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

/** Resmi site ile aynı: yüksek serial = daha yeni drop */
export function sortDropsNewestFirst(drops, now = Date.now()) {
  return [...drops]
    .sort((a, b) => {
      const scoreDiff = dropSortScore(b, now) - dropSortScore(a, now)
      if (scoreDiff !== 0) return scoreDiff

      const ta = parseDropTimeMs(a.timeText, now)
      const tb = parseDropTimeMs(b.timeText, now)
      if (ta != null && tb != null && ta !== tb) return tb - ta

      return Number(b.serial) - Number(a.serial)
    })
    .map((d, i) => ({ ...d, rank: i + 1 }))
}

/** Serial olmayan kayıtları atar; aynı serial için en dolu kaydı tutar. */
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
  return sortDropsNewestFirst([...bySerial.values()])
}

export function mergeDrops(existing, incoming) {
  const bySerial = new Map()

  for (const d of existing ?? []) {
    const key = dropKey(d)
    if (!key) continue
    bySerial.set(key, { ...d, id: key, serial: key })
  }

  for (const d of incoming ?? []) {
    const key = dropKey(d)
    if (!key) continue
    const prev = bySerial.get(key)
    const richer = prev && richness(prev) > richness(d) ? { ...d, ...prev } : { ...prev, ...d }
    bySerial.set(key, {
      ...richer,
      id: key,
      serial: key,
      liveRank: d.rank ?? prev?.liveRank ?? null,
      timeText: d.timeText || prev?.timeText || '',
      playerName: d.playerName || prev?.playerName || '',
      iconUrl: d.iconUrl || prev?.iconUrl || '',
      itemName: d.itemName || prev?.itemName || '',
    })
  }

  return sortDropsNewestFirst([...bySerial.values()])
}

/** Blob’a yanlışlıkla küçük liste yazılmasını engelle */
export function assertCacheNotShrunk(before, after) {
  if (before >= 100 && after < before * 0.9) {
    throw new Error(
      `Önbellek koruma: kayıt ${before} → ${after} olurdu (muhtemelen Blob okunamadı). Kayıt atlandı.`,
    )
  }
}
