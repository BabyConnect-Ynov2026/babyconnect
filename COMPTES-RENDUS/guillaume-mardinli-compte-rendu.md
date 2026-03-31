# Compte-rendu — [Guillaume MARDINLI] — [B3 INFRA] - [Equipe SaSuffit]

**Challenge 48h Ynov Toulouse 2026 — Babyfoot du futur**

---

## Le Projet

On a décidé de partir sur une App Web qui permet la reservation de Babyfoot pour certains créneaux via un scan de badge NFC. 
L'utilisateur se connecte sur l'application, il peut voir l'état des babyfoot (si des gens jouent dessus ou pas ) et si il trouve un babyfoot libre il peut scanner le badge NFC pour le reserver et dire qu'il joue dessus, il peut designer combien de joueurs jouent avec lui (et leur nom), comme ca si il reste un place quelqu'un peut venir jouer en plus. 
Il y a aussi un systeme de classement, quand on gagne, on gagne de l'elo et quand on perd de l'élo; cet elo peut servir lors de tournoi organisés (par le bde par exemple ou autre) et il y a donc un systeme d eclassement. On a aussi mis en place un systeme de Camera et de Capteurs qui servetn a savoir si un but a été marqués ou non. (double verification on sait jamais si le capteur bug ou alors la camera). 

 
## Ma contribution

Dans un premier temps j'ai participé a la recherche de fonctionnalités et de materiel nécessaire pour le projet; et avec l'équipe infra j'ai participé a la mise en place de Raspberry et a sa configuration pour pouvoir y déployer l'application par la suite. J'ai aussi mis un place un systeme de monitoring (Grafana + Prometheus + Exporter) pour avoir une vision de nos conteneurs et de notre raspberry

### Ce que j'ai fait

- Recherche de fonctionnalités 
- Recherche du materiel necessaire 
- Initialisation du Raspberry 
- Configuration du Raspberry afin d'y déployer l'application par la suite 
- Installation et Configuration de Grafana + Prometheus + Node Exporter + Cadvisor) pour avoir une vue sur la santé du Raspberry et des conteneurs. 
---


## Aide 

- J'ai pas mal travaillé en groupe sur le Raspberry et sa configuration et aidé les devs sur la comprehenson de nos besoin en infra (surtout sur docker)

## Difficultés rencontrées

<!-- Quels obstacles as-tu rencontré ? Techniques, d'organisation, de communication ? -->

- On avait commandé un premier Raspberry, mais la carte SD avait un probleme et ne voulait pas prendre un compte l'iso (Erreur a la fin de l'etape validation de l'installation de l'iso).
- On avait pas de cable ethernet ou encore d'ecran branché au Raspberry donc pour trouver l'adresse ip pour se connecter en ssh on a eu du mal au début. (Difficulté qu'on a vite résolu)
- Dans un groupe de 10 c'est difficile de communiquer et de se repartir les taches. 

---

## Ce que j'ai appris

<!-- Nouvelles technologies, méthodes de travail, soft skills... -->

- Ca a surtout mis a l'épreuve ma patience (il y aura toujours quelqu'un qui n'avance pas forcement comme on veut mais on peut rien y faire), ma capacité a communiqué parce que dans un projet ou on est nombreux ca peut vite partir dans tous les sens. 
Donc je dirais que c'est vraiment l'aspect gestion de projet / gestion d'équipe qui a été mis en avant et que j'ai pu développer sur ce projet plutot que l'aspect technique.

---

## Bilan

<!-- Un retour personnel sur le challenge. Ce que tu retiens, ce que tu ferais différemment... -->

- De mon point de vue je trouve le Challenge 48h moins interessant que les années prescedentes (B1 et B2) qui étaient plus accès technique. Je trouve que c'est encore un peu "tot" dans la scolarité pour se pencher sur la gestion de groupe, c'est quelque chose qu'on mets pas dutout en pratique en entreprise (dans la mienne en tout cas et pareil pour mes amis). Je trouve ca dommage de s'attarder sur ce point alors qu'on pourrait travailler sur de la technique et s'epanouir beaucoup plus dans le projet. Et pour le delai impartit je trouve qu'on était beaucoup trop dans les groupes.

**Cependant :**
J'ai critiqué mais si on enleve mon point de vue sur le manque d'aspect technique dans le projet. Concernant la gestion de projet et d'équipe ca reste un très bon exercice a pratiquer. 


## Annexe 

**Preuves d'investissement**

- Communication Discord :

![Identifiants Reseau pour Raspberry](https://imgur.com/a/9ZFc9XY)

![Carte SD Raspberry](https://imgur.com/a/5RAYua8)

![IP Raspberry](https://imgur.com/a/meos1y5)

![Avancée configration Raspberry](https://imgur.com/a/SnC0yzT)

![Commit Git](https://imgur.com/a/CnKQXR0)