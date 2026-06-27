# Hajar — Dashboard, Finances & Fournisseurs

**Ma partie :** vision globale, coûts, rentabilité et achats fournisseurs.

## Pages à présenter

- `/dashboard` — KPIs, graphiques, période
- `/finances` — coûts, revenus, marges
- `/finances/animal/[id]` — rentabilité par animal
- `/fournisseurs` — liste fournisseurs
- `/fournisseurs/nouveau` — création fournisseur
- `/fournisseurs/commandes` — commandes d'achat
- `/fournisseurs/commandes/nouvelle` — nouvelle commande

## Code frontend à citer

- `app/(dashboard)/dashboard`
- `app/(dashboard)/finances`
- `app/(dashboard)/fournisseurs`
- `components/dashboard/TroupeauBarChart.tsx`
- `components/dashboard/CoutsDonutChart.tsx`

## Code backend à citer

- `controllers/dashboard.controller.js`
- `controllers/finances.controller.js`
- `controllers/fournisseur.controller.js`
- `models/Fournisseur.js`
- `models/CommandeAchat.js`

## Points simples à dire

1. Le dashboard donne une vue rapide de la ferme.
2. Les graphiques montrent la répartition du troupeau et les coûts.
3. Les finances calculent les coûts, revenus, marges et rentabilité.
4. Les fournisseurs et commandes alimentent les coûts d'achat.
5. On peut analyser la rentabilité d'un animal.

## Démo rapide

Dashboard → changer période → finances → rentabilité animal → fournisseurs → commande.
