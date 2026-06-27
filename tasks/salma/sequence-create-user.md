# Diagramme de sequence - Creation utilisateur

```mermaid
sequenceDiagram
    actor Administrateur
    participant Interface as Page Utilisateurs
    participant Serveur as Serveur API
    participant DB as Base de donnees

    Administrateur->>Interface: Remplir formulaire utilisateur
    Interface->>Serveur: Envoyer nouvel utilisateur
    Serveur->>Serveur: Verifier session et hasher mot de passe
    Serveur->>DB: Enregistrer utilisateur
    DB-->>Serveur: Utilisateur cree
    Serveur-->>Interface: Confirmation
    Interface-->>Administrateur: Afficher succes
```

