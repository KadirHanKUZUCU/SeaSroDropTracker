/**
 * API + Vite'ı ayrı CMD pencerelerinde başlatır (Windows).
 * Not: "start" başlığında ":" kullanılmaz (sözdizimi hatası verir).
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function quoteWin(s) {
  return `"${String(s).replace(/"/g, '""')}"`
}

function runInNewWindow(title, npmScript) {
  // start /D "proje" "başlık" cmd /k npm run ...
  const line = `start /D ${quoteWin(root)} ${quoteWin(title)} cmd /k npm run ${npmScript}`
  spawn(line, [], {
    shell: true,
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  }).unref()
}

runInNewWindow('SRO API', 'server')
setTimeout(() => {
  runInNewWindow('SRO Vite', 'dev')
  console.log('Başlatıldı:')
  console.log('  API   → http://localhost:3001/api/health')
  console.log('  Panel → http://localhost:5173')
}, 800)
