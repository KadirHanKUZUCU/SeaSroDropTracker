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

/** En yeni önce: son canlı tarama → sayfa sırası → serial */
export function sortDropsNewestFirst(drops) {
  return [...drops]
    .sort((a, b) => {
      const seen = String(b.lastSeenAt ?? '').localeCompare(String(a.lastSeenAt ?? ''))
      if (seen !== 0) return seen

      const live = (a.liveRank ?? 9999) - (b.liveRank ?? 9999)
      if (live !== 0) return live

      const sa = Number(a.serial)
      const sb = Number(b.serial)
      if (!Number.isNaN(sa) && !Number.isNaN(sb) && sa !== sb) return sb - sa

      return String(b.timeText).localeCompare(String(a.timeText), 'tr')
    })
    .map((d, i) => ({ ...d, rank: i + 1 }))
}

/** Serial olmayan kayıtları atar; aynı serial için en dolu + güncel canlı bilgiyi tutar. */
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
  const now = new Date().toISOString()
  const bySerial = new Map()

  for (const d of existing ?? []) {
    const key = dropKey(d)
    if (!key) continue
    bySerial.set(key, {
      ...d,
      id: key,
      serial: key,
      firstSeenAt: d.firstSeenAt ?? d.lastSeenAt ?? null,
      lastSeenAt: d.lastSeenAt ?? null,
      liveRank: d.liveRank ?? d.rank ?? null,
    })
  }

  for (const d of incoming ?? []) {
    const key = dropKey(d)
    if (!key) continue
    const prev = bySerial.get(key)
    const base = prev && richness(prev) > richness(d) ? { ...d, ...prev } : { ...prev, ...d }
    bySerial.set(key, {
      ...base,
      id: key,
      serial: key,
      firstSeenAt: prev?.firstSeenAt ?? now,
      lastSeenAt: now,
      liveRank: d.rank ?? prev?.liveRank ?? null,
      timeText: d.timeText || prev?.timeText || '',
      playerName: d.playerName || prev?.playerName || '',
      iconUrl: d.iconUrl || prev?.iconUrl || '',
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
