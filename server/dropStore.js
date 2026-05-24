import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CACHE_FILE = path.join(__dirname, 'drops-cache.json')
const BLOB_PATHNAME = 'drops-cache.json'

export { mergeDrops, dedupeDrops } from './dropUtils.js'

async function loadFromBlob() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null
  try {
    const { list, get } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 })
    const hit = blobs.find((b) => b.pathname === BLOB_PATHNAME) ?? blobs[0]
    if (!hit?.url) return null
    const res = await fetch(hit.url)
    if (!res.ok) return null
    const raw = await res.json()
    return { drops: raw.drops ?? [], updatedAt: raw.updatedAt ?? null }
  } catch {
    return null
  }
}

async function saveToBlob(payload) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false
  const { put } = await import('@vercel/blob')
  await put(BLOB_PATHNAME, JSON.stringify(payload), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
  return true
}

export async function loadCache() {
  const fromBlob = await loadFromBlob()
  if (fromBlob) return fromBlob

  try {
    if (!fs.existsSync(CACHE_FILE)) return { drops: [], updatedAt: null }
    const raw = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
    return { drops: raw.drops ?? [], updatedAt: raw.updatedAt ?? null }
  } catch {
    return { drops: [], updatedAt: null }
  }
}

export async function saveCache(drops) {
  const payload = {
    updatedAt: new Date().toISOString(),
    drops,
  }

  if (await saveToBlob(payload)) return payload.updatedAt

  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true })
  fs.writeFileSync(CACHE_FILE, JSON.stringify(payload))
  return payload.updatedAt
}
