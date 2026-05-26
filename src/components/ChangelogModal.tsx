import { useEffect } from 'react'
import { APP_VERSION, CHANGELOG } from '../content/changelog'

interface Props {
  open: boolean
  onClose: () => void
}

export function ChangelogModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="changelog-title"
        className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-panel-border bg-panel-elevated shadow-2xl"
      >
        <div className="border-b border-panel-border bg-panel px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-accent-gold">
                Sürüm notları
              </p>
              <h2 id="changelog-title" className="font-display text-xl font-bold text-white">
                v{APP_VERSION} — Neler düzeldi?
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Teknik detay yok; kısaca neyin iyileştiğini özetledik.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg border border-panel-border px-2.5 py-1 text-sm text-slate-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="scrollbar-hidden flex-1 overflow-y-auto px-5 py-4">
          <ul className="space-y-5">
            {CHANGELOG.map((section) => (
              <li key={section.title}>
                <h3 className="mb-2 text-sm font-semibold text-accent-gold">{section.title}</h3>
                <ul className="space-y-2 text-sm leading-relaxed text-slate-300">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-gold/80" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-panel-border px-5 py-3 text-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-accent-gold px-5 py-2 text-sm font-semibold text-panel hover:brightness-110"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  )
}
