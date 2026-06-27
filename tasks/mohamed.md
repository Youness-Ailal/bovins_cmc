# Mohamed — Santé, Centre des alertes & BoviAI

**Ma partie :** le suivi sanitaire, les alertes en temps réel, et l'assistant IA.
C'est la partie « waouh » : je termine la démo.

🔗 App : https://bovitrack.netlify.app

## Pages que je présente

| Page | Lien | Ce que je montre |
|---|---|---|
| Santé | https://bovitrack.netlify.app/sante | Vue d'ensemble santé |
| États de santé | https://bovitrack.netlify.app/sante/etat | Liste + saisie d'un état |
| Nouveau traitement | https://bovitrack.netlify.app/sante/traitement/nouveau | Traitement + délai de retrait |
| Planification | https://bovitrack.netlify.app/sante/planification | Plans de traitement |
| Calendrier | https://bovitrack.netlify.app/sante/calendrier | Calendrier sanitaire |
| Centre des alertes | https://bovitrack.netlify.app/performance | Alertes : traiter / ignorer / exporter |
| BoviAI | https://bovitrack.netlify.app/boviai | Assistant IA (poser une question sur la ferme) |
| Cloche 🔔 | (en haut du dashboard) | Notifications en temps réel |

> Remarque : la route `/performance` est mal nommée — c'est le **Centre des alertes**.

## Code derrière (backend)
- `controllers/sante.controller.js` — états de santé, traitements, plans
- `controllers/alerte.controller.js` — liste / traiter / ignorer les alertes
- `services/alertService.js` + `socket.js` — **alertes temps réel (Socket.io)**
- `controllers/boviAI.controller.js` + `services/boviAITools.js` — **IA (function-calling Gemini)**
- Côté écran : `hooks/useAlerts.ts`, `contexts/AlertsContext.tsx`, `NotificationBell`

## Ce que je dois dire (points clés)
1. Les **alertes en temps réel** (WebSocket / Socket.io) : santé, stock faible, fin de
   délai de retrait → toast + cloche de notifications, sans rafraîchir la page.
2. Le **délai de retrait** : un animal traité ne peut pas être vendu avant la fin du délai.
3. **BoviAI** : l'IA interroge la vraie base via des outils (tools) et donne un conseil,
   pas juste un chiffre.

## Ordre de démo
Page Santé → ajouter un traitement (délai de retrait) → Centre des alertes →
poser une question à BoviAI → montrer la cloche qui se met à jour en direct.
