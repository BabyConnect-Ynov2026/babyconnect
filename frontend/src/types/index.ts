export interface Player {
  id: number
  username: string
  email: string
  full_name: string
  avatar_url?: string
  elo_rating: number
  wins: number
  losses: number
  draws: number
  goals: number
  created_at: string
}

export interface Table {
  id: number
  name: string
  location: string
  available: boolean
}

export type MatchStatus = 'pending' | 'ongoing' | 'completed'

export interface Match {
  id: number
  table_id: number
  table?: Table
  red_team_id_1: number
  red_player_1?: Player
  red_team_id_2?: number
  red_player_2?: Player
  blue_team_id_1: number
  blue_player_1?: Player
  blue_team_id_2?: number
  blue_player_2?: Player
  red_score: number
  blue_score: number
  status: MatchStatus
  duration_seconds: number
  started_at?: string
  finished_at?: string
  created_at: string
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Reservation {
  id: number
  player_id: number
  player?: Player
  table_id: number
  table?: Table
  start_time: string
  end_time: string
  status: ReservationStatus
  notes?: string
  created_at: string
}

export type TournamentStatus = 'open' | 'in_progress' | 'finished'

export interface Tournament {
  id: number
  name: string
  description: string
  max_players: number
  status: TournamentStatus
  start_date?: string
  end_date?: string
  winner_id?: number
  winner?: Player
  participant_count?: number
  created_at: string
}

export interface LeaderboardEntry {
  rank: number
  player: Player
  win_rate: number
  total_games: number
}

export interface GlobalStats {
  total_players: number
  total_matches: number
  ongoing_matches: number
  top_scorer?: Player
  most_active?: Player
}
