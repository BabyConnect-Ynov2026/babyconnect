import { Clock3, Trophy, Users } from 'lucide-react'
import type { Player } from '../../types'

import type {
  BabyfootCardData,
  BabyfootCardStatusTone,
  CurrentUser,
} from './types'

export const currentUser: Player | null = null

export const babyfootCards: BabyfootCardData[] = [
  {
    accent: 'from-emerald-100 via-white to-emerald-50',
    details: [
      { icon: Users, label: '0/4 joueurs' },
    ],
    id: 1,
    location: 'Campus',
    name: 'Baby-foot Cafeteria (Bat A)',
    occupancy: '0/4',
    status: 'Disponible',
    statusTone: 'available',
    subtitle: 'Pret pour la prochaine partie',
  },
  {
    accent: 'from-slate-100 via-white to-slate-50',
    details: [
      { icon: Clock3, label: 'Reste 08:34' },
      { icon: Users, label: 'Joueurs: 2/4' },
    ],
    footer: 'Par: Corentin R. (Silver Rank)',
    id: 2,
    location: 'Hall principal',
    name: 'Baby-foot Hall Principal',
    occupancy: '2/4',
    status: 'Occupé',
    statusTone: 'busy',
    subtitle: 'Partie en cours',
  },
  {
    accent: 'from-cyan-50 via-white to-emerald-50',
    ctaLabel: 'Voir tableau',
    details: [
      { icon: Trophy, label: 'Tournoi YNOV "Champions League"' },
      { icon: Clock3, label: 'Duree: Jusqu a la fin du match' },
    ],
    id: 3,
    location: 'Salle 104',
    name: 'Baby-foot Salle 104',
    occupancy: '4/4',
    status: 'Mode tournoi',
    statusTone: 'tournament',
    subtitle: 'Table reservee pour la competition',
  },
]

export const statusClasses: Record<BabyfootCardStatusTone, string> = {
  available: 'text-emerald-500 bg-emerald-50 border-emerald-100',
  busy: 'text-slate-900 bg-slate-100 border-slate-200',
  tournament: 'text-cyan-600 bg-cyan-50 border-cyan-100',
}
