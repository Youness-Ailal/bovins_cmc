# Répartition de la soutenance — BOVITRACK

**Application :** https://bovitrack.netlify.app

Chaque étudiant présente une partie claire du projet : les pages, le rôle métier, et le code principal derrière.

## Ordre conseillé

1. **Salma** — Authentification, rôles, administration
2. **Safouane** — Animaux et parcelles
3. **Youness** — Stocks et rations
4. **Hajar** — Dashboard, finances et fournisseurs
5. **Mohamed** — Santé, alertes et BoviAI

## Parties par étudiant

| Étudiant | Partie | Pages principales | À expliquer simplement |
|---|---|---|---|
| **Salma** | Authentification, Administration, Sécurité | Login, Administration, Utilisateurs, Races, Paramètres, Config alertes | Connexion avec JWT, rôles, accès par rôle côté frontend, gestion des utilisateurs, changement de mot de passe depuis l'administration. |
| **Safouane** | Animaux & Parcelles | Animaux, Nouvel animal, Fiche animal, Pesée, Sortie, Prêts à vendre, Parcelles, Nouvelle parcelle, Transfert | Cycle de vie d'un animal, pesées, GMQ, changement de phase, sortie, QR/PDF, transfert entre parcelles avec capacité. |
| **Youness** | Stocks & Rations | Stocks, Nouvel article, Fiche article, Mouvement, Historique, Rations, Nouvelle ration, Distribution | Gestion du stock, seuils d'alerte, mouvements entrée/sortie, composition des rations, distribution et consommation de stock. |
| **Hajar** | Dashboard, Finances & Fournisseurs | Dashboard, Finances, Rentabilité animal, Fournisseurs, Nouveau fournisseur, Commandes, Nouvelle commande | KPIs, graphiques, coûts par période, marge/rentabilité, fournisseurs et commandes comme source des coûts. |
| **Mohamed** | Santé, Alertes & BoviAI | Santé, États de santé, Nouveau traitement, Planification, Calendrier, Alertes, BoviAI, Cloche notifications | Traitements, délai de retrait, alertes, centre des alertes, notifications temps réel, assistant IA Gemini. |

## Code à citer par partie

| Étudiant | Frontend | Backend |
|---|---|---|
| **Salma** | `app/(auth)`, `app/(dashboard)/administration`, `components/dashboard/AuthGuard.tsx`, `components/dashboard/Sidebar.tsx`, `lib/auth.tsx`, `lib/roleAccess.ts` | `controllers/auth.controller.js`, `controllers/user.controller.js`, `controllers/race.controller.js`, `controllers/parametres.controller.js`, `middleware/auth.js`, `models/User.js` |
| **Safouane** | `app/(dashboard)/animaux`, `app/(dashboard)/parcelles`, `components/forms/AnimalForm.tsx` | `controllers/animal.controller.js`, `controllers/parcelle.controller.js`, `models/Animal.js`, `models/Parcelle.js`, `models/Pesee.js`, `utils/calculations.js`, `utils/pdfGenerator.js` |
| **Youness** | `app/(dashboard)/stocks`, `app/(dashboard)/rations` | `controllers/stock.controller.js`, `controllers/ration.controller.js`, `models/StockArticle.js`, `models/StockMouvement.js`, `models/Ration.js`, `models/Distribution.js` |
| **Hajar** | `app/(dashboard)/dashboard`, `app/(dashboard)/finances`, `app/(dashboard)/fournisseurs`, `components/dashboard/TroupeauBarChart.tsx`, `components/dashboard/CoutsDonutChart.tsx` | `controllers/dashboard.controller.js`, `controllers/finances.controller.js`, `controllers/fournisseur.controller.js`, `models/Fournisseur.js`, `models/CommandeAchat.js` |
| **Mohamed** | `app/(dashboard)/sante`, `app/(dashboard)/performance`, `app/(dashboard)/boviai`, `hooks/useAlerts.ts`, `contexts/AlertsContext.tsx`, `components/dashboard/NotificationBell.tsx` | `controllers/sante.controller.js`, `controllers/alerte.controller.js`, `controllers/boviAI.controller.js`, `services/alertService.js`, `services/boviAITools.js`, `socket.js` |

## Rôles de démonstration

| Personne | Rôle conseillé |
|---|---|
| Salma | **Admin** |
| Safouane | **Responsable** |
| Youness | **Responsable** |
| Hajar | **Responsable** |
| Mohamed | **Vétérinaire** |

## Accès par rôle

Le rôle **Opérateur** a été supprimé. Il reste seulement :

| Rôle | Accès |
|---|---|
| **Admin** | Toutes les pages, y compris Administration. |
| **Responsable** | Dashboard, Animaux, Parcelles, Stocks, Rations, Finances, Fournisseurs, Alertes. |
| **Vétérinaire** | Dashboard, Animaux, Santé, Alertes, BoviAI. |

Notes importantes pour Salma :

- L'utilisateur se connecte avec email + mot de passe.
- Le backend vérifie le token JWT avec `protect`.
- L'accès par rôle est appliqué côté frontend : menu filtré + redirection vers `/dashboard` si la page n'est pas autorisée.
- Le mot de passe oublié a été supprimé.
- Le changement de mot de passe se fait par l'admin dans : `Administration > Utilisateurs > Modifier utilisateur`.

## Comptes de démo

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | youness@bovitrack.ma | password123 |
| Responsable | salma@bovitrack.ma | password123 |
| Vétérinaire | mohamed@bovitrack.ma | password123 |

## Stack technique à citer

- **Frontend** : Next.js, React, TypeScript, Tailwind.
- **Backend** : Express, Node.js, MongoDB/Mongoose.
- **Auth** : JWT.
- **Temps réel** : Socket.IO pour les alertes.
- **IA** : Gemini avec tools/function calling.
- **PDF** : génération serveur pour passeport, rapports, carnets.

## Fiches détaillées

- [salma.md](salma.md)
- [safouane.md](safouane.md)
- [youness.md](youness.md)
- [hajar.md](hajar.md)
- [mohamed.md](mohamed.md)
