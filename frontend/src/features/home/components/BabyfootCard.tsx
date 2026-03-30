import { MapPin } from 'lucide-react'
import { statusClasses } from '../data'
import type { BabyfootCardData } from '../types'

type BabyfootCardProps = {
  card: BabyfootCardData
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
        <div className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
          {card.occupancy}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${statusClasses[card.statusTone]}`}
        >
          {card.status}
        </span>
        {card.subtitle && (
          <span className="text-right text-xs font-semibold text-slate-500">
            {card.subtitle}
          </span>
        )}
      </div>

      <div className="mt-4 flex-1 space-y-2">
        {card.details.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Icon size={16} className="text-emerald-600" />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {card.footer && (
        <p className="mt-4 text-sm font-semibold text-slate-500">
          {card.footer}
        </p>
      )}

      {card.ctaLabel && (
        <button
          type="button"
          className="mt-5 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-[0_18px_30px_rgba(15,23,42,0.2)] transition-transform hover:scale-[1.01]"
        >
          {card.ctaLabel}
        </button>
      )}
    </article>
  )
}
