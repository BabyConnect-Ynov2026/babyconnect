import { useEffect, useState, useCallback } from 'react'
import {
  X, ChevronLeft, ChevronRight, Clock, Calendar, MapPin, CheckCircle,
} from 'lucide-react'
import { reservationsApi, playersApi } from '../services/api'
import { Player, Reservation, Table } from '../types'
import {
  format, startOfWeek, addDays, addWeeks, subWeeks,
  isSameDay, parseISO, isBefore, setHours, setMinutes,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

const SLOT_DURATION = 15
const DAY_START = 8
const DAY_END = 19

function generateSlots(day: Date): Date[] {
  const slots: Date[] = []
  for (let h = DAY_START; h < DAY_END; h++) {
    for (let m = 0; m < 60; m += SLOT_DURATION) {
      slots.push(setMinutes(setHours(new Date(day), h), m))
    }
  }
  return slots
}

function isSlotTaken(slot: Date, reservations: Reservation[]): boolean {
  const slotEnd = new Date(slot.getTime() + SLOT_DURATION * 60 * 1000)
  return reservations
    .filter((r) => r.status !== 'cancelled')
    .some((r) => {
      const start = parseISO(r.start_time)
      const end = parseISO(r.end_time)
      return slot < end && slotEnd > start
    })
}

type Props = {
  table: Table
  onClose: () => void
}

export function ReservationModal({ table, onClose }: Props) {
  const [players, setPlayers] = useState<Player[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)
  const [playerId, setPlayerId] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(() => {
    Promise.all([
      playersApi.getAll(),
      reservationsApi.getAll({ table_id: table.id }),
    ]).then(([plRes, resRes]) => {
      setPlayers(plRes.data.players ?? [])
      setReservations(resRes.data.reservations ?? [])
    }).finally(() => setLoading(false))
  }, [table.id])

  useEffect(() => { load() }, [load])

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const slots = generateSlots(selectedDay)

  const handleSubmit = async () => {
    if (!selectedSlot || !playerId) return
    setSubmitting(true)
    const end = new Date(selectedSlot.getTime() + SLOT_DURATION * 60 * 1000)
    try {
      await reservationsApi.create({
        player_id: Number(playerId),
        table_id: table.id,
        start_time: selectedSlot.toISOString(),
        end_time: end.toISOString(),
        notes,
      })
      toast.success('Réservation confirmée ! 🎉')
      setSelectedSlot(null)
      setNotes('')
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Créneau déjà pris ou erreur serveur')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Panel */}
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-[#f3f4ef] rounded-t-[32px] sm:rounded-[32px] shadow-[0_32px_80px_rgba(15,23,42,0.25)]">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#f3f4ef] px-6 pt-6 pb-4 border-b border-black/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.65rem] font-black uppercase tracking-[0.28em] text-emerald-600">
                Réservation
              </p>
              <h2 className="text-xl font-black text-slate-950 leading-tight mt-0.5">
                {table.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-slate-500">
                <MapPin size={12} className="text-emerald-500" />
                {table.location}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-900 transition-colors flex-shrink-0 mt-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* ── Calendrier ── */}
              <div className="bg-white rounded-[24px] border border-black/5 shadow-sm overflow-hidden">

                {/* Week nav */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => setWeekStart((w) => subWeeks(w, 1))}
                    className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-black text-slate-700">
                    {format(weekStart, 'd MMM', { locale: fr })} —{' '}
                    {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: fr })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWeekStart((w) => addWeeks(w, 1))}
                    className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Day tabs */}
                <div className="grid grid-cols-7 border-b border-slate-100">
                  {weekDays.map((day) => {
                    const isSelected = isSameDay(day, selectedDay)
                    const isToday = isSameDay(day, new Date())
                    const daySlots = generateSlots(day)
                    const taken = daySlots.filter(
                      (s) => !isBefore(s, new Date()) && isSlotTaken(s, reservations)
                    ).length
                    const total = daySlots.filter((s) => !isBefore(s, new Date())).length

                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        onClick={() => { setSelectedDay(day); setSelectedSlot(null) }}
                        className={`flex flex-col items-center py-2.5 px-1 transition-colors ${
                          isSelected
                            ? 'bg-emerald-500 text-white'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-[0.55rem] font-bold uppercase tracking-wider opacity-60">
                          {format(day, 'EEE', { locale: fr })}
                        </span>
                        <span className={`text-sm font-black mt-0.5 ${isToday && !isSelected ? 'text-emerald-600' : ''}`}>
                          {format(day, 'd')}
                        </span>
                        {total > 0 && (
                          <span className={`mt-1 w-1.5 h-1.5 rounded-full ${
                            taken === total ? 'bg-red-400' :
                            taken > 0 ? 'bg-orange-400' :
                            isSelected ? 'bg-white/50' : 'bg-emerald-400'
                          }`} />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Slots */}
                <div className="p-4">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    {format(selectedDay, 'EEEE d MMMM', { locale: fr })} · créneaux 30 min
                  </p>
                  <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
                    {slots.map((slot) => {
                      const taken = isSlotTaken(slot, reservations)
                      const past = isBefore(slot, new Date())
                      const active = selectedSlot?.getTime() === slot.getTime()

                      return (
                        <button
                          key={slot.toISOString()}
                          type="button"
                          disabled={taken || past}
                          onClick={() => setSelectedSlot(slot)}
                          className={`
                            rounded-xl py-2 text-[0.7rem] font-bold transition-all duration-150
                            ${past
                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              : taken
                              ? 'bg-red-50 text-red-300 border border-red-100 cursor-not-allowed line-through'
                              : active
                              ? 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.4)] scale-105'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-500 hover:text-white hover:scale-105'
                            }
                          `}
                        >
                          {format(slot, 'HH:mm')}
                        </button>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-3 text-[0.65rem] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-200 inline-block" />
                      Disponible
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-red-50 border border-red-100 inline-block" />
                      Réservé
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-slate-100 inline-block" />
                      Passé
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Formulaire confirmation ── */}
              {selectedSlot && (
                <div className="bg-white rounded-[24px] border border-black/5 shadow-sm p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                    Confirmer
                  </p>

                  {/* Récap créneau */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-1.5 bg-emerald-50 rounded-2xl px-3 py-1.5 border border-emerald-100">
                      <Calendar size={12} className="text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-800">
                        {format(selectedSlot, 'EEEE d MMM', { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 rounded-2xl px-3 py-1.5 border border-slate-100">
                      <Clock size={12} className="text-slate-500" />
                      <span className="text-xs font-bold text-slate-700">
                        {format(selectedSlot, 'HH:mm')} → {format(new Date(selectedSlot.getTime() + SLOT_DURATION * 60_000), 'HH:mm')}
                      </span>
                    </div>
                  </div>

                  {/* Joueur */}
                  <div className="mb-3">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">
                      Joueur *
                    </label>
                    <select
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value)}
                    >
                      <option value="">Sélectionner un joueur...</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.username} — {p.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">
                      Notes <span className="font-normal text-slate-400">(optionnel)</span>
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      placeholder="Tournoi amical, entraînement..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!playerId || submitting}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3 text-sm font-black text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)] transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={15} />
                      {submitting ? 'En cours...' : 'Confirmer la réservation'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSlot(null)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}