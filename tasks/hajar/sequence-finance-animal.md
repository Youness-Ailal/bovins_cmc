# Diagramme de sequence - Rentabilite animal

```mermaid
sequenceDiagram
    actor Responsable as Responsable finance
    participant Frontend as Page Rentabilite Animal
    participant API as API Finances
    participant Middleware as Middleware protect
    participant Controller as FinancesController
    participant Animal as AnimalModel
    participant Pesee as PeseeModel
    participant Parametres as ParametresModel
    participant DB as MongoDB

    Responsable->>Frontend: Ouvrir rentabilite animal
    Frontend->>API: GET /api/finances/animal/:id
    API->>Middleware: Verifier token JWT
    Middleware-->>API: Utilisateur authentifie
    API->>Controller: bilanAnimal(id)
    Controller->>Animal: Charger animal
    Animal->>DB: findById(id)
    Controller->>Pesee: Charger pesees
    Pesee->>DB: find(animal)
    Controller->>Parametres: Charger prix moyens
    Parametres->>DB: findOne()
    DB-->>Controller: Donnees financieres
    Controller->>Controller: Calculer couts, revenus et marge
    Controller-->>API: Bilan animal
    API-->>Frontend: Donnees rentabilite
    Frontend-->>Responsable: Afficher resultat
```

