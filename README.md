# BabyConnect

Plateforme de gestion de babyfoot avec :
- un frontend React + TypeScript
- un backend Express + TypeScript
- une base PostgreSQL
- une orchestration Docker Compose

Le projet permet de gerer les joueurs, les matchs, les reservations, les tables, les tournois et le classement.

## Architecture

```text
babyconnect/
|- frontend/         Application React + Vite
|- backend/          API Express + Prisma
|- DOCUMENTATION/    Documentation technique et guides
|- COMPTES-RENDUS/   Comptes-rendus de projet
|- docker-compose.yml
|- .env.example
`- README.md
```

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

Pages principales :
- accueil
- authentification
- profil
- dashboard admin
- leaderboard
- reservations
- tournois
- matchs
- joueurs

### Backend
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT pour l'authentification

Le backend expose ses routes sous ` /api/v1 `.

Domaines couverts :
- auth
- players
- matches
- reservations
- tables
- tournaments
- leaderboard

## Prerequis

- Node.js 20+ recommande
- npm
- Docker et Docker Compose pour le lancement conteneurise
- PostgreSQL si lancement local sans Docker

## Demarrage rapide avec Docker

1. Copier le fichier d'environnement :

```powershell
Copy-Item .env.example .env
```

2. Demarrer la stack :

```powershell
docker compose up --build
```

3. Acceder aux services :
- frontend : `http://localhost`
- backend : `http://localhost:8080/api/v1/health`
- PostgreSQL : `localhost:5432`

## Demarrage local

### Backend

```powershell
cd backend
npm install
npm run prisma:generate
npm run dev
```

Le backend demarre par defaut sur `http://localhost:8080`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Le frontend Vite demarre generalement sur `http://localhost:5173`.

## Variables d'environnement

Le fichier [`.env.example`](./.env.example) contient les variables principales :

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DATABASE_URL`
- `SERVER_PORT`
- `JWT_SECRET`

## API principale

Base URL : `http://localhost:8080/api/v1`

Exemples de routes :
- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /players`
- `GET /matches`
- `POST /reservations`
- `GET /tables`
- `GET /tables/live`
- `GET /leaderboard`
- `GET /stats`

## Documentation du projet

Documentation complementaire disponible dans :
- [`DOCUMENTATION/architecture.md`](./DOCUMENTATION/architecture.md)
- [`DOCUMENTATION/api.md`](./DOCUMENTATION/api.md)
- [`DOCUMENTATION/installation.md`](./DOCUMENTATION/installation.md)
- [`DOCUMENTATION/guide-utilisateur.md`](./DOCUMENTATION/guide-utilisateur.md)
- [`COMPTES-RENDUS/README.md`](./COMPTES-RENDUS/README.md)

## Workflow recommande pour contribuer

```powershell
git checkout -b docs/readme-cleanup
git add README.md
git commit -m "docs: update repository README"
git push -u origin docs/readme-cleanup
```

Ensuite, ouvrir une Pull Request vers la branche cible du projet.
