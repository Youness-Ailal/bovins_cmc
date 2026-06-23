# BOVITRACK — Plan d'Implémentation

## Priorité 1 — Connexion Frontend ↔ API (toutes les pages)

Chaque page utilise actuellement des données hardcodées. Remplacer par de vrais appels API.

### Pages à connecter
- `animaux/page.tsx` → `GET /api/animals`
- `animaux/[id]/page.tsx` → `GET /api/animals/:id`
- `animaux/nouveau/page.tsx` → `POST /api/animals`
- `animaux/[id]/modifier/page.tsx` → `PUT /api/animals/:id`
- `animaux/[id]/pesee/nouveau/page.tsx` → `POST /api/animals/:id/pesees`
- `animaux/[id]/sortie/page.tsx` → `POST /api/animals/:id/sortie`
- `parcelles/page.tsx` → `GET /api/parcelles`
- `parcelles/[id]/page.tsx` → `GET /api/parcelles/:id`
- `parcelles/nouvelle/page.tsx` → `POST /api/parcelles`
- `parcelles/transfert/page.tsx` → `POST /api/parcelles/transfert`
- `stocks/page.tsx` → `GET /api/stock/articles`
- `stocks/nouveau/page.tsx` → `POST /api/stock/articles`
- `stocks/mouvement/page.tsx` → `POST /api/stock/mouvements`
- `stocks/historique/page.tsx` → `GET /api/stock/mouvements`
- `rations/page.tsx` → `GET /api/rations`
- `rations/[id]/page.tsx` → `GET /api/rations/:id`
- `rations/nouvelle/page.tsx` → `POST /api/rations`
- `rations/distribution/page.tsx` → `POST /api/rations/distributions`
- `rations/historique/page.tsx` → `GET /api/rations/distributions`
- `sante/page.tsx` → `GET /api/sante/traitements`
- `sante/etat/page.tsx` → `GET /api/sante/etats`
- `sante/planification/page.tsx` → `GET /api/sante/plans`
- `sante/calendrier/page.tsx` → `GET /api/sante/plans`
- `administration/utilisateurs/` → `GET/POST/PUT /api/users`
- `administration/races/` → `GET/POST/PUT /api/races`
- `performance/page.tsx` → `GET /api/alertes`

### Librairie à créer
- `frontend/lib/api.ts` — wrapper fetch avec auth token, gestion erreurs, base URL

---

## Priorité 2 — Dashboard avec vrais graphiques

### Ce qui manque
- Graphiques interactifs (actuellement : boîtes KPI statiques)
- Données réelles depuis `GET /api/dashboard`

### À implémenter
- Installer **Recharts** (`npm install recharts`)
- Graphique 1 : Répartition du troupeau par phase (PieChart)
- Graphique 2 : Évolution du poids moyen sur 30 jours (LineChart)
- Graphique 3 : Coûts alimentation vs. santé vs. achat (BarChart)
- Graphique 4 : Niveau des stocks critiques (BarChart horizontal)
- KPIs dynamiques depuis l'API (troupeau total, GMQ moyen, alertes actives, prêts à vendre)
- Alertes actives en temps réel (polling toutes les 30s ou WebSocket)


## Priorité 3 — Module Financier (nouveau)

### Backend à créer
- Endpoint `GET /api/finances/animal/:id` — coût de revient d'un animal (alimentation + santé + achat)
- Endpoint `GET /api/finances/troupeau` — bilan financier global
- Endpoint `GET /api/finances/projection` — revenu projeté si vente aujourd'hui
- Calcul : coût/jour = (distributions × prix article) + (traitements × coût médicament)

### Frontend à créer
- `finances/page.tsx` — bilan global (revenus projetés vs. coûts réels)
- `finances/animal/[id]/page.tsx` — fiche de rentabilité par animal
- Graphique : évolution du coût cumulé par animal dans le temps
- Entrée sidebar : **Finances**

---

## Priorité 4 — Module Fournisseurs (nouveau)

