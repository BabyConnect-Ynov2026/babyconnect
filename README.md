<div align="center">

# BabyConnect

### Plateforme connectée de babyfoot — Ynov Toulouse 2026

**Challenge 48h · Babyfoot du futur**

[![CI](https://github.com/BabyConnect-Ynov2026/babyconnect/actions/workflows/ci.yml/badge.svg)](https://github.com/BabyConnect-Ynov2026/babyconnect/actions)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)

</div>

---

## Contexte

Et si on réinventait l'expérience babyfoot à Ynov ? BabyConnect est une plateforme web complète pour moderniser et digitaliser l'usage des babyfoots du Souk, conçue pour les ~1000 étudiants d'Ynov Toulouse.

## Entreprise

**Nom : BabyConnect Corp**

### Equipe 1 — Suffix

| Prénom NOM | Filière | Rôle |
|------------|---------|------|
| Dylan HEBRARD | B3 DEV | Lead Backend / Go API |
| Cédric RIGHI | B3 DEV | Frontend React |
| Nohaeila LAGHALID | B3 DEV | DevOps / Docker |
| Erwann VARLET | B3 DEV | Infrastructure |
| Ingrid LARE | B3 DEV | Frontend |
| Ioané SULASHVILI | B3 DEV | Data / Stats |
| Maël LOPEZ | B3 DEV | Backend / ELO |

### Equipe 2 — SaSure

| Prénom NOM | Filière | Rôle |
|------------|---------|------|
| Nicolas GOUY | B3 IADATA | Data Analyst |
| Hilary Capriaty KAMSU | B3 IADATA | ML / Statistiques |
| Corentin BEDO | B3 INFRA | Infrastructure |
| Guillaume MARDINLI | B3 INFRA | DevOps / CI/CD |
| Mathys COLOMBO | B3 INFRA | Backend / API |

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
│   ┌──────────────┐     ┌──────────────┐    ┌──────────┐ │
│   │   Frontend   │───▶│   Backend    │───▶│ Postgres │ │
│   │  React + TS  │     │ Express + TS │    │    DB    │ │
│   │  Tailwind    │◀───│ Prisma + REST │◀───│          │ │
│   └──────────────┘     └──────────────┘    └──────────┘ │
│         :3000               :8080             :5432     │
└─────────────────────────────────────────────────────────┘
```

## Stack technique

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | TypeScript, Express, Prisma |
| Base de données | PostgreSQL 16 |
| Déploiement | Docker, Docker Compose |
| CI/CD | GitHub Actions |

## Lancer le projet

### Prérequis
- [Node.js 20+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) + Docker Compose (optionnel, pratique pour Postgres)

### Etat actuel du démarrage

Le backend du repo n'est plus en Go: il est maintenant en **TypeScript / Express / Prisma** dans [backend/](./backend).

Important:
- le fichier [`.env.example`](./.env.example) à la racine sert surtout au `docker compose`
- pour lancer l'API en local, il faut utiliser [`backend/.env.example`](./backend/.env.example)
- le `docker compose up -d` complet n'est **pas** la bonne méthode pour démarrer le backend dans l'etat actuel du repo

### Base de donnees (Docker recommande)

```bash
git clone https://github.com/BabyConnect-Ynov2026/babyconnect.git
cd babyconnect

# Configuration Docker (si besoin)
cp .env.example .env

# Demarrer uniquement Postgres
docker compose up -d db
```

### Backend local

```bash
cd backend

# 1. Configurer l'environnement du backend
cp .env.example .env

# 2. Installer les dependances
npm install

# 3. Generer / synchroniser Prisma avec la base
npm run prisma:push

# 4. Lancer l'API
npm run dev

# API: http://localhost:8080/api/v1
```

### Frontend local

```bash
cd frontend
npm install
npm run dev
# Frontend: http://localhost:3000
```

### Build backend

```bash
cd backend
npm install
npm run build
npm run start
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
