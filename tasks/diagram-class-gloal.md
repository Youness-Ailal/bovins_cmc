# Diagramme de classe global

Ce diagramme presente une vue simplifiee du systeme. Il garde seulement les classes principales et les relations essentielles. Les classes de detail comme les lignes de commande, les ingredients de ration, les historiques complets et les parametres globaux sont documentees dans les diagrammes de module.

## Classes principales

```text
User
- id: Int
- nomComplet: String
- email: String
- role: String
- statut: String

Animal
- id: Int
- identifiant: String
- nni: String
- sexe: String
- phase: String
- poidsActuel: Float
- etatSante: String
- statut: String

Race
- id: Int
- nom: String
- poidsAdulte: Float
- gmqCible: Float

Parcelle
- id: Int
- nom: String
- reference: String
- capaciteMax: Int
- type: String

SuiviAnimal
- id: Int
- date: Date
- type: String
- valeur: String

Traitement
- id: Int
- type: String
- produit: String
- dateDebut: Date
- dateFin: Date
- statut: String

StockArticle
- id: Int
- designation: String
- categorie: String
- quantite: Float
- seuil: Float
- prixUnitaire: Float

StockMouvement
- id: Int
- type: String
- quantite: Float
- date: Date
- motif: String

Ration
- id: Int
- nom: String
- phase: String
- cible: String
- coutJour: Float

Distribution
- id: Int
- date: Date
- quantite: Float
- nbAnimaux: Int
- coutEstime: Float

Fournisseur
- id: Int
- nom: String
- contact: String
- type: String

CommandeAchat
- id: Int
- date: Date
- montantTotal: Float

Alerte
- id: Int
- niveau: String
- categorie: String
- message: String
- traitee: Boolean
```

## Relations essentielles

```text
Race 1 -------- 0..* Animal
Une race peut etre associee a plusieurs animaux.

Parcelle 0..1 -------- 0..* Animal
Une parcelle peut contenir plusieurs animaux.

Animal 1 -------- 0..* SuiviAnimal
Un animal peut avoir plusieurs suivis: pesees, etats de sante ou observations.

Animal 1 -------- 0..* Traitement
Un animal peut recevoir plusieurs traitements.

StockArticle 0..1 -------- 0..* Traitement
Un traitement peut utiliser un article de stock, par exemple un medicament.

Fournisseur 0..1 -------- 0..* StockArticle
Un fournisseur peut fournir plusieurs articles.

StockArticle 1 -------- 0..* StockMouvement
Chaque entree, sortie ou ajustement concerne un article de stock.

User 0..1 -------- 0..* StockMouvement
Un mouvement de stock peut etre enregistre par un utilisateur.

Fournisseur 1 -------- 0..* CommandeAchat
Un fournisseur peut avoir plusieurs commandes.

CommandeAchat 0..1 -------- 0..* StockMouvement
Une commande peut generer des mouvements de stock.

Ration 0..1 -------- 0..* Parcelle
Une ration peut etre affectee a plusieurs parcelles.

Ration 1 -------- 0..* Distribution
Une ration peut etre distribuee plusieurs fois.

StockArticle 0..* -------- 0..* Ration
Une ration est composee d'articles de stock sous forme d'ingredients.

Alerte
Classe transversale utilisee pour les alertes de stock, sante et notifications.
```
