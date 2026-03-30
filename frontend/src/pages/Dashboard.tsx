import { useEffect, useState } from 'react'
import { Users, Swords, Trophy, Activity } from 'lucide-react'
import { leaderboardApi, matchesApi } from '../services/api'
import { GlobalStats, Match } from '../types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function Dashboard() {
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [recentMatches, setRecentMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      leaderboardApi.getStats(),
      matchesApi.getAll(),
    ]).then(([statsRes, matchesRes]) => {
      setStats(statsRes.data)
      setRecentMatches(matchesRes.data.matches?.slice(0, 5) ?? [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    { label: 'Joueurs inscrits', value: stats?.total_players ?? 0, icon: Users, color: 'text-blue-400' },
    { label: 'Matchs joués', value: stats?.total_matches ?? 0, icon: Swords, color: 'text-green-400' },
    { label: 'Matchs en cours', value: stats?.ongoing_matches ?? 0, icon: Activity, color: 'text-yellow-400' },
    { label: 'Top scorer', value: stats?.top_scorer?.username ?? '—', icon: Trophy, color: 'text-orange-400' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Bienvenue sur BabyConnect — Babyfoot Ynov Toulouse</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">{label}</span>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent matches */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Derniers matchs</h2>
        {recentMatches.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun match joué pour l'instant</p>
        ) : (
          <div className="space-y-3">
            {recentMatches.map((match) => (
              <div key={match.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-red-400">
                      {match.red_player_1?.username ?? `#${match.red_team_id_1}`}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white text-lg">
                      {match.red_score} - {match.blue_score}
                    </p>
                    <span className={`text-xs ${
                      match.status === 'ongoing' ? 'text-yellow-400' :
                      match.status === 'completed' ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {match.status === 'ongoing' ? 'En cours' :
                       match.status === 'completed' ? 'Terminé' : 'En attente'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-blue-400">
                      {match.blue_player_1?.username ?? `#${match.blue_team_id_1}`}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {format(new Date(match.created_at), 'dd MMM HH:mm', { locale: fr })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
