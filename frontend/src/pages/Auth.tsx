import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Home, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'

type AuthMode = 'login' | 'register'

export default function Auth() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, login, register } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  })

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f4ef] px-4 text-slate-950">
        <div className="h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await login(loginForm)
      toast.success('Connexion réussie')
      navigate('/profile')
    } catch (error) {
      const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(message ?? 'Impossible de se connecter')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        email: registerForm.email,
        fullName: registerForm.fullName,
        password: registerForm.password,
        username: registerForm.username,
      })
      toast.success('Compte créé avec succès')
      navigate('/profile')
    } catch (error) {
      const message = (error as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(message ?? 'Impossible de créer le compte')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f4ef] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
        <section className="flex-1 rounded-[32px] bg-gradient-to-br from-emerald-500 via-emerald-400 to-lime-300 p-8 text-slate-950 shadow-[0_24px_60px_rgba(16,185,129,0.25)] sm:p-10">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-950/70">
              BabyConnect
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-950/10 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-900 transition-colors hover:bg-white"
            >
              <Home size={14} />
              Accueil
            </Link>
          </div>

          <h1 className="mt-10 max-w-lg text-4xl font-black leading-none tracking-tight sm:text-5xl">
            Connecte-toi pour accéder à ton profil BabyConnect.
          </h1>
          <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-slate-900/75 sm:text-base">
            Crée un compte pour suivre tes statistiques, retrouver ton espace personnel
            et accéder aux fonctionnalités réservées aux joueurs inscrits.
          </p>
        </section>

        <section className="w-full max-w-xl rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_22px_50px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`rounded-2xl px-4 py-3 text-sm font-black transition-colors ${
                mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`rounded-2xl px-4 py-3 text-sm font-black transition-colors ${
                mode === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'
              }`}
            >
              Inscription
            </button>
          </div>

          {mode === 'login' ? (
            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-emerald-400 focus:bg-white"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-600">
                  Mot de passe
                </label>
                <input
                  type="password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-emerald-400 focus:bg-white"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, password: event.target.value }))
                  }
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogIn size={16} />
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleRegister}>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-600">
                  Nom complet
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-emerald-400 focus:bg-white"
                  value={registerForm.fullName}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, fullName: event.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-600">
                  Pseudo
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-emerald-400 focus:bg-white"
                  value={registerForm.username}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, username: event.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-emerald-400 focus:bg-white"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-emerald-400 focus:bg-white"
                    value={registerForm.password}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, password: event.target.value }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-600">
                    Confirmation
                  </label>
                  <input
                    type="password"
                    minLength={6}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-emerald-400 focus:bg-white"
                    value={registerForm.confirmPassword}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus size={16} />
                {isSubmitting ? 'Création...' : 'Créer mon compte'}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}
