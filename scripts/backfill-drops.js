/**
 * CLI: node scripts/backfill-drops.js
 * 110cap drop sayfalarını tarayıp server/drops-cache.json dosyasına yazar.
 */
import { backfillAll } from '../server/fetchDrops.js'
import { loadCache, mergeDrops, saveCache } from '../server/dropStore.js'

const maxPages = Number(process.argv[2]) || 200
console.log(`Taranıyor (max ${maxPages} sayfa / kaynak)...`)

const scraped = await backfillAll(maxPages)
const { drops: cached } = await loadCache()
const merged = mergeDrops(cached, scraped)
const updatedAt = await saveCache(merged)

console.log(`Bu tarama: ${scraped.length} kayıt`)
console.log(`Önbellek toplam: ${merged.length} kayıt`)
console.log(`Güncellendi: ${updatedAt}`)
