# Plan 01 — Connexion Frontend ↔ API

## Objectif
Remplacer toutes les données hardcodées dans les pages frontend par de vrais appels à l'API backend MongoDB.

## Étape 1 — Créer `frontend/lib/api.ts`

Wrapper centralisé pour tous les appels API :
- Lit le token JWT depuis localStorage
- Ajoute l'en-tête `Authorization: Bearer <token>`
- Gère les erreurs (401 → redirect login, 403 → message accès refusé, 500 → message erreur)
- Base URL depuis `process.env.NEXT_PUBLIC_API_URL`

```ts
// frontend/lib/api.ts
export async function apiFetch(path: string, options?: RequestInit) { ... }
export const api = {
  get: (path) => apiFetch(path),
  post: (path, body) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => apiFetch(path, { method: 'DELETE' }),
}
```

## Étape 2 — Connecter les pages Animaux

| Page | Méthode | Endpoint |
|---|---|---|
| `animaux/page.tsx` | GET | `/api/animals?statut=Actif` |
| `animaux/[id]/page.tsx` | GET | `/api/animals/:id` |
| `animaux/nouveau/page.tsx` | POST | `/api/animals` |
| `animaux/[id]/modifier/page.tsx` | PUT | `/api/animals/:id` |
| `animaux/[id]/pesee/nouveau/page.tsx` | POST | `/api/animals/:id/pesees` |
| `animaux/[id]/sortie/page.tsx` | POST | `/api/animals/:id/sortie` |
| `animaux/prets-a-vendre/page.tsx` | GET | `/api/animals?pretAVendre=true` |

## Étape 3 — Connecter les pages Parcelles

| Page | Méthode | Endpoint |
|---|---|---|
| `parcelles/page.tsx` | GET | `/api/parcelles` |
| `parcelles/[id]/page.tsx` | GET | `/api/parcelles/:id` |
| `parcelles/nouvelle/page.tsx` | POST | `/api/parcelles` |
| `parcelles/transfert/page.tsx` | POST | `/api/parcelles/transfert` |

## Étape 4 — Connecter les pages Stocks

| Page | Méthode | Endpoint |
|---|---|---|
| `stocks/page.tsx` | GET | `/api/stock/articles` |
| `stocks/nouveau/page.tsx` | POST | `/api/stock/articles` |
| `stocks/mouvement/page.tsx` | POST | `/api/stock/mouvements` |
| `stocks/historique/page.tsx` | GET | `/api/stock/mouvements` |

## Étape 5 — Connecter les pages Rations

| Page | Méthode | Endpoint |
|---|---|---|
| `rations/page.tsx` | GET | `/api/rations` |
| `rations/[id]/page.tsx` | GET | `/api/rations/:id` |
| `rations/nouvelle/page.tsx` | POST | `/api/rations` |
| `rations/distribution/page.tsx` | POST | `/api/rations/distributions` |
| `rations/historique/page.tsx` | GET | `/api/rations/distributions` |

## Étape 6 — Connecter les pages Santé

| Page | Méthode | Endpoint |
|---|---|---|
| `sante/page.tsx` | GET | `/api/sante/traitements` |
| `sante/etat/page.tsx` | GET | `/api/sante/etats` |
| `sante/planification/page.tsx` | GET | `/api/sante/plans` |
| `sante/calendrier/page.tsx` | GET | `/api/sante/plans` |
| `sante/traitement/nouveau/page.tsx` | POST | `/api/sante/traitements` |
| `sante/etat/nouveau/page.tsx` | POST | `/api/sante/etats` |

## Étape 7 — Connecter Administration

| Page | Méthode | Endpoint |
|---|---|---|
| `administration/utilisateurs/` | GET/POST | `/api/users` |
| `administration/utilisateurs/[id]/` | GET/PUT/DELETE | `/api/users/:id` |
| `administration/races/` | GET/POST | `/api/races` |
| `administration/races/[id]/` | GET/PUT/DELETE | `/api/races/:id` |
| `administration/alertes/` | GET/PUT | `/api/alertes` |
| `administration/parametres/` | GET/PUT | `/api/parametres` |

## Étape 8 — Connecter Performance

| Page | Méthode | Endpoint |
|---|---|---|
| `performance/page.tsx` | GET | `/api/alertes` |

## Pattern à appliquer sur chaque page

```tsx
// Avant (hardcodé)
const [data, setData] = useState(STATIC_ARRAY)

// Après (API réelle)
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  api.get('/api/animals').then(res => {
    setData(res.data)
    setLoading(false)
  })
}, [])

if (loading) return <Spinner />
```

## Fichiers à créer / modifier
- `frontend/lib/api.ts` (nouveau)
- Toutes les pages listées ci-dessus (modifier)
- `frontend/components/ui/Spinner.tsx` (nouveau — indicateur de chargement)
- `frontend/components/ui/ErrorMessage.tsx` (nouveau — affichage erreur API)
