import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function FilterDrawer({ open, onClose, children }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Filtreleri kapat"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="scrollbar-hidden absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-2xl border border-panel-border bg-panel-elevated p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">Filtreler</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-panel-border px-3 py-1.5 text-sm text-slate-300 hover:text-white"
          >
            Kapat
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
