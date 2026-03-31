import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { registerSchema, loginSchema } from "../types/schemas";

function winRate(wins: number, losses: number, draws: number): number {
  const total = wins + losses + draws;
  if (total === 0) return 0;
  return (wins / total) * 100;
}

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { username, email, password, fullName } = parsed.data;

  try {
    const hash = await bcrypt.hash(password, 10);
    const player = await prisma.player.create({
      data: { username, email, password: hash, fullName },
    });

    const { password: _pw, ...safePlayer } = player;
    res.status(201).json({ player: safePlayer });
  } catch {
    res.status(409).json({ error: "Username or email already exists" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const player = await prisma.player.findUnique({ where: { email } });
    if (!player) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, player.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const secret = process.env["JWT_SECRET"];
    if (!secret) {
      res.status(500).json({ error: "JWT secret not configured" });
      return;
    }

    const token = jwt.sign({ playerId: player.id }, secret, { expiresIn: "7d" });
    const { password: _pw, ...safePlayer } = player;
    res.status(200).json({ token, player: safePlayer });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getPlayers(_req: Request, res: Response): Promise<void> {
  try {
    const players = await prisma.player.findMany({
      orderBy: { eloRating: "desc" },
      omit: { password: true },
    });
    res.status(200).json({ players, count: players.length });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getPlayer(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params["id"] ?? "");
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const player = await prisma.player.findUnique({
      where: { id },
      omit: { password: true },
    });

    if (!player) {
      res.status(404).json({ error: "Player not found" });
      return;
    }

    res.status(200).json({ player });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getPlayerStats(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params["id"] ?? "");
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const player = await prisma.player.findUnique({
      where: { id },
      omit: { password: true },
    });

    if (!player) {
      res.status(404).json({ error: "Player not found" });
      return;
    }

    const recentMatches = await prisma.match.findMany({
      where: {
        OR: [
          { redTeamId1: id },
          { blueTeamId1: id },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        redPlayer1: { omit: { password: true } },
        bluePlayer1: { omit: { password: true } },
        table: true,
      },
    });

    res.status(200).json({
      player,
      win_rate: winRate(player.wins, player.losses, player.draws),
      recent_matches: recentMatches,
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}
