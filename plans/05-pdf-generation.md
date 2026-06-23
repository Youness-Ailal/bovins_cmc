# Plan 05 — Génération PDF (Documents Officiels)

## Objectif
Générer des documents PDF officiels conformes aux exigences ONSSA marocaines :
passeport bovin, laissez-passer de transport, carnet de santé.

## Installation
```bash
cd backend && npm install pdfkit
```

## Backend

### Fichiers à créer
- `backend/src/utils/pdfGenerator.js` — fonctions de génération réutilisables
- Ajouter routes PDF dans les controllers existants

### Endpoint 1 — Passeport Bovin
```
GET /api/animals/:id/passeport
Content-Type: application/pdf
```

Contenu du document :
- En-tête : logo BOVITRACK + "Passeport Bovin Officiel"
- Identification : Numéro SNIT, identifiant ferme, race, sexe, date de naissance estimée
- Propriétaire : nom, adresse, région
- Historique des pesées (tableau)
- Vaccinations reçues (tableau : vaccin, date, vétérinaire)
- Statut santé actuel
- QR code (si module QR implémenté)

### Endpoint 2 — Laissez-passer Transport
```
GET /api/animals/:id/laissez-passer
Content-Type: application/pdf
```

Contenu :
- Numéro du document (généré automatiquement)
- Animal : identifiant SNIT, race, poids
- Origine : nom ferme, adresse, province
- Destination : à remplir manuellement (champ texte dans le formulaire frontend)
- Date de départ
- Cachet vétérinaire (espace réservé)
- Validité : 72h (date d'expiration calculée)

### Endpoint 3 — Carnet de Santé
```
GET /api/sante/animal/:id/carnet
Content-Type: application/pdf
```

Contenu :
- Fiche identité de l'animal
- Tableau des états de santé (date, statut, observation)
- Tableau des traitements (médicament, dose, durée, vétérinaire)
- Tableau des planifications vaccinales
- Délais de retrait actifs (si applicable)

### Utilitaire `pdfGenerator.js`
```js
const PDFDocument = require('pdfkit')

function createHeader(doc, title) { ... }
function createTable(doc, columns, rows) { ... }
function createFooter(doc) { ... }

module.exports = { createHeader, createTable, createFooter }
```

### Réponse HTTP pour les PDF
```js
res.setHeader('Content-Type', 'application/pdf')
res.setHeader('Content-Disposition', `attachment; filename="passeport-${id}.pdf"`)
doc.pipe(res)
doc.end()
```

## Frontend

### Modifications sur `animaux/[id]/page.tsx`
- Bouton **"Passeport PDF"** → `window.open('/api/animals/:id/passeport')`
- Bouton **"Laissez-passer"** → ouvre modal pour saisir la destination puis télécharge

### Modifications sur `animaux/[id]/sortie/page.tsx`
- Après confirmation de sortie → proposer le téléchargement du laissez-passer

### Modifications sur `sante/page.tsx` ou fiche animal
- Bouton **"Carnet de santé PDF"** → `window.open('/api/sante/animal/:id/carnet')`

## Notes
- Les PDF sont générés à la volée (pas stockés sur disque)
- Utiliser une police sans accent si pdfkit pose des problèmes avec les caractères français (ou intégrer une police TTF)
- Ajouter `pdfkit` aux dépendances backend uniquement
