import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CACHE_FILE = path.join(__dirname, 'drops-cache.json')
const BLOB_PATHNAME = 'drops-cache.json'

/** Vercel private store veya public store */
const BLOB_ACCESS = process.env.BLOB_ACCESS === 'public' ? 'public' : 'private'

export { mergeDrops, dedupeDrops } from './dropUtils.js'

async function loadFromBlob() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null
  try {
    const { get } = await import('@vercel/blob')
    const result = await get(BLOB_PATHNAME, { access: BLOB_ACCESS })
    if (!result || result.statusCode !== 200 || !result.stream) return null
    const text = await new Response(result.stream).text()
    const raw = JSON.parse(text)
    return { drops: raw.drops ?? [], updatedAt: raw.updatedAt ?? null }
  } catch {
    return null
  }
}

async function saveToBlob(payload) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false
  try {
    const { put } = await import('@vercel/blob')
    await put(BLOB_PATHNAME, JSON.stringify(payload), {
      access: BLOB_ACCESS,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    })
    return true
  } catch (e) {
    console.error('Blob save failed:', e.message)
    return false
  }
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
