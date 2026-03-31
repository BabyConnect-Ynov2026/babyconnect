# Compte-rendu de projet – BabyConnect

## Introduction

Pour ce projet, j’ai travaillé sur une idée assez originale : rendre un baby-foot “intelligent” en le connectant à un système capable de comprendre ce qu’il se passe sur la table. L’objectif était d’améliorer l’expérience des étudiants sur le campus Ynov, avec une interface mobile simple et un module de vision capable de détecter les actions de jeu.  
C’était un projet assez complet, avec de la technique, de l’UX, de la vision et pas mal d’allers-retours pour que tout fonctionne ensemble.

## Ma contribution

Ma partie principale a été le sous-module `babyconnect-ai`, c’est-à-dire tout ce qui touche à la caméra, au traitement vidéo et à la détection d’événements.  
Concrètement, j’ai travaillé sur :

- la récupération du flux vidéo (DroidCam ou vidéo locale),
- la conversion du flux en images utilisables,
- la détection de la balle, des tirs et des buts,
- l’API Flask et le serveur WebSocket pour exposer les infos,
- l’outil de calibration pour régler les seuils HSV,
- l’organisation du code en modules clairs.

J’ai aussi participé à la réflexion sur l’expérience utilisateur pour que la vision s’intègre bien dans le parcours global.

## Partie UX / UI

Avant de coder, on a réalisé des maquettes mobiles pour clarifier l’expérience utilisateur.  
Deux écrans étaient vraiment importants :

- **La liste des baby-foots** : état (dispo, occupé, tournoi), localisation, joueurs présents, temps restant… L’idée était que l’utilisateur comprenne tout en un coup d’œil.
- **L’écran “NFC détecté”** : quand le téléphone approche une table équipée, l’app reconnaît automatiquement la table et propose des actions rapides comme jouer directement ou réserver.

Ces maquettes nous ont aidé à mieux comprendre les besoins réels et à imaginer comment la vision allait s’intégrer dans le parcours. Ça évite de développer des choses qui ne servent pas.

## Partie IA / Caméra

La partie vision est le cœur du module. Le fonctionnement global est :

**caméra → ffmpeg → Python → OpenCV → détection → API/WebSocket**

Les éléments principaux :

- `CameraSource` : lit le flux vidéo via `ffmpeg`.
- `DetectorService` : détecte la balle (HSV), estime les tirs, gère l’état du jeu.
- `GoalDetector` : prototype pour détecter les buts (zone + flux optique + franchissement de ligne).
- `calibrate.py` : outil pour régler la couleur de la balle et le cadrage.
- `events.py` : serveur WebSocket pour envoyer les événements en temps réel.

Le système fonctionne déjà en prototype : la balle est détectée, les tirs aussi, et la logique de but commence à être crédible même si elle reste sensible aux conditions réelles.

## Partie technique

Techniquement, le module repose sur :

- Python
- OpenCV
- NumPy
- Flask
- WebSocket
- ffmpeg
- DroidCam

L’API expose des routes simples comme `/health`, `/status`, `/events/recent`, `/start`, `/stop`.  
Le projet est structuré en modules (`camera`, `detector`, `goal_detection`, etc.) pour garder un code propre et compréhensible.

## Difficultés

Il y a eu plusieurs points compliqués :

- la stabilité du flux DroidCam (réseau, latence, qualité variable),
- la dépendance à `ffmpeg` qui doit être installé correctement,
- la détection HSV très sensible à la lumière et à la couleur de la balle,
- le placement de la caméra qui change tout,
- la détection de but, plus complexe qu’on l’imagine,
- le fichier `requirements.txt` pas cohérent avec le code réel,
- peu de tests sur un vrai baby-foot complet.

C’est un prototype avancé, mais pas encore un système totalement fiable en conditions réelles.

## Apprentissages

Ce projet m’a appris beaucoup de choses :

- gérer un flux vidéo en temps réel,
- utiliser OpenCV pour analyser des images,
- structurer un projet Python modulaire,
- créer une API simple mais fonctionnelle,
- comprendre comment relier vision, backend et interface mobile,
- calibrer un système de détection,
- travailler sur un cas concret où tout n’est pas parfait.

Ça m’a aussi appris à être patient, parce que la vision, c’est rarement simple du premier coup.

## Conclusion personnelle

Ce projet m’a vraiment fait progresser, autant techniquement que dans ma manière de réfléchir à un système complet.  
J’ai parfois eu du mal, mais voir le module fonctionner, détecter la balle et envoyer des événements, ça donne un vrai sentiment d’avancer.  
Le fait de travailler aussi sur les maquettes m’a aidé à garder en tête l’utilisateur final, pas seulement la technique.

Au final, c’est un projet exigeant mais très formateur, et je suis satisfait du résultat même s’il reste encore des améliorations possibles.
