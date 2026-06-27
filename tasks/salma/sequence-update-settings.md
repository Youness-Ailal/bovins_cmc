# Diagramme de sequence - Modification parametres

```mermaid
sequenceDiagram
    actor Administrateur
    participant Frontend as Page Parametres
    participant API as API Parametres
    participant Middleware as Middleware protect
    participant Controller as ParametresController
    participant Model as ParametresModel
    participant DB as MongoDB

    Administrateur->>Frontend: Modifier les parametres
    Frontend->>API: PUT /api/parametres
    API->>Middleware: Verifier token JWT
    Middleware-->>API: Utilisateur authentifie
    API->>Controller: update(req.body)
    Controller->>Model: findOneAndUpdate()
    Model->>DB: Sauvegarder parametres
    DB-->>Model: Parametres mis a jour
    Model-->>Controller: Parametres
    Controller-->>API: Reponse OK
    API-->>Frontend: Parametres mis a jour
    Frontend-->>Administrateur: Afficher succes
```

