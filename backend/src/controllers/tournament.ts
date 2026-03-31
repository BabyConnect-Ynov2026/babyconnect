import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { createTournamentSchema, joinTournamentSchema } from "../types/schemas";

export async function createTournament(req: Request, res: Response): Promise<void> {
  const parsed = createTournamentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { name, description, maxPlayers } = parsed.data;

  try {
    const tournament = await prisma.tournament.create({
      data: {
        name,
        description: description ?? "",
        maxPlayers: maxPlayers ?? 16,
        status: "open",
      },
    });

    res.status(201).json({ tournament });
  } catch {
    res.status(500).json({ error: "Failed to create tournament" });
  }
}

export async function getTournaments(_req: Request, res: Response): Promise<void> {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        winner: { omit: { password: true } },
        _count: { select: { participants: true } },
      },
    });

    const result = tournaments.map((t) => {
      const { _count, ...rest } = t;
      return { ...rest, participant_count: _count.participants };
    });

    res.status(200).json({ tournaments: result, count: result.length });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getTournament(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params["id"] ?? "");
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        winner: { omit: { password: true } },
        matches: { include: { redPlayer1: { omit: { password: true } }, bluePlayer1: { omit: { password: true } } } },
      },
    });

    if (!tournament) {
      res.status(404).json({ error: "Tournament not found" });
      return;
    }

    const participants = await prisma.tournamentParticipant.findMany({
      where: { tournamentId: id },
      include: { player: { omit: { password: true } } },
    });

    res.status(200).json({ tournament, participants });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function joinTournament(req: Request, res: Response): Promise<void> {
  const tournamentId = parseInt(req.params["id"] ?? "");
  if (isNaN(tournamentId)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = joinTournamentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { playerId } = parsed.data;

  try {
    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) {
      res.status(404).json({ error: "Tournament not found" });
      return;
    }

    if (tournament.status !== "open") {
      res.status(400).json({ error: "Tournament is not open for registration" });
      return;
    }

    const count = await prisma.tournamentParticipant.count({ where: { tournamentId } });
    if (count >= tournament.maxPlayers) {
      res.status(409).json({ error: "Tournament is full" });
      return;
    }

    await prisma.tournamentParticipant.create({
      data: { tournamentId, playerId },
    });

    res.status(201).json({ message: "Successfully joined tournament" });
  } catch {
    res.status(409).json({ error: "Player already registered" });
  }
}
