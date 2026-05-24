import { parseItemDegree } from './itemDegree'

export type ItemCategory = 'weapon' | 'equipment' | 'accessory'
export type ItemRace = 'CH' | 'EU' | null
export type ItemTier = 'Nova' | 'SOS' | 'Moon' | 'Sun' | ''

export type WeaponSubtype =
  | 'ch_bow'
  | 'ch_spear'
  | 'ch_blade'
  | 'ch_glavie'
  | 'ch_sword'
  | 'ch_shield'
  | 'eu_sword1h'
  | 'eu_sword2h'
  | 'eu_dagger'
  | 'eu_crossbow'
  | 'eu_staff'
  | 'eu_warlock'
  | 'eu_cleric'
  | 'eu_harp'
  | 'eu_shield'
  | 'eu_axe'

const PART: Record<string, string> = {
  BA: 'Chest',
  LA: 'Legs',
  HA: 'Head',
  EA: 'Shoulder',
  SA: 'Shoulder',
  GA: 'Gloves',
  FA: 'Foot',
}

const GENDER: Record<string, string> = {
  M: 'Male',
  W: 'Female',
  F: 'Female',
}

const ARMOR_SET: Record<string, string> = {
  HEAVY: 'Heavy',
  LIGHT: 'Light',
  MEDIUM: 'Medium',
  ROBE: 'Robe',
  CLOTHES: 'Garment',
  ARMOR: 'Armor',
  ARM: 'Armor',
  PRO: 'Protector',
  TOW: 'Garment',
  HARM: 'Heavy',
  LARM: 'Light',
}

const EU_WEAPON_LABEL: Record<WeaponSubtype, string> = {
  ch_bow: 'Bow',
  ch_spear: 'Spear',
  ch_blade: 'Blade',
  ch_glavie: 'Glavie',
  ch_sword: 'Sword',
  ch_shield: 'Shield',
  eu_sword1h: '1H Sword',
  eu_sword2h: '2H Sword',
  eu_dagger: 'Dagger',
  eu_crossbow: 'Crossbow',
  eu_staff: 'Staff',
  eu_warlock: 'Warlock Rod',
  eu_cleric: 'Cleric Rod',
  eu_harp: 'Harp',
  eu_shield: 'Shield',
  eu_axe: 'Axe',
}

export const CH_WEAPON_FILTERS: { id: WeaponSubtype; label: string }[] = [
  { id: 'ch_bow', label: 'Bow' },
  { id: 'ch_spear', label: 'Spear' },
  { id: 'ch_blade', label: 'Blade' },
  { id: 'ch_glavie', label: 'Glavie' },
  { id: 'ch_sword', label: 'Sword' },
  { id: 'ch_shield', label: 'Kalkan' },
]

export const EU_WEAPON_FILTERS: { id: WeaponSubtype; label: string }[] = [
  { id: 'eu_sword1h', label: '1H Sword' },
  { id: 'eu_sword2h', label: '2H Sword' },
  { id: 'eu_dagger', label: 'Dagger' },
  { id: 'eu_crossbow', label: 'Crossbow' },
  { id: 'eu_staff', label: 'Staff' },
  { id: 'eu_warlock', label: 'Warlock Rod' },
  { id: 'eu_cleric', label: 'Cleric Rod' },
  { id: 'eu_harp', label: 'Harp' },
  { id: 'eu_shield', label: 'Shield' },
  { id: 'eu_axe', label: 'Axe' },
]

function upper(itemName: string) {
  return itemName.toUpperCase()
}

/** Zırh: ITEM_CH_W_LIGHT_11_BA — BA göğüs, silah değil */
export function isArmorItem(itemName: string): boolean {
  const u = upper(itemName)
  return (
    /ITEM_(CH|EU)_[MWF]_(HEAVY|LIGHT|ROBE|CLOTHES|ARMOR|ARM|PRO|TOW|MEDIUM|HARM|LARM)_\d{1,2}_(BA|LA|FA|HA|EA|GA|SA)_/.test(
      u,
    ) || /ITEM_(CH|EU)_[MWF]_[A-Z]+_\d{1,2}_(BA|LA|FA|HA|EA|GA|SA)_/.test(u)
  )
}

export function isAccessoryItem(itemName: string): boolean {
  const u = upper(itemName)
  return (
    /ITEM_ETC_(RING|EARRING|NECKLACE)/.test(u) ||
    /ITEM_(CH|EU)_(RING|EARRING|NECKLACE)_\d/.test(u) ||
    /_(RING|EARRING|NECKLACE)_\d/.test(u)
  )
}

export function isWeaponItem(itemName: string): boolean {
  const u = upper(itemName)
  if (isArmorItem(itemName) || isAccessoryItem(itemName)) return false
  return (
    /ITEM_CH_(BLADE|BOW|SPEAR|T_SPEAR|GLAIVE|TBLADE|SWORD|SW|SHIELD|BA)_\d/.test(u) ||
    /ITEM_EU_(SWORD2H|TSWORD|SWORD|DAGGER|XBOW|CROSSBOW|BOW|STAFF|T_STAFF|DARKSTAFF|HARP|LUTE|AXE|SHIELD|ROD|W_ROD|CLERIC|WAND)_\d/.test(
      u,
    )
  )
}

export function getItemCategory(itemName: string): ItemCategory {
  if (isAccessoryItem(itemName)) return 'accessory'
  if (isArmorItem(itemName)) return 'equipment'
  if (isWeaponItem(itemName)) return 'weapon'
  return 'equipment'
}

export function getItemRace(itemName: string): ItemRace {
  const u = upper(itemName)
  if (u.startsWith('ITEM_CH')) return 'CH'
  if (u.startsWith('ITEM_EU')) return 'EU'
  return null
}

