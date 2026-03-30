import { useEffect, useState } from 'react'
import { Trophy, TrendingUp } from 'lucide-react'
import { leaderboardApi } from '../../services/api'
import { LeaderboardEntry } from '../../types'

const medals = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    leaderboardApi.get().then((res) => {
      setEntries(res.data.leaderboard ?? [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <Trophy className="text-yellow-400" size={28} />
        <div>
          <h1 className="text-3xl font-bold text-white">Classement ELO</h1>
          <p className="text-gray-400 mt-1">Top 100 joueurs de l'Ynov Toulouse</p>
        </div>
      </div>

      {/* Top 3 podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[entries[1], entries[0], entries[2]].map((entry, i) => (
            <div
              key={entry.player.id}
              className={`card text-center ${i === 1 ? 'border-yellow-500/50 bg-yellow-500/5' : ''}`}
            >
              <div className="text-3xl mb-2">
                {i === 1 ? medals[0] : i === 0 ? medals[1] : medals[2]}
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-white">
                {entry.player.username[0].toUpperCase()}
              </div>
              <p className="font-semibold text-white">{entry.player.username}</p>
              <p className="text-gray-400 text-sm">{entry.player.full_name}</p>
              <div className="mt-3 space-y-1">
                <p className="text-lg font-bold text-green-400">{entry.player.elo_rating} ELO</p>
                <p className="text-xs text-gray-500">{entry.total_games} matchs</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full leaderboard table */}
      <div className="card overflow-hidden p-0">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <TrendingUp size={16} className="text-green-400" />
          <h2 className="font-semibold text-white">Classement général</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
                <th className="text-left px-4 py-3">Rang</th>
                <th className="text-left px-4 py-3">Joueur</th>
                <th className="text-right px-4 py-3">ELO</th>
                <th className="text-right px-4 py-3">V</th>
                <th className="text-right px-4 py-3">D</th>
                <th className="text-right px-4 py-3">N</th>
                <th className="text-right px-4 py-3">Buts</th>
                <th className="text-right px-4 py-3">Win%</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-8">
                    Aucun joueur inscrit pour l'instant
                  </td>
                </tr>
              ) : (
                entries.map((entry, idx) => (
                  <tr
                    key={entry.player.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-400">
                        {medals[idx] ?? `#${entry.rank}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {entry.player.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{entry.player.username}</p>
                          <p className="text-xs text-gray-500">{entry.player.full_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-400">
                      {entry.player.elo_rating}
                    </td>
                    <td className="px-4 py-3 text-right text-green-400">{entry.player.wins}</td>
                    <td className="px-4 py-3 text-right text-red-400">{entry.player.losses}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{entry.player.draws}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{entry.player.goals}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-gray-300">
                        {entry.win_rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
