/**
 * Yerel server/drops-cache.json → Vercel Blob
 * Kullanım: BLOB_READ_WRITE_TOKEN=xxx node scripts/upload-cache-blob.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cacheFile = path.join(root, 'server', 'drops-cache.json')

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN gerekli (Vercel → Storage → Blob → token)')
  process.exit(1)
}

if (!fs.existsSync(cacheFile)) {
  console.error('Dosya yok:', cacheFile)
  process.exit(1)
}

const raw = JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
const { put } = await import('@vercel/blob')

const access = process.env.BLOB_ACCESS === 'public' ? 'public' : 'private'

await put('drops-cache.json', JSON.stringify(raw), {
  access,
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: 'application/json',
})

console.log('Yüklendi:', raw.drops?.length ?? 0, 'kayıt → Vercel Blob')
