import express from 'express'
import cors from 'cors'
import { parseDropsFromHtml } from './fetchDrops.js'
import { loadCache, mergeDrops, saveCache } from './dropStore.js'
import { dedupeDrops } from './dropUtils.js'
import { getDropsResponse, runBackfill, withItemUrls } from './dropApi.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '15mb' }))

const PORT = Number(process.env.PORT) || 3001

async function handleImportHtml(req, res) {
  try {
    const html = req.body?.html
    if (!html || typeof html !== 'string') {
      return res.status(400).json({ error: 'html string gerekli' })
    }
    const drops = parseDropsFromHtml(html)
    if (!drops.length) {
      return res.status(400).json({ error: 'Hiç drop bulunamadı. .rank-item yapısı kontrol edin.' })
    }
    const replace = Boolean(req.body?.replace)
    const { drops: cached } = await loadCache()
    const merged = replace ? drops : mergeDrops(cached, drops)
    const updatedAt = await saveCache(merged)
    res.json({
      imported: drops.length,
      totalCount: merged.length,
      replaced: replace,
      updatedAt,
    })
  } catch (e) {
    res.status(500).json({ error: String(e.message) })
  }
}

app.get('/api/health', async (_req, res) => {
  const { drops } = await loadCache()
  res.json({ ok: true, cached: drops.length, port: PORT })
})

app.get('/api/drops', async (_req, res) => {
  try {
    res.json(await getDropsResponse())
  } catch (e) {
    res.status(500).json({ error: String(e.message), drops: [] })
  }
})

app.post('/api/import-html', handleImportHtml)
app.post('/api/drops/import', handleImportHtml)

app.post('/api/backfill', async (req, res) => {
  try {
    const maxPages = Math.min(Number(req.body?.maxPages) || 200, 500)
    res.json(await runBackfill(maxPages))
  } catch (e) {
    res.status(500).json({ error: String(e.message) })
  }
})

const server = app.listen(PORT, async () => {
  const { drops: raw } = await loadCache()
  const cleaned = dedupeDrops(raw)
  if (cleaned.length !== raw.length) {
    await saveCache(cleaned)
    console.log(`Önbellek temizlendi: ${raw.length} → ${cleaned.length} kayıt`)
  }
  console.log(`API http://localhost:${PORT}  (önbellek: ${cleaned.length} drop)`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nPort ${PORT} zaten kullanımda — API muhtemelen çalışıyor.\n` +
        `  → http://localhost:${PORT}/api/health\n` +
        `  Yeniden başlatmak için: npm run stop  ardından  npm run start\n`,
    )
    process.exit(1)
  }
  throw err
})
