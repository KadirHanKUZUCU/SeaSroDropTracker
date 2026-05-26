import type { ReactNode } from 'react'
import { toast } from 'sonner'
import type { DropFilters } from '../types/drop'
import { EMPTY_FILTERS } from '../types/drop'
import type { ItemCategory, ItemRace, WeaponSubtype } from '../lib/itemFormat'
import { CH_WEAPON_FILTERS, EU_WEAPON_FILTERS } from '../lib/itemFormat'

interface Props {
  filters: DropFilters
  onChange: (f: DropFilters) => void
  onRefresh: () => void
  onBackfill?: () => void
  loading: boolean
  backfilling?: boolean
  /** Mobil drawer içinde üst başlık gizlenir */
  embedded?: boolean
}

export function hasActiveFilters(f: DropFilters): boolean {
  return (
    f.search.trim() !== '' ||
    f.player.trim() !== '' ||
    f.degrees.length > 0 ||
    f.races.length > 0 ||
    f.categories.length > 0 ||
    f.weaponTypes.length > 0
  )
}

const DEGREE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const

const RACE_OPTIONS: { id: ItemRace; label: string }[] = [
  { id: 'CH', label: 'CH (Çin)' },
  { id: 'EU', label: 'EU (Avrupa)' },
]

const CATEGORY_OPTIONS: { id: ItemCategory; label: string }[] = [
  { id: 'weapon', label: 'Silahlar' },
  { id: 'equipment', label: 'Ekipmanlar' },
  { id: 'accessory', label: 'Aksesuarlar' },
]

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value]
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
        active
          ? 'border-accent-gold bg-accent-gold/15 text-accent-gold'
          : 'border-panel-border bg-panel text-slate-300 hover:border-accent-gold/40'
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
          active ? 'border-accent-gold bg-accent-gold text-panel' : 'border-slate-600'
        }`}
      >
        {active ? '✓' : ''}
      </span>
      {children}
    </button>
  )
}

export function DropFilters({
  filters,
  onChange,
  onRefresh,
  onBackfill,
  loading,
  backfilling,
  embedded = false,
}: Props) {
  const raceCh = filters.races.includes('CH')
  const raceEu = filters.races.includes('EU')
  const hasChWeapons = filters.weaponTypes.some((w) => w.startsWith('ch_'))
  const hasEuWeapons = filters.weaponTypes.some((w) => w.startsWith('eu_'))

  const euWeaponsBlocked = raceCh || hasChWeapons
  const chWeaponsBlocked = raceEu || hasEuWeapons

  const toggleRace = (id: ItemRace) => {
    const turningOn = !filters.races.includes(id)

    if (turningOn && id === 'CH' && hasEuWeapons) {
      toast.message('EU silahları seçili', {
        description: 'CH ırkı için önce EU silahlarını temizleyin.',
      })
      return
    }
    if (turningOn && id === 'EU' && hasChWeapons) {
      toast.message('CH silahları seçili', {
        description: 'EU ırkı için önce CH silahlarını temizleyin.',
      })
      return
    }
    if (turningOn && id === 'CH' && raceEu) {
      toast.message('EU ırkı seçili', {
        description: 'CH ırkı için önce EU ırkını kaldırın.',
      })
      return
    }
    if (turningOn && id === 'EU' && raceCh) {
      toast.message('CH ırkı seçili', {
        description: 'EU ırkı için önce CH ırkını kaldırın.',
      })
      return
    }

    onChange({ ...filters, races: toggleInList(filters.races, id) })
  }

  const toggleWeapon = (id: WeaponSubtype) => {
    const isCh = id.startsWith('ch_')
    const isEu = id.startsWith('eu_')
    const turningOn = !filters.weaponTypes.includes(id)

    if (turningOn && isEu && raceCh) {
      toast.message('CH ırkı seçili', {
        description: 'EU silahları için önce CH ırkını kaldırın veya CH silahlarını seçin.',
      })
      return
    }
    if (turningOn && isCh && raceEu) {
      toast.message('EU ırkı seçili', {
        description: 'CH silahları için önce EU ırkını kaldırın veya EU silahlarını seçin.',
      })
      return
    }
    if (turningOn && isEu && hasChWeapons) {
      toast.message('CH silahları seçili', {
        description: 'EU silahları için önce CH silahlarını temizleyin.',
      })
      return
    }
    if (turningOn && isCh && hasEuWeapons) {
      toast.message('EU silahları seçili', {
        description: 'CH silahları için önce EU silahlarını temizleyin.',
      })
      return
    }

    onChange({ ...filters, weaponTypes: toggleInList(filters.weaponTypes, id) })
  }

  return (
    <div
      className={
        embedded
          ? ''
          : 'rounded-xl border border-panel-border bg-panel-elevated p-4 shadow-xl'
      }
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {!embedded && <h2 className="font-display text-lg font-semibold text-white">Filtreler</h2>}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            disabled={!hasActiveFilters(filters)}
            className="rounded-lg border border-panel-border px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-accent-gold/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Temizle
          </button>
          {onBackfill && (
            <button
              type="button"
              onClick={onBackfill}
              disabled={loading || backfilling}
              className="rounded-lg border border-accent-gold/50 px-3 py-2 text-xs font-medium text-accent-gold transition hover:bg-accent-gold/10 disabled:opacity-50"
            >
              {backfilling ? 'Taranıyor…' : 'Tümünü Tara'}
            </button>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading || backfilling}
            className="rounded-lg bg-accent-gold px-4 py-2 text-sm font-semibold text-panel transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'Yükleniyor…' : 'Yenile'}
          </button>
        </div>
      </div>

      <div className="scrollbar-hidden grid max-h-[calc(100vh-12rem)] gap-4 overflow-y-auto">
        <label className="block text-xs font-medium text-accent-muted">
          Arama
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Item, oyuncu, serial…"
            className="mt-1 w-full rounded-lg border border-panel-border bg-panel px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-accent-gold focus:outline-none focus:ring-1 focus:ring-accent-gold"
          />
        </label>

        <label className="block text-xs font-medium text-accent-muted">
          Oyuncu
          <input
            type="text"
            value={filters.player}
            onChange={(e) => onChange({ ...filters, player: e.target.value })}
            placeholder="Oyuncu adı"
            className="mt-1 w-full rounded-lg border border-panel-border bg-panel px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-accent-gold focus:outline-none focus:ring-1 focus:ring-accent-gold"
          />
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-accent-muted">Irk</p>
            {filters.races.length > 0 && (
              <button
                type="button"
                onClick={() => onChange({ ...filters, races: [] })}
                className="text-[10px] text-accent-gold hover:underline"
              >
                Temizle
              </button>
            )}
          </div>
          <ul className="flex flex-col gap-1">
            {RACE_OPTIONS.map(({ id, label }) => (
              <li key={id}>
                <FilterButton
                  active={filters.races.includes(id)}
                  onClick={() => toggleRace(id)}
                >
                  {label}
                </FilterButton>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-accent-muted">Degree</p>
            {filters.degrees.length > 0 && (
              <button
                type="button"
                onClick={() => onChange({ ...filters, degrees: [] })}
                className="text-[10px] text-accent-gold hover:underline"
              >
                Temizle
              </button>
            )}
          </div>
          <ul className="flex flex-col gap-1">
            {DEGREE_OPTIONS.map((d) => (
              <li key={d}>
                <FilterButton
                  active={filters.degrees.includes(d)}
                  onClick={() =>
                    onChange({ ...filters, degrees: toggleInList(filters.degrees, d) })
                  }
                >
                  {d}D
                </FilterButton>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-accent-muted">Kategori</p>
            {filters.categories.length > 0 && (
              <button
                type="button"
                onClick={() => onChange({ ...filters, categories: [] })}
                className="text-[10px] text-accent-gold hover:underline"
              >
                Temizle
              </button>
            )}
          </div>
          <ul className="flex flex-col gap-1">
            {CATEGORY_OPTIONS.map(({ id, label }) => (
              <li key={id}>
                <FilterButton
                  active={filters.categories.includes(id)}
                  onClick={() =>
                    onChange({ ...filters, categories: toggleInList(filters.categories, id) })
                  }
                >
                  {label}
                </FilterButton>
              </li>
            ))}
          </ul>
        </div>

        <div className={chWeaponsBlocked ? 'rounded-lg opacity-50' : undefined}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-accent-muted">CH Silahlar</p>
            {raceEu && (
              <span className="text-[10px] text-amber-400/90">EU ırkı seçili</span>
            )}
            {filters.weaponTypes.some((w) => w.startsWith('ch_')) && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    weaponTypes: filters.weaponTypes.filter((w) => !w.startsWith('ch_')),
                  })
                }
                className="text-[10px] text-accent-gold hover:underline"
              >
                Temizle
              </button>
            )}
          </div>
          <ul className="flex flex-col gap-1">
            {CH_WEAPON_FILTERS.map(({ id, label }) => (
              <li key={id}>
                <FilterButton
                  active={filters.weaponTypes.includes(id)}
                  onClick={() => toggleWeapon(id)}
                >
                  {label}
                </FilterButton>
              </li>
            ))}
          </ul>
        </div>

        <div className={euWeaponsBlocked ? 'rounded-lg opacity-50' : undefined}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-accent-muted">EU Silahlar</p>
            {raceCh && (
              <span className="text-[10px] text-amber-400/90">CH ırkı seçili</span>
            )}
            {filters.weaponTypes.some((w) => w.startsWith('eu_')) && (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    weaponTypes: filters.weaponTypes.filter((w) => !w.startsWith('eu_')),
                  })
                }
                className="text-[10px] text-accent-gold hover:underline"
              >
                Temizle
              </button>
            )}
          </div>
          <ul className="flex flex-col gap-1">
            {EU_WEAPON_FILTERS.map(({ id, label }) => (
              <li key={id}>
                <FilterButton active={filters.weaponTypes.includes(id)} onClick={() => toggleWeapon(id)}>
                  {label}
                </FilterButton>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
