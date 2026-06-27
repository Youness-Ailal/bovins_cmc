# Diagramme de classe global

Ce diagramme resume les principales classes backend, leurs attributs importants et les cardinalites.

## Classes principales

```text
User
- id: Int
- prenom: String
- nom: String
- email: String
- password: String
- role: String
- statut: String
- derniereConnexion: Date

Animal
- id: Int
- identifiant: String
- nni: String
- sexe: String
- origine: String
- phase: String
- poidsEntree: Float
- poidsActuel: Float
- dateEntree: Date
- etatSante: String
- gmqActuel: Float
- coutCumule: Float
- delaiRetraitFin: Date
- statut: String
- sortie: Object
- notes: String

Race
- id: Int
- nom: String
- origine: String
- poidsAdulte: Float
- gmqCible: Float
- icCible: Float
- poidsAbattage: Float
- dureeEngraissement: Int
- description: String

Parcelle
- id: Int
- nom: String
- reference: String
- capaciteMax: Int
- superficie: Float
- type: String
- notes: String

Pesee
- id: Int
- date: Date
- poids: Float
- gmq: Float
- observateur: String
- notes: String

EtatSante
- id: Int
- date: Date
- etat: String
- temperature: Float
- poids: Float
- symptomes: String
- action: String

Traitement
- id: Int
- type: String
- produit: String
- dose: Float
- doseUnite: String
- voie: String
- dateDebut: Date
- dateFin: Date
- veterinaire: String
- delaiRetrait: Int
- statut: String
- observations: String

PlanTraitement
- id: Int
- type: String
- produit: String
- datePrevue: Date
- frequence: String
- statut: String
- notes: String

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

Distribution
- id: Int
- date: Date
- quantite: Float
- nbAnimaux: Int
- coutEstime: Float
- cible: String
- notes: String

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

Alerte
- id: Int
- niveau: String
- categorie: String
- message: String
- concerne: String
- date: Date
- traitee: Boolean

Parametres
- id: Int
- nomFerme: String
- siret: String
- adresse: String
- responsable: String
- devise: String
- unitePoids: String
- frequencePesee: Int
- seuilIC: Float
- poidsMinVente: Float
- prixVenteKgMoyen: Float
- prixAchatKgMoyen: Float
- notifs: Object
- alertesConfig: List

Conversation
- id: Int
- title: String
```

## Relations et cardinalites

```text
Race 1 -------- 0..* Animal
Une race peut etre associee a plusieurs animaux.
Chaque animal a une seule race.

Parcelle 0..1 -------- 0..* Animal
Une parcelle peut contenir plusieurs animaux.
Un animal peut etre dans une seule parcelle ou aucune.

Ration 0..1 -------- 0..* Parcelle
Une ration peut etre affectee a plusieurs parcelles.
Une parcelle peut avoir une ration ou aucune.

Animal 1 -------- 0..* Pesee
Un animal peut avoir plusieurs pesees.
Chaque pesee appartient a un seul animal.

Animal 1 -------- 0..* EtatSante
Un animal peut avoir plusieurs enregistrements de sante.
Chaque etat de sante appartient a un seul animal.

Animal 1 -------- 0..* Traitement
Un animal peut avoir plusieurs traitements.
Chaque traitement appartient a un seul animal.

Animal 1 -------- 0..* PlanTraitement
Un animal peut avoir plusieurs traitements planifies.
Chaque plan appartient a un seul animal.

StockArticle 0..1 -------- 0..* Traitement
Un traitement peut consommer un article medicament.
Un article peut etre utilise dans plusieurs traitements.

StockArticle 1 -------- 0..* StockMouvement
Un article peut avoir plusieurs mouvements de stock.
Chaque mouvement concerne un seul article.

User 0..1 -------- 0..* StockMouvement
Un utilisateur peut creer plusieurs mouvements.
Un mouvement peut avoir un utilisateur ou aucun.

Fournisseur 0..1 -------- 0..* StockArticle
Un fournisseur peut fournir plusieurs articles.
Un article peut avoir un fournisseur ou aucun.

Fournisseur 1 -------- 0..* CommandeAchat
Un fournisseur peut avoir plusieurs commandes.
Chaque commande appartient a un seul fournisseur.

CommandeAchat 1 -------- 1..* LigneCommande
Une commande contient une ou plusieurs lignes.
Chaque ligne appartient a une seule commande.

StockArticle 0..1 -------- 0..* LigneCommande
Une ligne de commande peut pointer vers un article.
Un article peut apparaitre dans plusieurs lignes.

CommandeAchat 0..1 -------- 0..* StockMouvement
Une commande peut generer plusieurs mouvements.
Un mouvement peut venir d'une commande ou non.

Ration 1 -------- 0..* IngredientRation
Une ration contient zero ou plusieurs ingredients.
Chaque ingredient appartient a une seule ration.

StockArticle 0..1 -------- 0..* IngredientRation
Un ingredient peut etre lie a un article de stock.
Un article peut etre utilise dans plusieurs rations.

Ration 1 -------- 0..* Distribution
Une ration peut etre distribuee plusieurs fois.
Chaque distribution concerne une seule ration.

User 1 -------- 0..* Conversation
Un utilisateur peut avoir plusieurs conversations BoviAI.
Chaque conversation appartient a un seul utilisateur.

Conversation 1 -------- 0..* Message
Une conversation contient plusieurs messages.
Chaque message est integre dans une seule conversation.

Alerte
Classe independante utilisee pour stock, sante, retrait et notifications.

Parametres
Classe singleton utilisee pour les reglages globaux de la ferme.
```
