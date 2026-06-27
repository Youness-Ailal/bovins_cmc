# Diagramme de classe - Mohamed

Modules: Sante, Alertes et BoviAI.

## Classes

```text
Animal
- id: Int
- identifiant: String
- etatSante: String
- poidsActuel: Float
- delaiRetraitFin: Date
- statut: String

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
- categorie: String
- quantite: Float
- seuil: Float

Alerte
- id: Int
- niveau: String
- categorie: String
- message: String
- concerne: String
- date: Date
- traitee: Boolean

Conversation
- id: Int
- title: String

Message
- role: String
- content: String
- createdAt: Date

User
- id: Int
- prenom: String
- nom: String
- email: String
- role: String
```

## Relations et cardinalites

```text
Animal 1 -------- 0..* EtatSante
Un animal peut avoir plusieurs controles de sante.
Chaque controle appartient a un seul animal.

Animal 1 -------- 0..* Traitement
Un animal peut avoir plusieurs traitements.
Chaque traitement appartient a un seul animal.

Animal 1 -------- 0..* PlanTraitement
Un animal peut avoir plusieurs traitements planifies.
Chaque plan appartient a un seul animal.

StockArticle 0..1 -------- 0..* Traitement
Un traitement peut utiliser un article medicament.
Un article peut etre utilise dans plusieurs traitements.

User 1 -------- 0..* Conversation
Un utilisateur peut avoir plusieurs conversations BoviAI.
Chaque conversation appartient a un seul utilisateur.

Conversation 1 -------- 0..* Message
Une conversation contient plusieurs messages.
Chaque message est integre dans une conversation.

Alerte
Classe independante utilisee pour les alertes sante, stock et delai de retrait.
```
