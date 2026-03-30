const API_BASE_URL = '/api/v1'

type QueryValue = string | number | boolean | null | undefined

type RequestOptions = {
  body?: unknown
  headers?: Record<string, string>
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  params?: Record<string, QueryValue>
}

export type ApiResponse<T = unknown> = {
  data: T
}

type ApiErrorPayload = {
  error?: string
  message?: string
}

class ApiError extends Error {
  response: {
    data: ApiErrorPayload | null
    status: number
  }

  constructor(message: string, status: number, data: ApiErrorPayload | null) {
    super(message)
    this.name = 'ApiError'
    this.response = { data, status }
  }
}

const buildUrl = (path: string, params?: Record<string, QueryValue>) => {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }

  return `${url.pathname}${url.search}`
}

const parseJson = async (response: Response) => {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return null
  }

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

const request = async <T = unknown>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  const { body, headers, method = 'GET', params } = options
  const response = await fetch(buildUrl(path, params), {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const data = await parseJson(response)

  if (!response.ok) {
    const message = data?.error ?? data?.message ?? `HTTP ${response.status}`
    throw new ApiError(message, response.status, data)
  }

  return { data: data as T }
}

const api = {
  delete: <T = unknown>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
  get: <T = unknown>(path: string, options?: { params?: Record<string, QueryValue> }) =>
    request<T>(path, { method: 'GET', params: options?.params }),
  patch: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { body, method: 'PATCH' }),
  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { body, method: 'POST' }),
}

// Players
export const playersApi = {
  register: (data: { username: string; email: string; password: string; full_name: string }) =>
    api.post('/players/register', data),
  getAll: () => api.get('/players'),
  getById: (id: number) => api.get(`/players/${id}`),
  getStats: (id: number) => api.get(`/players/${id}/stats`),
}

// Matches
export const matchesApi = {
  create: (data: {
    table_id: number
    red_team_id_1: number
    red_team_id_2?: number
    blue_team_id_1: number
    blue_team_id_2?: number
  }) => api.post('/matches', data),
  getAll: () => api.get('/matches'),
  getById: (id: number) => api.get(`/matches/${id}`),
  updateScore: (id: number, red: number, blue: number) =>
    api.patch(`/matches/${id}/score`, { red_score: red, blue_score: blue }),
  finish: (id: number) => api.post(`/matches/${id}/finish`),
}

// Reservations
export const reservationsApi = {
  create: (data: {
    player_id: number
    table_id: number
    start_time: string
    end_time: string
    notes?: string
  }) => api.post('/reservations', data),
  getAll: (params?: { table_id?: number; player_id?: number }) =>
    api.get('/reservations', { params }),
  cancel: (id: number) => api.delete(`/reservations/${id}`),
}

// Tables
export const tablesApi = {
  getAll: () => api.get('/tables'),
}

// Tournaments
export const tournamentsApi = {
  create: (data: { name: string; description?: string; max_players?: number }) =>
    api.post('/tournaments', data),
  getAll: () => api.get('/tournaments'),
  getById: (id: number) => api.get(`/tournaments/${id}`),
  join: (tournamentId: number, playerId: number) =>
    api.post(`/tournaments/${tournamentId}/join`, { player_id: playerId }),
}

// Leaderboard & Stats
export const leaderboardApi = {
  get: () => api.get('/leaderboard'),
  getStats: () => api.get('/stats'),
}

export default api
