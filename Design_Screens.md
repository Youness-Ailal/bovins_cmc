# Design Screens — Gestion Troupeau Bovin
**MVP · 5 acteurs · 30 écrans**

> ### 🔧 Note pour le prochain designer
> Les écrans marqués **`[AJOUTÉ ⭐]`** sont nouveaux — ils n'existent pas encore dans le design actuel.
> Les écrans marqués **`[MODIFIÉ ⭐]`** existent déjà mais leur description a été mise à jour — ajuster le design en conséquence.
> Tous les autres écrans sont inchangés.
> Les écrans marqués **`[JIRA ✅]`** ont été ajoutés au backlog Jira (projet KAN).

---

## Authentification
*Accessible par tous les rôles*

| Code | Écran | Acteur(s) | Description |
|------|-------|-----------|-------------|
| AUTH-01 | **Page de connexion** `[JIRA ✅ KAN-5]` | Tous | Formulaire email + mot de passe, logo application |
| AUTH-02 | **Mot de passe oublié / Réinitialisation** `[JIRA ✅ KAN-6]` | Tous | Étape 1 : saisie email. Étape 2 : nouveau mot de passe après clic sur le lien reçu (même flow progressif) |

---

## Dashboard principal
*Point d'entrée après connexion*

| Code | Écran | Acteur(s) | Description |
|------|-------|-----------|-------------|
| DASH-01 | **Tableau de bord KPI ferme** | Responsable | GMQ moyen troupeau, IC moyen, coût/kg moyen, nombre d'alertes actives, animaux proches du poids cible, répartition origine (ferme vs importé) |

---

## Module 01 — Animaux & Parcelles

### Animaux

| Code | Écran | Acteur(s) | Description |
|------|-------|-----------|-------------|
| AN-01 | **Liste des animaux** `[JIRA ✅ KAN-7]` | Responsable, Vétérinaire | Tableau filtrable par race, phase, parcelle, lot, état de santé — indicateurs GMQ et coût cumulé. Filtre rapide « Prêts à vendre » (poids cible atteint + délai retrait écoulé, triés par coût/jour décroissant) |
| AN-02 | **Fiche animal** `[JIRA ✅ KAN-8]` | Responsable, Vétérinaire | Détail en onglets — **Infos** (identifiant, race, sexe, parenté, origine, GMQ actuel, IC, projection abattage, état de santé) · **Pesées** (dernier poids enregistré + formulaire nouvelle pesée + GMQ calculé) · **Phases** (phase actuelle veau/jeune/adulte, déclenchement manuel de la transition) · **Rentabilité** (coût alimentation + vétérinaire + achat = total, coût/kg gagné, marge estimée) |
| AN-03 | **Formulaire animal** `[JIRA ✅ KAN-9]` | Responsable | Création et modification — NNI/identifiant, race, sexe, parenté (père/mère), origine, poids d'entrée, date d'entrée, notes |
| AN-04 | **Formulaire sortie / mortalité** `[JIRA ✅ KAN-10]` | Responsable, Vétérinaire | Motif (vente / abattage / mort), date sortie, poids final — clôture la fiche |

### Lots (Batches)

| Code | Écran | Acteur(s) | Description |
|------|-------|-----------|-------------|
| LOT-01 | **Liste des lots** `[JIRA ✅ KAN-11]` | Responsable | Tous les lots actifs avec GMQ moyen et coût total par lot |
| LOT-02 | **Fiche lot** `[JIRA ✅ KAN-12]` | Responsable | Animaux membres, statistiques agrégées (GMQ, IC, coût), alertes de groupe. Édition du nom, description et composition directement dans la fiche |

### Parcelles

| Code | Écran | Acteur(s) | Description |
|------|-------|-----------|-------------|
| PAR-01 | **Liste des parcelles** `[JIRA ✅ KAN-13]` | Responsable | Toutes les parcelles avec taux d'occupation actuel et ration assignée |
| PAR-02 | **Fiche parcelle** `[JIRA ✅ KAN-14]` | Responsable | Animaux présents, capacité max, ration actuelle (template assigné). Édition du nom, capacité et ration associée directement dans la fiche |
| PAR-03 | **Formulaire affectation / transfert** | Responsable | Sélection animal + parcelle cible, vérification capacité en temps réel |

---

## Module 02 — Stock & Rations

### Stock

