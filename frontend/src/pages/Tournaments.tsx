import { useEffect, useState } from 'react'
import { Target, Plus, Users } from 'lucide-react'
import { tournamentsApi, playersApi } from '../services/api'
import { Tournament, Player } from '../types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', description: '', max_players: '16' })
  const [joinForm, setJoinForm] = useState<{ tournamentId: number | null; playerId: string }>({
    tournamentId: null,
    playerId: '',
  })

  const load = () => {
    Promise.all([tournamentsApi.getAll(), playersApi.getAll()]).then(([tRes, pRes]) => {
      setTournaments(tRes.data.tournaments ?? [])
      setPlayers(pRes.data.players ?? [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await tournamentsApi.create({
        name: form.name,
        description: form.description,
        max_players: Number(form.max_players),
      })
      toast.success('Tournoi créé !')
      setShowForm(false)
      setForm({ name: '', description: '', max_players: '16' })
      load()
    } catch {
      toast.error('Erreur lors de la création du tournoi')
    }
  }

  const handleJoin = async (tournamentId: number) => {
    if (!joinForm.playerId) return
    try {
      await tournamentsApi.join(tournamentId, Number(joinForm.playerId))
      toast.success('Inscrit au tournoi !')
      setJoinForm({ tournamentId: null, playerId: '' })
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Erreur lors de l\'inscription')
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      open: { cls: 'badge-green', label: 'Inscriptions ouvertes' },
      in_progress: { cls: 'badge-yellow', label: 'En cours' },
      finished: { cls: 'badge-blue', label: 'Terminé' },
    }
    const s = map[status] ?? { cls: 'badge-yellow', label: status }
    return <span className={s.cls}>{s.label}</span>
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
          <Target className="text-green-400" size={28} />
          <div>
            <h1 className="text-3xl font-bold text-white">Tournois</h1>
            <p className="text-gray-400 mt-1">Organisez et participez aux compétitions</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Créer un tournoi
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Nouveau tournoi</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom du tournoi</label>
              <input type="text" className="input" placeholder="Tournoi printemps 2026..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre max de joueurs</label>
              <input type="number" className="input" min="2" max="64"
                value={form.max_players}
                onChange={(e) => setForm({ ...form, max_players: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea className="input h-20 resize-none" placeholder="Description du tournoi..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Créer</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tournament cards */}
      {tournaments.length === 0 ? (
        <div className="card text-center py-12">
          <Target size={48} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">Aucun tournoi pour l'instant</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
            Créer le premier tournoi
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                  {tournament.description && (
                    <p className="text-gray-400 text-sm mt-1">{tournament.description}</p>
                  )}
                </div>
                {statusBadge(tournament.status)}
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {tournament.participant_count ?? 0} / {tournament.max_players} joueurs
                </span>
                <span>
                  Créé le {format(new Date(tournament.created_at), 'dd MMM yyyy', { locale: fr })}
                </span>
                {tournament.winner && (
                  <span className="text-yellow-400 flex items-center gap-1">
                    🏆 Vainqueur: {tournament.winner.username}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, ((tournament.participant_count ?? 0) / tournament.max_players) * 100)}%`
                  }}
                />
              </div>

              {tournament.status === 'open' && (
                <div className="flex items-center gap-3">
                  {joinForm.tournamentId === tournament.id ? (
                    <>
                      <select
                        className="input flex-1"
                        value={joinForm.playerId}
                        onChange={(e) => setJoinForm({ ...joinForm, playerId: e.target.value })}
                      >
                        <option value="">Choisir un joueur...</option>
                        {players.map((p) => (
                          <option key={p.id} value={p.id}>{p.username} — {p.full_name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleJoin(tournament.id)}
                        className="btn-primary"
                        disabled={!joinForm.playerId}
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setJoinForm({ tournamentId: null, playerId: '' })}
                        className="btn-secondary"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setJoinForm({ tournamentId: tournament.id, playerId: '' })}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Plus size={14} />
                      S'inscrire
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
