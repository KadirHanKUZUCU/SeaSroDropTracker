import { runBackfill } from '../server/dropApi.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  try {
    const maxPages = Math.min(Number(req.body?.maxPages) || 200, 500)
    const data = await runBackfill(maxPages)
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ error: String(e.message) })
  }
}