| Code | Écran | Acteur(s) | Description |
|------|-------|-----------|-------------|
| STK-01 | **Stocks** | Responsable | Vue combinée — synthèse alertes (articles sous seuil, proches péremption) + liste complète des articles (aliments et médicaments) avec quantité actuelle, unité, prix unitaire, date péremption |
| STK-02 | **Formulaire article** | Responsable | Création et modification — nom, type (aliment / médicament), quantité, unité, prix d'achat, date péremption, seuil d'alerte minimal |
| STK-03 `[AJOUTÉ ⭐]` | **Historique des mouvements de stock** | Responsable | Journal chronologique de toutes les entrées et sorties pour un article donné — colonnes : date, type d'opération (approvisionnement / distribution ration / traitement vétérinaire), référence (numéro distribution ou acte médical), quantité entrée/sortie, solde après opération. Accessible depuis la fiche article dans STK-01. |

### Rations

| Code | Écran | Acteur(s) | Description |
|------|-------|-----------|-------------|
| RAT-01 | **Liste des rations (templates)** | Responsable | Rations-templates définies par phase de croissance avec coût/tête/jour calculé |
| RAT-02 `[MODIFIÉ ⭐]` | **Fiche / Formulaire ration (template)** | Responsable | **Définition de la recette uniquement** — composition détaillée (ingrédients, quantités/jour/tête), coût total calculé. Création et modification dans le même écran. ⚠️ Cet écran ne déclenche PAS de déduction stock — c'est un template réutilisable. Le bouton « Préparer une distribution » renvoie vers RAT-03. |
| RAT-03 `[AJOUTÉ ⭐]` | **Formulaire de distribution / mélange de ration** | Responsable | **C'est l'écran "food mix" — le seul qui déclenche la déduction du stock.** Champs : sélection parcelle ou lot cible, date de distribution, ration template à appliquer (chargée automatiquement depuis l'assignation parcelle), nombre d'animaux (pré-rempli). Tableau de calcul affiché en temps réel : pour chaque ingrédient → quantité/tête/jour × nombre d'animaux = **quantité totale à préparer** + stock disponible + stock restant après déduction. Bouton « Confirmer la distribution » → le système déduit chaque ingrédient du stock et enregistre l'événement. Alerte bloquante si stock insuffisant pour un ingrédient. |
| RAT-04 `[AJOUTÉ ⭐]` | **Historique des distributions alimentaires** | Responsable | Liste chronologique de toutes les distributions enregistrées — colonnes : date, parcelle/lot, ration appliquée, nombre d'animaux, coût total distribution. Clic sur une ligne → détail des quantités déduites par ingrédient. Permet de vérifier qu'aucun jour n'a été sauté et de tracer la consommation réelle sur une période. |

---

## Module 03 — Santé & Traitements

| Code | Écran | Acteur(s) | Description |
|------|-------|-----------|-------------|
| VET-01 | **Liste des traitements** | Vétérinaire, Responsable | Tous les actes médicaux actifs ou récents avec statut délai de retrait |
| VET-02 | **Formulaire traitement** | Vétérinaire, Responsable | Animal, médicament (depuis stock), dosage, voie d'administration, date — délai retrait calculé automatiquement, stock déduit |
| VET-03 | **Formulaire état de santé** | Vétérinaire | Sélection statut — Sain / Malade / En traitement / En observation |
| VET-04 | **Formulaire planification traitement** | Vétérinaire | Animal, médicament, date prévue, type (vaccin / déparasitage / autre), notes |
| VET-05 | **Calendrier des traitements à venir** | Vétérinaire, Responsable | Vue agenda des traitements planifiés avec indicateurs J-3 / J-1 |

---

## Module 04 — Performance & Export

| Code | Écran | Acteur(s) | Description |
|------|-------|-----------|-------------|
| PERF-01 | **Centre des alertes** | Responsable, Vétérinaire | Toutes les alertes actives classées par priorité (critique / avertissement / info) — stock, croissance, santé, capacité |
| PERF-02 | **Export des données** | Responsable, Admin | Sélection périmètre (lot / parcelle / période), format (Excel / CSV), aperçu avant export |

---

## Module 05 — Administration & Paramétrage
*Accessible par Admin uniquement*

| Code | Écran | Acteur(s) | Description |
|------|-------|-----------|-------------|
| ADM-01 | **Liste des utilisateurs** | Admin | Tous les comptes avec rôle, statut actif/inactif, dernière connexion. Actions inline : désactiver, réinitialiser mot de passe |
| ADM-02 | **Formulaire utilisateur** | Admin | Création et modification — nom, email, rôle (Admin / Responsable / Vétérinaire), statut actif |
| ADM-03 | **Configuration des races** | Admin | Liste des races bovines avec GMQ cible, IC cible et poids abattage cible par phase |
| ADM-04 | **Formulaire race** | Admin | Nom de la race, seuils GMQ et IC par phase (veau / jeune / adulte), poids cible |
| ADM-05 | **Configuration des alertes** | Admin | Seuils personnalisables — stock minimal, délai rappel traitement, seuil retard croissance, canaux (in-app, email) |
| ADM-06 | **Paramètres généraux** | Admin | Nom de la ferme, localisation, devise, langue (FR / AR), fuseau horaire |

---

## Composants transversaux
*Présents sur toutes les pages*

| Code | Composant | Description |
|------|-----------|-------------|
| NAV-01 | **Barre de navigation principale** | Liens vers les 5 modules + badge alertes actives + recherche globale rapide (identifiant animal, NNI, nom de lot) |
| NAV-02 | **En-tête utilisateur** | Nom, rôle actuel, lien déconnexion |
| NOTIF-01 | **Panneau de notifications** | Alertes en temps réel accessibles depuis n'importe quelle page |

---

## Récapitulatif

| Catégorie | Codes | Écrans |
|-----------|-------|--------|
| Authentification | AUTH-01 → 02 | 2 |
| Dashboard | DASH-01 | 1 |
| Animaux & Parcelles | AN-01 → 04, LOT-01 → 02, PAR-01 → 03 | 9 |
| Stock & Rations | STK-01 → 03 ⭐, RAT-01 → 04 ⭐ | 7 (+3 vs v1) |
| Santé & Traitements | VET-01 → 05 | 5 |
| Performance & Export | PERF-01 → 02 | 2 |
| Administration | ADM-01 → 06 | 6 |
| Composants transversaux | NAV-01 → 02, NOTIF-01 | 3 |
| **Total** | | **35** (+3 vs v1) |

---

## 🔁 Récapitulatif des changements (pour le designer)

| Code | Type | Raison |
|------|------|--------|
| STK-03 | **AJOUTÉ ⭐** | Traçabilité des mouvements de stock — entrées, sorties rations, sorties traitements |
| RAT-02 | **MODIFIÉ ⭐** | Clarifié comme "template/recette uniquement" — ajout bouton vers RAT-03 |
| RAT-03 | **AJOUTÉ ⭐** | **Écran critique manquant** — distribution/mélange réel avec déduction stock en temps réel |
| RAT-04 | **AJOUTÉ ⭐** | Historique des distributions pour traçabilité et vérification des jours manquants |

---

## 🎫 Récapitulatif des tickets Jira créés

| Code | Écran | Ticket Jira |
|------|-------|-------------|
| AUTH-01 | Page de connexion Login | [KAN-5](https://cmcdrarga.atlassian.net/browse/KAN-5) |
| AUTH-02 | Mot de passe oublié / Réinitialisation | [KAN-6](https://cmcdrarga.atlassian.net/browse/KAN-6) |
| AN-01 | Liste des animaux | [KAN-7](https://cmcdrarga.atlassian.net/browse/KAN-7) |
| AN-02 | Fiche animal | [KAN-8](https://cmcdrarga.atlassian.net/browse/KAN-8) |
| AN-03 | Formulaire animal | [KAN-9](https://cmcdrarga.atlassian.net/browse/KAN-9) |
| AN-04 | Formulaire sortie / mortalité | [KAN-10](https://cmcdrarga.atlassian.net/browse/KAN-10) |
| LOT-01 | Liste des lots | [KAN-11](https://cmcdrarga.atlassian.net/browse/KAN-11) |
| LOT-02 | Fiche lot | [KAN-12](https://cmcdrarga.atlassian.net/browse/KAN-12) |
| PAR-01 | Liste des parcelles | [KAN-13](https://cmcdrarga.atlassian.net/browse/KAN-13) |
| PAR-02 | Fiche parcelle | [KAN-14](https://cmcdrarga.atlassian.net/browse/KAN-14) |

---

## Logique de déduction stock — Tableau récapitulatif

> Pour clarifier **quand et comment** le stock est déduit selon l'opération :

| Opération | Écran déclencheur | Déduction automatique |
|-----------|-------------------|-----------------------|
| Définir une recette de ration | RAT-02 | ❌ Non — c'est un template |
| Assigner une ration à une parcelle | PAR-02 | ❌ Non — c'est une configuration |
| **Distribuer / préparer la ration du jour** | **RAT-03 ⭐** | **✅ Oui — ingrédients déduits du stock** |
| Enregistrer un traitement vétérinaire | VET-02 | ✅ Oui — médicament déduit du stock |
| Approvisionner un article | STK-02 | ✅ Oui — quantité ajoutée au stock |
