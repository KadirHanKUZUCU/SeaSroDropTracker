const TR_MONTHS = {
  oca: 0,
  jan: 0,
  şub: 1,
  sub: 1,
  feb: 1,
  mar: 2,
  nis: 3,
  apr: 3,
  may: 4,
  haz: 5,
  jun: 5,
  tem: 6,
  jul: 6,
  ağu: 7,
  aug: 7,
  eyl: 8,
  sep: 8,
  ekim: 9,
  oct: 9,
  kas: 10,
  nov: 10,
  ara: 11,
  dec: 11,
}

/** timeText → yaklaşık unix ms (büyük = daha yeni). */
export function parseDropTimeMs(timeText, now = Date.now()) {
  const t = String(timeText ?? '').trim().toLowerCase()
  if (!t) return null

  let m = t.match(/(\d+)\s*(?:dakika|minute|min)\b/)
  if (m) return now - Number(m[1]) * 60_000

  m = t.match(/(\d+)\s*(?:saat|hour|hr)\b/)
  if (m) return now - Number(m[1]) * 3_600_000

  m = t.match(/(\d+)\s*(?:gün|day)\b/)
  if (m) return now - Number(m[1]) * 86_400_000

  m = t.match(/(\d{1,2})\s+([a-zçğıöşü]+)\s+(\d{1,2}):(\d{2})/i)
  if (m) {
    const day = Number(m[1])
    const monKey = m[2].slice(0, 3).toLowerCase()
    const month = TR_MONTHS[monKey]
    if (month == null) return null
    const hour = Number(m[3])
    const minute = Number(m[4])
    const year = new Date(now).getFullYear()
    return new Date(year, month, day, hour, minute).getTime()
  }

  return null
}

export function dropSortScore(d, now = Date.now()) {
  const serial = Number(d?.serial)
  if (!Number.isNaN(serial) && serial > 0) return serial

  const parsed = parseDropTimeMs(d?.timeText, now)
  if (parsed != null) return parsed

  return 0
}
