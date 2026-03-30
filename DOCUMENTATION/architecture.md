# Architecture Technique — BabyConnect

## Vue d'ensemble

BabyConnect suit une architecture **client-serveur** classique avec séparation claire des responsabilités :

```
┌──────────────────────────────────────────────────────────────────┐
│                         Navigateur                                │
│                    React + TypeScript SPA                         │
│                        (Port 3000/80)                             │
└─────────────────────────┬────────────────────────────────────────┘
                          │ HTTP REST (JSON)
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Go Backend API                               │
│                   Gin + GORM (Port 8080)                          │
│                                                                   │
│   ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌─────────────┐  │
│   │ Players  │  │  Matches   │  │Reservations│ │ Tournaments │  │
│   │Controller│  │ Controller │  │ Controller │ │  Controller │  │
│   └──────────┘  └────────────┘  └──────────┘  └─────────────┘  │
│                                                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                     GORM ORM Layer                       │   │
│   └─────────────────────────────────────────────────────────┘   │
└─────────────────────────┬────────────────────────────────────────┘
                          │ SQL
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                    PostgreSQL 16 (Port 5432)                       │
│                                                                   │
│  players | matches | tables | reservations | tournaments         │
│  tournament_participants                                          │
└──────────────────────────────────────────────────────────────────┘
```

## Structure des dossiers

```
babyconnect/
├── backend/                    # API Go
│   ├── main.go                 # Point d'entrée, seeding
│   ├── config/
│   │   └── config.go           # Configuration DB, env
│   ├── models/                 # Modèles GORM (Player, Match, ...)
│   ├── controllers/            # Logique métier par domaine
│   ├── routes/
│   │   └── routes.go           # Déclaration de toutes les routes
│   ├── middleware/
│   │   └── cors.go             # CORS
│   ├── go.mod
│   └── Dockerfile
├── frontend/                   # App React
│   ├── src/
│   │   ├── App.tsx             # Router principal
│   │   ├── pages/              # Pages (Dashboard, Leaderboard...)
│   │   ├── components/         # Composants réutilisables
│   │   ├── services/
│   │   │   └── api.ts          # Couche d'accès à l'API
│   │   └── types/
│   │       └── index.ts        # Types TypeScript partagés
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline CI GitHub Actions
├── docker-compose.yml
├── .env.example
└── README.md
```

## Modèle de données

### Entités principales

**Player** — Joueur inscrit sur la plateforme
- `id`, `username` (unique), `email` (unique), `full_name`
- `elo_rating` (défaut 1000), `wins`, `losses`, `draws`, `goals`

**Table** — Table de babyfoot physique
- `id`, `name`, `location`, `available`

**Match** — Partie entre joueurs
- Équipe rouge (1 ou 2 joueurs) vs Équipe bleue (1 ou 2 joueurs)
- `red_score`, `blue_score`, `status` (pending/ongoing/completed)
- `started_at`, `finished_at`, `duration_seconds`

**Reservation** — Créneaux de réservation
- `player_id`, `table_id`, `start_time`, `end_time`
- `status` (pending/confirmed/cancelled/completed)
- Vérification des conflits horaires côté backend

**Tournament** — Compétition organisée
- `name`, `description`, `max_players`, `status`
- `winner_id`, `start_date`, `end_date`

## Système ELO

Le classement utilise l'algorithme ELO standard :

```
E(A) = 1 / (1 + 10^((RB - RA) / 400))
R'(A) = R(A) + K * (S(A) - E(A))
```

Où :
- `K = 32` (facteur de volatilité)
- `S(A) = 1` (victoire), `0.5` (nul), `0` (défaite)
- Rating initial = **1000**

## CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) exécute :
1. **Build & Vet** du backend Go
2. **Build** du frontend React
3. **Build des images Docker**

Déclenché sur push vers `main`/`master`/`develop` et sur Pull Requests.
