import { useEffect, useState } from 'react'
import { Swords, Plus, CheckCircle } from 'lucide-react'
import { matchesApi, tablesApi, playersApi } from '../../services/api'
import { Match, Table, Player } from '../../types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState<Record<number, { red: number; blue: number }>>({})
  const [form, setForm] = useState({
    table_id: '',
    red_team_id_1: '',
    blue_team_id_1: '',
  })

  const load = () => {
    Promise.all([
      matchesApi.getAll(),
      tablesApi.getAll(),
      playersApi.getAll(),
    ]).then(([matchRes, tableRes, playerRes]) => {
      setMatches(matchRes.data.matches ?? [])
      setTables(tableRes.data.tables ?? [])
      setPlayers(playerRes.data.players ?? [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await matchesApi.create({
        table_id: Number(form.table_id),
        red_team_id_1: Number(form.red_team_id_1),
        blue_team_id_1: Number(form.blue_team_id_1),
      })
      toast.success('Match lancé !')
      setShowForm(false)
      setForm({ table_id: '', red_team_id_1: '', blue_team_id_1: '' })
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Erreur lors de la création du match')
    }
  }

  const handleUpdateScore = async (matchId: number) => {
    const s = scores[matchId]
    if (!s) return
    try {
      await matchesApi.updateScore(matchId, s.red, s.blue)
      toast.success('Score mis à jour')
      load()
    } catch {
      toast.error('Erreur mise à jour du score')
    }
  }

  const handleFinish = async (matchId: number) => {
    try {
      await matchesApi.finish(matchId)
      toast.success('Match terminé ! ELO mis à jour.')
      load()
    } catch {
      toast.error('Erreur lors de la fin du match')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const ongoingMatches = matches.filter((m) => m.status === 'ongoing')
  const finishedMatches = matches.filter((m) => m.status === 'completed')

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Swords className="text-green-400" size={28} />
          <div>
            <h1 className="text-3xl font-bold text-white">Matchs</h1>
            <p className="text-gray-400 mt-1">Suivez et gérez les matchs en temps réel</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nouveau match
        </button>
      </div>

      {/* New match form */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Créer un match</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Table</label>
              <select className="input" value={form.table_id}
                onChange={(e) => setForm({ ...form, table_id: e.target.value })} required>
                <option value="">Choisir...</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Equipe Rouge</label>
              <select className="input" value={form.red_team_id_1}
                onChange={(e) => setForm({ ...form, red_team_id_1: e.target.value })} required>
                <option value="">Joueur rouge...</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>{p.username}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Equipe Bleue</label>
              <select className="input" value={form.blue_team_id_1}
                onChange={(e) => setForm({ ...form, blue_team_id_1: e.target.value })} required>
                <option value="">Joueur bleu...</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>{p.username}</option>
                ))}
              </select>
            </div>
            <div className="col-span-3 flex gap-3">
              <button type="submit" className="btn-primary">Lancer le match</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Ongoing matches */}
      {ongoingMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            En cours ({ongoingMatches.length})
          </h2>
          <div className="grid gap-4">
            {ongoingMatches.map((match) => {
              const s = scores[match.id] ?? { red: match.red_score, blue: match.blue_score }
              return (
                <div key={match.id} className="card border-yellow-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="text-center flex-1">
                        <p className="font-bold text-red-400 text-lg">
                          {match.red_player_1?.username ?? `#${match.red_team_id_1}`}
                        </p>
                        <input
                          type="number"
                          min={0}
                          className="input text-center text-2xl font-bold text-white w-20 mt-2"
                          value={s.red}
                          onChange={(e) => setScores({
                            ...scores,
                            [match.id]: { ...s, red: Number(e.target.value) }
                          })}
                        />
                      </div>
                      <div className="text-center text-gray-400 font-bold text-xl">VS</div>
                      <div className="text-center flex-1">
                        <p className="font-bold text-blue-400 text-lg">
                          {match.blue_player_1?.username ?? `#${match.blue_team_id_1}`}
                        </p>
                        <input
                          type="number"
                          min={0}
                          className="input text-center text-2xl font-bold text-white w-20 mt-2"
                          value={s.blue}
                          onChange={(e) => setScores({
                            ...scores,
                            [match.id]: { ...s, blue: Number(e.target.value) }
                          })}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-6">
                      <button
                        onClick={() => handleUpdateScore(match.id)}
                        className="btn-secondary text-sm"
                      >
                        Mettre à jour
                      </button>
                      <button
                        onClick={() => handleFinish(match.id)}
                        className="btn-primary text-sm flex items-center gap-1"
                      >
                        <CheckCircle size={14} />
                        Terminer
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Match history */}
      <div className="card overflow-hidden p-0">
        <div className="p-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Historique ({finishedMatches.length})</h2>
        </div>
        {finishedMatches.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Aucun match terminé</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {finishedMatches.map((match) => (
              <div key={match.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <span className={`font-medium w-28 text-right ${
                    match.red_score > match.blue_score ? 'text-white' : 'text-gray-500'
                  }`}>
                    {match.red_player_1?.username ?? `#${match.red_team_id_1}`}
                  </span>
                  <div className="text-center w-16">
                    <p className="font-bold text-white">
                      {match.red_score} - {match.blue_score}
                    </p>
                  </div>
                  <span className={`font-medium w-28 ${
                    match.blue_score > match.red_score ? 'text-white' : 'text-gray-500'
                  }`}>
                    {match.blue_player_1?.username ?? `#${match.blue_team_id_1}`}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {match.finished_at
                    ? format(new Date(match.finished_at), 'dd MMM yyyy HH:mm', { locale: fr })
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
