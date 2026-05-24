import { runScrapeCron } from '../../server/dropApi.js'

export const config = {
  maxDuration: 10,
}

function authorizeCron(req) {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return true

  const auth = req.headers.authorization || req.headers.Authorization || ''
  if (auth === `Bearer ${secret}`) return true

  const headerSecret = req.headers['x-cron-secret']
  if (headerSecret === secret) return true

  // Tarayıcıdan tek seferlik test: ?secret=... (cron-job.org için header kullan)
  const q = req.query?.secret
  if (typeof q === 'string' && q === secret) return true

  return false
}

export default async function handler(req, res) {
  if (!authorizeCron(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const result = await runScrapeCron()
    res.status(200).json({ ok: true, ...result })
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message) })
  }
}
