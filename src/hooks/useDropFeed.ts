import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { DropFilters, DropItem, DropsResponse } from '../types/drop'
import { itemDetailUrl } from '../types/drop'
import { enrichDrop } from '../lib/itemFormat'
import { sampleDrops } from '../data/sampleDrops'

const POLL_MS = 45_000
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

async function fetchDrops(): Promise<DropsResponse> {
  const res = await fetch(API_DROPS, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = (await res.json()) as DropsResponse
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<string | null>(null)
  const [useSample, setUseSample] = useState(false)
  const [backfilling, setBackfilling] = useState(false)
  const knownIds = useRef<Set<string>>(new Set())
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(async (silent = false) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDrops()
      const { drops: fresh, fetchedAt } = data
      setLastFetched(fetchedAt)
      setUseSample(false)

      const oldKnown = new Set(knownIds.current)
      const newOnes = fresh.filter((d) => !oldKnown.has(d.id))
      fresh.forEach((d) => knownIds.current.add(d.id))
      setDrops(fresh)

      if (newOnes.length > 0) {
        if (!silent) {
          toast.success(`${newOnes.length} yeni drop`, {
            description: newOnes.slice(0, 3).map((d) => d.displayName).join(', '),
          })
        }
      } else if (!silent) {
        toast.message('Liste güncel', { description: `${fresh.length} kayıt.` })
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Bilinmeyen hata'
      setError(msg)
      if (!silent) toast.error('Drop listesi alınamadı', { description: msg })
      setUseSample(true)
      setDrops(sampleDrops)
      knownIds.current = new Set(sampleDrops.map((d) => d.id))
    } finally {
      setLoading(false)
    }
  }, [])

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
      const drops = dedupeClient((data.drops ?? []).map((d) => normalizeDrop(d)))
      drops.forEach((d) => knownIds.current.add(d.id))
      setDrops(drops)
      setLastFetched(data.fetchedAt)
      setUseSample(false)
      toast.success('Tarama tamamlandı', {
        description: `+${data.backfillAdded ?? 0} yeni · Toplam ${drops.length} kayıt`,
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
    pollRef.current = setInterval(() => refresh(true), POLL_MS)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [refresh])

  const filtered = useMemo(() => applyFilters(drops, filters), [drops, filters])

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
    filtered,
    filters,
    setFilters,
    loading,
    error,
    lastFetched,
    useSample,
    backfilling,
    refresh,
    backfill,
    stats,
    topPlayers,
  }
}
