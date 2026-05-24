import type { DropItem } from '../types/drop'
import { enrichDrop } from './itemFormat'

export function parseDropsFromHtml(html: string): DropItem[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const items = doc.querySelectorAll('.rank-item')
  const drops: DropItem[] = []

  items.forEach((el, index) => {
    const rankEl = el.querySelector('.rank-number')
    const rankText = rankEl?.textContent?.trim() ?? String(index + 1)
    const rank = parseInt(rankText.replace(/\D/g, ''), 10) || index + 1

    const itemLink = el.querySelector('.rank-name a')
    const href = itemLink?.getAttribute('href') ?? ''
    const serialMatch = href.match(/serial\/(\d+)/)
    const serial = serialMatch ? serialMatch[1] : ''
    const itemName =
      itemLink?.textContent?.trim() ||
      itemLink?.getAttribute('title')?.trim() ||
      ''

    const playerLink = el.querySelector('.rank-info small a')
    const playerName = playerLink?.textContent?.trim() ?? ''

    const timeEl = el.querySelector('.stat-drop')
    const timeText = timeEl?.textContent?.replace(/\s+/g, ' ').trim() ?? ''

    const iconEl = el.querySelector('.activity-item-icon img')
    let iconUrl = iconEl?.getAttribute('src') ?? ''
    if (iconUrl && !iconUrl.startsWith('http')) {
      iconUrl = iconUrl.startsWith('/') ? `https://110cap.seasro.com${iconUrl}` : iconUrl
    }

    const itemIcon = el.querySelector('.item-icon')
    const rareClass = itemIcon?.className?.match(/rare-(\d+)/)
    const blueStats = rareClass ? parseInt(rareClass[1], 10) : 0

    const itemUrl = href.startsWith('/')
      ? `https://110cap.seasro.com${href}`
      : href

    drops.push(
      enrichDrop({
        id: serial || `rank-${rank}`,
        rank,
        serial,
        itemName,
        playerName,
        timeText,
        iconUrl,
        rare: blueStats,
        itemUrl,
      }) as DropItem,
    )
  })

  return drops
}
