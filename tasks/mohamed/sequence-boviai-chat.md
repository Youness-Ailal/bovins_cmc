# Diagramme de sequence - Chat BoviAI

```mermaid
sequenceDiagram
    actor Veterinaire
    participant Frontend as Page BoviAI
    participant API as API BoviAI
    participant Middleware as Middleware protect
    participant Controller as BoviAIController
    participant Tools as BoviAITools
    participant Gemini as Service Gemini
    participant Conversation as ConversationModel
    participant DB as MongoDB

    Veterinaire->>Frontend: Poser une question
    Frontend->>API: POST /api/boviai/chat
    API->>Middleware: Verifier token JWT
    Middleware-->>API: Utilisateur authentifie
    API->>Controller: chat(message, conversationId)
    Controller->>Conversation: Charger ou creer conversation
    Conversation->>DB: findById/create
    Controller->>Gemini: Envoyer question avec contexte
    Gemini->>Tools: Demander donnees ferme si besoin
    Tools->>DB: Lire animaux, stocks, sante ou finances
    DB-->>Tools: Donnees utiles
    Tools-->>Gemini: Resultats tools
    Gemini-->>Controller: Reponse assistant
    Controller->>Conversation: Ajouter messages user + assistant
    Conversation->>DB: Sauvegarder conversation
    Controller-->>API: Reponse BoviAI
    API-->>Frontend: Message assistant
    Frontend-->>Veterinaire: Afficher reponse
```

