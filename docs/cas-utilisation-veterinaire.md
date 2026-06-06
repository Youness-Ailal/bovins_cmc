# Cas d'utilisation — Vétérinaire

> Coller le bloc PlantUML dans [planttext.com](https://www.planttext.com) pour générer l'image.

```plantuml
@startuml CasUtilisation_Veterinaire
left to right direction
skinparam shadowing false
skinparam packageStyle rectangle
skinparam actorStyle awesome
skinparam usecase {
  BackgroundColor #FFFFFF
  BorderColor #2D7A3A
  ArrowColor #1B2E1F
}
title Cas d'utilisation — Vétérinaire

actor "Vétérinaire" as Vet

rectangle "Santé & Traitements" {
  usecase "Enregistrer un traitement" as UC12
  usecase "Mettre à jour l'état de santé" as UC13
  usecase "Planifier un traitement" as UC14
}

rectangle "Animaux" {
  usecase "Enregistrer une pesée" as UC02
  usecase "Enregistrer une sortie\n(mortalité)" as UC06
  usecase "Consulter un animal" as UC07
}

rectangle "Performance" {
  usecase "Consulter les alertes" as UC20
}

Vet --> UC12
Vet --> UC13
Vet --> UC14
Vet --> UC02
Vet --> UC06
Vet --> UC07
Vet --> UC20

@enduml
```
