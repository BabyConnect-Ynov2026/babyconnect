import type { Response } from "express";
import prisma from "./prisma";

const LIVE_TABLE_PING_MS = 15000;

export type LiveTableStatus = "free" | "reserved" | "occupied";

export type LiveTableSnapshot = {
  id: number;
  location: string | null;
  name: string;
  status: LiveTableStatus;
};

type LiveTablesPayload = {
  tables: LiveTableSnapshot[];
};

const clients = new Set<Response>();
let heartbeatId: NodeJS.Timeout | null = null;

export async function listLiveTables(): Promise<LiveTableSnapshot[]> {
  const now = new Date();
  const tables = await prisma.table.findMany({
    orderBy: { id: "asc" },
    include: {
      reservations: {
        where: {
          status: { in: ["pending", "confirmed"] },
          startTime: { lte: now },
          endTime: { gte: now },
        },
        select: { id: true },
      },
    },
  });

  return tables.map((table) => {
    const reserved = table.reservations.length > 0;
    const occupied = !table.available;

    return {
      id: table.id,
      location: table.location,
      name: table.name,
      status: occupied ? "occupied" : reserved ? "reserved" : "free",
    };
  });
}

function startHeartbeat(): void {
  if (heartbeatId) {
    return;
  }

  heartbeatId = setInterval(() => {
    if (clients.size === 0) {
      stopHeartbeat();
      return;
    }

    void broadcastLiveTables();
  }, LIVE_TABLE_PING_MS);
}

function stopHeartbeat(): void {
  if (!heartbeatId) {
    return;
  }

  clearInterval(heartbeatId);
  heartbeatId = null;
}

async function writeSnapshot(response: Response): Promise<void> {
  const payload: LiveTablesPayload = {
    tables: await listLiveTables(),
  };

  response.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function broadcastLiveTables(): Promise<void> {
  if (clients.size === 0) {
    return;
  }

  const payload: LiveTablesPayload = {
    tables: await listLiveTables(),
  };
  const message = `data: ${JSON.stringify(payload)}\n\n`;

  for (const client of clients) {
    client.write(message);
  }
}

export async function registerLiveTablesClient(response: Response): Promise<void> {
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");
  response.setHeader("Content-Type", "text/event-stream");

  response.flushHeaders?.();
  clients.add(response);
  startHeartbeat();

  await writeSnapshot(response);

  response.on("close", () => {
    clients.delete(response);
    if (clients.size === 0) {
      stopHeartbeat();
    }
  });
}
