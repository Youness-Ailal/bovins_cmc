# Use Cases — Gestion Troupeau Bovin
**MVP · 5 modules · 22 cas d'utilisation · 4 acteurs**

---

## Acteurs

| Acteur | Rôle |
|--------|------|
| **Administrateur** | Paramétrage, races, utilisateurs, seuils système |
| **Responsable ferme** | Suivi quotidien — animaux, stock, pesées, rations |
| **Vétérinaire** | Traitements, santé, délais de retrait |
| **Système (auto)** | GMQ, IC, alertes, déductions stock, transitions de phase |

---

## Module 01 — Animaux & Parcelles
> registre · pesées · phases · mouvements

### UC-01 · Enregistrer un animal *(core)*
- **Acteur :** Responsable
- **Description :** Créer la fiche animal — identifiant (NNI ou interne), race, sexe, parenté (père/mère), origine (né à la ferme / importé), poids à l'entrée, date d'entrée. Poids cible d'abattage configuré par race.

### UC-02 · Enregistrer une pesée *(core)*
- **Acteur :** Responsable, Vétérinaire
- **Description :** Saisir le poids vif et la date. Le système calcule automatiquement le GMQ depuis la pesée précédente et met à jour la projection d'abattage.
- **Relation :** `«include»` Calculer GMQ

### UC-03 · Gérer les phases de croissance *(core)*
- **Acteur :** Responsable, Système
- **Description :** Suivre la progression veau → jeune → adulte. Transition déclenchée manuellement ou automatiquement par le système selon l'âge et le poids. Chaque phase lie une ration spécifique.
- **Relation :** `«extend»` Notification de transition de phase

### UC-04 · Créer un lot (batch)
- **Acteur :** Responsable
- **Description :** Regrouper des animaux de même origine ou phase pour un suivi collectif — GMQ moyen, coût total, alertes de groupe.

### UC-05 · Affecter à une parcelle / transférer
- **Acteur :** Responsable
- **Description :** Placer un animal dans un paddock ou le déplacer. Capacité maximale vérifiée. Mouvement horodaté et tracé automatiquement.
- **Relation :** `«include»` Vérifier capacité maximale

### UC-06 · Enregistrer une sortie ou mortalité
- **Acteur :** Responsable, Vétérinaire
- **Description :** Clôturer la fiche — motif (vente, abattage, mort), date, poids de sortie. Ferme la fiche et alimente les statistiques de l'élevage.

### UC-07 · Rechercher / consulter un animal
- **Acteur :** Responsable, Vétérinaire
- **Description :** Filtrer par race, phase, parcelle, lot, état de santé. Accéder à la fiche complète avec GMQ actuel, IC, coût cumulé et projection d'abattage.

---

## Module 02 — Stock & Rations
> aliments · médicaments · coût/tête · alertes stock

### UC-08 · Gérer le stock (aliments + médicaments) *(core)*
- **Acteur :** Responsable
- **Description :** Ajouter un article avec quantité, unité, prix d'achat et date de péremption. Mise à jour après consommation ou réapprovisionnement.
- **Relation :** `«extend»` Alerte stock faible

### UC-09 · Créer et associer une ration *(core)*
- **Acteur :** Responsable
- **Description :** Définir la composition d'une ration par phase de croissance (ingrédients + quantités/jour/tête). Calcul automatique du coût par tête par jour selon les prix en stock. Association à une parcelle ou un lot.
- **Relation :** `«include»` Calculer coût ration

### UC-10 · Tableau de bord des stocks
- **Acteur :** Responsable
- **Description :** Vue synthétique des niveaux actuels, articles sous le seuil d'alerte et produits proches de la péremption.

---

## Module 03 — Santé & Traitements
> actes médicaux · délai retrait · planification

### UC-12 · Enregistrer un traitement *(core)*
- **Acteur :** Vétérinaire, Responsable
- **Description :** Saisir le médicament, dosage, voie d'administration et date. Le stock médicament est déduit automatiquement et le délai de retrait est calculé et affiché clairement sur la fiche.
- **Relation :** `«include»` Calculer délai de retrait

### UC-13 · Mettre à jour l'état de santé
- **Acteur :** Vétérinaire
- **Description :** Statut visible sur la fiche — Sain / Malade / En traitement / En observation. Bloque la planification de sortie si délai de retrait non écoulé.

### UC-14 · Planifier un traitement futur
- **Acteur :** Vétérinaire
- **Description :** Programmer un vaccin ou déparasitage. Rappel automatique à J-3 et J-1 pour le vétérinaire et le responsable.
- **Relation :** `«extend»` Alerte traitement à venir

---

## Module 04 — Performance & Tableau de Bord
> GMQ · IC · rentabilité · alertes · KPI ferme · export

### UC-16 · Calculer GMQ & IC automatiquement *(core)*
- **Acteur :** Système
- **Description :** À chaque pesée — calcul du Gain Moyen Quotidien et de l'Indice de Consommation. Comparaison automatique avec le seuil de la race pour détecter les retards de croissance.

