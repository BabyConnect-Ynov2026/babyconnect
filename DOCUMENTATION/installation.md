# Guide d'installation — BabyConnect

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (inclut Docker Compose)
- Git

## Installation en 3 commandes

```bash
git clone https://github.com/YOUR_ORG/babyconnect.git
cd babyconnect
cp .env.example .env
docker compose up -d
```

L'application est disponible sur **http://localhost**.

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

# Installer les dépendances Go
go mod download

# Copier la config (modifier DB_HOST=localhost)
cp ../.env.example .env

# Lancer l'API
go run main.go
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
