import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { DropFilters, DropItem, DropsResponse } from '../types/drop'
import { itemDetailUrl } from '../types/drop'
import { enrichDrop } from '../lib/itemFormat'
import { sampleDrops } from '../data/sampleDrops'
import { getMsUntilNextCron, PANEL_REFRESH_AFTER_CRON_MS } from '../lib/syncSchedule'
import { countNewSinceLastVisit, loadLastVisitSerials, saveLastVisitSerials } from '../lib/lastVisit'
import { sortDrops, type SortMode } from '../lib/sortDrops'

const API_DROPS = '/api/drops'

function applyFilters(drops: DropItem[], filters: DropFilters): DropItem[] {
  const q = filters.search.trim().toLowerCase()
  const player = filters.player.trim().toLowerCase()

  return drops.filter((d) => {
    if (q) {
      const hay = `${d.displayName} ${d.itemName} ${d.playerName} ${d.serial}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (player && !d.playerName.toLowerCase().includes(player)) return false
    if (filters.degrees.length > 0) {
      if (d.degree == null || !filters.degrees.includes(d.degree)) return false
    }
    if (filters.races.length > 0) {
      if (!d.race || !filters.races.includes(d.race)) return false
    }
    if (filters.categories.length > 0 && !filters.categories.includes(d.category)) {
      return false
    }
    if (filters.weaponTypes.length > 0) {
      if (!d.weaponSubtype || !filters.weaponTypes.includes(d.weaponSubtype)) return false
    }
    return true
  })
}

function dedupeClient(drops: DropItem[]): DropItem[] {
  const bySerial = new Map<string, DropItem>()
  for (const d of drops) {
    const serial = d.serial?.trim()
    if (!serial) continue
    bySerial.set(serial, { ...d, id: serial, serial })
  }
  return [...bySerial.values()].map((d, i) => ({ ...d, rank: i + 1 }))
}

function normalizeDrop(raw: Partial<DropItem> & { itemName: string }): DropItem {
  const serial = raw.serial?.trim() ?? ''
  const enriched = enrichDrop({
    id: serial || raw.id || '',
    rank: raw.rank ?? 0,
    serial,
    itemName: raw.itemName,
    displayName: raw.displayName ?? '',
    playerName: raw.playerName ?? '',
    timeText: raw.timeText ?? '',
    iconUrl: raw.iconUrl ?? '',
    rare: raw.rare ?? 0,
    blueStats: raw.blueStats ?? raw.rare ?? 0,
    degree: raw.degree ?? null,
    category: raw.category ?? 'equipment',
    race: raw.race ?? null,
    tier: raw.tier ?? '',
    weaponSubtype: raw.weaponSubtype ?? null,
    itemUrl: serial ? itemDetailUrl(serial) : raw.itemUrl ?? '',
  }) as DropItem
  return enriched
}

async function fetchDrops(): Promise<DropsResponse & { hint?: string; emptyCache?: boolean }> {
  const res = await fetch(API_DROPS, { cache: 'no-store' })
  const data = (await res.json()) as DropsResponse & { hint?: string; emptyCache?: boolean; error?: string }
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`)
  }
  const drops = dedupeClient((data.drops ?? []).map((d) => normalizeDrop(d)))
  return { ...data, drops, totalCount: drops.length }
}

export function useDropFeed() {
  const [drops, setDrops] = useState<DropItem[]>([])
  const [filters, setFilters] = useState<DropFilters>({
    search: '',
    player: '',
    degrees: [],
    races: [],
    categories: [],
    weaponTypes: [],
  })
  const [sort, setSort] = useState<SortMode>('newest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<string | null>(null)
  const [dbUpdatedAt, setDbUpdatedAt] = useState<string | null>(null)
  const [useSample, setUseSample] = useState(false)
  const [backfilling, setBackfilling] = useState(false)
  const [newDropCount, setNewDropCount] = useState(0)
  const lastVisitSerials = useRef(loadLastVisitSerials())

  const refresh = useCallback(async (silent = false) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDrops()
      const { drops: fresh, fetchedAt, hint, emptyCache, cacheUpdatedAt } = data
      setLastFetched(fetchedAt)
      setDbUpdatedAt(cacheUpdatedAt ?? fetchedAt ?? null)
      setUseSample(false)

      if (emptyCache && fresh.length === 0) {
        setDrops([])
        setError(hint ?? 'Henüz drop kaydı yok. Kısa süre sonra tekrar deneyin.')
        setNewDropCount(0)
        if (!silent) toast.message('Liste boş', { description: 'Veri henüz hazırlanmıyor olabilir.' })
        return
      }

      const newSinceVisit = countNewSinceLastVisit(fresh, lastVisitSerials.current)
      setNewDropCount(newSinceVisit)
      setDrops(fresh)

      if (!silent && fresh.length > 0) {
        toast.message('Liste güncellendi', { description: `${fresh.length} kayıt.` })
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Bilinmeyen hata'
      setError(msg)
      if (!silent) {
        const description = import.meta.env.DEV
          ? msg
          : 'Sunucuya ulaşılamadı. Biraz sonra yenileyin.'
        toast.error('Drop listesi alınamadı', { description })
      }
      setUseSample(true)
      setDrops(sampleDrops)
    } finally {
      setLoading(false)
    }
  }, [])

  const markNewDropsSeen = useCallback(() => {
    const serials = drops.map((d) => d.serial).filter(Boolean)
    if (serials.length) {
      saveLastVisitSerials(serials)
      lastVisitSerials.current = new Set(serials)
    }
    setNewDropCount(0)
  }, [drops])

  useEffect(() => {
    const saveOnLeave = () => {
      const serials = drops.map((d) => d.serial).filter(Boolean)
      if (serials.length) saveLastVisitSerials(serials)
    }
    window.addEventListener('pagehide', saveOnLeave)
    return () => window.removeEventListener('pagehide', saveOnLeave)
  }, [drops])

  const backfill = useCallback(async () => {
    setBackfilling(true)
    setError(null)
    try {
      const res = await fetch('/api/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxPages: 200 }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as DropsResponse & { backfillAdded?: number; scrapedCount?: number }
      const next = dedupeClient((data.drops ?? []).map((d) => normalizeDrop(d)))
      setDrops(next)
      setLastFetched(data.fetchedAt)
      setUseSample(false)
      toast.success('Tarama tamamlandı', {
        description: `+${data.backfillAdded ?? 0} yeni · Toplam ${next.length} kayıt`,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Tarama başarısız'
      toast.error('Tümünü Tara', { description: msg })
    } finally {
      setBackfilling(false)
    }
  }, [])

  useEffect(() => {
    refresh(true)
  }, [refresh])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const schedule = () => {
      const delay = getMsUntilNextCron() + PANEL_REFRESH_AFTER_CRON_MS
      timeoutId = setTimeout(() => {
        refresh(true)
        schedule()
      }, delay)
    }

    schedule()
    return () => clearTimeout(timeoutId)
  }, [refresh])

  const filtered = useMemo(() => applyFilters(drops, filters), [drops, filters])
  const sortedFiltered = useMemo(() => sortDrops(filtered, sort), [filtered, sort])

  const filterByPlayer = useCallback((playerName: string) => {
    setFilters((f) => ({ ...f, player: playerName }))
  }, [])

  const stats = useMemo(() => {
    const players = new Set(drops.map((d) => d.playerName).filter(Boolean))
    return { total: drops.length, players: players.size }
  }, [drops])

  const topPlayers = useMemo(() => {
    const counts = new Map<string, number>()
    for (const d of drops) {
      if (!d.playerName) continue
      counts.set(d.playerName, (counts.get(d.playerName) ?? 0) + 1)
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
  }, [drops])

  return {
    drops,
    filtered: sortedFiltered,
    filteredCount: filtered.length,
    filters,
    setFilters,
    sort,
    setSort,
    loading,
    error,
    lastFetched,
    dbUpdatedAt,
    useSample,
    backfilling,
    refresh,
    backfill,
    stats,
    topPlayers,
    newDropCount,
    markNewDropsSeen,
    filterByPlayer,
  }
}
