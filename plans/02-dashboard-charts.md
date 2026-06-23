# Plan 02 — Dashboard avec vrais graphiques

## Objectif
Remplacer les boîtes KPI statiques par un tableau de bord dynamique avec graphiques interactifs
alimenté par l'API réelle `/api/dashboard`.

## Installation
```bash
cd frontend && npm install recharts
```

## Étape 1 — Connecter les KPIs à l'API

L'endpoint `GET /api/dashboard` retourne déjà :
```json
{
  "kpis": { "gmqMoyen", "troupeauTotal", "coutKgMoyen", "alertesActives", "pretsAVendre" },
  "repartition": { "Veau", "Croissance", "Engraissement", "Finition" },
  "coutTotal": 0,
  "stock": [...],
  "traitements": [...],
  "alertes": [...]
}
```

Modifier `dashboard/page.tsx` pour appeler cet endpoint au chargement.

## Étape 2 — Graphique 1 : Répartition du troupeau (PieChart)

```tsx
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'

const data = [
  { name: 'Veau', value: repartition.Veau },
  { name: 'Croissance', value: repartition.Croissance },
  { name: 'Engraissement', value: repartition.Engraissement },
  { name: 'Finition', value: repartition.Finition },
]
const COLORS = ['#93C5FD', '#6EE7B7', '#FCD34D', '#2D7A3A']
```

## Étape 3 — Graphique 2 : Niveau des stocks critiques (BarChart)

Données : articles depuis `GET /api/dashboard` → champ `stock`
- Barre verte si quantite > seuil
- Barre rouge si quantite <= seuil
- Ligne de référence = seuil minimum

```tsx
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, Tooltip } from 'recharts'
```

## Étape 4 — Graphique 3 : Répartition des coûts (BarChart ou PieChart)

Données : depuis `GET /api/dashboard/rentabilite`
- Alimentation (distributions)
- Santé (traitements)
- Achat (estimation)

## Étape 5 — Liste alertes actives dynamique

Remplacer les alertes hardcodées par les alertes depuis l'API.
Rafraîchissement automatique toutes les 60 secondes (`setInterval`).

## Étape 6 — Liste traitements en cours

Remplacer par les traitements réels depuis l'API (`statut: "En cours" | "Planifié"`).

## Fichiers à modifier
- `frontend/app/(dashboard)/dashboard/page.tsx` — connexion API + intégration Recharts

## Fichiers à créer
- `frontend/components/dashboard/TroupeauPieChart.tsx`
- `frontend/components/dashboard/StockBarChart.tsx`
- `frontend/components/dashboard/CoutsChart.tsx`
- `frontend/components/dashboard/AlertesList.tsx`
- `frontend/components/dashboard/TraitementsEnCours.tsx`
