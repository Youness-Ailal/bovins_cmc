# Diagramme de sequence - Consultation dashboard

```mermaid
sequenceDiagram
    actor Responsable as Responsable finance
    participant Frontend as Page Dashboard
    participant API as API Dashboard
    participant Middleware as Middleware protect
    participant Controller as DashboardController
    participant Animal as AnimalModel
    participant Stock as StockArticleModel
    participant Sante as TraitementModel
    participant DB as MongoDB

    Responsable->>Frontend: Ouvrir dashboard
    Frontend->>API: GET /api/dashboard
    API->>Middleware: Verifier token JWT
    Middleware-->>API: Utilisateur authentifie
    API->>Controller: summary()
    Controller->>Animal: Compter animaux et statuts
    Animal->>DB: aggregate/count
    Controller->>Stock: Calculer valeur stock
    Stock->>DB: aggregate
    Controller->>Sante: Lire traitements actifs
    Sante->>DB: find/count
    DB-->>Controller: Donnees dashboard
    Controller-->>API: KPIs et graphiques
    API-->>Frontend: Donnees dashboard
    Frontend-->>Responsable: Afficher KPIs
```

