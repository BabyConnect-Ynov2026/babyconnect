# Compte-rendu — Nicolas Gouy — B3 IADATA

**Challenge 48h Ynov Toulouse 2026 — Babyfoot du futur**

---

## Présentation du projet

BabyConnect est une plateforme web pensée pour digitaliser l'expérience babyfoot à Ynov Toulouse. L'idée de départ était simple : les babyfoots du Souk sont utilisés tout le temps, mais sans aucun suivi — pas de scores, pas de réservations, pas de classement. On s'est dit qu'on pouvait changer ça.

Le projet regroupe plusieurs briques : une interface web pour gérer les matchs, les réservations de tables et un classement ELO des joueurs, et un module IA (ynov-baby-vision) qui utilise une caméra au-dessus du terrain pour détecter la balle et envoyer les buts automatiquement à l'API — sans intervention humaine.

L'objectif n'était pas de faire quelque chose de parfait en 48h, mais de poser des bases solides et de montrer que c'est faisable techniquement.

---

## Mon rôle dans le projet

J'ai pris en charge deux axes principaux :

**1. L'architecture et l'organisation du projet**

Au démarrage, j'ai mis en place la structure globale : choix de la stack (Go/Gin/GORM pour le backend, React/TypeScript/Tailwind pour le frontend, PostgreSQL, Docker), création de l'organisation GitHub [BabyConnect-Ynov2026](https://github.com/BabyConnect-Ynov2026) avec les 4 repos (babyconnect, ynov-baby-vision, DOCUMENTATION, COMPTES-RENDUS), le Docker Compose multi-services avec healthcheck, et le pipeline CI/CD GitHub Actions.

**2. Le module ynov-baby-vision**

C'est la partie sur laquelle j'ai le plus travaillé et qui correspond à ma filière IADATA. J'ai développé un script Python qui :
- Détecte la balle en temps réel via **YOLOv8** (modèle COCO, classe 32 = sports ball)
- Détecte le franchissement des lignes de but par **intersection de segments** (produit vectoriel)
- Envoie automatiquement les scores à l'API BabyConnect via des requêtes HTTP

Les fichiers : `tracker.py`, `goal_detector.py`, `api_client.py`, `config.py`, `main.py`.

**Preuves :** mes commits sont visibles sur [github.com/BabyConnect-Ynov2026](https://github.com/BabyConnect-Ynov2026). J'ai aussi rédigé la documentation technique et le guide d'installation.

---

## Aides

**Aide apportée :**
- J'ai mis en place le Docker Compose pour que tout le monde puisse lancer le projet sans installer Go ou Node manuellement.
- J'ai expliqué le fonctionnement du système ELO à l'équipe pour qu'ils puissent l'afficher correctement côté UI.

**Aide reçue :**
- L'équipe frontend (ceux qui ont repris le backend TS) m'a tenu informé des changements d'API pour que ynov-baby-vision reste compatible.
- Un coéquipier m'a aidé à identifier le bug de l'ordre de migration GORM (la table `matches` référençait `tournaments` avant sa création).

---

## Contexte du bac à sable

Le challenge m'a permis de toucher à des technos que j'aurais pas eu l'occasion d'utiliser dans un contexte de cours classique, notamment **YOLOv8 et OpenCV** pour de la détection d'objets en temps réel. C'est quelque chose que j'avais envie d'explorer depuis un moment mais je n'avais pas eu l'occasion.

Le fait de travailler en équipe pluridisciplinaire a aussi été intéressant : j'ai dû expliquer des concepts IA/data à des devs backend, et inversement comprendre leurs contraintes côté API pour que mon module s'intègre proprement. C'est exactement ce genre de situation qu'on retrouve en entreprise.

---

## IA

J'ai utilisé **Claude Code** (IA d'Anthropic, dans VS Code) pour m'aider sur ce challenge. Voici comment :

- **Génération de boilerplate** : mise en place initiale du projet Go (structure des dossiers, go.mod, Dockerfile, docker-compose.yml). J'ai relu et adapté chaque fichier.
- **Debugging** : Claude m'a aidé à identifier le bug de migration GORM et le problème de go.sum manquant dans la CI.
- **ynov-baby-vision** : j'ai utilisé Claude pour structurer le code Python (séparation tracker/detector/api_client), mais la logique de détection (produit vectoriel pour l'intersection de lignes, cooldown entre buts) a été revue et comprise par moi avant intégration.
- **Documentation** : aide à la rédaction des guides techniques.

Je n'ai pas utilisé l'IA de façon exclusive — chaque bloc de code généré a été lu, compris et souvent modifié. L'IA m'a surtout servi à aller plus vite sur les parties répétitives (boilerplate, config Docker) pour me concentrer sur la logique métier.

---

## Shop

Je n'ai pas eu connaissance du système de shop pendant le challenge, je n'ai donc pas pu en tirer parti.

---

## Difficultés / Facilités

**Difficultés :**
- La migration de stack en cours de challenge : l'équipe a décidé de passer de Go à TypeScript/Express/Prisma pour le backend, ce qui a nécessité de s'adapter rapidement et de re-aligner les interfaces API.
- La calibration des lignes de but dans ynov-baby-vision : les coordonnées en pixels dépendent du placement exact de la caméra, il faut une phase de calibration manuelle pour chaque installation. Pas de solution parfaite en 48h.
- Les problèmes Windows/Linux sur les fins de ligne (CRLF/LF) qui créaient de faux "fichiers modifiés" dans git.

**Facilités :**
- Go est un langage que je maîtrise assez bien, ce qui m'a permis d'avancer rapidement sur le backend initial.
- Docker Compose a rendu le déploiement simple pour toute l'équipe.

---

## Investissements personnels

- 4 repositories créés et organisés dans l'organisation GitHub
- Rédaction de 5 fichiers de documentation (architecture, API, installation, guide utilisateur, README)
- Module ynov-baby-vision complet (5 fichiers Python, ~300 lignes)
- Mise en place du pipeline CI/CD (GitHub Actions)

---

## Retours personnels

Le format du challenge est bien pensé : 48h c'est court, mais suffisant pour apprendre des choses et produire quelque chose de concret. Le fait d'être évalué sur la collaboration plutôt que sur la perfection technique est une bonne approche — ça correspond mieux à la réalité du terrain.

Ce que j'améliorerais : une réunion de kick-off plus structurée au départ pour éviter les divergences de stack en cours de route. On a perdu du temps à ré-aligner l'équipe sur l'architecture backend.
