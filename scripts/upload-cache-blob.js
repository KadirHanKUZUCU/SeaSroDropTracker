/**
 * Yerel server/drops-cache.json → Vercel Blob
 * Kullanım: BLOB_READ_WRITE_TOKEN=xxx node scripts/upload-cache-blob.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN gerekli (Vercel → Storage → Blob → token)')
  process.exit(1)
}

if (!fs.existsSync(cacheFile)) {
  console.error('Dosya yok:', cacheFile)
  process.exit(1)
}

const raw = JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
const { dedupeDrops } = await import('../server/dropUtils.js')
const drops = dedupeDrops(raw.drops ?? [])
const payload = { ...raw, drops, updatedAt: new Date().toISOString() }
const { put } = await import('@vercel/blob')

const access = process.env.BLOB_ACCESS === 'public' ? 'public' : 'private'

await put('drops-cache.json', JSON.stringify(payload), {
  access,
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: 'application/json',
})

console.log('Yüklendi:', drops.length, 'kayıt → Vercel Blob')
