import type { DropItem } from '../types/drop'
import { enrichDrop } from '../lib/itemFormat'

const raw = [
  {
    id: '72339069108585847',
    rank: 1,
    serial: '72339069108585847',
    itemName: 'ITEM_EU_M_HEAVY_08_LA_A_RARE',
    playerName: '_BaRD',
    timeText: '2 saat önce',
    iconUrl: 'https://media.kguardedge.com/media/icon/item/europe/man_item/heavy_08_la.webp',
    rare: 2,
    itemUrl: 'https://110cap.seasro.com/logging/item/serial/72339069108585847',
  },
  {
    id: '72339069108585463',
    rank: 2,
    serial: '72339069108585463',
    itemName: 'ITEM_CH_M_LIGHT_11_FA_A_RARE',
    playerName: 'Catchy',
    timeText: '2 saat önce',
    iconUrl: 'https://media.kguardedge.com/media/icon/item/china/man_item/light_11_fa.webp',
    rare: 16,
    itemUrl: 'https://110cap.seasro.com/logging/item/serial/72339069108585463',
  },
  {
    id: '72339069108585373',
    rank: 3,
    serial: '72339069108585373',
    itemName: 'ITEM_CH_SPEAR_11_A_RARE',
    playerName: 'AsbWizz',
    timeText: '2 saat önce',
    iconUrl: 'https://media.kguardedge.com/media/icon/item/china/weapon/spear_11.webp',
    rare: 13,
    itemUrl: 'https://110cap.seasro.com/logging/item/serial/72339069108585373',
  },
  {
    id: '72339069108585354',
    rank: 4,
    serial: '72339069108585354',
    itemName: 'ITEM_EU_M_LIGHT_04_HA_B_RARE',
    playerName: 'HarperTwo',
    timeText: '2 saat önce',
    iconUrl: 'https://media.kguardedge.com/media/icon/item/europe/man_item/light_04_ha.webp',
    rare: 21,
    itemUrl: 'https://110cap.seasro.com/logging/item/serial/72339069108585354',
  },
  {
    id: '72339069108584776',
    rank: 5,
    serial: '72339069108584776',
    itemName: 'ITEM_CH_RING_11_A_RARE',
    playerName: 'KOMANDO1',
    timeText: '3 saat önce',
    iconUrl: 'https://media.kguardedge.com/media/icon/item/china/acc/ring_11.webp',
    rare: 1,
    itemUrl: 'https://110cap.seasro.com/logging/item/serial/72339069108584776',
  },
]

export const sampleDrops: DropItem[] = raw.map((d) => enrichDrop(d) as DropItem)
