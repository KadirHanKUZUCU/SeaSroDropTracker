const PART = {
  BA: 'Chest',
  LA: 'Legs',
  HA: 'Head',
  EA: 'Shoulder',
  SA: 'Shoulder',
  GA: 'Gloves',
  FA: 'Foot',
}

const GENDER = { M: 'Male', W: 'Female', F: 'Female' }

const ARMOR_SET = {
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

const WEAPON_LABEL = {
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

export function parseItemDegree(itemName) {
  const upper = itemName.toUpperCase()
  const typeDegree =
    /ITEM_(CH|EU)_[MWF]_(HEAVY|LIGHT|ROBE|CLOTHES|ARMOR|ARM|PRO|TOW|MEDIUM|HARM|LARM)_(\d{1,2})_/i.exec(
      upper,
    )
  if (typeDegree) {
    const n = parseInt(typeDegree[2] ?? typeDegree[1], 10)
    if (n >= 1 && n <= 15) return n
  }
  const m = upper.match(/_(\d{2})_/)
  if (m) {
    const n = parseInt(m[1], 10)
    if (n >= 1 && n <= 15) return n
  }
  return null
}

export function isArmorItem(itemName) {
  const u = itemName.toUpperCase()
  return (
    /ITEM_(CH|EU)_[MWF]_(HEAVY|LIGHT|ROBE|CLOTHES|ARMOR|ARM|PRO|TOW|MEDIUM|HARM|LARM)_\d{1,2}_(BA|LA|FA|HA|EA|GA|SA)_/.test(
      u,
    ) || /ITEM_(CH|EU)_[MWF]_[A-Z]+_\d{1,2}_(BA|LA|FA|HA|EA|GA|SA)_/.test(u)
  )
}

function isAccessoryItem(itemName) {
  const u = itemName.toUpperCase()
  return (
    /ITEM_ETC_(RING|EARRING|NECKLACE)/.test(u) ||
    /ITEM_(CH|EU)_(RING|EARRING|NECKLACE)_\d/.test(u) ||
    /_(RING|EARRING|NECKLACE)_\d/.test(u)
  )
}

export function isWeaponItem(itemName) {
  const u = itemName.toUpperCase()
  if (isArmorItem(itemName) || isAccessoryItem(itemName)) return false
  return (
    /ITEM_CH_(BLADE|BOW|SPEAR|T_SPEAR|GLAIVE|TBLADE|SWORD|SW|SHIELD|BA)_\d/.test(u) ||
    /ITEM_EU_(SWORD2H|TSWORD|SWORD|DAGGER|XBOW|CROSSBOW|BOW|STAFF|T_STAFF|DARKSTAFF|HARP|LUTE|AXE|SHIELD|ROD|W_ROD|CLERIC|WAND)_\d/.test(
      u,
    )
  )
}

export function getItemCategory(itemName) {
  if (isAccessoryItem(itemName)) return 'accessory'
  if (isArmorItem(itemName)) return 'equipment'
  if (isWeaponItem(itemName)) return 'weapon'
  return 'equipment'
}

export function getItemRace(itemName) {
  const u = itemName.toUpperCase()
  if (u.startsWith('ITEM_CH')) return 'CH'
  if (u.startsWith('ITEM_EU')) return 'EU'
  return null
}

export function getItemTier(itemName, degree) {
  const u = itemName.toUpperCase()
  if (/_C_RARE/.test(u)) return 'Sun'
  if (/_B_RARE/.test(u)) return 'Moon'
  if (/_A_RARE/.test(u)) return degree === 11 ? 'Nova' : 'SOS'
  return ''
}

export function getWeaponSubtype(itemName) {
  if (!isWeaponItem(itemName)) return null
  const u = itemName.toUpperCase()
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
    if (/ITEM_EU_STAFF_\d/.test(u) && !/DARKSTAFF|T_STAFF/.test(u)) return 'eu_cleric'
    if (/ITEM_EU_(HARP|LUTE)_/.test(u)) return 'eu_harp'
    if (/ITEM_EU_AXE_/.test(u)) return 'eu_axe'
  }
  return null
}

function getGender(itemName) {
  const m = itemName.toUpperCase().match(/ITEM_(?:CH|EU)_([MWF])_/)
  return m ? (GENDER[m[1]] ?? '') : ''
}

function getArmorPart(itemName) {
  const u = itemName.toUpperCase()
  for (const code of ['FA', 'LA', 'HA', 'EA', 'SA', 'GA', 'BA']) {
    if (new RegExp(`_${code}_`).test(u)) return PART[code]
  }
  return ''
}

function getArmorSetLabel(itemName) {
  const u = itemName.toUpperCase()
  for (const [key, label] of Object.entries(ARMOR_SET)) {
    if (u.includes(`_${key}_`)) return label
  }
  return ''
}

export function formatItemDisplay(itemName) {
  const degree = parseItemDegree(itemName)
  const degreeStr = degree != null ? `${degree}D` : ''
  const race = getItemRace(itemName)
  const tier = getItemTier(itemName, degree)
  const category = getItemCategory(itemName)
  const parts = []
  if (degreeStr) parts.push(degreeStr)
  if (race) parts.push(race)

  if (category === 'accessory') {
    const u = itemName.toUpperCase()
    if (u.includes('RING')) parts.push('Ring')
    else if (u.includes('EARRING')) parts.push('Earring')
    else if (u.includes('NECKLACE')) parts.push('Necklace')
    else parts.push('Accessory')
  } else if (category === 'weapon') {
    const sub = getWeaponSubtype(itemName)
    parts.push(sub ? WEAPON_LABEL[sub] : 'Weapon')
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

export function enrichDrop(raw) {
  const degree = raw.degree ?? parseItemDegree(raw.itemName)
  return {
    ...raw,
    degree,
    displayName: formatItemDisplay(raw.itemName),
    category: getItemCategory(raw.itemName),
    race: getItemRace(raw.itemName),
    tier: getItemTier(raw.itemName, degree),
    weaponSubtype: getWeaponSubtype(raw.itemName),
  }
}
