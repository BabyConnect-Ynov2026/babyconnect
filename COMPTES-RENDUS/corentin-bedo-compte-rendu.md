# Présentation du projet #

Notre projet vise à modernier l'utilisation du babyfoot tout en accentuant l'aspect social du jeu. On a donc décidé de créer une application web permettant de gérer des réservation des babys.
Le but est de pouvoir voir en une seconde si quelqu'un est déjà en train de jouer, s'il reste de la place, ou si on peut jouer. On peut réserver sa place pour un créneau choisi, demander pour organiser un tournoi, ou encore voir les statistiques de ses parties passées (classement ELO) ect.
Afin d'assurer les roulements, le baby, lorsqu'il est réservé, est utilisable pendant 15 min. Un chrono se lance quand on scanne la carte sur le baby, et si personne ne scanne, la réservation est annulée pour laisser la place aux autres.

## Mon rôle dans le projet ##
Au lancement, on a tous réfléchi à ce qu'on pouvait faire, et finalement on est partis sur l'appli de réservation. Je me suis occupé de faire le sondage au début pour valider l'idée.
Par la suite, je me suis lancé sur la création du Trello et le workgroup. On a fait un board pour la partie dev et un pour la partie infra.
On s'est ensuite concertés avec les infras pour savoir le matos dont on avait besoin, puis on a passé la commande : Raspberry Pi 5, cartes NFC, et bonbons !
Ma dernière tâche ça a été l'administration du Raspberry, la mise en place des services sous Docker (front, back, DB) et le déploiement.

## Aides ##
Il a fallu adapter le Dockerfile pour que le build passe bien et que la db soit bien connectée au front. De mon côté, je me suis fait aider pour bien comprendre comment le backend appelait la base de données ect.

## Contexte du bac à sable ##
Pour le bac à sable, on a tout fait tourner sur un Raspberry Pi 5. Le but c'était d'avoir un environnement propre, donc j'ai tout mis sous Docker : un conteneur pour le front, un pour le back et un pour la base de données. J'ai aussi rajouté Grafana (avec guillaume)et Prometheus pour surveiller si le Raspberry tenait le coup avec tout ce qu'on lui demandait.

## IA ##
J'ai utilisé l'IA (Gemini) surtout pour le débug technique. Par exemple, quand j'avais des erreurs de schémas Prisma ou des soucis de permissions sur Linux, ça m'a permis de trouver les bonnes commandes rapidement sans perdre 2h de recherche.
Je me suis aussi permis, après plusieurs conversations avec la pdg, d'imaginer des features en plus avec de l'IA, comme une caméra pour filmer les parties, les analyser, proposer des statistiques, des conseils personnalisés, et faire office d'arbitre.

## Shop ##
On a utilisé le shop pour commander tout le matos : Raspberry Pi 5, cartes NFC... et les bonbons dcp !
-BONUS- Notre professionnalisme oblige, on s'est assurés que le site de commerce était solide. J'ai regardé un peu les requêtes GET/POST et les surfaces d'attaques possibles pour être sûr qu'il n'y avait pas de failles.(pour commander plus de bonbons) Le site est solide 👍.

## Difficultés / Facilités ##
C'est la partie où j'ai le plus bossé. J'ai eu des galères de droits au début ("Permission denied" sur Git), j'ai dû tout remettre au propre avec des commandes chown.
Le plus gros problème technique, c'était Prisma qui ne trouvait pas les tables dans la base (erreur P2021). J'ai dû modifier le .env pour forcer tout le monde à utiliser le schéma public.
Enfin, comme le web demande du HTTPS pour le NFC, j'ai utilisé Pinggy pour créer un tunnel SSH sécurisé. C'était bien plus léger que de monter un reverse proxy complet sur le Raspberry.

## Investissements personnels ##
Je me suis pas mal investi pour que l'infra soit safe, j'ai généré des secrets de 128 bits pour les clés JWT et les accès base de données. J'ai aussi vérifié les logs Docker pour être sûr que tout communiquait bien et que le déploiement soit ok pour la demo qui j'espère vous a plu (si vous etes aller voir apres mon ping...).

## Retours personnels ##
Le format 48h est hyper intense mais c'est comme ça qu'on apprend. C'est gratifiant de voir l'appli qui tourne sur le Raspberry à la fin et que les cartes NFC soient bien détectées via l'URL sécurisée. Sans mentir, le projet niveau infra est léger donc j'ai pas été super stimulé, mais merci pour cet event quand meme.