export function getItemTier(itemName: string, degree: number | null): ItemTier {
  const u = upper(itemName)
  if (/_C_RARE/.test(u)) return 'Sun'
  if (/_B_RARE/.test(u)) return 'Moon'
  if (/_A_RARE/.test(u)) return degree === 11 ? 'Nova' : 'SOS'
  return ''
}

export function getWeaponSubtype(itemName: string): WeaponSubtype | null {
  if (!isWeaponItem(itemName)) return null
  const u = upper(itemName)

  if (u.startsWith('ITEM_CH')) {
    if (/ITEM_CH_SHIELD_/.test(u)) return 'ch_shield'
    if (/ITEM_CH_BOW_/.test(u)) return 'ch_bow'
    if (/ITEM_CH_(SPEAR|T_SPEAR)_/.test(u)) return 'ch_spear'
    if (/ITEM_CH_(TBLADE|GLAIVE)_/.test(u)) return 'ch_glavie'
    if (/ITEM_CH_BLADE_/.test(u)) return 'ch_blade'
    if (/ITEM_CH_(SWORD|SW)_/.test(u)) return 'ch_sword'
  }

  if (u.startsWith('ITEM_EU')) {
    if (/ITEM_EU_SHIELD_/.test(u)) return 'eu_shield'
    if (/ITEM_EU_(SWORD2H|TSWORD)_/.test(u)) return 'eu_sword2h'
    if (/ITEM_EU_SWORD_\d/.test(u) && !/SWORD2H/.test(u)) return 'eu_sword1h'
    if (/ITEM_EU_DAGGER_/.test(u)) return 'eu_dagger'
    if (/ITEM_EU_(XBOW|CROSSBOW|BOW)_/.test(u)) return 'eu_crossbow'
    if (/ITEM_EU_T_STAFF_/.test(u)) return 'eu_staff'
    if (/ITEM_EU_(DARKSTAFF|W_ROD)_/.test(u)) return 'eu_warlock'
    if (/ITEM_EU_(CLERIC|ROD)_/.test(u)) return 'eu_cleric'
    // ITEM_EU_STAFF (1H) = Cleric Rod; T_STAFF = Staff (2H)
    if (/ITEM_EU_STAFF_\d/.test(u) && !/DARKSTAFF|T_STAFF/.test(u)) return 'eu_cleric'
    // LUTE: eski client adı; 110cap EU bard enstrümanı Harp
    if (/ITEM_EU_(HARP|LUTE)_/.test(u)) return 'eu_harp'
    if (/ITEM_EU_AXE_/.test(u)) return 'eu_axe'
  }

  return null
}

function getGender(itemName: string): string {
  const m = upper(itemName).match(/ITEM_(?:CH|EU)_([MWF])_/)
  return m ? (GENDER[m[1]] ?? '') : ''
}

function getArmorPart(itemName: string): string {
  const u = upper(itemName)
  for (const code of ['FA', 'LA', 'HA', 'EA', 'SA', 'GA', 'BA']) {
    if (new RegExp(`_${code}_`).test(u)) return PART[code]
  }
  return ''
}

function getArmorSetLabel(itemName: string): string {
  const u = upper(itemName)
  for (const [key, label] of Object.entries(ARMOR_SET)) {
    if (u.includes(`_${key}_`)) return label
  }
  return ''
}

function getWeaponLabel(itemName: string): string {
  const sub = getWeaponSubtype(itemName)
  return sub ? EU_WEAPON_LABEL[sub] : 'Weapon'
}

export function formatItemDisplay(itemName: string): string {
  const degree = parseItemDegree(itemName)
  const degreeStr = degree != null ? `${degree}D` : ''
  const race = getItemRace(itemName)
  const tier = getItemTier(itemName, degree)
  const category = getItemCategory(itemName)

  const parts: string[] = []
  if (degreeStr) parts.push(degreeStr)
  if (race) parts.push(race)

  if (category === 'accessory') {
    const u = upper(itemName)
    if (u.includes('RING')) parts.push('Ring')
    else if (u.includes('EARRING')) parts.push('Earring')
    else if (u.includes('NECKLACE')) parts.push('Necklace')
    else parts.push('Accessory')
  } else if (category === 'weapon') {
    parts.push(getWeaponLabel(itemName))
  } else {
    const gender = getGender(itemName)
    const part = getArmorPart(itemName)
    const set = getArmorSetLabel(itemName)
    if (gender) parts.push(gender)
    if (set && !part) parts.push(set)
    if (part) parts.push(part)
    else if (!set) parts.push('Gear')
  }

  if (tier) parts.push(tier)

  return parts.join(' ').replace(/\s+/g, ' ').trim() || itemName
}

export function enrichDrop<
  T extends { itemName: string; rare?: number; degree?: number | null },
>(raw: T) {
  const degree = raw.degree ?? parseItemDegree(raw.itemName)
  const itemName = raw.itemName
  return {
    ...raw,
    degree,
    displayName: formatItemDisplay(itemName),
    category: getItemCategory(itemName),
    race: getItemRace(itemName),
    tier: getItemTier(itemName, degree),
    weaponSubtype: getWeaponSubtype(itemName),
    blueStats: raw.rare ?? 0,
    rare: raw.rare ?? 0,
  }
}

export function tierBadgeClass(tier: ItemTier): string {
  switch (tier) {
    case 'Nova':
      return 'border-amber-400/50 bg-amber-950/40 text-amber-200'
    case 'SOS':
      return 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
    case 'Moon':
      return 'border-violet-500/40 bg-violet-950/40 text-violet-300'
    case 'Sun':
      return 'border-orange-500/40 bg-orange-950/40 text-orange-300'
    default:
      return 'border-slate-600 bg-slate-900/40 text-slate-400'
  }
}
