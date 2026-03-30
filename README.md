<div align="center">

# BabyConnect

### Plateforme connectée de babyfoot — Ynov Toulouse 2026

**Challenge 48h · Babyfoot du futur**

[![CI](https://github.com/BabyConnect-Ynov2026/babyconnect/actions/workflows/ci.yml/badge.svg)](https://github.com/BabyConnect-Ynov2026/babyconnect/actions)
![Go](https://img.shields.io/badge/Go-1.22-00ADD8?logo=go)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)

</div>

---

## Contexte

Et si on réinventait l'expérience babyfoot à Ynov ? BabyConnect est une plateforme web complète pour moderniser et digitaliser l'usage des babyfoots du Souk, conçue pour les ~1000 étudiants d'Ynov Toulouse.

## Entreprise

**Nom : BabyConnect Corp**

### Equipe 1 — Dev & Infra

| Prénom NOM | Filière | Rôle |
|------------|---------|------|
| Nicolas GOUY | B3 DEV | Lead Backend / Go API |
| Prénom NOM | B3 DEV | Frontend React |
| Prénom NOM | B2 INFO | DevOps / Docker |
| Prénom NOM | B1 INFRA | Infrastructure |
| Prénom NOM | B1 INFO | Frontend |

### Equipe 2 — Data & IA

| Prénom NOM | Filière | Rôle |
|------------|---------|------|
| Prénom NOM | B3 IADATA | Data Analyst |
| Prénom NOM | B2 IADATA | ML / Statistiques |
| Prénom NOM | B1 IADATA | Visualisation |

---

## Fonctionnalités

| Module | Description |
|--------|-------------|
| **Réservations** | Réserver une table en quelques clics, gestion des conflits en temps réel |
| **Matchs Live** | Enregistrement des scores en direct avec mise à jour instantanée |
| **Leaderboard ELO** | Classement dynamique avec système de rating ELO (comme les échecs) |
| **Tournois** | Création et gestion de tournois avec brackets automatiques |
| **Stats joueurs** | Profils détaillés : W/L ratio, buts, historique |
| **Dashboard** | Vue d'ensemble en temps réel de l'activité babyfoot |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     BabyConnect                         │
│                                                         │
│   ┌─────────────┐    ┌──────────────┐    ┌──────────┐  │
│   │   Frontend   │───▶│   Backend    │───▶│  Postgres │  │
│   │  React + TS  │    │   Go + Gin   │    │    DB    │  │
│   │  Tailwind    │◀───│  REST API    │◀───│          │  │
│   └─────────────┘    └──────────────┘    └──────────┘  │
│         :3000               :8080             :5432     │
└─────────────────────────────────────────────────────────┘
```

## Stack technique

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Go 1.22, Gin, GORM |
| Base de données | PostgreSQL 16 |
| Déploiement | Docker, Docker Compose |
| CI/CD | GitHub Actions |

## Lancer le projet

### Prérequis
- [Docker](https://www.docker.com/) + Docker Compose
- [Go 1.22+](https://go.dev/) (pour le dev local)
- [Node.js 20+](https://nodejs.org/) (pour le dev local)

### Démarrage rapide (Docker)

```bash
# 1. Cloner le repo
git clone https://github.com/BabyConnect-Ynov2026/babyconnect.git
cd babyconnect

# 2. Configurer l'environnement
cp .env.example .env

# 3. Lancer tous les services
docker compose up -d

# L'app est disponible sur http://localhost
# L'API est sur http://localhost:8080/api/v1
```

### Développement local

```bash
# Backend
cd backend
go mod download
cp ../.env.example .env
go run main.go

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

## API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/health` | Santé de l'API |
| `GET` | `/api/v1/leaderboard` | Classement ELO |
| `GET` | `/api/v1/stats` | Statistiques globales |
| `POST` | `/api/v1/players/register` | Inscrire un joueur |
| `GET` | `/api/v1/players` | Liste des joueurs |
| `POST` | `/api/v1/matches` | Créer un match |
| `PATCH` | `/api/v1/matches/:id/score` | Mettre à jour le score |
| `POST` | `/api/v1/matches/:id/finish` | Terminer un match (calcul ELO) |
| `POST` | `/api/v1/reservations` | Créer une réservation |
| `GET` | `/api/v1/reservations` | Lister les réservations |
| `POST` | `/api/v1/tournaments` | Créer un tournoi |
| `POST` | `/api/v1/tournaments/:id/join` | S'inscrire à un tournoi |

## Repositories de l'organisation

| Repo | Description |
|------|-------------|
| [babyconnect](https://github.com/BabyConnect-Ynov2026/babyconnect) | Application principale (ce repo) |
| [DOCUMENTATION](https://github.com/BabyConnect-Ynov2026/DOCUMENTATION) | Documentation technique et utilisateur |
| [COMPTES-RENDUS](https://github.com/BabyConnect-Ynov2026/COMPTES-RENDUS) | Comptes rendus individuels |
| [INSTRUCTIONS](https://github.com/BabyConnect-Ynov2026/INSTRUCTIONS) | Instructions du challenge (fork) |

## Documentation

La documentation complète est disponible dans le repository [DOCUMENTATION](https://github.com/BabyConnect-Ynov2026/DOCUMENTATION).

---

<div align="center">
<sub>Challenge 48h Ynov Toulouse 2026 — BabyConnect Corp</sub>
</div>
