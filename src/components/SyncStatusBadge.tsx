import { useEffect, useState } from 'react'
import {
  CRON_INTERVAL_MINUTES,
  formatCountdown,
  getMsUntilNextCron,
  getNextCronDate,
} from '../lib/syncSchedule'

interface Props {
  dbUpdatedAt: string | null
  loading?: boolean
}

export function SyncStatusBadge({ dbUpdatedAt, loading }: Props) {
  const [msLeft, setMsLeft] = useState(() => getMsUntilNextCron())

  useEffect(() => {
    const tick = () => setMsLeft(getMsUntilNextCron())
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  const nextAt = getNextCronDate()
  const dbLabel = dbUpdatedAt
    ? new Date(dbUpdatedAt).toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  return (
    <div className="flex flex-col items-end gap-1 text-right">
      <div className="flex items-center gap-2 rounded-lg border border-accent-gold/30 bg-accent-gold/10 px-3 py-2">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${loading ? 'animate-pulse bg-amber-400' : 'bg-emerald-400'}`}
          title={loading ? 'Yükleniyor' : 'Cron aktif'}
        />
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-accent-gold/90">
            Otomatik güncelleme
          </p>
          <p className="text-xs text-slate-300">
            Veritabanı her <span className="font-semibold text-white">{CRON_INTERVAL_MINUTES} dk</span>{' '}
            güncellenir
          </p>
        </div>
      </div>
      <p className="font-mono text-sm tabular-nums text-white">
        Sonraki tarama:{' '}
        <span className="text-accent-gold">{formatCountdown(msLeft)}</span>
      </p>
      <p className="text-[10px] text-slate-500">
        {nextAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} · cron-job.org
      </p>
      <p className="text-[10px] text-slate-600">DB son güncelleme: {dbLabel}</p>
    </div>
  )
}
