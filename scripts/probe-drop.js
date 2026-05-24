import * as cheerio from 'cheerio'

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml',
  Referer: 'https://110cap.seasro.com/',
}

async function count(url) {
  const r = await fetch(url, { headers })
  if (!r.ok) return { url, status: r.status }
  const $ = cheerio.load(await r.text())
  return { url, n: $('.rank-item').length, first: $('.rank-item').first().find('.rank-name a').attr('href')?.slice(-8) }
}

const bases = [
  'https://110cap.seasro.com/logging/drop',
  'https://110cap.seasro.com/logging/stats',
]
for (const b of bases) {
  console.log(await count(b))
}

// look for data attributes in saved way - fetch drop and find "50" or "total"
const r = await fetch('https://110cap.seasro.com/logging/drop', { headers })
const h = await r.text()
console.log('status', r.status, 'len', h.length)
if (h.length > 1000) {
  const totals = h.match(/total|count|650|records/gi)
  console.log('keywords', totals?.slice(0, 20))
  const load = h.match(/load[^"']{0,40}/gi)
  console.log('load', load?.slice(0, 15))
}
