import * as cheerio from 'cheerio'
import { enrichDrop, parseItemDegree } from './itemFormat.js'

const BASE = 'https://110cap.seasro.com'
export const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  Referer: 'https://110cap.seasro.com/',
}

export function itemDetailUrl(serial) {
  return `${BASE}/logging/item/serial/${serial}`
}

function extractSerial($, $el) {
  let serial = ''
  $el.find('a[href*="serial/"]').each((_, node) => {
    if (serial) return
    const m = ($(node).attr('href') || '').match(/serial\/(\d+)/)
    if (m) serial = m[1]
  })
  return serial
}

function parseRankItem($, el, index) {
  const $el = $(el)
  const rankNum = $el.find('.rank-number').text().trim()
  const serial = extractSerial($, $el)
  const itemLink = $el.find('.rank-name a').attr('href') || $el.find('.item-icon').attr('href') || ''
  const itemName =
    $el.find('.rank-name a').text().trim() ||
    $el.find('.rank-name a').attr('title') ||
    $el.find('.item-icon').attr('title') ||
    ''
  const playerName = $el.find('.rank-info small a').text().trim() || $el.find('.rank-info a').first().text().trim()
  const timeText = $el.find('.stat-drop').text().replace(/\s+/g, ' ').trim()
  const iconUrl = $el.find('.activity-item-icon img').attr('src') || $el.find('img').first().attr('src') || ''
  const rareClass = $el.find('.item-icon').attr('class') || ''
  const rareMatch = rareClass.match(/rare-(\d+)/)
  const blueStats = rareMatch ? parseInt(rareMatch[1], 10) : 0
  const fullIcon = iconUrl.startsWith('http') ? iconUrl : iconUrl ? `${BASE}${iconUrl}` : ''
  const fullItem = serial ? itemDetailUrl(serial) : itemLink.startsWith('/') ? `${BASE}${itemLink}` : itemLink

  if (!serial || !itemName) return null

  return enrichDrop({
    id: serial,
    rank: parseInt(rankNum, 10) || index + 1,
    serial,
    itemName,
    playerName,
    timeText,
    iconUrl: fullIcon,
    rare: blueStats,
    blueStats,
    degree: parseItemDegree(itemName),
    itemUrl: fullItem,
  })
}

export function parseDropsFromHtml(html) {
  const $ = cheerio.load(html)
  const drops = []
  const seen = new Set()

  $('.rank-item').each((i, el) => {
    const d = parseRankItem($, el, i)
    if (d && !seen.has(d.id)) {
      seen.add(d.id)
      drops.push(d)
    }
  })

  if (drops.length > 0) return drops

  $('a[href*="/logging/item/serial/"]').each((i, el) => {
    const href = $(el).attr('href') || ''
    const serialMatch = href.match(/serial\/(\d+)/)
    const serial = serialMatch ? serialMatch[1] : ''
    if (!serial || seen.has(serial)) return
    seen.add(serial)
    const itemName = $(el).text().trim() || $(el).attr('title') || ''
    drops.push(
      enrichDrop({
        id: serial,
        rank: drops.length + 1,
        serial,
        itemName,
        playerName: '',
        timeText: '',
        iconUrl: '',
        rare: 0,
        blueStats: 0,
        degree: parseItemDegree(itemName),
        itemUrl: itemDetailUrl(serial),
      }),
    )
  })

  return drops
}

async function fetchHtml(url) {
  const r = await fetch(url, { headers: FETCH_HEADERS })
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`)
  const html = await r.text()
  if (!html || html.length < 500) throw new Error(`Boş yanıt: ${url}`)
  return html
}

function pageUrl(basePath, page, strategy) {
  if (page <= 1) return `${BASE}${basePath}`
  if (strategy === 'page') return `${BASE}${basePath}?page=${page}`
  if (strategy === 'p') return `${BASE}${basePath}?p=${page}`
  return `${BASE}${basePath}?offset=${(page - 1) * 50}`
}

export async function fetchFromPath(basePath, maxPages = 30) {
  const seen = new Set()
  const collected = []
  const strategies = ['page', 'p', 'offset']
  let strategyIndex = 0
  let emptyStreak = 0

  for (let page = 1; page <= maxPages; page++) {
    if (page > 1) await new Promise((r) => setTimeout(r, 400))

    const strategy = strategies[strategyIndex]
    let batch = []
    try {
      const html = await fetchHtml(pageUrl(basePath, page, strategy))
      batch = parseDropsFromHtml(html)
    } catch {
      if (page === 1) return collected
      break
    }

    let added = 0
    for (const d of batch) {
      if (!seen.has(d.id)) {
        seen.add(d.id)
        collected.push(d)
        added++
      }
    }

    if (added === 0) {
      emptyStreak++
      if (emptyStreak >= 2 && strategyIndex < strategies.length - 1) {
        strategyIndex++
        emptyStreak = 0
        continue
      }
      if (emptyStreak >= 3) break
    } else {
      emptyStreak = 0
    }

    if (batch.length < 50 && page > 1) break
  }

  return collected
}

/** Drop + plus sayfalarından mümkün olduğunca çok kayıt */
export async function fetchAllSources(maxPages = 150) {
  const paths = ['/logging/drop', '/logging/plus']
  const byId = new Map()

  for (const path of paths) {
    const batch = await fetchFromPath(path, maxPages)
    for (const d of batch) byId.set(d.id, d)
  }

  return [...byId.values()].sort((a, b) => a.rank - b.rank)
}

export async function backfillAll(maxPages = 200) {
  return fetchAllSources(maxPages)
}
