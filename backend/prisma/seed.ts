import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma";
import { seedTables } from "../src/lib/seed";
import { calculateElo } from "../src/lib/elo";

const demoPassword = "babyconnect123";

const demoPlayers = [
  { username: "alice", email: "alice@babyconnect.local", fullName: "Alice Martin" },
  { username: "bruno", email: "bruno@babyconnect.local", fullName: "Bruno Petit" },
  { username: "chloe", email: "chloe@babyconnect.local", fullName: "Chloe Bernard" },
  { username: "diego", email: "diego@babyconnect.local", fullName: "Diego Morel" },
  { username: "emma", email: "emma@babyconnect.local", fullName: "Emma Garcia" },
  { username: "farid", email: "farid@babyconnect.local", fullName: "Farid Laurent" },
] as const;

function addDays(base: Date, days: number): Date {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function setTime(base: Date, hours: number, minutes: number): Date {
  const date = new Date(base);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "TournamentParticipant",
      "Match",
      "Reservation",
      "Tournament",
      "Table",
      "Player"
    RESTART IDENTITY CASCADE
  `);
}

async function ensurePlayers(): Promise<Map<string, number>> {
  const password = await bcrypt.hash(demoPassword, 10);
  const ids = new Map<string, number>();

  for (const player of demoPlayers) {
    const record = await prisma.player.upsert({
      where: { email: player.email },
      update: {
        username: player.username,
        fullName: player.fullName,
        password,
      },
      create: {
        ...player,
        password,
      },
    });

    ids.set(player.username, record.id);
  }

  return ids;
}

async function resetPlayerStats(playerIds: Iterable<number>): Promise<void> {
  for (const playerId of playerIds) {
    await prisma.player.update({
      where: { id: playerId },
      data: {
        eloRating: 1000,
        wins: 0,
        losses: 0,
        draws: 0,
        goals: 0,
      },
    });
  }
}

async function applyCompletedMatch(redPlayerId: number, bluePlayerId: number, redScore: number, blueScore: number): Promise<void> {
  const [redPlayer, bluePlayer] = await Promise.all([
    prisma.player.findUniqueOrThrow({ where: { id: redPlayerId } }),
    prisma.player.findUniqueOrThrow({ where: { id: bluePlayerId } }),
  ]);

  const redWon = redScore > blueScore;
  const draw = redScore === blueScore;
  const redResult = redWon ? 1 : draw ? 0.5 : 0;
  const blueResult = redWon ? 0 : draw ? 0.5 : 1;

  await prisma.player.update({
    where: { id: redPlayerId },
    data: {
      eloRating: calculateElo(redPlayer.eloRating, bluePlayer.eloRating, redResult),
      wins: redWon ? redPlayer.wins + 1 : redPlayer.wins,
      draws: draw ? redPlayer.draws + 1 : redPlayer.draws,
      losses: !redWon && !draw ? redPlayer.losses + 1 : redPlayer.losses,
      goals: redPlayer.goals + redScore,
    },
  });

  await prisma.player.update({
    where: { id: bluePlayerId },
    data: {
      eloRating: calculateElo(bluePlayer.eloRating, redPlayer.eloRating, blueResult),
      wins: !redWon && !draw ? bluePlayer.wins + 1 : bluePlayer.wins,
      draws: draw ? bluePlayer.draws + 1 : bluePlayer.draws,
      losses: redWon ? bluePlayer.losses + 1 : bluePlayer.losses,
      goals: bluePlayer.goals + blueScore,
    },
  });
}

async function ensureTournament(name: string, data: {
  description: string;
  maxPlayers: number;
  status: "open" | "finished";
  startDate: Date;
  endDate?: Date;
  winnerId?: number;
}): Promise<number> {
  const existing = await prisma.tournament.findFirst({
    where: { name },
    select: { id: true },
  });

  if (existing) {
    return existing.id;
  }

  const tournament = await prisma.tournament.create({
    data: {
      name,
      description: data.description,
      maxPlayers: data.maxPlayers,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
      winnerId: data.winnerId,
    },
  });

  return tournament.id;
}

async function seedReservations(playerIds: Map<string, number>, tableIds: Map<string, number>): Promise<number> {
  const count = await prisma.reservation.count();
  if (count > 0) {
    return 0;
  }

  const now = new Date();
  const tomorrow = addDays(now, 1);
  const inTwoDays = addDays(now, 2);
  const yesterday = addDays(now, -1);

  const result = await prisma.reservation.createMany({
    data: [
      {
        playerId: playerIds.get("alice")!,
        tableId: tableIds.get("Table 1")!,
        startTime: setTime(tomorrow, 18, 0),
        endTime: setTime(tomorrow, 18, 45),
        status: "confirmed",
        notes: "Session d'entrainement solo",
      },
      {
        playerId: playerIds.get("chloe")!,
        tableId: tableIds.get("Table 2")!,
        startTime: setTime(inTwoDays, 12, 30),
        endTime: setTime(inTwoDays, 13, 15),
        status: "confirmed",
        notes: "Pause dej avec l'equipe produit",
      },
      {
        playerId: playerIds.get("farid")!,
        tableId: tableIds.get("Table 3")!,
        startTime: setTime(yesterday, 17, 0),
        endTime: setTime(yesterday, 17, 45),
        status: "completed",
        notes: "Reservation de demonstration deja terminee",
      },
    ],
  });

  return result.count;
}

async function seedMatches(playerIds: Map<string, number>, tableIds: Map<string, number>, finishedTournamentId: number): Promise<number> {
  const count = await prisma.match.count();
  if (count > 0) {
    return 0;
  }

  await resetPlayerStats(playerIds.values());

  const now = new Date();
  const matches: Array<{
    tableName: string;
    redUsername: string;
    blueUsername: string;
    redScore: number;
    blueScore: number;
    startedAt: Date;
    durationSeconds: number;
    tournamentId?: number;
  }> = [
    {
      tableName: "Table 1",
      redUsername: "alice",
      blueUsername: "bruno",
      redScore: 10,
      blueScore: 7,
      startedAt: setTime(addDays(now, -7), 18, 0),
      durationSeconds: 720,
    },
    {
      tableName: "Table 2",
      redUsername: "chloe",
      blueUsername: "diego",
      redScore: 8,
      blueScore: 10,
      startedAt: setTime(addDays(now, -6), 12, 30),
      durationSeconds: 810,
    },
    {
      tableName: "Table 3",
      redUsername: "emma",
      blueUsername: "farid",
      redScore: 10,
      blueScore: 5,
      startedAt: setTime(addDays(now, -5), 19, 15),
      durationSeconds: 690,
    },
    {
      tableName: "Table 1",
      redUsername: "alice",
      blueUsername: "emma",
      redScore: 9,
      blueScore: 9,
      startedAt: setTime(addDays(now, -3), 18, 30),
      durationSeconds: 900,
      tournamentId: finishedTournamentId,
    },
  ];

  for (const match of matches) {
    const tableId = tableIds.get(match.tableName)!;
    const redPlayerId = playerIds.get(match.redUsername)!;
    const bluePlayerId = playerIds.get(match.blueUsername)!;
    const finishedAt = new Date(match.startedAt.getTime() + match.durationSeconds * 1000);

    await prisma.match.create({
      data: {
        tableId,
        redTeamId1: redPlayerId,
        blueTeamId1: bluePlayerId,
        redScore: match.redScore,
        blueScore: match.blueScore,
        status: "completed",
        startedAt: match.startedAt,
        finishedAt,
        durationSeconds: match.durationSeconds,
        tournamentId: match.tournamentId,
      },
    });

    await applyCompletedMatch(redPlayerId, bluePlayerId, match.redScore, match.blueScore);
  }

  await prisma.table.updateMany({
    data: { available: true },
  });

  return matches.length;
}

async function main(): Promise<void> {
  await resetDatabase();
  await seedTables();

  const tables = await prisma.table.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  const tableIds = new Map(tables.map((table) => [table.name, table.id]));

  const playerIds = await ensurePlayers();

  const now = new Date();
  const finishedTournamentId = await ensureTournament("Souk Championship 2026", {
    description: "Tournoi de demo termine pour alimenter les vues detaillees.",
    maxPlayers: 4,
    status: "finished",
    startDate: setTime(addDays(now, -3), 18, 0),
    endDate: setTime(addDays(now, -3), 20, 0),
    winnerId: playerIds.get("alice"),
  });

  const openTournamentId = await ensureTournament("BabyConnect Spring Cup 2026", {
    description: "Tournoi de demo ouvert aux inscriptions.",
    maxPlayers: 8,
    status: "open",
    startDate: setTime(addDays(now, 7), 18, 30),
  });

  for (const username of ["alice", "bruno", "chloe", "diego"] as const) {
    await prisma.tournamentParticipant.upsert({
      where: {
        tournamentId_playerId: {
          tournamentId: finishedTournamentId,
          playerId: playerIds.get(username)!,
        },
      },
      update: {},
      create: {
        tournamentId: finishedTournamentId,
        playerId: playerIds.get(username)!,
      },
    });
  }

  for (const username of ["alice", "bruno", "emma", "farid"] as const) {
    await prisma.tournamentParticipant.upsert({
      where: {
        tournamentId_playerId: {
          tournamentId: openTournamentId,
          playerId: playerIds.get(username)!,
        },
      },
      update: {},
      create: {
        tournamentId: openTournamentId,
        playerId: playerIds.get(username)!,
      },
    });
  }

  const seededReservations = await seedReservations(playerIds, tableIds);
  const seededMatches = await seedMatches(playerIds, tableIds, finishedTournamentId);

  console.log("Database reset and seeding complete");
  console.log(`Demo players available: ${demoPlayers.length}`);
  console.log(`Demo login password: ${demoPassword}`);
  console.log(`Reservations created: ${seededReservations}`);
  console.log(`Matches created: ${seededMatches}`);
}

main()
  .catch((error) => {
    console.error("Database seeding failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
