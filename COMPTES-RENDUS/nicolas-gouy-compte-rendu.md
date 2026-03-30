# Compte-rendu — Nicolas Gouy — B3 DEV

**Challenge 48h Ynov Toulouse 2026 — Babyfoot du futur**

---

## Ma contribution

J'ai travaillé principalement sur le **backend Go** de BabyConnect et la mise en place de l'architecture globale du projet.

### Ce que j'ai fait

- **Architecture du projet** : choix de la stack (Go/Gin/GORM + React/TS + PostgreSQL + Docker), mise en place de la structure des dossiers
- **Backend API REST** :
  - Modèles GORM : Player, Match, Table, Reservation, Tournament
  - Controllers : gestion des joueurs, matchs, réservations, tournois, leaderboard
  - Système ELO pour le classement dynamique
  - Vérification des conflits de réservations
  - Seeding automatique des tables de babyfoot
- **DevOps** :
  - Dockerfiles pour le backend et le frontend
  - Docker Compose pour orchestrer les 3 services (db, backend, frontend)
  - Pipeline CI/CD GitHub Actions (build, vet, test)
- **Collaboration** : support de l'équipe frontend pour l'intégration API

---

## Difficultés rencontrées

- **Coordination inter-équipes** : avec plusieurs équipes travaillant en parallèle, synchroniser les interfaces (endpoints API, modèles de données) a demandé une communication constante.
- **Système ELO** : l'implémentation du calcul ELO sans librairie externe a nécessité de revoir les formules mathématiques pour les adapter correctement à Go.
- **Gestion des conflits de réservations** : la requête SQL pour détecter les overlaps temporels était plus complexe que prévu.

---

## Ce que j'ai appris

- La gestion d'un projet multi-équipes en temps contraint : la documentation et la communication sont aussi importantes que le code
- GORM et ses associations (HasOne, BelongsTo, foreignKey) en Go
- L'importance du CORS et de la configuration Docker en développement multi-services
- Le système ELO et son application au classement de joueurs de babyfoot

---

## Bilan

Ce challenge m'a permis de sortir de ma zone de confort en travaillant avec des équipes Data et Infra que je ne connaissais pas. Le résultat est une plateforme fonctionnelle qui répond au besoin de départ, même si des améliorations sont possibles (authentification JWT complète, WebSockets pour le live, tests unitaires).

> *Le plus difficile n'était pas le code, mais de s'aligner rapidement avec des gens qui ont des approches et des niveaux différents. C'est exactement ce que ce challenge voulait nous faire travailler.*
