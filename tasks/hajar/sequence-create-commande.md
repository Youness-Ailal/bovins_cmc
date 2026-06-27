# Diagramme de sequence - Creation commande achat

```mermaid
sequenceDiagram
    actor Responsable as Responsable achats
    participant Interface as Page Nouvelle Commande
    participant Serveur as Serveur API
    participant DB as Base de donnees

    Responsable->>Interface: Saisir fournisseur et lignes
    Interface->>Serveur: Envoyer commande
    Serveur->>Serveur: Calculer montant total
    Serveur->>DB: Enregistrer commande
    Serveur->>DB: Mettre a jour stock et mouvements
    DB-->>Serveur: Commande creee
    Serveur-->>Interface: Confirmation
    Interface-->>Responsable: Afficher succes
```

