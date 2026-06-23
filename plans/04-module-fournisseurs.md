# Plan 04 — Module Fournisseurs

## Objectif
Gérer les fournisseurs d'aliments, médicaments et équipements, ainsi que les commandes d'achat.
Déclencher des suggestions de commande automatiques quand le stock passe sous le seuil minimum.

## Backend

### Fichiers à créer
- `backend/src/models/Fournisseur.js`
- `backend/src/models/CommandeAchat.js`
- `backend/src/controllers/fournisseur.controller.js`
- `backend/src/routes/fournisseur.routes.js`

### Modèle `Fournisseur`
```js
{
  nom: String (requis),
  contact: String,          // téléphone ou email
  region: String,           // ex: Casablanca, Meknès, Settat
  type: enum ['Aliments', 'Médicaments', 'Équipements', 'Autre'],
  articlesHabituels: [{ ref: 'StockArticle', prixHabituel: Number }],
  notes: String,
}
```

### Modèle `CommandeAchat`
```js
{
  fournisseur: { ref: 'Fournisseur', requis },
  date: Date,
  statut: enum ['En attente', 'Confirmée', 'Livrée', 'Annulée'],
  lignes: [{ article: { ref: 'StockArticle' }, quantite: Number, prixUnitaire: Number }],
  montantTotal: Number,     // calculé automatiquement
  notes: String,
}
```

### Endpoints
```
GET    /api/fournisseurs              — liste tous les fournisseurs
POST   /api/fournisseurs              — créer un fournisseur
GET    /api/fournisseurs/:id          — détail fournisseur
PUT    /api/fournisseurs/:id          — modifier
DELETE /api/fournisseurs/:id          — supprimer

GET    /api/fournisseurs/commandes    — toutes les commandes
POST   /api/fournisseurs/commandes    — créer une commande
PUT    /api/fournisseurs/commandes/:id — changer statut (livraison)
```

### Logique automatique — Suggestions de commande
Dans `stock.controller.js`, après chaque mouvement de sortie :
- Si `article.quantite <= article.seuil` → créer une `Alerte` de type "Stock critique"
- Ajouter à l'alerte : `fournisseurSuggere` = le fournisseur qui fournit habituellement cet article

### Enregistrer dans `backend/src/routes/index.js`
```js
app.use('/api/fournisseurs', require('./fournisseur.routes'))
```

## Frontend

### Fichiers à créer
- `frontend/app/(dashboard)/fournisseurs/page.tsx`
- `frontend/app/(dashboard)/fournisseurs/nouveau/page.tsx`
- `frontend/app/(dashboard)/fournisseurs/[id]/page.tsx`
- `frontend/app/(dashboard)/fournisseurs/commandes/page.tsx`
- `frontend/app/(dashboard)/fournisseurs/commandes/nouvelle/page.tsx`

### `fournisseurs/page.tsx`
- Tableau : nom, région, type, nombre de commandes passées
- Bouton "Nouveau fournisseur"
- Filtre par type (Aliments / Médicaments / Équipements)

### `fournisseurs/commandes/page.tsx`
- Tableau des commandes avec statut coloré (badge)
- Filtres : fournisseur, statut, période
- Bouton "Marquer comme livré" → déclenche entrée en stock automatiquement
- Total des achats sur 30 / 90 jours

### Sidebar
Ajouter entrée **Fournisseurs** dans `Sidebar.tsx`
avec icône `Truck` (lucide-react).

## Intégration avec le module Stock
Quand une commande passe en statut "Livrée" :
→ créer automatiquement un `StockMouvement` de type "entrée" pour chaque ligne de commande.
