const STORAGE_KEY = 'sro-drop-tracker-serials'

export function loadLastVisitSerials(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((s): s is string => typeof s === 'string' && s.length > 0))
  } catch {
    return new Set()
  }
}

export function saveLastVisitSerials(serials: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serials))
  } catch {
    /* quota / private mode */
  }
}

export function countNewSinceLastVisit(drops: { serial: string }[], last: Set<string>): number {
  if (last.size === 0) return 0
  return drops.filter((d) => d.serial && !last.has(d.serial)).length
}
