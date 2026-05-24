import { loadCache } from '../server/dropStore.js'

export default async function handler(_req, res) {
  try {
    const { drops, updatedAt } = await loadCache()
    res.status(200).json({
      ok: true,
      vercel: Boolean(process.env.VERCEL),
      blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      blobAccess: process.env.BLOB_ACCESS || 'private',
      cronSecret: Boolean(process.env.CRON_SECRET),
      cached: drops.length,
      updatedAt,
    })
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message) })
  }
}
