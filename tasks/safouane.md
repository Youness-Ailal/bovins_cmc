# Safouane — Animaux & Parcelles

**Ma partie :** suivi du troupeau, cycle de vie des animaux et gestion des parcelles.

## Pages à présenter

- `/animaux` — liste, filtres, statut sanitaire
- `/animaux/nouveau` — création animal
- `/animaux/[id]` — fiche animal, pesées, santé, finances, PDF
- `/animaux/[id]/pesee/nouveau` — nouvelle pesée
- `/animaux/[id]/sortie` — vente, abattage ou mortalité
- `/animaux/prets-a-vendre` — animaux prêts à vendre
- `/parcelles` — occupation, capacité, recherche
- `/parcelles/nouvelle` — création parcelle
- `/parcelles/transfert` — transfert animal vers une parcelle

## Code frontend à citer

- `app/(dashboard)/animaux`
- `app/(dashboard)/parcelles`
- `components/forms/AnimalForm.tsx`
- `components/ui/ProgressBar.tsx`
- `components/ui/Badge.tsx`

## Code backend à citer

- `controllers/animal.controller.js`
- `controllers/parcelle.controller.js`
- `models/Animal.js`
- `models/Parcelle.js`
- `models/Pesee.js`
- `utils/calculations.js`
- `utils/pdfGenerator.js`

## Points simples à dire

1. L'animal suit un cycle : entrée → pesées → phase → sortie.
2. Les pesées calculent le **GMQ**.
3. Les phases sont : Veau, Croissance, Engraissement, Finition.
4. La fiche animal génère des documents PDF et QR code.
5. Le transfert vérifie la capacité de la parcelle.

## Démo rapide

Liste animaux → fiche animal → ajouter pesée → parcelles → transfert.
