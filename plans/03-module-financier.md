# Plan 03 — Module Financier

## Objectif
Permettre à l'éleveur de voir le coût de revient réel de chaque animal et la rentabilité globale du troupeau.

## Backend — Nouveau controller + routes

### Fichiers à créer
- `backend/src/controllers/finances.controller.js`
- `backend/src/routes/finances.routes.js`

### Endpoint 1 — Coût par animal
```
GET /api/finances/animal/:id
```
Calcul :
- Coût achat = `poidsEntree × prixAchatKg` (champ à ajouter sur Animal)
- Coût alimentation = somme des `Distribution.coutEstime` où `animal = :id`
- Coût santé = somme des coûts des `Traitement` où `animal = :id` (ajouter champ `coutTotal` sur Traitement)
- Coût total = achat + alimentation + santé
- Bénéfice projeté = `poidsActuel × prixMarcheKg` (depuis Parametres) - coût total
- Marge = bénéfice / coût total × 100

### Endpoint 2 — Bilan global du troupeau
```
GET /api/finances/troupeau
```
- Coût total troupeau (somme de tous les animaux actifs)
- Revenu projeté si vente aujourd'hui
- Marge globale
- Top 5 animaux les plus rentables
- Top 5 animaux les moins rentables (à surveiller)

### Endpoint 3 — Projection de vente
```
GET /api/finances/projection?ids=id1,id2,id3
```
- Prend une liste d'IDs d'animaux
- Retourne le revenu total si on les vend aujourd'hui au prix du marché actuel

### Champs à ajouter sur les modèles existants
- `Animal` : `prixAchatKg: Number` (prix payé au kilo à l'achat)
- `Traitement` : `coutTotal: Number` (coût total du traitement en MAD)
- `Parametres` : `prixVenteKgMoyen: Number` (prix de vente moyen au kilo, mis à jour manuellement)

### Enregistrer dans `backend/src/routes/index.js`
```js
app.use('/api/finances', require('./finances.routes'))
```

## Frontend — Nouvelles pages

### Fichiers à créer
- `frontend/app/(dashboard)/finances/page.tsx` — bilan global
- `frontend/app/(dashboard)/finances/animal/[id]/page.tsx` — rentabilité par animal

### `finances/page.tsx`
- KPI cards : Coût total troupeau | Revenu projeté | Marge globale
- Graphique BarChart : coût vs. revenu par animal (top 10)
- Tableau : liste des animaux avec coût/tête, revenu projeté, marge (%)
- Indicateur couleur : vert (marge > 20%), orange (0-20%), rouge (perte)

### `finances/animal/[id]/page.tsx`
- Détail du coût : achat + alimentation + santé (avec graphique en donut)
- Évolution du coût cumulé dans le temps (LineChart)
- Projection : "Si vendu aujourd'hui → X MAD de bénéfice"

### Sidebar
Ajouter entrée **Finances** dans `components/dashboard/Sidebar.tsx`
avec icône `TrendingUp` (lucide-react).

## Dépendances
- `recharts` (déjà installé au plan 02)
- Aucune nouvelle dépendance backend
