# Diagramme de sequence - Creation animal

```mermaid
sequenceDiagram
    actor Responsable as Responsable elevage
    participant Interface as Formulaire Animal
    participant Serveur as Serveur API
    participant DB as Base de donnees

    Responsable->>Interface: Remplir les informations animal
    Interface->>Serveur: Envoyer animal
    Serveur->>Serveur: Verifier session et donnees
    Serveur->>DB: Enregistrer animal
    DB-->>Serveur: Animal cree
    Serveur-->>Interface: Confirmation
    Interface-->>Responsable: Ouvrir fiche animal
```

