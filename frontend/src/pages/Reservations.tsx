import { useEffect, useState } from 'react'
import { Calendar, Plus, X, Clock, MapPin } from 'lucide-react'
import { reservationsApi, tablesApi, playersApi } from '../services/api'
import { Reservation, Table, Player } from '../types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    player_id: '',
    table_id: '',
    start_time: '',
    end_time: '',
    notes: '',
  })

  const load = () => {
    Promise.all([
      reservationsApi.getAll(),
      tablesApi.getAll(),
      playersApi.getAll(),
    ]).then(([resRes, tablesRes, playersRes]) => {
      setReservations(resRes.data.reservations ?? [])
      setTables(tablesRes.data.tables ?? [])
      setPlayers(playersRes.data.players ?? [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await reservationsApi.create({
        player_id: Number(form.player_id),
        table_id: Number(form.table_id),
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        notes: form.notes,
      })
      toast.success('Réservation créée !')
      setShowForm(false)
      setForm({ player_id: '', table_id: '', start_time: '', end_time: '', notes: '' })
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Erreur lors de la réservation')
    }
  }

  const handleCancel = async (id: number) => {
    try {
      await reservationsApi.cancel(id)
      toast.success('Réservation annulée')
      load()
    } catch {
      toast.error('Erreur lors de l\'annulation')
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'badge-green',
      cancelled: 'badge-red',
      completed: 'badge-blue',
      pending: 'badge-yellow',
    }
    const labels: Record<string, string> = {
      confirmed: 'Confirmé',
      cancelled: 'Annulé',
      completed: 'Terminé',
      pending: 'En attente',
    }
    return <span className={map[status] ?? 'badge-yellow'}>{labels[status] ?? status}</span>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="text-green-400" size={28} />
          <div>
            <h1 className="text-3xl font-bold text-white">Réservations</h1>
            <p className="text-gray-400 mt-1">Gérez les créneaux de jeu</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nouvelle réservation
        </button>
      </div>

      {/* Table availability */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {tables.map((table) => (
          <div key={table.id} className="card flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">{table.name}</p>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <MapPin size={12} /> {table.location}
              </p>
            </div>
            <span className={table.available ? 'badge-green' : 'badge-red'}>
              {table.available ? 'Libre' : 'Occupée'}
            </span>
          </div>
        ))}
      </div>

      {/* New reservation form */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Nouvelle réservation</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Joueur</label>
              <select
                className="input"
                value={form.player_id}
                onChange={(e) => setForm({ ...form, player_id: e.target.value })}
                required
              >
                <option value="">Choisir un joueur...</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>{p.username} — {p.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Table</label>
              <select
                className="input"
                value={form.table_id}
                onChange={(e) => setForm({ ...form, table_id: e.target.value })}
                required
              >
                <option value="">Choisir une table...</option>
                {tables.filter(t => t.available).map((t) => (
                  <option key={t.id} value={t.id}>{t.name} — {t.location}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Début</label>
              <input
                type="datetime-local"
                className="input"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fin</label>
              <input
                type="datetime-local"
                className="input"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Notes (optionnel)</label>
              <input
                type="text"
                className="input"
                placeholder="Tournoi amical, entraînement..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Réserver</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reservations list */}
      <div className="card overflow-hidden p-0">
        <div className="p-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Réservations à venir</h2>
        </div>
        {reservations.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Aucune réservation</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {reservations.map((res) => (
              <div key={res.id} className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Clock size={18} className="text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {res.player?.username ?? `Joueur #${res.player_id}`} —{' '}
                      <span className="text-gray-400">{res.table?.name ?? `Table #${res.table_id}`}</span>
                    </p>
                    <p className="text-sm text-gray-400">
                      {format(new Date(res.start_time), 'EEEE dd MMMM, HH:mm', { locale: fr })} →{' '}
                      {format(new Date(res.end_time), 'HH:mm', { locale: fr })}
                    </p>
                    {res.notes && <p className="text-xs text-gray-500 mt-0.5">{res.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(res.status)}
                  {res.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(res.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
