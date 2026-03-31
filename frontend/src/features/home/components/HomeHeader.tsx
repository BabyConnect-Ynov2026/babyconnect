import { ChevronRight, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CurrentUser } from '../types'

type HomeHeaderProps = {
  currentUser: CurrentUser | null
  isMenuOpen: boolean
  logoSrc: string
  onCloseMenu: () => void
  onToggleMenu: () => void
}

export function HomeHeader({
  currentUser,
  isMenuOpen,
  logoSrc,
  onCloseMenu,
  onToggleMenu,
}: HomeHeaderProps) {
  return (
    <header className="sticky top-0 z-20 -mx-4 border-b border-black/5 bg-white/95 px-4 pb-3 pt-4 backdrop-blur sm:-mx-6 sm:px-6 lg:top-4 lg:mx-0 lg:rounded-[32px] lg:border lg:bg-white/90 lg:px-6 lg:pb-4 lg:pt-5 lg:shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <img
          src={logoSrc}
          alt="Ynov Campus"
          className="h-11 w-auto rounded-xl object-contain sm:h-12"
        />

        <div className="flex items-center gap-3">
          {currentUser ? (
            <Link to="/profile">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="h-11 w-11 rounded-full border border-emerald-100 object-cover shadow-sm"
              />
            </Link>
          ) : (
            <Link
              to="/profile"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-base font-black text-white shadow-[0_10px_30px_rgba(16,185,129,0.35)]"
            >
              Y
            </Link>
          )}

          <button
            type="button"
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={onToggleMenu}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-transform hover:scale-[1.03]"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-300 lg:absolute lg:right-4 lg:top-[calc(100%+0.75rem)] lg:w-72 ${isMenuOpen ? 'max-h-40 pt-3 lg:max-h-56 lg:pt-0' : 'max-h-0 lg:max-h-0'}`}>
        <nav className="rounded-3xl border border-emerald-100 bg-[#f8fffc] p-2 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <Link
            to="/"
            onClick={onCloseMenu}
            className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-white"
          >
            Accueil
            <ChevronRight size={16} />
          </Link>
          <Link
            to="/profile"
            onClick={onCloseMenu}
            className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-white"
          >
            Profil
            <ChevronRight size={16} />
          </Link>
        </nav>
      </div>
    </header>
  )
}
