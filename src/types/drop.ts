import type { ItemCategory, ItemRace, ItemTier, WeaponSubtype } from '../lib/itemFormat'

export const ITEM_DETAIL_BASE = 'https://110cap.seasro.com/logging/item/serial'

export function itemDetailUrl(serial: string): string {
  return `${ITEM_DETAIL_BASE}/${serial}`
}

export interface DropItem {
  id: string
  rank: number
  serial: string
  itemName: string
  displayName: string
  playerName: string
  timeText: string
  iconUrl: string
  rare: number
  blueStats: number
  degree: number | null
  category: ItemCategory
  race: ItemRace
  tier: ItemTier
  weaponSubtype: WeaponSubtype | null
  itemUrl: string
}

export interface DropFilters {
  search: string
  player: string
  degrees: number[]
  races: ItemRace[]
  categories: ItemCategory[]
  weaponTypes: WeaponSubtype[]
}

export const EMPTY_FILTERS: DropFilters = {
  search: '',
  player: '',
  degrees: [],
  races: [],
  categories: [],
  weaponTypes: [],
}

export interface DropsResponse {
  drops: DropItem[]
  fetchedAt: string
  cacheUpdatedAt?: string
  liveCount?: number
  totalCount?: number
  cachedCount?: number
  sourceNote?: string | null
  fromCacheOnly?: boolean
  backfillAdded?: number
  fromCache?: boolean
}
