# Diagramme de sequence - Distribution ration

```mermaid
sequenceDiagram
    actor Responsable as Responsable alimentation
    participant Interface as Page Distribution
    participant Serveur as Serveur API
    participant DB as Base de donnees

    Responsable->>Interface: Choisir ration, cible et quantite
    Interface->>Serveur: Envoyer distribution
    Serveur->>DB: Lire ration et stock
    DB-->>Serveur: Ingredients et quantites
    Serveur->>Serveur: Calculer cout estime
    Serveur->>DB: Deduire stock et enregistrer distribution
    DB-->>Serveur: Distribution creee
    Serveur-->>Interface: Confirmation
    Interface-->>Responsable: Afficher succes
```

