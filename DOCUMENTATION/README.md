# Documentation — BabyConnect

Documentation complète de la plateforme BabyConnect — Challenge 48h Ynov Toulouse 2026.

## Sommaire

- [Architecture technique](./architecture.md)
- [Guide d'installation](./installation.md)
- [Documentation API](./api.md)
- [Guide utilisateur](./guide-utilisateur.md)

---

## Présentation rapide

BabyConnect est une plateforme web full-stack permettant de digitaliser l'expérience babyfoot à Ynov Toulouse :

- **Réservations** — Système de créneaux pour éviter les conflits et les files d'attente
- **Matchs live** — Suivi des scores en temps réel
- **Classement ELO** — Système de ranking inspiré des échecs
- **Tournois** — Organisation de compétitions entre étudiants
- **Statistiques** — Analyse des performances des joueurs

## Stack

| Composant | Technologie | Version |
|-----------|------------|---------|
| Frontend | React + TypeScript + Tailwind CSS | 18 / 5 / 3 |
| Backend | Go + Gin + GORM | 1.22 |
| Base de données | PostgreSQL | 16 |
| Conteneurisation | Docker + Compose | latest |
| CI/CD | GitHub Actions | — |
