# Salma — Authentification, Administration & Sécurité

**Ma partie :** comment on se connecte, qui a le droit de faire quoi (rôles), et la
configuration de la ferme. C'est moi qui ouvre la démo (la connexion).

🔗 App : https://bovitrack.netlify.app

## Pages que je présente

| Page | Lien | Ce que je montre |
|---|---|---|
| Connexion | https://bovitrack.netlify.app/login | Login, email + mot de passe, redirection |
| Mot de passe oublié | https://bovitrack.netlify.app/forgot-password | Demande de réinitialisation |
| Réinitialisation | https://bovitrack.netlify.app/reset-password | Nouveau mot de passe |
| Administration | https://bovitrack.netlify.app/administration | Accueil admin |
| Utilisateurs | https://bovitrack.netlify.app/administration/utilisateurs | Liste, ajout, rôles des membres |
| Races | https://bovitrack.netlify.app/administration/races | Races + poids/GMQ cible (base des calculs) |
| Paramètres | https://bovitrack.netlify.app/administration/parametres | Infos ferme, devise |
| Config alertes | https://bovitrack.netlify.app/administration/alertes | Seuils des alertes |

> Les pages « nouveau » et « détail » (utilisateurs, races) s'ouvrent depuis les listes.

## Code derrière (backend)
- `controllers/auth.controller.js` — connexion, mot de passe oublié/réinitialisation
- `middleware/auth.js` — `protect` (vérifie le JWT) + `restrictTo` (vérifie le rôle)
- `config/roles.js` — les 3 rôles et leurs permissions ; `lib/permissions.ts` (côté écran)
- `controllers/user.controller.js`, `race.controller.js`, `parametres.controller.js`

## Ce que je dois dire (points clés)
1. **JWT** : à la connexion, le serveur renvoie un token ; chaque requête est protégée par `protect`.
2. **RBAC (rôles)** : 3 rôles — Admin, Responsable, Vétérinaire, .
La sécurité
   est **côté serveur** (`restrictTo`) ; côté écran on cache juste les boutons interdits.
3. Les **races** servent de référence aux calculs (poids cible, GMQ cible).

## Ordre de démo
Connexion (Admin) → page Utilisateurs (montrer les rôles) → Races → Config alertes.
