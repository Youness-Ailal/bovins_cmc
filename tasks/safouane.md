# Safouane — Animaux & Parcelles

**Ma partie :** le cœur du troupeau — la vie d'un animal de l'entrée à la sortie,
et les parcelles où ils vivent.

🔗 App : https://bovitrack.netlify.app

## Pages que je présente

| Page | Lien | Ce que je montre |
|---|---|---|
| Liste animaux | https://bovitrack.netlify.app/animaux | Tableau, filtres, statuts |
| Nouvel animal | https://bovitrack.netlify.app/animaux/nouveau | Formulaire de création |
| Fiche animal | https://bovitrack.netlify.app/animaux | Ouvrir une fiche : infos, pesées, QR code |
| Modifier | (depuis la fiche) | Édition d'un animal |
| Nouvelle pesée | (depuis la fiche) | Saisir un poids → calcul GMQ |
| Sortie animal | (depuis la fiche) | Vente / abattage / mort |
| Prêts à vendre | https://bovitrack.netlify.app/animaux/prets-a-vendre | Animaux prêts pour la vente |
| Parcelles | https://bovitrack.netlify.app/parcelles | Liste, capacité, occupation |
| Nouvelle parcelle | https://bovitrack.netlify.app/parcelles/nouvelle | Création |
| Transfert | https://bovitrack.netlify.app/parcelles/transfert | Déplacer des animaux entre parcelles |

## Code derrière (backend)
- `controllers/animal.controller.js` — CRUD, pesées, phase, santé, sortie
- `controllers/parcelle.controller.js` — parcelles + transferts
- `utils/calculations.js` — calcul **GMQ** et **IC**
- `utils/pdfGenerator.js` — passeport animal + carte **QR code**

## Ce que je dois dire (points clés)
1. Le **cycle de vie** complet : entrée → pesées → phase (Veau → Croissance →
   Engraissement → Finition) → sortie/vente.
2. Les calculs zootechniques : **GMQ** (gain moyen quotidien) et **IC** (indice de consommation).
3. La génération **PDF** (passeport) et le **QR code** par animal.
4. Le **transfert** entre parcelles tient compte de la capacité.

## Ordre de démo
Liste animaux → ouvrir une fiche (pesées + QR) → ajouter une pesée → Parcelles → Transfert.
