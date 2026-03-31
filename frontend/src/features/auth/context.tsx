import { createContext, useEffect, useState, type PropsWithChildren } from 'react'
import { authApi } from '../../services/api'
import {
  clearStoredAuthSession,
  getStoredAuthSession,
  persistAuthSession,
} from './storage'
import type {
  AuthSession,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from './types'

type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  user: AuthUser | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  register: (credentials: RegisterCredentials) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredAuthSession())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedSession = getStoredAuthSession()

    if (!storedSession) {
      setIsLoading(false)
      return
    }

    setSession(storedSession)

    authApi.getMe()
      .then((response) => {
        const nextSession = {
          token: storedSession.token,
          user: response.data.player,
        }

        persistAuthSession(nextSession)
        setSession(nextSession)
      })
      .catch(() => {
        clearStoredAuthSession()
        setSession(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials)
    const nextSession = {
      token: response.data.token,
      user: response.data.player,
    }

    persistAuthSession(nextSession)
    setSession(nextSession)
  }

  const register = async (credentials: RegisterCredentials) => {
    const response = await authApi.register(credentials)
    const nextSession = {
      token: response.data.token,
      user: response.data.player,
    }

    persistAuthSession(nextSession)
    setSession(nextSession)
  }

  const logout = () => {
    clearStoredAuthSession()
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: session !== null,
        isLoading,
        login,
        logout,
        register,
        token: session?.token ?? null,
        user: session?.user ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
