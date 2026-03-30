import { Router } from "express";
import * as player from "../controllers/player";
import * as match from "../controllers/match";
import * as reservation from "../controllers/reservation";
import * as tournament from "../controllers/tournament";
import * as leaderboard from "../controllers/leaderboard";

const router = Router();

// Health
router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "BabyConnect API" });
});

// Auth
router.post("/auth/login", player.login);

// Players
router.post("/players/register", player.register);
router.get("/players", player.getPlayers);
router.get("/players/:id", player.getPlayer);
router.get("/players/:id/stats", player.getPlayerStats);

// Matches
router.post("/matches", match.createMatch);
router.get("/matches", match.getMatches);
router.get("/matches/:id", match.getMatch);
router.patch("/matches/:id/score", match.updateScore);
router.post("/matches/:id/finish", match.finishMatch);

// Reservations
router.post("/reservations", reservation.createReservation);
router.get("/reservations", reservation.getReservations);
router.delete("/reservations/:id", reservation.cancelReservation);

// Tables
router.get("/tables", reservation.getTables);

// Tournaments
router.post("/tournaments", tournament.createTournament);
router.get("/tournaments", tournament.getTournaments);
router.get("/tournaments/:id", tournament.getTournament);
router.post("/tournaments/:id/join", tournament.joinTournament);

// Leaderboard & Stats
router.get("/leaderboard", leaderboard.getLeaderboard);
router.get("/stats", leaderboard.getStats);

export default router;
