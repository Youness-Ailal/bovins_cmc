# Diagramme de classe - Safouane

Modules: Animaux et Parcelles.

## Classes

```text
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

Ration
- id: Int
- nom: String
- phase: String
- cible: String
```

## Relations et cardinalites

```text
Race 1 -------- 0..* Animal
Une race peut concerner plusieurs animaux.
Chaque animal a une seule race.

Parcelle 0..1 -------- 0..* Animal
Une parcelle peut contenir plusieurs animaux.
Un animal peut etre dans une seule parcelle ou aucune.

Animal 1 -------- 0..* Pesee
Un animal peut avoir plusieurs pesees.
Chaque pesee appartient a un seul animal.

Ration 0..1 -------- 0..* Parcelle
Une ration peut etre affectee a plusieurs parcelles.
Une parcelle peut avoir une ration ou aucune.

Animal 1 -------- 0..1 Sortie
Un animal actif n'a pas de sortie.
Un animal sorti a une sortie avec motif, date, poids et prix.
```
