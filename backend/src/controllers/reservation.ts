import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { createReservationSchema } from "../types/schemas";

const reservationInclude = {
  player: { omit: { password: true } },
  table: true,
} as const;

export async function createReservation(req: Request, res: Response): Promise<void> {
  const parsed = createReservationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { playerId, tableId, startTime: startRaw, endTime: endRaw, notes } = parsed.data;
  const startTime = new Date(startRaw);
  const endTime = new Date(endRaw);

  if (endTime <= startTime) {
    res.status(400).json({ error: "End time must be after start time" });
    return;
  }

  if (startTime < new Date()) {
    res.status(400).json({ error: "Cannot reserve in the past" });
    return;
  }

  try {
    // Check for conflicts
    const conflict = await prisma.reservation.count({
      where: {
        tableId,
        status: { not: "cancelled" },
        OR: [
          { startTime: { lte: startTime }, endTime: { gte: startTime } },
          { startTime: { lte: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } },
        ],
      },
    });

    if (conflict > 0) {
      res.status(409).json({ error: "Table already reserved for this time slot" });
      return;
    }

    const reservation = await prisma.reservation.create({
      data: {
        playerId,
        tableId,
        startTime,
        endTime,
        notes: notes ?? "",
        status: "confirmed",
      },
      include: reservationInclude,
    });

    res.status(201).json({ reservation });
  } catch {
    res.status(500).json({ error: "Failed to create reservation" });
  }
}

export async function getReservations(req: Request, res: Response): Promise<void> {
  const tableId = req.query["table_id"] ? parseInt(req.query["table_id"] as string) : undefined;
  const playerId = req.query["player_id"] ? parseInt(req.query["player_id"] as string) : undefined;
  const showAll = req.query["all"] !== undefined;

  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        ...(tableId !== undefined && { tableId }),
        ...(playerId !== undefined && { playerId }),
        ...(!showAll && { endTime: { gt: new Date() } }),
      },
      orderBy: { startTime: "asc" },
      include: reservationInclude,
    });

    res.status(200).json({ reservations, count: reservations.length });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function cancelReservation(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params["id"] ?? "");
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }

    await prisma.reservation.update({
      where: { id },
      data: { status: "cancelled" },
    });

    res.status(200).json({ message: "Reservation cancelled" });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getTables(_req: Request, res: Response): Promise<void> {
  try {
    const tables = await prisma.table.findMany();
    res.status(200).json({ tables, count: tables.length });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}
