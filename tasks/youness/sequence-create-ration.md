# Diagramme de sequence - Creation ration

```mermaid
sequenceDiagram
    actor Responsable as Responsable alimentation
    participant Frontend as Page Nouvelle Ration
    participant API as API Rations
    participant Middleware as Middleware protect
    participant Controller as RationController
    participant Ration as RationModel
    participant DB as MongoDB

    Responsable->>Frontend: Saisir ration et ingredients
    Frontend->>API: POST /api/rations
    API->>Middleware: Verifier token JWT
    Middleware-->>API: Utilisateur authentifie
    API->>Controller: create(req.body)
    Controller->>Ration: create(data)
    Ration->>DB: Inserer ration
    DB-->>Ration: Ration creee
    Ration-->>Controller: Ration
    Controller-->>API: Reponse 201
    API-->>Frontend: Ration creee
    Frontend-->>Responsable: Redirection liste rations
```

