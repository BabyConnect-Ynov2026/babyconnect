import { useEffect, useState } from 'react'
import { Users, Plus, Star } from 'lucide-react'
import { playersApi } from '../services/api'
import { Player } from '../types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
  })

  const load = () => {
    playersApi.getAll().then((res) => {
      setPlayers(res.data.players ?? [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await playersApi.register(form)
      toast.success(`${form.username} enregistré !`)
      setShowForm(false)
      setForm({ username: '', email: '', password: '', full_name: '' })
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Erreur lors de l\'inscription')
    }
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
          <Users className="text-green-400" size={28} />
          <div>
            <h1 className="text-3xl font-bold text-white">Joueurs</h1>
            <p className="text-gray-400 mt-1">{players.length} joueurs inscrits</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Inscrire un joueur
        </button>
      </div>

      {/* Register form */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Inscription joueur</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom complet</label>
              <input type="text" className="input" placeholder="Nicolas Gouy"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Pseudo</label>
              <input type="text" className="input" placeholder="ngouy"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="email" className="input" placeholder="nicolas@ynov.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Mot de passe <span className="text-gray-600">(6 caractères min.)</span>
              </label>
              <input type="password" className="input" placeholder="••••••"
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">Inscrire</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Players grid */}
      {players.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={48} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">Aucun joueur inscrit</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
            Inscrire le premier joueur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {players.map((player, idx) => (
            <div key={player.id} className="card hover:border-green-500/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {player.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white truncate">{player.username}</p>
                    {idx < 3 && <Star size={14} className="text-yellow-400 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-400 truncate">{player.full_name}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-800 rounded-lg p-2">
                  <p className="text-lg font-bold text-green-400">{player.elo_rating}</p>
                  <p className="text-xs text-gray-500">ELO</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-2">
                  <p className="text-lg font-bold text-white">{player.wins}W/{player.losses}L</p>
                  <p className="text-xs text-gray-500">Record</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-2">
                  <p className="text-lg font-bold text-yellow-400">{player.goals}</p>
                  <p className="text-xs text-gray-500">Buts</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-3">
                Inscrit le {format(new Date(player.created_at), 'dd MMM yyyy', { locale: fr })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
