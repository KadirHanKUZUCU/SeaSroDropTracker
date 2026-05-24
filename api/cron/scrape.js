import { runScrapeCron } from '../../server/dropApi.js'

function authorizeCron(req) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  const auth = req.headers.authorization || req.headers.Authorization || ''
  return auth === `Bearer ${secret}`
}

/** Vercel Cron veya harici cron-job.org ile çağrılır */
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
