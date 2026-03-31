import type { BabyfootCardData, HomeTableStatus } from './types'

type LiveTable = {
  id: number
  location: string | null
  name: string
  status: HomeTableStatus
}

const accentPalette = [
  'from-emerald-100 via-white to-emerald-50',
  'from-amber-50 via-white to-orange-50',
  'from-slate-100 via-white to-slate-50',
] as const

const accentByStatus: Record<HomeTableStatus, string> = {
  free: accentPalette[0],
  reserved: accentPalette[1],
  occupied: accentPalette[2],
}

export function mapLiveTableToCard(table: LiveTable): BabyfootCardData {
  return {
    accent: accentByStatus[table.status],
    id: table.id,
    location: table.location || 'Campus Ynov',
    name: table.name,
    status: table.status,
  }
}
