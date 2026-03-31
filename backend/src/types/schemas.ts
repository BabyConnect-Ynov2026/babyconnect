import { z } from "zod";

// Auth / Player
export const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Match
export const createMatchSchema = z.object({
  tableId: z.number().int().positive(),
  redTeamId1: z.number().int().positive(),
  blueTeamId1: z.number().int().positive(),
  tournamentId: z.number().int().positive().optional(),
});

export const updateScoreSchema = z.object({
  redScore: z.number().int().min(0),
  blueScore: z.number().int().min(0),
});

// Reservation
export const createReservationSchema = z.object({
  playerId: z.number().int().positive(),
  tableId: z.number().int().positive(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().optional(),
});

// Tournament
export const createTournamentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  maxPlayers: z.number().int().positive().optional(),
});

export const joinTournamentSchema = z.object({
  playerId: z.number().int().positive(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type UpdateScoreInput = z.infer<typeof updateScoreSchema>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type JoinTournamentInput = z.infer<typeof joinTournamentSchema>;
