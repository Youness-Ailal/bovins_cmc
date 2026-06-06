# Diagramme de classes — BOVITRACK

> Modèle de données simplifié de l'application de gestion de troupeau bovin.
> Coller le bloc PlantUML dans [planttext.com](https://www.planttext.com) pour générer l'image.

```plantuml
@startuml DiagrammeClasses_BOVITRACK
skinparam classAttributeIconSize 0
skinparam shadowing false
skinparam class {
  BackgroundColor #FFFFFF
  BorderColor #2D7A3A
  ArrowColor #1B2E1F
}
hide circle
hide methods
title Diagramme de classes — BOVITRACK

class Utilisateur {
  nom
  email
  role
  statut
}

class Race {
  nom
  gmqCible
  icCible
  poidsAbattage
}

class Animal {
  identifiant
  sexe
  phase
  poidsActuel
  gmqActuel
  etatSante
  statut
}

class Pesee {
  date
  poids
  gmq
}

class Lot {
  nom
  phase
}

class Parcelle {
  nom
  capaciteMax
  type
}

class ArticleStock {
  designation
  categorie
  quantite
  seuil
  prixUnitaire
}

class MouvementStock {
  type
  quantite
  date
}

class Ration {
  nom
  phase
  coutJour
}

class Distribution {
  date
  quantite
  coutEstime
}

class Traitement {
  type
  produit
  dateDebut
  delaiRetrait
  statut
}

class EtatSante {
  date
  etat
  temperature
}

class PlanTraitement {
  type
  datePrevue
  statut
}

class Alerte {
  niveau
  message
  traitee
}

' ===================== ASSOCIATIONS =====================
Animal "*" --> "1" Race : appartient à
Animal "*" --> "0..1" Parcelle : situé dans
Animal "*" --> "0..1" Lot : regroupé dans
Animal "1" --> "*" Pesee : possède
Animal "1" --> "*" Traitement : reçoit
Animal "1" --> "*" EtatSante : suivi par
Animal "1" --> "*" PlanTraitement : programmé pour

Parcelle "*" --> "0..1" Ration : ration assignée
Ration "*" --> "*" ArticleStock : ingrédients
Distribution "*" --> "1" Ration : distribue

ArticleStock "1" --> "*" MouvementStock : trace
Traitement "*" --> "0..1" ArticleStock : déduit du stock

@enduml
```
