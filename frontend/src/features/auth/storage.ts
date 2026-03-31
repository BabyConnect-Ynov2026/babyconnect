import type { AuthSession } from './types'

const AUTH_STORAGE_KEY = 'babyconnect.auth'

function canUseStorage(): boolean {
  return typeof window !== 'undefined'
}

export function getStoredAuthSession(): AuthSession | null {
  if (!canUseStorage()) {
    return null
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>
    if (!parsed.token || !parsed.user) {
      return null
    }

    return parsed as AuthSession
  } catch {
    return null
  }
}

export function getStoredAuthToken(): string | null {
  return getStoredAuthSession()?.token ?? null
}

export function persistAuthSession(session: AuthSession): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredAuthSession(): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}