### UC-17 · Fiche de rentabilité par animal *(core)*
- **Acteur :** Responsable
- **Description :** Vue synthétique — coût alimentation cumulé + coût vétérinaire + coût d'achat = coût total, coût/kg gagné, marge estimée si vendu aujourd'hui.

### UC-18 · Tableau de bord KPI ferme *(core)*
- **Acteur :** Responsable
- **Description :** Vue d'ensemble en temps réel — GMQ moyen du troupeau, IC moyen, coût/kg moyen, alertes actives, animaux proches du poids cible, répartition origine (ferme vs importé).

### UC-19 · Liste animaux prêts à vendre
- **Acteur :** Responsable, Système
- **Description :** Vue filtrée des animaux ayant atteint ou dépassé leur poids cible avec délai de retrait écoulé. Classés par coût/jour décroissant pour prioriser les sorties.

### UC-20 · Alertes automatiques (×10)
- **Acteur :** Système, Responsable, Vétérinaire
- **Description :** Dix alertes déclenchées automatiquement :
  1. Stock faible
  2. Produit proche péremption
  3. Traitement à venir (J-3)
  4. Traitement à venir (J-1)
  5. Retard de croissance détecté
  6. Animal prêt à abattre
  7. Délai de retrait non écoulé
  8. Transition de phase détectée
  9. Stock médicament épuisé
  10. Mortalité anormale dans un lot

### UC-21 · Exporter les données
- **Acteur :** Responsable, Admin
- **Description :** Export du registre des animaux, pesées, traitements et coûts en format Excel ou CSV. Périmètre configurable — par lot, parcelle ou période.

---

## Module 05 — Administration & Paramétrage
> utilisateurs · races · seuils · configuration système

### UC-22 · Gérer les utilisateurs et rôles *(core)*
- **Acteur :** Admin
- **Description :** Créer, modifier et désactiver les comptes utilisateurs. Attribuer les rôles (Admin / Responsable / Vétérinaire) et configurer les permissions par module. Réinitialisation des mots de passe.

### UC-23 · Configurer les races et seuils *(core)*
- **Acteur :** Admin
- **Description :** Définir et modifier les races bovines (nom, GMQ cible, IC cible, poids d'abattage cible par phase). Ces paramètres servent de référence à tous les calculs automatiques et alertes de croissance.
- **Relation :** `«include»` Définir seuils GMQ / IC

### UC-24 · Paramétrer les alertes et notifications
- **Acteur :** Admin
- **Description :** Configurer les seuils d'alerte (niveau de stock minimal, délai rappel traitement, seuil retard croissance). Choisir les canaux de notification — in-app, email.

---

## Relations UML

| Type | De | Vers | Condition |
|------|----|------|-----------|
| `«include»` | Enregistrer une pesée | **Calculer GMQ + IC** | Toujours obligatoire à chaque pesée |
| `«include»` | Affecter à une parcelle | **Vérifier capacité maximale** | Toujours obligatoire avant affectation |
| `«include»` | Enregistrer un traitement | **Calculer délai de retrait** | Toujours obligatoire — délai selon médicament |
| `«include»` | Enregistrer un traitement | **Déduire stock médicament** | Toujours obligatoire à chaque acte médical |
| `«include»` | Créer une ration | **Calculer coût par tête / jour** | Calcul selon prix d'achat en stock |
| `«include»` | Configurer les races | **Définir seuils GMQ / IC** | Paramètres de référence pour tous les calculs |
| `«extend»` | Mettre à jour le stock | **Alerter stock faible** | Si quantité < seuil configuré |
| `«extend»` | Calculer le GMQ | **Alerter retard de croissance** | Si GMQ < seuil race sur N jours |
| `«extend»` | Suivre le poids cible | **Alerter animal prêt à vendre** | Si poids ≥ cible ET délai retrait écoulé |
| `«extend»` | Planifier un traitement futur | **Alerter traitement à venir** | Rappel automatique à J-3 et J-1 |
| `«extend»` | Gérer les phases de croissance | **Notifier transition de phase** | Si âge ou poids atteint le seuil suivant |
| `«extend»` | Tableau de bord KPI | **Exporter les données** | À la demande — périmètre configurable |

---

## Hors scope V1 — Prévu V2

| Feature | Description |
|---------|-------------|
| Planification abattage avancée | Calendrier 30/60/90 j, fiche traçabilité PDF, estimation rendement carcasse |
| Module Finance complet | Bilan de lot à la clôture, rapport exportable par campagne |
| Analytique avancée & courbes | Courbes de croissance avec projection, comparaison rations par IC |
| Pathologies récurrentes | Statistiques maladies par race/saison/parcelle, prévention épidémies |
| Filiation & génétique | Arbre généalogique, performance des lignées père/mère |
| QR Code & IoT | Identification par QR/code-barres, intégration capteurs IoT |
