import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { calculateElo } from "../lib/elo";
import { createMatchSchema, updateScoreSchema } from "../types/schemas";
import { Match, Player } from "@prisma/client";

const matchInclude = {
  redPlayer1: { omit: { password: true } },
  redPlayer2: { omit: { password: true } },
  bluePlayer1: { omit: { password: true } },
  bluePlayer2: { omit: { password: true } },
  table: true,
} as const;

export async function createMatch(req: Request, res: Response): Promise<void> {
  const parsed = createMatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { tableId, redTeamId1, redTeamId2, blueTeamId1, blueTeamId2, tournamentId } = parsed.data;

  try {
    const [match] = await prisma.$transaction([
      prisma.match.create({
        data: {
          tableId,
          redTeamId1,
          redTeamId2,
          blueTeamId1,
          blueTeamId2,
          tournamentId,
          status: "ongoing",
          startedAt: new Date(),
        },
        include: matchInclude,
      }),
      prisma.table.update({
        where: { id: tableId },
        data: { available: false },
      }),
    ]);

    res.status(201).json({ match });
  } catch {
    res.status(500).json({ error: "Failed to create match" });
  }
}

export async function getMatches(_req: Request, res: Response): Promise<void> {
  try {
    const matches = await prisma.match.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: matchInclude,
    });
    res.status(200).json({ matches, count: matches.length });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMatch(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params["id"] ?? "");
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const match = await prisma.match.findUnique({ where: { id }, include: matchInclude });
    if (!match) {
      res.status(404).json({ error: "Match not found" });
      return;
    }
    res.status(200).json({ match });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateScore(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params["id"] ?? "");
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = updateScoreSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) {
      res.status(404).json({ error: "Match not found" });
      return;
    }

    const updated = await prisma.match.update({
      where: { id },
      data: parsed.data,
      include: matchInclude,
    });

    res.status(200).json({ match: updated });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function finishMatch(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params["id"] ?? "");
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const match = await prisma.match.findUnique({
      where: { id },
      include: matchInclude,
    });

    if (!match) {
      res.status(404).json({ error: "Match not found" });
      return;
    }

    const now = new Date();
    const durationSeconds = match.startedAt
      ? Math.floor((now.getTime() - match.startedAt.getTime()) / 1000)
      : 0;

    const updated = await prisma.match.update({
      where: { id },
      data: { status: "completed", finishedAt: now, durationSeconds },
      include: matchInclude,
    });

    // Update player stats & ELO
    await updatePlayerStats(updated);

    // Free the table
    await prisma.table.update({
      where: { id: match.tableId },
      data: { available: true },
    });

    res.status(200).json({ match: updated });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

async function updatePlayerStats(
  match: Match
): Promise<void> {
  const redWon = match.redScore > match.blueScore;
  const draw = match.redScore === match.blueScore;

  const redScore = redWon ? 1.0 : draw ? 0.5 : 0.0;
  const blueScore = redWon ? 0.0 : draw ? 0.5 : 1.0;

  const red1 = await prisma.player.findUnique({ where: { id: match.redTeamId1 } });
  const blue1 = await prisma.player.findUnique({ where: { id: match.blueTeamId1 } });

  if (red1 && blue1) {
    const newRedElo = calculateElo(red1.eloRating, blue1.eloRating, redScore);
    const newBlueElo = calculateElo(blue1.eloRating, red1.eloRating, blueScore);

    await prisma.player.update({
      where: { id: red1.id },
      data: {
        eloRating: newRedElo,
        goals: red1.goals + match.redScore,
        wins: redWon ? red1.wins + 1 : red1.wins,
        draws: draw ? red1.draws + 1 : red1.draws,
        losses: !redWon && !draw ? red1.losses + 1 : red1.losses,
      },
    });

    await prisma.player.update({
      where: { id: blue1.id },
      data: {
        eloRating: newBlueElo,
        goals: blue1.goals + match.blueScore,
        wins: !redWon && !draw ? blue1.wins + 1 : blue1.wins,
        draws: draw ? blue1.draws + 1 : blue1.draws,
        losses: redWon ? blue1.losses + 1 : blue1.losses,
      },
    });
  }
}
