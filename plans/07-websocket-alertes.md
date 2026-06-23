# Plan 07 — Alertes en Temps Réel (WebSocket)

## Objectif
Envoyer des notifications push instantanées aux utilisateurs connectés
sans qu'ils aient besoin de rafraîchir la page.

## Installation
```bash
cd backend && npm install socket.io
cd frontend && npm install socket.io-client
```

## Backend

### Modifier `backend/src/app.js` (ou `server.js`)
```js
const { createServer } = require('http')
const { Server } = require('socket.io')

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true }
})

// Rendre io accessible dans tous les controllers
app.set('io', io)

// Authentification WebSocket
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  // vérifier JWT, attacher socket.user
  next()
})

io.on('connection', (socket) => {
  socket.join(`user:${socket.user.id}`)  // room par utilisateur
  socket.join('all')                      // room globale ferme
})

httpServer.listen(process.env.PORT || 3001)
```

### Émettre des événements depuis les controllers

**Alerte stock critique** (dans `stock.controller.js`) :
```js
if (article.quantite <= article.seuil) {
  req.app.get('io').to('all').emit('alerte:stock', {
    articleId: article.id,
    designation: article.designation,
    quantite: article.quantite,
    seuil: article.seuil,
  })
}
```

**Alerte santé animal** (dans `animal.controller.js`) :
```js
if (animal.etatSante === 'Malade') {
  req.app.get('io').to('all').emit('alerte:sante', {
    animalId: animal.id,
    identifiant: animal.identifiant,
    message: `Animal ${animal.identifiant} est passé à l'état Malade`,
  })
}
```

**Alerte délai de retrait** (cron job ou trigger lors d'une mise à jour traitement) :
```js
io.to('all').emit('alerte:retrait', {
  animalId,
  identifiant,
  dateFinRetrait,
})
```

### Événements définis
| Événement | Déclencheur | Destinataire |
|---|---|---|
| `alerte:stock` | Article passe sous seuil | Tous |
| `alerte:sante` | Animal passe à "Malade" | Tous |
| `alerte:retrait` | Fin de délai de retrait médicament | Tous |
| `alerte:velage` | J-14 avant vêlage prévu | Tous |
| `notification:user` | Action admin sur un utilisateur | Room utilisateur spécifique |

## Frontend

### Fichiers à créer
- `frontend/lib/socket.ts` — singleton de connexion Socket.io
- `frontend/hooks/useAlerts.ts` — hook React pour écouter les alertes
- `frontend/components/dashboard/NotificationBadge.tsx` — badge dans sidebar
- `frontend/components/dashboard/ToastAlert.tsx` — toast en haut à droite

### `frontend/lib/socket.ts`
```ts
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL!.replace('/api', ''), {
      auth: { token },
      autoConnect: true,
    })
  }
  return socket
}
```

### `frontend/hooks/useAlerts.ts`
```ts
export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    const socket = getSocket(localStorage.getItem('token')!)

    socket.on('alerte:stock', (data) => setAlerts(prev => [data, ...prev]))
    socket.on('alerte:sante', (data) => setAlerts(prev => [data, ...prev]))
    socket.on('alerte:retrait', (data) => setAlerts(prev => [data, ...prev]))

    return () => { socket.off('alerte:stock'); socket.off('alerte:sante') }
  }, [])

  return alerts
}
```

### Intégration dans le layout dashboard
```tsx
// frontend/app/(dashboard)/layout.tsx
const alerts = useAlerts()

// Afficher un toast pour chaque nouvelle alerte
```

### Badge dans Sidebar
- Ajouter `<NotificationBadge count={unreadCount} />` à côté de l'entrée "Alertes" dans la sidebar
- Nombre rouge qui disparaît quand l'utilisateur visite la page Alertes

## Notes
- Le badge et les toasts fonctionnent sans rechargement de page
- Utiliser `useRef` pour éviter de ré-attacher les listeners à chaque render
- Les alertes reçues par WebSocket sont aussi sauvegardées en DB (via le controller existant)
