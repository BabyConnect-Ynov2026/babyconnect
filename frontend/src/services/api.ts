import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

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
