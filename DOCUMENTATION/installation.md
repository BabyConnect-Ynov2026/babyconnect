# Guide d'installation — BabyConnect

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (inclut Docker Compose)
- [Node.js 20+](https://nodejs.org/)
- npm
- Git

## Lancement recommande

```bash
git clone https://github.com/BabyConnect-Ynov2026/babyconnect.git
cd babyconnect
cp .env.example .env
docker compose up -d db
```

Cette commande demarre uniquement PostgreSQL.

Pour lancer l'application complete:
- backend API: `http://localhost:8080/api/v1`
- frontend: `http://localhost:3000`

---

## Variables d'environnement (.env)

| Variable | Défaut | Description |
|----------|--------|-------------|
| `DB_HOST` | `db` | Hôte PostgreSQL (nom du service Docker) |
| `DB_PORT` | `5432` | Port PostgreSQL |
| `DB_USER` | `admin` | Utilisateur DB |
| `DB_PASSWORD` | `changeme` | **À changer en production !** |
| `DB_NAME` | `babyconnect` | Nom de la base |
| `SERVER_PORT` | `8080` | Port de l'API |
| `JWT_SECRET` | — | **À changer en production !** |

---

## Développement local (sans Docker)

### Backend

```bash
cd backend

# Installer les dépendances Node
npm install

# Copier la config backend (modifier DB_HOST=localhost si besoin)
cp .env.example .env

# Synchroniser le schema Prisma avec la base
npm run prisma:push

# Lancer l'API
npm run dev
# → http://localhost:8080/api/v1
```

### Frontend

```bash
cd frontend

# Installer les dépendances Node
npm install

# Lancer le serveur de dev
npm run dev
# → http://localhost:3000
```

### Base de données locale

```bash
# Lancer uniquement PostgreSQL
docker compose up db -d
```

---

## Commandes utiles

```bash
# Voir les logs
docker compose logs -f

# Redémarrer un service
docker compose restart backend

# Arrêter tout
docker compose down

# Arrêter et supprimer les données
docker compose down -v

# Rebuild après modification du code
docker compose up -d --build
```

---

## Ports utilisés

| Service | Port |
|---------|------|
| Frontend | 80 |
| Backend API | 8080 |
| PostgreSQL | 5432 |
