import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tournamentsApi, playersApi } from '../services/api'
import { Tournament, Player } from '../types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  Trophy, Users, Plus, ChevronRight, X, Target,
  Calendar, Crown, Swords, ChevronLeft, CheckCircle
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────
type TournamentParticipant = {
  id: number
  player_id: number
  player?: Player
  tournament_id: number
}

type TournamentDetails = {
  tournament: Tournament
  participants: TournamentParticipant[]
}

// ─── Status config ─────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
  open:        { label: 'Inscriptions ouvertes', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200',  dot: 'bg-emerald-500' },
  in_progress: { label: 'En cours',              cls: 'bg-amber-50 text-amber-700 border border-amber-200',        dot: 'bg-amber-500' },
  finished:    { label: 'Terminé',               cls: 'bg-slate-100 text-slate-500 border border-slate-200',       dot: 'bg-slate-400' },
}

// ─── Bracket component ─────────────────────────────────────────────────────────
function BracketView({ participants }: { participants: TournamentParticipant[] }) {
  if (participants.length < 2) {
    return (
      <div className="text-center py-10 text-slate-400">
        <Swords size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">Le tableau sera généré quand il y aura assez de participants</p>
      </div>
    )
  }

  // Build simple bracket pairs
  const pairs: Array<[TournamentParticipant, TournamentParticipant | null]> = []
  for (let i = 0; i < participants.length; i += 2) {
    pairs.push([participants[i], participants[i + 1] ?? null])
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Tour 1 — {pairs.length} matchs
      </p>
      {pairs.map((pair, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <span className="text-xs text-slate-400 w-5 text-right">{idx + 1}</span>
          <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center px-4 py-2.5 border-b border-slate-100">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 mr-2">
                {pair[0].player?.username?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-sm font-medium text-slate-800">
                {pair[0].player?.username ?? `Joueur #${pair[0].player_id}`}
              </span>
              <span className="ml-auto text-xs text-slate-400">{pair[0].player?.elo_rating ?? '—'} ELO</span>
            </div>
            <div className="flex items-center px-4 py-2.5">
              {pair[1] ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 mr-2">
                    {pair[1].player?.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="text-sm font-medium text-slate-800">
                    {pair[1].player?.username ?? `Joueur #${pair[1].player_id}`}
                  </span>
                  <span className="ml-auto text-xs text-slate-400">{pair[1].player?.elo_rating ?? '—'} ELO</span>
                </>
              ) : (
                <span className="text-sm text-slate-400 italic">Bye — qualifié automatiquement</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function TournamentsHome() {
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<TournamentDetails | null>(null)
  const [detailTab, setDetailTab] = useState<'participants' | 'bracket'>('participants')
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Join state
  const [joinTournamentId, setJoinTournamentId] = useState<number | null>(null)
  const [joinPlayerId, setJoinPlayerId] = useState('')

  // Create form
  const [form, setForm] = useState({ name: '', description: '', max_players: '16' })
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    Promise.all([tournamentsApi.getAll(), playersApi.getAll()])
      .then(([tRes, pRes]) => {
        setTournaments(tRes.data.tournaments ?? [])
        setPlayers(pRes.data.players ?? [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openDetail = async (tournament: Tournament) => {
    setLoadingDetail(true)
    try {
      const res = await tournamentsApi.getById(tournament.id)
      setSelectedTournament(res.data)
      setDetailTab('participants')
    } catch {
      toast.error('Erreur lors du chargement du tournoi')
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await tournamentsApi.create({
        name: form.name,
        description: form.description,
        max_players: Number(form.max_players),
      })
      toast.success('Tournoi créé !')
      setShowCreate(false)
      setForm({ name: '', description: '', max_players: '16' })
      load() // Refresh data after creating
    } catch {
      toast.error('Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoin = async (tournamentId: number) => {
    if (!joinPlayerId) return
    try {
      await tournamentsApi.join(tournamentId, Number(joinPlayerId))
      toast.success('Inscrit au tournoi !')
      setJoinTournamentId(null)
      setJoinPlayerId('')
      load()
      // Refresh detail if open
      if (selectedTournament?.tournament.id === tournamentId) {
        openDetail(selectedTournament.tournament)
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? "Erreur lors de l'inscription")
    }
  }

  const openTournaments = tournaments.filter(t => t.status === 'open')
  const activeTournaments = tournaments.filter(t => t.status === 'in_progress')
  const pastTournaments = tournaments.filter(t => t.status === 'finished')

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f3f4ef] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f3f4ef] text-slate-950 pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="pt-8 pb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={18} className="text-slate-600" />
            </button>
            <div>
              <p className="text-xs font-bold tracking-widest text-emerald-600 uppercase mb-1">BabyConnect</p>
              <h1 className="text-4xl font-black text-slate-900 leading-tight">Tournois</h1>
              <p className="text-slate-500 mt-1 text-sm">Inscris-toi et affronte les meilleurs joueurs du campus.</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors mt-2"
          >
            <Plus size={15} />
            Créer un tournoi
          </button>
        </div>

        {/* ── Stats strip ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Tournois ouverts',  value: openTournaments.length,   icon: Target,   color: 'text-emerald-600' },
            { label: 'En cours',          value: activeTournaments.length, icon: Swords,   color: 'text-amber-600' },
            { label: 'Terminés',          value: pastTournaments.length,   icon: Trophy,   color: 'text-slate-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex items-center gap-3">
              <Icon size={20} className={color} />
              <div>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── No tournaments ──────────────────────────────────────────────────── */}
        {tournaments.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
            <Trophy size={48} className="mx-auto mb-4 text-slate-200" />
            <p className="font-bold text-slate-700 text-lg">Aucun tournoi pour l'instant</p>
            <p className="text-slate-400 text-sm mt-1 mb-5">Sois le premier à en créer un !</p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-colors"
            >
              Créer le premier tournoi
            </button>
          </div>
        )}

        {/* ── Open tournaments ────────────────────────────────────────────────── */}
        {openTournaments.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
              Inscriptions ouvertes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openTournaments.map(t => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  players={players}
                  joinTournamentId={joinTournamentId}
                  joinPlayerId={joinPlayerId}
                  onJoinStart={(id) => { setJoinTournamentId(id); setJoinPlayerId('') }}
                  onJoinCancel={() => setJoinTournamentId(null)}
                  onJoinPlayerChange={setJoinPlayerId}
                  onJoinConfirm={handleJoin}
                  onViewDetail={openDetail}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Active tournaments ──────────────────────────────────────────────── */}
        {activeTournaments.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
              En cours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTournaments.map(t => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  players={players}
                  joinTournamentId={joinTournamentId}
                  joinPlayerId={joinPlayerId}
                  onJoinStart={(id) => { setJoinTournamentId(id); setJoinPlayerId('') }}
                  onJoinCancel={() => setJoinTournamentId(null)}
                  onJoinPlayerChange={setJoinPlayerId}
                  onJoinConfirm={handleJoin}
                  onViewDetail={openDetail}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Past tournaments ────────────────────────────────────────────────── */}
        {pastTournaments.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
              Terminés
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastTournaments.map(t => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  players={players}
                  joinTournamentId={joinTournamentId}
                  joinPlayerId={joinPlayerId}
                  onJoinStart={(id) => { setJoinTournamentId(id); setJoinPlayerId('') }}
                  onJoinCancel={() => setJoinTournamentId(null)}
                  onJoinPlayerChange={setJoinPlayerId}
                  onJoinConfirm={handleJoin}
                  onViewDetail={openDetail}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Create modal ─────────────────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Nouveau</p>
                <h2 className="text-xl font-black text-slate-900">Créer un tournoi</h2>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X size={16} className="text-slate-600" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom du tournoi</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Champions League Ynov..."
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none h-20"
                  placeholder="Décris les règles, le format..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nombre max de joueurs
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['4', '8', '16', '32'].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, max_players: n })}
                      className={`py-2 rounded-xl text-sm font-semibold border transition-colors ${
                        form.max_players === n
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-slate-900 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><CheckCircle size={15} /> Créer le tournoi</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Detail modal ─────────────────────────────────────────────────────── */}
      {selectedTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${statusConfig[selectedTournament.tournament.status]?.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[selectedTournament.tournament.status]?.dot}`} />
                    {statusConfig[selectedTournament.tournament.status]?.label}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900">{selectedTournament.tournament.name}</h2>
                {selectedTournament.tournament.description && (
                  <p className="text-sm text-slate-500 mt-0.5">{selectedTournament.tournament.description}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedTournament(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0 ml-4"
              >
                <X size={16} className="text-slate-600" />
              </button>
            </div>

            {/* Stats row */}
            <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-6 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Users size={14} className="text-emerald-500" />
                <span className="font-semibold">{selectedTournament.participants.length}</span>
                <span className="text-slate-400">/ {selectedTournament.tournament.max_players} joueurs</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Calendar size={14} className="text-slate-400" />
                {/* Correction pour created_at dans le modal de détail */}
                <span>
                  {selectedTournament.tournament.created_at ?
                    format(new Date(selectedTournament.tournament.created_at), 'dd MMM yyyy', { locale: fr }) : '—'}
                </span>
              </div>
              {selectedTournament.tournament.winner && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Crown size={14} className="text-amber-500" />
                  <span className="font-semibold text-amber-700">{selectedTournament.tournament.winner.username}</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="px-6 py-2 flex-shrink-0">
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (selectedTournament.participants.length / selectedTournament.tournament.max_players) * 100)}%` }}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 flex gap-1 flex-shrink-0">
              {(['participants', 'bracket'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                    detailTab === tab
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {tab === 'participants' ? `Participants (${selectedTournament.participants.length})` : 'Bracket'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {detailTab === 'participants' ? (
                <div className="space-y-2">
                  {selectedTournament.participants.length === 0 ? (
                    <div className="text-center py-10">
                      <Users size={32} className="mx-auto mb-2 text-slate-200" />
                      <p className="text-slate-400 text-sm">Aucun participant pour l'instant</p>
                    </div>
                  ) : (
                    selectedTournament.participants.map((p, idx) => (
                      <div key={p.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                        <span className="text-xs font-bold text-slate-400 w-5">#{idx + 1}</span>
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                          {p.player?.username?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            {p.player?.username ?? `Joueur #${p.player_id}`}
                          </p>
                          <p className="text-xs text-slate-400">{p.player?.full_name}</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {p.player?.elo_rating ?? '—'} ELO
                        </span>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <BracketView participants={selectedTournament.participants} />
              )}
            </div>
          </div>
        </div>
      )}

      {loadingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </main>
  )
}

// ─── Tournament card ───────────────────────────────────────────────────────────
function TournamentCard({
  tournament,
  players,
  joinTournamentId,
  joinPlayerId,
  onJoinStart,
  onJoinCancel,
  onJoinPlayerChange,
  onJoinConfirm,
  onViewDetail,
}: {
  tournament: Tournament
  players: Player[]
  joinTournamentId: number | null
  joinPlayerId: string
  onJoinStart: (id: number) => void
  onJoinCancel: () => void
  onJoinPlayerChange: (id: string) => void
  onJoinConfirm: (id: number) => void
  onViewDetail: (t: Tournament) => void
}) {
  const status = statusConfig[tournament.status] ?? statusConfig.open
  const fillPct = Math.min(100, ((tournament.participant_count ?? 0) / tournament.max_players) * 100)
  const isFull = (tournament.participant_count ?? 0) >= tournament.max_players

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4 hover:border-emerald-300 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${status.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          <h3 className="font-black text-slate-900 text-lg leading-tight truncate">{tournament.name}</h3>
          {tournament.description && (
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{tournament.description}</p>
          )}
        </div>
        {tournament.status === 'finished' && tournament.winner && (
          <div className="flex-shrink-0 flex flex-col items-center bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <Crown size={16} className="text-amber-500 mb-0.5" />
            <span className="text-xs font-bold text-amber-700">{tournament.winner.username}</span>
          </div>
        )}
      </div>

      {/* Players + progress */}
      <div>
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="flex items-center gap-1 text-slate-500">
            <Users size={13} />
            {tournament.participant_count ?? 0} / {tournament.max_players} joueurs
          </span>
          {/* Correction pour created_at dans TournamentCard */}
          <span className="text-xs text-slate-400">
            {tournament.created_at ? format(new Date(tournament.created_at), 'dd MMM yyyy', { locale: fr }) : '—'}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-emerald-500'}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
        {isFull && tournament.status === 'open' && (
          <p className="text-xs text-red-500 mt-1">Tournoi complet</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onViewDetail(tournament)}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
        >
          <Trophy size={14} />
          Voir
          <ChevronRight size={13} />
        </button>

        {tournament.status === 'open' && !isFull && (
          <>
            {joinTournamentId === tournament.id ? (
              <div className="flex-1 flex gap-2">
                <select
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={joinPlayerId}
                  onChange={e => onJoinPlayerChange(e.target.value)}
                >
                  <option value="">Choisir un joueur...</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.username}</option>
                  ))}
                </select>
                <button
                  onClick={() => onJoinConfirm(tournament.id)}
                  disabled={!joinPlayerId}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
                >
                  OK
                </button>
                <button
                  onClick={onJoinCancel}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm px-2 py-2 rounded-xl transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onJoinStart(tournament.id)}
                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-xl transition-colors"
              >
                <Plus size={14} />
                S'inscrire
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
