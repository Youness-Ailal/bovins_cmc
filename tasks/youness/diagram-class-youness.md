# Diagramme de classe - Youness

Modules: Stocks et Rations.

## Classes

```text
StockArticle
- id: Int
- designation: String
- reference: String
- categorie: String
- unite: String
- quantite: Float
- seuil: Float
- prixUnitaire: Float
- datePeremption: Date
- notes: String
- statut: String

StockMouvement
- id: Int
- type: String
- quantite: Float
- quantiteApres: Float
- date: Date
- prixUnitaire: Float
- motif: String
- notes: String

Ration
- id: Int
- nom: String
- phase: String
- cible: String
- coutJour: Float
- nbIngredients: Int

IngredientRation
- nom: String
- quantite: Float
- unite: String
- prixUnitaire: Float

Distribution
- id: Int
- cible: String
- date: Date
- quantite: Float
- nbAnimaux: Int
- coutEstime: Float
- notes: String

Fournisseur
- id: Int
- nom: String
- contact: String
- region: String
- type: String

User
- id: Int
- prenom: String
- nom: String
- email: String
- role: String
```

## Relations et cardinalites

```text
Fournisseur 0..1 -------- 0..* StockArticle
Un fournisseur peut fournir plusieurs articles.
Un article peut avoir un fournisseur ou aucun.

StockArticle 1 -------- 0..* StockMouvement
Un article peut avoir plusieurs mouvements.
Chaque mouvement concerne un seul article.

User 0..1 -------- 0..* StockMouvement
Un utilisateur peut enregistrer plusieurs mouvements.
Un mouvement peut avoir un utilisateur ou aucun.

Ration 1 -------- 0..* IngredientRation
Une ration contient plusieurs ingredients.
Chaque ingredient appartient a une seule ration.

StockArticle 0..1 -------- 0..* IngredientRation
Un ingredient peut etre lie a un article de stock.
Un article peut etre utilise dans plusieurs rations.

Ration 1 -------- 0..* Distribution
Une ration peut etre distribuee plusieurs fois.
Chaque distribution concerne une seule ration.
```
