import { babyfootCards, currentUser } from '../features/home/data'
import { useNavigate } from 'react-router-dom'
import type { Player } from '../types'
import { BabyfootCard } from '../features/home/components/BabyfootCard'
import { HomeHeader } from '../features/home/components/HomeHeader'
import { HomeHero } from '../features/home/components/HomeHero'
import homeLogo from '../../assets/img/logo-home-ynov.png'
import { useHomeState } from '../features/home/useHomeState'

export default function Profile() {
    const navigate = useNavigate()
    const user: Player | null = currentUser
    const { isMenuOpen, closeMenu, toggleMenu } = useHomeState()

    return (
        <main className="min-h-screen bg-[#f3f4ef] text-slate-950">
            <div>
                <HomeHeader
                    currentUser={currentUser ? { name: currentUser.full_name, avatarUrl: currentUser.avatar_url } : null}
                    isMenuOpen={isMenuOpen}
                    logoSrc={homeLogo}
                    onCloseMenu={closeMenu}
                    onToggleMenu={toggleMenu}
                />
                <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

                    <h1 className="text-2xl font-black mb-8">Votre Profil</h1>

                    {/* Profile Card */}
                    <section className="rounded-[28px] bg-white p-6 shadow border border-black/5">
                        <div className="flex flex-col items-center text-center">

                            {/* Avatar */}
                            {user?.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.full_name}
                                    className="h-24 w-24 rounded-full object-cover shadow-sm"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center text-4xl font-black text-slate-700">
                                    {user?.full_name?.[0] ?? 'Y'}
                                </div>
                            )}

                            <p className="mt-4 text-xl font-black">
                                {user?.full_name ?? 'Invité'}
                            </p>

                            <p className="text-slate-500">
                                {user ? `@${user.username}` : '@non-connecté'}
                            </p>

                            <button
                                type="button"
                                className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow hover:scale-[1.02] transition-transform"
                            >
                                Modifier profil
                            </button>
                        </div>
                    </section>

                    {/* Stats */}
                    <section className="mt-6 rounded-[28px] bg-[#1ad7b0] p-6 shadow border border-black/5">
                        <h2 className="text-lg font-black mb-4">Statistiques</h2>

                        <div className="grid grid-cols-2 gap-4 text-slate-900 font-semibold">
                            <div>
                                <p className="text-sm text-slate-600">Mon Élo</p>
                                <p className="text-xl font-black">{user?.elo_rating ?? 0}</p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-600">Victoires</p>
                                <p className="text-xl font-black">{user?.wins ?? 0}</p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-600">Défaites</p>
                                <p className="text-xl font-black">{user?.losses ?? 0}</p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-600">Matchs nuls</p>
                                <p className="text-xl font-black">{user?.draws ?? 0}</p>
                            </div>
                        </div>
                    </section>

                    {/* Reservations */}
                    <section
                        className="mt-6 rounded-[28px] bg-[#1ad7b0] p-6 shadow border border-black/5 cursor-pointer hover:bg-emerald-300 transition-colors"
                        onClick={() => navigate('/reservations')}
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-lg font-black">Mes réservations</p>
                            <span className="text-xl font-black">→</span>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}