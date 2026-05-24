import * as cheerio from 'cheerio'

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}

async function serials(url) {
  const r = await fetch(url, { headers })
  const html = await r.text()
  const list = [...html.matchAll(/\/logging\/item\/serial\/(\d+)/g)].map((m) => m[1])
  return [...new Set(list)]
}

const p1 = await serials('https://110cap.seasro.com/logging/drop?page=1')
const p2 = await serials('https://110cap.seasro.com/logging/drop?page=2')
const overlap = p1.filter((s) => p2.includes(s))
console.log('p1', p1.length, 'first', p1[0])
console.log('p2', p2.length, 'first', p2[0])
console.log('overlap', overlap.length)

// find pagination in HTML
const html = await (await fetch('https://110cap.seasro.com/logging/drop', { headers })).text()
const pag = html.match(/data-page|pagination|load-more|infinite|offset|DataTable/gi)
console.log('hints', pag)
const scripts = html.match(/fetch\([^)]+\)|axios|\/logging\/[^"']+/gi)?.slice(0, 30)
console.log('fetch', scripts)
