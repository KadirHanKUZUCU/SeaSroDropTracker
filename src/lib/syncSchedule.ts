/** cron-job.org: her 10 dakikada bir (:00, :10, :20 …) */
export const CRON_INTERVAL_MINUTES = 10

/** Bir sonraki 10 dk dilimine kalan ms (ör. 20:07 → 20:10) */
export function getMsUntilNextCron(now = Date.now()): number {
  const d = new Date(now)
  const min = d.getMinutes()
  const slot = Math.floor(min / CRON_INTERVAL_MINUTES)
  const nextMin = (slot + 1) * CRON_INTERVAL_MINUTES
  const next = new Date(d)
  if (nextMin >= 60) {
    next.setHours(d.getHours() + 1)
    next.setMinutes(0)
  } else {
    next.setMinutes(nextMin)
  }
  next.setSeconds(0)
  next.setMilliseconds(0)
  return Math.max(0, next.getTime() - now)
}

export function getNextCronDate(now = Date.now()): Date {
  return new Date(now + getMsUntilNextCron(now))
}

/** Cron bittikten sonra panel yenilemesi (+35 sn) */
export const PANEL_REFRESH_AFTER_CRON_MS = 35_000

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
