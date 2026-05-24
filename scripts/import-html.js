/**

 * HTML dosyasından rank-item'ları parse edip cache'e aktarır.

 * Kullanım:

 *   node scripts/import-html.js [dosya.html]

 *   node scripts/import-html.js server/rank-items-full.html --replace

 */

import fs from 'fs'

import path from 'path'

import { fileURLToPath } from 'url'

import { parseDropsFromHtml } from '../server/fetchDrops.js'

import { loadCache, mergeDrops, saveCache } from '../server/dropStore.js'



const __dirname = path.dirname(fileURLToPath(import.meta.url))

const root = path.resolve(__dirname, '..')



async function main() {

  const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))

  const replace = process.argv.includes('--replace')



  const inputPath = args[0]

    ? path.resolve(process.cwd(), args[0])

    : path.join(root, 'server', 'rank-items-full.html')



  if (!fs.existsSync(inputPath)) {

    console.error('Dosya bulunamadı:', inputPath)

    console.error('Önce: node scripts/extract-html-from-transcript.js')

    process.exit(1)

  }



  console.log('Okunuyor:', inputPath)

  const html = fs.readFileSync(inputPath, 'utf8')

  const drops = parseDropsFromHtml(html)

  console.log('Parse edilen rank-item sayısı:', drops.length)



  if (drops.length === 0) {

    console.error('Hiç item parse edilemedi.')

    process.exit(1)

  }



  const { drops: cached } = await loadCache()

  const merged = replace ? drops : mergeDrops(cached, drops)

  await saveCache(merged)



  console.log(replace ? 'Cache yenilendi (--replace)' : 'Cache birleştirildi')

  console.log('Cache toplam kayıt:', merged.length)

  console.log('Örnek:', merged.slice(0, 3).map((d) => `${d.displayName} (${d.serial})`))

}



main().catch((e) => {

  console.error(e)

  process.exit(1)

})

