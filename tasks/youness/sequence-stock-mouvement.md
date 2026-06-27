# Diagramme de sequence - Mouvement de stock

```mermaid
sequenceDiagram
    actor Responsable as Responsable stock
    participant Interface as Page Mouvement Stock
    participant Serveur as Serveur API
    participant DB as Base de donnees

    Responsable->>Interface: Saisir mouvement
    Interface->>Serveur: Envoyer mouvement
    Serveur->>DB: Lire article
    DB-->>Serveur: Quantite actuelle
    Serveur->>Serveur: Calculer nouvelle quantite
    Serveur->>DB: Sauvegarder article et mouvement
    Serveur->>DB: Creer alerte si stock faible
    DB-->>Serveur: Mouvement enregistre
    Serveur-->>Interface: Confirmation
    Interface-->>Responsable: Afficher succes
```