### Backend à créer
- Modèle `Fournisseur` : nom, contact, région, type (aliments / médicaments / équipements)
- Modèle `CommandeAchat` : fournisseur, articles, quantités, prix, date, statut
- Routes CRUD pour fournisseurs et commandes

### Frontend à créer
- `fournisseurs/page.tsx` — liste des fournisseurs
- `fournisseurs/nouveau/page.tsx` — ajouter un fournisseur
- `fournisseurs/commandes/page.tsx` — historique des commandes
- Alerte automatique quand un article stock < seuil → suggestion de commande au fournisseur habituel

---

## Priorité 5 — Génération PDF (documents officiels)

### Backend à créer
- Installer **pdfkit** (`npm install pdfkit`)
- `GET /api/animals/:id/passeport` — passeport bovin PDF (identifiant SNIT, race, vaccins, poids)
- `GET /api/animals/:id/laissez-passer` — document transport inter-provincial (format ONSSA)
- `GET /api/sante/animal/:id/carnet` — carnet de santé complet en PDF

### Frontend
- Bouton "Télécharger Passeport" sur la fiche animal
- Bouton "Laissez-passer transport" sur la page sortie
- Bouton "Carnet de santé PDF" sur la page santé d'un animal

---

## Priorité 6 — BoviAI (Assistant IA)

### Backend à créer
- `POST /api/boviAI/chat` — reçoit une question, injecte le contexte de la ferme, appelle l'API Claude
- Contexte injecté : nombre d'animaux actifs, alertes en cours, stock critique, animaux prêts à vendre, coût moyen
- Installer `@anthropic-ai/sdk`

### Frontend à créer
- `boviAI/page.tsx` — interface de chat (bulles message, input, historique de session)
- Bouton flottant "Demander à BoviAI" accessible depuis toutes les pages
- Exemples de questions pré-remplies :
  - "Quels animaux sont prêts pour l'Aïd ?"
  - "Mon stock va durer combien de temps ?"
  - "Quels vaccins faire ce mois ?"

---


## Priorité 7 — Alertes en Temps Réel (WebSocket)

### Backend à créer
- Installer **Socket.io** côté serveur
- Événements émis automatiquement :
  - `alerte:stock` — quand un article passe sous son seuil
  - `alerte:sante` — quand un animal passe à "Malade"
  - `alerte:velage` — J-14 avant un vêlage prévu
  - `alerte:retrait` — fin du délai de retrait d'un médicament

### Frontend à créer
- Connexion `socket.io-client` dans le layout dashboard
- Badge de notification dans la sidebar (compteur d'alertes non lues)
- Toast notification en haut à droite pour chaque alerte reçue

---

## Priorité 8 — QR Code par Animal

### Backend
- `GET /api/animals/:id/qrcode` — génère un QR code PNG (librairie `qrcode`)
- Le QR code pointe vers la fiche publique de l'animal (ou fiche interne)

### Frontend
- Bouton "QR Code" sur la fiche animal
- Modal avec QR code affichable + bouton télécharger PNG
- Utilisable au souk pour partager la fiche sanitaire à l'acheteur

---

## Stack Additionnel à Installer

### Backend
```bash
npm install recharts            # graphiques (frontend)
npm install pdfkit              # génération PDF
npm install qrcode              # QR codes
npm install socket.io           # temps réel
npm install @anthropic-ai/sdk   # BoviAI
npm install moment-hijri        # calendrier hégirien (Aïd)
```

### Frontend
```bash
npm install recharts            # graphiques
npm install react-leaflet leaflet  # carte
npm install socket.io-client    # temps réel
```

---

## Ordre d'Implémentation Suggéré

1. `lib/api.ts` + connexion API sur toutes les pages existantes
2. Dashboard avec vrais graphiques (Recharts)
3. Module Reproduction (backend + frontend)
4. Module Financier (backend + frontend)
5. PDF generation (passeport + laissez-passer)
6. BoviAI (backend + frontend)
7. Module Aïd Al Adha
8. Module Fournisseurs
9. Carte Leaflet des parcelles
10. WebSocket alertes temps réel
11. QR codes animaux
