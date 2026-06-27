# Mohamed — Santé, Alertes & BoviAI

**Ma partie :** santé du troupeau, traitements, alertes et assistant IA.

## Pages à présenter

- `/sante` — traitements et registre
- `/sante/etat` — état sanitaire du troupeau
- `/sante/etat/nouveau` — enregistrer un état
- `/sante/traitement/nouveau` — nouveau traitement
- `/sante/planification` — plans de traitement
- `/sante/calendrier` — calendrier sanitaire
- `/performance` — centre des alertes
- `/boviai` — assistant IA
- Cloche notifications — alertes temps réel

## Code frontend à citer

- `app/(dashboard)/sante`
- `app/(dashboard)/performance`
- `app/(dashboard)/boviai`
- `hooks/useAlerts.ts`
- `contexts/AlertsContext.tsx`
- `components/dashboard/NotificationBell.tsx`

## Code backend à citer

- `controllers/sante.controller.js`
- `controllers/alerte.controller.js`
- `controllers/boviAI.controller.js`
- `services/alertService.js`
- `services/boviAITools.js`
- `socket.js`

## Points simples à dire

1. Les traitements suivent le produit, dose, dates et délai de retrait.
2. Le délai de retrait bloque la vente avant la date autorisée.
3. Les alertes sont affichées dans le centre des alertes.
4. Socket.IO sert aux notifications temps réel.
5. BoviAI utilise Gemini et interroge les vraies données via des tools.

## Démo rapide

Santé → nouveau traitement → alertes → BoviAI → cloche notifications.
