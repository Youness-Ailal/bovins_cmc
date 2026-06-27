# Diagramme de classe - Salma

Modules: Authentification, Administration, Roles, Races et Parametres.

## Classes

```text
User
- id: Int
- prenom: String
- nom: String
- email: String
- password: String
- role: String
- statut: String
- derniereConnexion: Date
- fullName: String

Race
- id: Int
- nom: String
- origine: String
- poidsAdulte: Float
- gmqCible: Float
- icCible: Float
- poidsAbattage: Float
- dureeEngraissement: Int
- description: String

Animal
- id: Int
- identifiant: String
- phase: String
- poidsActuel: Float
- statut: String

Parametres
- id: Int
- nomFerme: String
- siret: String
- adresse: String
- responsable: String
- devise: String
- unitePoids: String
- frequencePesee: Int
- seuilIC: Float
- poidsMinVente: Float
- prixVenteKgMoyen: Float
- prixAchatKgMoyen: Float
- notifs: Object
- alertesConfig: List

Alerte
- id: Int
- niveau: String
- categorie: String
- message: String
- concerne: String
- date: Date
- traitee: Boolean
```

## Relations et cardinalites

```text
User
Classe utilisee pour connexion JWT, profil, role, statut et changement de mot de passe.

Race 1 -------- 0..* Animal
Une race peut etre associee a plusieurs animaux.
Chaque animal a une seule race.

Parametres
Classe singleton: un seul document principal pour les reglages de la ferme.

Parametres 1 -------- 0..* AlerteConfig
Les configurations d'alertes sont stockees dans Parametres.alertesConfig.

Alerte
Classe separee pour afficher et traiter les alertes dans l'administration.

Role frontend
Admin: acces a toutes les pages.
Responsable: dashboard, animaux, parcelles, stocks, rations, finances, fournisseurs, performance.
Veterinaire: dashboard, animaux, sante, performance, boviai.
```
