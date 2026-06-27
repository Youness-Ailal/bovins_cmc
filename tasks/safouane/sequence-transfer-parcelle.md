# Diagramme de sequence - Transfert parcelle

```mermaid
sequenceDiagram
    actor Responsable as Responsable elevage
    participant Frontend as Page Transfert
    participant API as API Parcelles
    participant Middleware as Middleware protect
    participant Controller as ParcelleController
    participant Animal as AnimalModel
    participant Parcelle as ParcelleModel
    participant DB as MongoDB

    Responsable->>Frontend: Choisir animal et parcelle destination
    Frontend->>API: POST /api/parcelles/transfert
    API->>Middleware: Verifier token JWT
    Middleware-->>API: Utilisateur authentifie
    API->>Controller: transfert(animalId, parcelleDestId)
    Controller->>Parcelle: Verifier capacite destination
    Parcelle->>DB: Compter animaux dans parcelle
    DB-->>Parcelle: Occupation actuelle
    Controller->>Animal: update parcelle
    Animal->>DB: Sauvegarder nouvelle parcelle
    DB-->>Animal: Animal transfere
    Animal-->>Controller: Animal
    Controller-->>API: Reponse OK
    API-->>Frontend: Transfert valide
    Frontend-->>Responsable: Afficher succes
```

