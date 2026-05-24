/**
 * Cursor transcript'ten kullanıcının yapıştırdığı rank-item HTML'ini çıkarır.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const transcriptPath =
  process.argv[2] ||
  path.join(
    process.env.USERPROFILE || '',
    '.cursor',
    'projects',
    'c-Users-HAN-Desktop-sro-items',
    'agent-transcripts',
    '93a8e821-4ecd-4cf6-8550-d8ad0698b5cf',
    '93a8e821-4ecd-4cf6-8550-d8ad0698b5cf.jsonl',
  )

const outPath = path.join(root, 'server', 'rank-items-full.html')

if (!fs.existsSync(transcriptPath)) {
  console.error('Transcript bulunamadı:', transcriptPath)
  process.exit(1)
}

let best = ''
let bestCount = 0

for (const line of fs.readFileSync(transcriptPath, 'utf8').split('\n')) {
  if (!line.trim()) continue
  let row
  try {
    row = JSON.parse(line)
  } catch {
    continue
  }
  if (row.role !== 'user') continue
  const text = row.message?.content?.find((c) => c.type === 'text')?.text || ''
  if (!text.includes('rank-item') || !text.includes('650')) continue
  const idx = text.indexOf('<div class="content-card">')
  const html = idx >= 0 ? text.slice(idx) : text
  const count = (html.match(/class="rank-item"/g) || []).length
  if (count > bestCount) {
    best = html
    bestCount = count
  }
}

if (bestCount === 0) {
  // 650 kelimesi olmayan en büyük rank-item bloğu
  for (const line of fs.readFileSync(transcriptPath, 'utf8').split('\n')) {
    if (!line.trim()) continue
    let row
    try {
      row = JSON.parse(line)
    } catch {
      continue
    }
    if (row.role !== 'user') continue
    const text = row.message?.content?.find((c) => c.type === 'text')?.text || ''
    if (!text.includes('rank-item')) continue
    const idx = text.indexOf('<div class="content-card">')
    const html = idx >= 0 ? text.slice(idx) : text
    const count = (html.match(/class="rank-item"/g) || []).length
    if (count > bestCount) {
      best = html
      bestCount = count
    }
  }
}

if (bestCount === 0) {
  console.error('Transcript içinde rank-item HTML bulunamadı.')
  process.exit(1)
}

fs.writeFileSync(outPath, best, 'utf8')
console.log('Kaydedildi:', outPath)
console.log('rank-item sayısı:', bestCount)
console.log('Dosya boyutu:', fs.statSync(outPath).size, 'byte')
