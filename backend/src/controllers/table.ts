import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { listLiveTables, registerLiveTablesClient } from "../lib/table-live";

export async function getTables(_req: Request, res: Response): Promise<void> {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { id: "asc" },
    });
    res.status(200).json({ tables, count: tables.length });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getLiveTables(_req: Request, res: Response): Promise<void> {
  try {
    const tables = await listLiveTables();
    res.status(200).json({ tables, count: tables.length });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function streamLiveTables(_req: Request, res: Response): Promise<void> {
  try {
    await registerLiveTablesClient(res);
  } catch {
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to start live stream" });
    } else {
      res.end();
    }
  }
}
