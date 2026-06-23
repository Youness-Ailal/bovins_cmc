# Plan 08 — QR Code par Animal

## Objectif
Générer un QR code unique par animal, scannable au souk ou lors d'un contrôle vétérinaire,
pour accéder instantanément à sa fiche sanitaire.

## Installation
```bash
cd backend && npm install qrcode
```

## Backend

### Endpoint QR Code image
```
GET /api/animals/:id/qrcode
Content-Type: image/png
```

```js
const QRCode = require('qrcode')

exports.getQrCode = asyncHandler(async (req, res) => {
  const animal = await Animal.findById(req.params.id)
  if (!animal) throw new ApiError(404, 'Animal non trouvé')

  // L'URL encodée dans le QR code — fiche publique ou interne
  const url = `${process.env.FRONTEND_URL}/animaux/${animal.id}`

  res.setHeader('Content-Type', 'image/png')
  QRCode.toFileStream(res, url, { width: 300 })
})
```

Ajouter dans `animal.routes.js` :
```js
router.get('/:id/qrcode', protect, getQrCode)
```

### Endpoint QR Code avec données animal (pour impression)
```
GET /api/animals/:id/qrcode-card
Content-Type: application/pdf
```

Retourne une petite carte PDF (format carte de visite) contenant :
- QR code
- Identifiant SNIT
- Race
- Poids actuel
- Date de génération

## Frontend

### Modifications sur `animaux/[id]/page.tsx`

Ajouter un bouton **"QR Code"** dans la section actions de la fiche animal :
```tsx
<Button variant="outline" onClick={() => setShowQR(true)}>
  <Icon name="QrCode" /> QR Code
</Button>
```

### Modal QR Code
```tsx
// Afficher l'image directement depuis l'API
<img src={`/api/animals/${id}/qrcode`} alt="QR Code" width={200} />

// Bouton télécharger
<a href={`/api/animals/${id}/qrcode`} download={`qrcode-${identifiant}.png`}>
  Télécharger PNG
</a>

// Bouton imprimer la carte
<a href={`/api/animals/${id}/qrcode-card`} target="_blank">
  Imprimer carte
</a>
```

### Fichiers à modifier
- `backend/src/controllers/animal.controller.js` — ajouter `getQrCode`, `getQrCodeCard`
- `backend/src/routes/animal.routes.js` — ajouter les 2 routes
- `frontend/app/(dashboard)/animaux/[id]/page.tsx` — bouton + modal QR

## Cas d'usage concrets
- **Au souk** : l'acheteur scanne le QR → voit les vaccins, le poids, l'état de santé
- **Transport** : le chauffeur scanne → vérifie que l'animal correspond au laissez-passer
- **Contrôle ONSSA** : l'inspecteur scanne → accède à tout l'historique instantanément
