import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Trophy,
  Calendar,
  Swords,
  Users,
  Target,
} from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/leaderboard', icon: Trophy, label: 'Classement' },
  { href: '/admin/matches', icon: Swords, label: 'Matchs' },
  { href: '/admin/reservations', icon: Calendar, label: 'Réservations' },
  { href: '/admin/tournaments', icon: Target, label: 'Tournois' },
  { href: '/admin/players', icon: Users, label: 'Joueurs' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-black font-bold text-lg">
              B
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">BabyConnect</h1>
              <p className="text-xs text-gray-400">Ynov Toulouse 2026</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = location.pathname === href
            return (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-green-500/20 text-green-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">Challenge 48h — Ynov 2026</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  )
}
