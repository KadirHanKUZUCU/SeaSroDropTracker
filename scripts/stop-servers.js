/**
 * 3001 (API) ve 5173 (Vite) portlarındaki dinleyen süreçleri kapatır.
 */
import { execSync } from 'node:child_process'

const PORTS = [3001, 5173]

function killPort(port) {
  try {
    const out = execSync(`netstat -ano | findstr ":${port}"`, { encoding: 'utf8' })
    const pids = new Set()
    for (const line of out.split('\n')) {
      if (!line.includes('LISTENING')) continue
      const parts = line.trim().split(/\s+/)
      const pid = parts[parts.length - 1]
      if (pid && pid !== '0') pids.add(pid)
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' })
        console.log(`Port ${port} → PID ${pid} kapatıldı`)
      } catch {
        /* zaten kapalı */
      }
    }
    if (pids.size === 0) console.log(`Port ${port} → dinleyen süreç yok`)
  } catch {
    console.log(`Port ${port} → dinleyen süreç yok`)
  }
}

for (const port of PORTS) killPort(port)
console.log('Bitti.')
