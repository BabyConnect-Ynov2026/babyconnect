# Documentation API — BabyConnect

Base URL: `http://localhost:8080/api/v1`

---

## Santé

### `GET /health`

Vérifie que l'API est en ligne.

**Réponse 200**
```json
{ "status": "ok", "service": "BabyConnect API" }
```

---

## Joueurs

### `POST /players/register`

Inscrit un nouveau joueur.

**Body**
```json
{
  "username": "ngouy",
  "email": "nicolas.gouy@ynov.com",
  "password": "motdepasse",
  "full_name": "Nicolas Gouy"
}
```

**Réponse 201**
```json
{
  "player": {
    "id": 1,
    "username": "ngouy",
    "full_name": "Nicolas Gouy",
    "elo_rating": 1000,
    "wins": 0, "losses": 0, "draws": 0, "goals": 0
  }
}
```

### `GET /players`

Liste tous les joueurs, triés par ELO décroissant.

### `GET /players/:id`

Détail d'un joueur.

### `GET /players/:id/stats`

Stats complètes d'un joueur + 10 derniers matchs.

---

## Matchs

### `POST /matches`

Crée et démarre un match.

**Body**
```json
{
  "table_id": 1,
  "red_team_id_1": 1,
  "blue_team_id_1": 2
}
```

### `GET /matches`

Liste les 50 derniers matchs.

### `PATCH /matches/:id/score`

Met à jour le score en cours de partie.

**Body**
```json
{ "red_score": 3, "blue_score": 2 }
```

### `POST /matches/:id/finish`

Termine le match, calcule l'ELO, libère la table.

---

## Réservations

### `POST /reservations`

Crée une réservation (vérifie les conflits).

**Body**
```json
{
  "player_id": 1,
  "table_id": 2,
  "start_time": "2026-03-31T14:00:00Z",
  "end_time": "2026-03-31T15:00:00Z",
  "notes": "Entraînement tournoi"
}
```

**Erreur 409** si un conflit existe.

### `GET /reservations`

Liste les réservations futures. Paramètres optionnels : `table_id`, `player_id`.

### `DELETE /reservations/:id`

Annule une réservation.

---

## Tables

### `GET /tables`

Liste les 3 tables avec leur disponibilité.

---

## Tournois

### `POST /tournaments`

Crée un tournoi.

**Body**
```json
{
  "name": "Tournoi Printemps 2026",
  "description": "Premier tournoi de la saison",
  "max_players": 16
}
```

### `GET /tournaments`

Liste tous les tournois avec nombre de participants.

### `GET /tournaments/:id`

Détail d'un tournoi avec liste des participants.

### `POST /tournaments/:id/join`

Inscrit un joueur à un tournoi.

**Body**
```json
{ "player_id": 1 }
```

---

## Leaderboard & Stats

### `GET /leaderboard`

Top 100 joueurs classés par ELO.

**Réponse**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "player": { "username": "ngouy", "elo_rating": 1150, ... },
      "win_rate": 72.5,
      "total_games": 40
    }
  ]
}
```

### `GET /stats`

Statistiques globales de la plateforme.

**Réponse**
```json
{
  "total_players": 42,
  "total_matches": 156,
  "ongoing_matches": 2,
  "top_scorer": { "username": "ngouy", "goals": 89 },
  "most_active": { "username": "player2", "wins": 35 }
}
```
