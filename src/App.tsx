import { useState } from 'react'
import { Toaster } from 'sonner'
import { DropFilters, hasActiveFilters } from './components/DropFilters'
import { DropList } from './components/DropList'
import { TopPlayers } from './components/TopPlayers'
import { SyncStatusBadge } from './components/SyncStatusBadge'
import { SortBar } from './components/SortBar'
import { NewDropsBadge } from './components/NewDropsBadge'
import { FilterDrawer } from './components/FilterDrawer'
import { useDropFeed } from './hooks/useDropFeed'

const isDev = import.meta.env.DEV

function App() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const {
    drops,
    filtered,
    filteredCount,
    filters,
    setFilters,
    sort,
    setSort,
    loading,
    error,
    dbUpdatedAt,
    useSample,
    refresh,
    stats,
    topPlayers,
    backfilling,
    backfill,
    newDropCount,
    markNewDropsSeen,
    filterByPlayer,
  } = useDropFeed()

  const filterProps = {
    filters,
    onChange: setFilters,
    onRefresh: () => refresh(),
    onBackfill: isDev ? backfill : undefined,
    loading,
    backfilling,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e17] via-panel to-[#0f1419] text-white">
      <header className="border-b border-panel-border bg-panel-elevated/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-white">
                SeaSRO <span className="text-accent-gold">Drop</span> Tracker
              </h1>
              <p className="text-sm text-accent-muted">
                110cap.seasro.com — canlı drop listesi
                {useSample && (
                  <span className="ml-2 rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-200">
                    demo modu
                  </span>
                )}
              </p>
            </div>
            <NewDropsBadge count={newDropCount} onDismiss={markNewDropsSeen} />
          </div>
          <SyncStatusBadge dbUpdatedAt={dbUpdatedAt} loading={loading} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <TopPlayers players={topPlayers} onPlayerClick={filterByPlayer} />

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-panel-border bg-panel-elevated p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-accent-muted">Toplam kayıt</p>
            <p className="text-2xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-panel-border bg-panel-elevated p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-accent-muted">Oyuncu</p>
            <p className="text-2xl font-semibold text-white">{stats.players}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <aside className="hidden lg:col-span-1 lg:block">
            <DropFilters {...filterProps} />
          </aside>

          <section className="lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-panel-border bg-panel-elevated px-4 py-2 text-sm font-medium text-white lg:hidden"
              >
                Filtreler
                {hasActiveFilters(filters) && (
                  <span className="rounded-full bg-accent-gold/20 px-2 py-0.5 text-xs text-accent-gold">
                    aktif
                  </span>
                )}
              </button>
              <SortBar value={sort} onChange={setSort} />
            </div>

            <p className="mb-4 text-sm text-slate-400">
              <span className="font-semibold text-white">
                {filteredCount} / {stats.total}
              </span>{' '}
              gösteriliyor
              {filters.player.trim() && (
                <span className="text-accent-muted">
                  {' '}
                  · oyuncu: <span className="text-accent-gold">{filters.player}</span>
                </span>
              )}
            </p>

            {error && !useSample && drops.length === 0 && (
              <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
                {isDev ? error : 'Liste şu an yüklenemedi. Lütfen biraz sonra yenileyin.'}
              </div>
            )}
            {error && useSample && (
              <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
                {isDev
                  ? `Canlı veri alınamadı (${error}). Demo verisi gösteriliyor — npm run start ile yerel sunucuyu açın.`
                  : 'Canlı veri alınamadı. Demo verisi gösteriliyor.'}
              </div>
            )}

            <DropList
              drops={filtered}
              totalUnfiltered={stats.total}
              onPlayerClick={filterByPlayer}
            />
          </section>
        </div>
      </main>

      <FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <DropFilters
          {...filterProps}
          embedded
          onRefresh={() => {
            refresh()
            setFiltersOpen(false)
          }}
        />
      </FilterDrawer>

      <footer className="relative mt-12 overflow-hidden border-t border-panel-border bg-gradient-to-b from-panel-elevated/40 to-panel py-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,175,55,0.15), transparent)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <p className="text-xs text-slate-500">
            Veri kaynağı:{' '}
            <a
              href="https://110cap.seasro.com/logging/drop"
              className="text-accent-gold transition hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              110cap.seasro.com/logging/drop
            </a>
          </p>
          <div className="mx-auto my-4 h-px w-24 bg-gradient-to-r from-transparent via-accent-gold/40 to-transparent" />
          <p className="font-display text-sm font-semibold tracking-[0.2em] text-slate-300 uppercase">
            SeaSRO Drop Tracker
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
            © 2026 · Tüm drop verileri ilgili sunucuya aittir · Kişisel takip aracı
          </p>
          <p className="mt-4 text-sm text-slate-400">
            crafted with{' '}
            <span className="text-red-400/90" aria-label="love">
              ♥
            </span>{' '}
            for the community
          </p>
          <p className="mt-3 font-display text-base tracking-wide">
            <span className="text-accent-muted">@</span>
            <span className="bg-gradient-to-r from-accent-gold to-amber-200 bg-clip-text font-semibold text-transparent">
              aRuzas
            </span>
          </p>
        </div>
      </footer>

      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast: 'border border-panel-border bg-panel-elevated text-white',
          },
        }}
        richColors
      />
    </div>
  )
}

export default App
