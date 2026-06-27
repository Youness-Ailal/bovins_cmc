# Diagramme de sequence - Alertes temps reel

```mermaid
sequenceDiagram
    actor Veterinaire
    participant Interface as Interface Notifications
    participant Serveur as Serveur API
    participant Socket as Socket.IO
    participant DB as Base de donnees

    Interface->>Socket: Ouvrir connexion temps reel
    Serveur->>DB: Detecter ou creer alerte
    Serveur->>Socket: Envoyer nouvelle alerte
    Socket-->>Interface: Notification recue
    Interface-->>Veterinaire: Afficher cloche notification
    Veterinaire->>Interface: Traiter alerte
    Interface->>Serveur: Marquer alerte traitee
    Serveur->>DB: Mettre a jour alerte
    DB-->>Serveur: Alerte traitee
    Serveur-->>Interface: Confirmation
```

