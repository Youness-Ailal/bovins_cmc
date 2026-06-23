# Plan 06 — BoviAI (Assistant IA)

## Objectif
Intégrer un assistant conversationnel en français qui répond aux questions de l'éleveur
en utilisant les données réelles de sa ferme comme contexte.

## Installation
```bash
cd backend && npm install @anthropic-ai/sdk
```

## Configuration
Ajouter dans `backend/.env` :
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Backend

### Fichiers à créer
- `backend/src/controllers/boviAI.controller.js`
- `backend/src/routes/boviAI.routes.js`

### Endpoint principal
```
POST /api/boviAI/chat
Body: { message: string, history: [{ role, content }] }
```

### Logique du controller

**Étape 1** — Collecter le contexte de la ferme depuis MongoDB :
```js
const animauxActifs = await Animal.countDocuments({ statut: 'Actif' })
const alertesActives = await Alerte.countDocuments({ traitee: false })
const stocksCritiques = await StockArticle.find({ statut: 'critique' }).select('designation quantite unite seuil')
const pretsAVendre = await Animal.countDocuments({ phase: 'Finition', statut: 'Actif' })
const prochainVelage = await Reproduction?.findOne({ statut: 'En gestation' }).sort('dateVelagePrevue')
```

**Étape 2** — Construire le system prompt :
```js
const systemPrompt = `
Tu es BoviAI, l'assistant intelligent de la ferme bovine BOVITRACK.
Tu réponds en français, de façon concise et pratique.

Contexte actuel de la ferme :
- Animaux actifs : ${animauxActifs}
- Alertes non traitées : ${alertesActives}
- Animaux prêts à vendre : ${pretsAVendre}
- Stocks critiques : ${stocksCritiques.map(s => `${s.designation}: ${s.quantite} ${s.unite} (seuil: ${s.seuil})`).join(', ')}

Réponds uniquement sur la base de ces données. Si tu ne sais pas, dis-le clairement.
`
```

**Étape 3** — Appeler l'API Claude :
```js
const { Anthropic } = require('@anthropic-ai/sdk')
const client = new Anthropic()

const response = await client.messages.create({
  model: 'claude-haiku-4-5-20251001',  // modèle rapide et économique
  max_tokens: 500,
  system: systemPrompt,
  messages: [...history, { role: 'user', content: message }],
})

res.json({ reply: response.content[0].text })
```

### Enregistrer dans `backend/src/routes/index.js`
```js
app.use('/api/boviAI', require('./boviAI.routes'))
```

## Frontend

### Fichiers à créer
- `frontend/app/(dashboard)/boviAI/page.tsx` — page de chat complète
- `frontend/components/dashboard/BoviAIButton.tsx` — bouton flottant

### `boviAI/page.tsx`
- Interface de chat : bulles de messages (style WhatsApp)
- Input texte en bas + bouton "Envoyer"
- Historique de la session (messages stockés en état React, pas en DB)
- Indicateur de chargement pendant la réponse de l'IA
- Questions suggérées (chips cliquables) :
  - "Quels animaux sont prêts à vendre ?"
  - "Mon stock va durer combien de temps ?"
  - "Quels vaccins faire ce mois ?"
  - "Quel est mon bénéfice projeté ?"
  - "Quelles alertes sont actives ?"

### `BoviAIButton.tsx`
- Bouton flottant en bas à droite sur toutes les pages du dashboard
- Icône `MessageCircle` (lucide-react) + texte "BoviAI"
- Couleur `primary` (#2D7A3A)
- Clic → redirige vers `/boviAI`

### Intégration dans le layout dashboard
Ajouter `<BoviAIButton />` dans `frontend/app/(dashboard)/layout.tsx`

### Sidebar
Ajouter entrée **BoviAI** avec icône `Bot` (lucide-react) et badge "IA".

## Sécurité
- La clé API Anthropic ne doit JAMAIS être exposée côté frontend
- Toujours appeler l'API Claude depuis le backend uniquement
- Appliquer rate limiting sur `/api/boviAI/chat` (ex: 20 requêtes/minute/utilisateur)

## Coût estimé
- Claude Haiku : ~$0.001 par conversation
- Pour 50 éleveurs × 10 questions/jour = ~$0.50/jour
