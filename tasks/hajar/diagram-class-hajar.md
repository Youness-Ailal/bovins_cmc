# Diagramme de classe - Hajar

Modules: Dashboard, Finances et Fournisseurs.

## Classes

```text
Fournisseur
- id: Int
- nom: String
- contact: String
- region: String
- type: String
- notes: String

CommandeAchat
- id: Int
- date: Date
- montantTotal: Float
- notes: String

LigneCommande
- quantite: Float
- prixUnitaire: Float

StockArticle
- id: Int
- designation: String
- categorie: String
- quantite: Float
- prixUnitaire: Float

StockMouvement
- id: Int
- type: String
- quantite: Float
- quantiteApres: Float
- date: Date
- prixUnitaire: Float

Animal
- id: Int
- identifiant: String
- poidsEntree: Float
- poidsActuel: Float
- coutCumule: Float
- statut: String
- sortie: Object

Pesee
- id: Int
- date: Date
- poids: Float
- gmq: Float

Parametres
- id: Int
- devise: String
- prixVenteKgMoyen: Float
- prixAchatKgMoyen: Float
- poidsMinVente: Float
```

## Relations et cardinalites

```text
Fournisseur 1 -------- 0..* CommandeAchat
Un fournisseur peut avoir plusieurs commandes.
Chaque commande appartient a un seul fournisseur.

CommandeAchat 1 -------- 1..* LigneCommande
Une commande contient une ou plusieurs lignes.
Chaque ligne appartient a une seule commande.

StockArticle 0..1 -------- 0..* LigneCommande
Une ligne peut pointer vers un article.
Un article peut apparaitre dans plusieurs commandes.

Fournisseur 0..1 -------- 0..* StockArticle
Un fournisseur peut fournir plusieurs articles.
Un article peut avoir un fournisseur ou aucun.

CommandeAchat 0..1 -------- 0..* StockMouvement
Une commande peut generer plusieurs mouvements de stock.
Un mouvement peut venir d'une commande ou non.

Animal 1 -------- 0..* Pesee
Les finances utilisent les pesees pour suivre performance et poids.

Animal 1 -------- 0..1 Sortie
La rentabilite animal utilise le prix de sortie quand l'animal est vendu.

Parametres
Classe singleton pour devise, prix moyens et seuils de calcul.
```
