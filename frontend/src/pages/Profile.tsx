import { useNavigate } from 'react-router-dom'
import { HomeHeader } from '../features/home/components/HomeHeader'
import homeLogo from '../../assets/img/logo-home-ynov.png'
import { useHomeState } from '../features/home/useHomeState'
import { useAuth } from '../features/auth/useAuth'

export default function Profile() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { isMenuOpen, closeMenu, toggleMenu } = useHomeState()

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-[#f3f4ef] text-slate-950">
      <div>
        <HomeHeader
          isMenuOpen={isMenuOpen}
          logoSrc={homeLogo}
          onCloseMenu={closeMenu}
          onToggleMenu={toggleMenu}
        />
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-2xl font-black">Votre Profil</h1>

          <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 text-4xl font-black text-slate-700">
                {user.fullName[0].toUpperCase()}
              </div>

              <p className="mt-4 text-xl font-black">{user.fullName}</p>
              <p className="text-slate-500">@{user.username}</p>
              <p className="mt-1 text-sm text-slate-400">{user.email}</p>

              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow transition-transform hover:scale-[1.02]"
              >
                Se déconnecter
              </button>
            </div>
          </section>

          <section className="mt-6 rounded-[28px] border border-black/5 bg-[#1ad7b0] p-6 shadow">
            <h2 className="mb-4 text-lg font-black">Statistiques</h2>

            <div className="grid grid-cols-2 gap-4 font-semibold text-slate-900">
              <div>
                <p className="text-sm text-slate-600">Mon Élo</p>
                <p className="text-xl font-black">{user.eloRating}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600">Victoires</p>
                <p className="text-xl font-black">{user.wins}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600">Défaites</p>
                <p className="text-xl font-black">{user.losses}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600">Matchs nuls</p>
                <p className="text-xl font-black">{user.draws}</p>
              </div>
            </div>
          </section>

          <section
            className="mt-6 cursor-pointer rounded-[28px] border border-black/5 bg-white p-6 shadow transition-colors hover:bg-slate-50"
            onClick={() => navigate('/')}
          >
            <div className="flex items-center justify-between">
              <p className="text-lg font-black">Retourner à l&apos;accueil</p>
              <span className="text-xl font-black">→</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
