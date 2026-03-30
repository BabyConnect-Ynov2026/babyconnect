import {Request, Response} from "express";
import prisma from "../lib/prisma";

export async function getLeaderboard(_req: Request, res: Response): Promise<void> {
    try {
        const players = await prisma.player.findMany({
            orderBy: {eloRating: "desc"},
            take: 100,
            omit: {password: true},
        });

        const leaderboard = players.map((p, i) => {
            const totalGames = p.wins + p.losses + p.draws;
            const winRate = totalGames === 0 ? 0 : (p.wins / totalGames) * 100;
            return {
                rank: i + 1,
                player: p,
                win_rate: winRate,
                total_games: totalGames,
            };
        });

        res.status(200).json({leaderboard});
    } catch {
        res.status(500).json({error: "Internal server error"});
    }
}

export async function getStats(_req: Request, res: Response): Promise<void> {
    try {
        const [totalPlayers, totalMatches, ongoingMatches, topScorer, mostActive] = await Promise.all([
            prisma.player.count(),
            prisma.match.count({where: {status: "completed"}}),
            prisma.match.count({where: {status: "ongoing"}}),
            prisma.player.findFirst({orderBy: {goals: "desc"}, omit: {password: true}}),
            prisma.player.findFirst({
                orderBy: [{wins: "desc"}, {losses: "desc"}, {draws: "desc"}],
                omit: {password: true},
            }),
        ]);

        res.status(200).json({
            total_players: totalPlayers,
            total_matches: totalMatches,
            ongoing_matches: ongoingMatches,
            top_scorer: topScorer,
            most_active: mostActive,
        });
    } catch {
        res.status(500).json({error: "Internal server error"});
    }
}
