import { getDropsResponse } from '../server/dropApi.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    return res.status(204).end()
  }
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const data = await getDropsResponse()
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ error: String(e.message), drops: [] })
  }
}
