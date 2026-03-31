import { MapPin } from 'lucide-react'
import type { BabyfootCardData } from '../types'

type BabyfootCardProps = {
  card: BabyfootCardData
}

const badgeClasses: Record<BabyfootCardData['status'], string> = {
  free: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  reserved: 'border-amber-100 bg-amber-50 text-amber-700',
  occupied: 'border-slate-200 bg-slate-100 text-slate-700',
}

const badgeLabels: Record<BabyfootCardData['status'], string> = {
  free: 'Libre',
  reserved: 'Reservee',
  occupied: 'Occupee',
}

export function BabyfootCard({ card }: BabyfootCardProps) {
  return (
    <article
      className={`flex h-full flex-col rounded-[28px] border border-black/5 bg-gradient-to-br ${card.accent} p-5 shadow-[0_22px_50px_rgba(15,23,42,0.08)] sm:p-6`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[1.2rem] font-black leading-6 text-slate-950 sm:text-[1.35rem]">
            {card.name}
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500">
            <MapPin size={16} className="text-emerald-600" />
            <span>{card.location}</span>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${badgeClasses[card.status]}`}
        >
          {badgeLabels[card.status]}
        </span>
      </div>
    </article>
  )
}
