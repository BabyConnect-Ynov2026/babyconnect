export type AuthUser = {
  id: number
  username: string
  email: string
  fullName: string
  eloRating: number
  wins: number
  losses: number
  draws: number
  goals: number
  createdAt: string
  updatedAt?: string
}

export type AuthSession = {
  token: string
  user: AuthUser
}

export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterCredentials = {
  username: string
  email: string
  password: string
  fullName: string
}
