# Diagramme de sequence - Ajout pesee

```mermaid
sequenceDiagram
    actor Responsable as Responsable elevage
    participant Frontend as Page Nouvelle Pesee
    participant API as API Animaux
    participant Middleware as Middleware protect
    participant Controller as AnimalController
    participant Pesee as PeseeModel
    participant Animal as AnimalModel
    participant DB as MongoDB

    Responsable->>Frontend: Saisir poids et date
    Frontend->>API: POST /api/animaux/:id/pesees
    API->>Middleware: Verifier token JWT
    Middleware-->>API: Utilisateur authentifie
    API->>Controller: addPesee(id, data)
    Controller->>Pesee: Chercher derniere pesee
    Pesee->>DB: findOne(animal).sort(date)
    DB-->>Pesee: Derniere pesee
    Controller->>Controller: Calculer GMQ
    Controller->>Pesee: create(pesee)
    Pesee->>DB: Inserer pesee
    Controller->>Animal: Mettre a jour poidsActuel et gmqActuel
    Animal->>DB: update animal
    DB-->>Controller: Donnees mises a jour
    Controller-->>API: Reponse 201
    API-->>Frontend: Pesee creee
    Frontend-->>Responsable: Afficher fiche animal
```

