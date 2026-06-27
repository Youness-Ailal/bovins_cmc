# Salma — Authentification, Administration & Sécurité

**Ma partie :** connexion, rôles, utilisateurs et configuration de la ferme.

## Pages à présenter

- `/login` — connexion email + mot de passe
- `/administration` — accueil administration
- `/administration/utilisateurs` — liste, ajout, modification, rôle, statut
- `/administration/races` — races, poids cible, GMQ cible
- `/administration/parametres` — informations de la ferme
- `/administration/alertes` — configuration des alertes

## Code frontend à citer

- `app/(auth)/login/page.tsx`
- `app/(dashboard)/administration`
- `components/dashboard/AuthGuard.tsx`
- `components/dashboard/Sidebar.tsx`
- `lib/auth.tsx`
- `lib/roleAccess.ts`

## Code backend à citer

- `controllers/auth.controller.js`
- `controllers/user.controller.js`
- `controllers/race.controller.js`
- `controllers/parametres.controller.js`
- `middleware/auth.js`
- `models/User.js`

## Points simples à dire

1. La connexion utilise un **JWT**.
2. Le backend vérifie seulement que l'utilisateur est connecté avec `protect`.
3. L'accès par rôle est fait côté frontend : menu filtré + redirection vers `/dashboard`.
4. 3 rôles : **Admin**, **Responsable**, **Vétérinaire**.
6. Le mot de passe oublié a été supprimé.
7. Le mot de passe se change depuis : `Administration > Utilisateurs > Modifier utilisateur`.

## Démo rapide

Connexion Admin → Utilisateurs → modifier rôle/mot de passe → Races → Paramètres.
