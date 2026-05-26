/**
 * Canlı drop sayfasını çek → yerel önbellekle birleştir → Blob'a yükle
 * Kullanım: npm run sync-live
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchQuickLive } from '../server/fetchDrops.js'
import { mergeDrops } from '../server/dropUtils.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cacheFile = path.join(root, 'server', 'drops-cache.json')

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnvLocal()

const existing = fs.existsSync(cacheFile)
  ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')).drops ?? []
  : []

console.log('Mevcut önbellek:', existing.length)
const live = await fetchQuickLive()
console.log('Canlı sayfa:', live.length, '→ örnek:', live[0]?.playerName, live[0]?.serial)

const merged = mergeDrops(existing, live)
const payload = {
  updatedAt: new Date().toISOString(),
  drops: merged,
}

fs.writeFileSync(cacheFile, JSON.stringify(payload))
console.log('Yerel kayıt:', merged.length, '→ #1:', merged[0]?.playerName, merged[0]?.timeText)

if (process.env.BLOB_READ_WRITE_TOKEN) {
  const { put } = await import('@vercel/blob')
  const access = process.env.BLOB_ACCESS === 'public' ? 'public' : 'private'
  await put('drops-cache.json', JSON.stringify(payload), {
    access,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
  console.log('Blob güncellendi.')
} else {
  console.log('BLOB_READ_WRITE_TOKEN yok — sadece yerel dosya yazıldı.')
}
