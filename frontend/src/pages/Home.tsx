import { useEffect, useState } from 'react'
import homeLogo from '../../assets/img/logo-home-ynov.png'
import { HomeHeader } from '../features/home/components/HomeHeader'
import { HomeHero } from '../features/home/components/HomeHero'
import { ScanNfcButton } from '../features/home/components/ScanNfcButton'
import { useHomeState } from '../features/home/useHomeState'
import { ReservationModal } from '../components/ReservationModal'
import { tablesApi } from '../services/api'
import { Table } from '../types'
import { MapPin, Clock, Users } from 'lucide-react'

// ─── Données enrichies par table (indexées par position dans la liste) ────────
// Remplace ces données par celles de ton API quand elles seront disponibles
const MOCK_DATA = [
  {
    name: 'Baby-foot Souk',
    location: 'Souk',
    occupancy: '2/4',
    status: 'occupied' as const,
    timeRemainingSeconds: 514,
    players: ['Corentin R. (Silver Rank)', 'Lucas M.'],
  },
  {
    name: 'Baby-foot Hall Principal',
    location: 'Campus',
    occupancy: '0/4',
    status: 'free' as const,
  },
  {
    name: 'Baby-foot Salle 104',
    location: 'Salle 104',
    occupancy: '4/4',
    status: 'occupied' as const,
    timeRemainingSeconds: 302,
    players: ['Théo B.', 'Mathis D.', 'Enzo P.', 'Nathan G.'],
  },
]

// ─── Hook compteur décroissant ────────────────────────────────────────────────
function useCountdown(initialSeconds?: number) {
  const [secs, setSecs] = useState<number>(initialSeconds ?? 0)

  useEffect(() => {
    if (!initialSeconds) return
    setSecs(initialSeconds)
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [initialSeconds])

  if (!initialSeconds) return null
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// ─── Carte individuelle ───────────────────────────────────────────────────────
type MockEntry = (typeof MOCK_DATA)[number]

function TableCard({
  table,
  mock,
  onReserve,
}: {
  table: Table
  mock: MockEntry
  onReserve: () => void
}) {
  const countdown = useCountdown(
    mock.status === 'occupied' ? mock.timeRemainingSeconds : undefined
  )
  const isFree = mock.status === 'free'

  return (
    <div
      className={`flex flex-col gap-3 p-5 rounded-2xl shadow-sm border border-black/5 ${
        isFree ? 'bg-gradient-to-br from-emerald-50 via-white to-white' : 'bg-white'
      }`}
    >
      {/* Nom + occupancy */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-xl font-black text-slate-900 leading-tight">{mock.name}</h3>
        <span className="text-sm font-black text-slate-500 whitespace-nowrap pt-0.5">
          {mock.occupancy}
        </span>
      </div>

      {/* Localisation */}
      <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
        <MapPin size={13} className="text-emerald-500" />
        {mock.location}
      </div>

      {/* Badge statut + label */}
      <div className="flex items-center gap-3">
        {isFree ? (
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
            Disponible
          </span>
        ) : (
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
            Occupé
          </span>
        )}
        <span className="text-sm text-slate-400 font-medium">
          {isFree ? 'Prêt pour la prochaine partie' : 'Partie en cours'}
        </span>
      </div>

      {/* Détails si occupé */}
      {mock.status === 'occupied' && (
        <div className="flex flex-col gap-1.5 mt-1">
          {countdown !== null && (
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Clock size={13} className="text-slate-400" />
              Reste {countdown}
            </div>
          )}
          {'players' in mock && mock.players && mock.players.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Users size={13} className="text-slate-400" />
              {mock.players.join(' · ')}
            </div>
          )}
        </div>
      )}

      {/* Spacer pour aligner le bouton en bas */}
      <div className="flex-grow" />

      {/* CTA */}
      <button
        onClick={onReserve}
        className="mt-2 w-full bg-emerald-500 text-white py-3 px-6 rounded-2xl text-sm font-black hover:bg-emerald-600 transition-all"
      >
        Réserver cette table
      </button>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Home() {
  const { closeMenu, isMenuOpen, toggleMenu } = useHomeState()
  const [tables, setTables] = useState<Table[]>([])
  const [reservingTable, setReservingTable] = useState<Table | null>(null)

  useEffect(() => {
    tablesApi.getAll().then((res) => {
      setTables(res.data.tables ?? [])
    })
  }, [])

  return (
    <main className="min-h-screen bg-[#f3f4ef] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-36 sm:px-6 lg:px-8">
        <HomeHeader
          currentUser={null}
          isMenuOpen={isMenuOpen}
          logoSrc={homeLogo}
          onCloseMenu={closeMenu}
          onToggleMenu={toggleMenu}
        />

        <HomeHero />

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tables.length === 0 ? (
            <p className="text-sm text-slate-400 col-span-3">Chargement des tables...</p>
          ) : (
            tables.map((table, index) => (
              <TableCard
                key={table.id}
                table={table}
                mock={MOCK_DATA[index % MOCK_DATA.length]}
                onReserve={() => setReservingTable(table)}
              />
            ))
          )}
        </section>
      </div>

      <ScanNfcButton />

      {reservingTable && (
        <ReservationModal
          table={reservingTable}
          onClose={() => setReservingTable(null)}
        />
      )}
    </main>
  )
}