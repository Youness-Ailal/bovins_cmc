# Répartition de la soutenance — BOVITRACK

🔗 **Application en ligne :** https://bovitrack.netlify.app

Le projet est découpé en 5 parties, une par personne. Chaque membre présente une
**tranche complète** (les pages + le code derrière) qu'il peut démontrer en direct.

| # | Membre | Domaine | Pages | Fiche |
|---|---|---|---|---|
| 1 | Salma | Authentification, Administration & Sécurité | 11 | [salma.md](salma.md) |
| 2 | Safouane | Animaux & Parcelles | 11 | [safouane.md](safouane.md) |
| 3 | Youness | Stocks & Rations | 11 | [youness.md](youness.md) |
| 4 | Hajar | Dashboard, Finances & Fournisseurs | 9 | [hajar.md](hajar.md) |
| 5 | Mohamed | Santé, Centre des alertes & BoviAI | 9 | [mohamed.md](mohamed.md) |

> Ordre conseillé : **Salma** (connexion + rôles) → **Safouane** (les animaux) →
> **Youness** (stocks/alimentation) → **Hajar** (finances/achats) →
> **Mohamed** (santé + temps réel + IA, le final « waouh »).

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | youness@bovitrack.ma | password123 |
| Responsable | salma@bovitrack.ma | password123 |
| Vétérinaire | mohamed@bovitrack.ma | password123 |

## Stack technique

- **Frontend** : Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 — déployé sur Netlify
- **Backend** : Express 5 + Node.js + MongoDB (Mongoose)
- **Temps réel** : Socket.io · **IA** : Gemini (function-calling) · **PDF** : génération serveur

## Note d'équilibre

Répartition resserrée (9–11 pages). Mohamed a un peu moins de pages mais porte les
deux pièces les plus techniques (temps réel + IA). La page `/performance` est en
réalité le **Centre des alertes** (route mal nommée), rattachée à Mohamed.
