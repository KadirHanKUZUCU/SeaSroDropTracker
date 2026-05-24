import { backfillAll, fetchAllSources, itemDetailUrl } from './fetchDrops.js'
import { loadCache, mergeDrops, saveCache } from './dropStore.js'

export function withItemUrls(drops) {
  return drops.map((d) => ({
    ...d,
    itemUrl: d.serial ? itemDetailUrl(d.serial) : d.itemUrl,
  }))
}

/** Canlı site + önbellek birleştir */
export async function getDropsResponse() {
  try {
    const live = await fetchAllSources(80)
    const { drops: cached } = await loadCache()
    const merged = mergeDrops(cached, live)
    const updatedAt = await saveCache(merged)
    return {
      drops: withItemUrls(merged),
      fetchedAt: new Date().toISOString(),
      cacheUpdatedAt: updatedAt,
      liveCount: live.length,
      totalCount: merged.length,
    }
  } catch (e) {
    const { drops: cached } = await loadCache()
    if (cached.length > 0) {
      return {
        drops: withItemUrls(cached),
        fetchedAt: new Date().toISOString(),
        fromCacheOnly: true,
        error: String(e.message),
        totalCount: cached.length,
      }
    }
    throw e
  }
}

/** Cron: sadece tara ve önbelleğe yaz (hafif) */
export async function runScrapeCron() {
  const { drops: cached } = await loadCache()
  const before = cached.length
  const live = await fetchAllSources(80)
  const merged = mergeDrops(cached, live)
  const updatedAt = await saveCache(merged)
  return {
    before,
    liveFound: live.length,
    totalCount: merged.length,
    added: merged.length - before,
    updatedAt,
  }
}

export async function runBackfill(maxPages = 200) {
  const { drops: cached } = await loadCache()
  const before = cached.length
  const scraped = await backfillAll(maxPages)
  const merged = mergeDrops(cached, scraped)
  await saveCache(merged)
  return {
    drops: withItemUrls(merged),
    fetchedAt: new Date().toISOString(),
    scrapedCount: scraped.length,
    backfillAdded: merged.length - before,
    totalCount: merged.length,
  }
}
