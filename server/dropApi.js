import { backfillAll, fetchAllSources, fetchQuickLive, itemDetailUrl } from './fetchDrops.js'
import { loadCache, mergeDrops, saveCache } from './dropStore.js'
import { assertCacheNotShrunk } from './dropUtils.js'

const IS_VERCEL = Boolean(process.env.VERCEL)

export function withItemUrls(drops) {
  return drops.map((d) => ({
    ...d,
    itemUrl: d.serial ? itemDetailUrl(d.serial) : d.itemUrl,
  }))
}

/** Vercel: sadece Blob önbellek (timeout yok). Yerel: canlı + önbellek. */
export async function getDropsResponse() {
  const { drops: cached, updatedAt: cacheUpdatedAt } = await loadCache()

  if (IS_VERCEL) {
    if (cached.length === 0) {
      return {
        drops: [],
        fetchedAt: new Date().toISOString(),
        totalCount: 0,
        emptyCache: true,
        hint:
          'Önbellek boş. Vercel Blob bağlayıp Redeploy edin, ardından /api/cron/scrape veya cron-job.org ile tarama yapın.',
      }
    }
    return {
      drops: withItemUrls(cached),
      fetchedAt: new Date().toISOString(),
      cacheUpdatedAt,
      totalCount: cached.length,
      fromCache: true,
    }
  }

  try {
    const live = await fetchAllSources(80)
    const merged = mergeDrops(cached, live)
    const updatedAt = await saveCache(merged, { previousCount: cached.length })
    return {
      drops: withItemUrls(merged),
      fetchedAt: new Date().toISOString(),
      cacheUpdatedAt: updatedAt,
      liveCount: live.length,
      totalCount: merged.length,
    }
  } catch (e) {
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

/** Cron / dış tetikleyici: hızlı tarama (~2 sayfa), Blob'a yazar */
export async function runScrapeCron() {
  const { drops: cached } = await loadCache()
  const before = cached.length
  const live = await fetchQuickLive()
  const merged = mergeDrops(cached, live)
  assertCacheNotShrunk(before, merged.length)
  const updatedAt = await saveCache(merged, { previousCount: before })
  return {
    before,
    liveFound: live.length,
    totalCount: merged.length,
    added: merged.length - before,
    updatedAt,
    blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  }
}

export async function runBackfill(maxPages = 200) {
  const { drops: cached } = await loadCache()
  const before = cached.length
  const scraped = await backfillAll(IS_VERCEL ? 3 : maxPages)
  const merged = mergeDrops(cached, scraped)
  await saveCache(merged, { previousCount: before })
  return {
    drops: withItemUrls(merged),
    fetchedAt: new Date().toISOString(),
    scrapedCount: scraped.length,
    backfillAdded: merged.length - before,
    totalCount: merged.length,
  }
}
