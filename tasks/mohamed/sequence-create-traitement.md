# Diagramme de sequence - Creation traitement

```mermaid
sequenceDiagram
    actor Veterinaire
    participant Interface as Page Nouveau Traitement
    participant Serveur as Serveur API
    participant DB as Base de donnees

    Veterinaire->>Interface: Saisir traitement
    Interface->>Serveur: Envoyer traitement
    Serveur->>Serveur: Calculer delai de retrait
    Serveur->>DB: Enregistrer traitement
    Serveur->>DB: Mettre a jour animal et stock medicament
    Serveur->>DB: Creer alerte si necessaire
    DB-->>Serveur: Traitement cree
    Serveur-->>Interface: Confirmation
    Interface-->>Veterinaire: Afficher succes
```

