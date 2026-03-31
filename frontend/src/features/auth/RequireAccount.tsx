import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './useAuth'

export function RequireAccount({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f4ef] px-4 text-slate-950">
        <div className="h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f3f4ef] px-4 py-12 text-slate-950">
        <div className="mx-auto max-w-xl rounded-[32px] border border-black/5 bg-white p-8 text-center shadow-[0_22px_50px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-600">
            Accès protégé
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950">
            Le profil est réservé aux comptes inscrits.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Connecte-toi ou crée ton compte pour accéder à ton espace personnel.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/auth"
              className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-emerald-600"
            >
              Connexion / Inscription
            </Link>
            <Link
              to="/"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
