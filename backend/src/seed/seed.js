/**
 * Seed script — populates the database with realistic demo data.
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Race = require('../models/Race');
const Parcelle = require('../models/Parcelle');
const Lot = require('../models/Lot');
const Animal = require('../models/Animal');
const Pesee = require('../models/Pesee');
const StockArticle = require('../models/StockArticle');
const StockMouvement = require('../models/StockMouvement');
const Ration = require('../models/Ration');
const Distribution = require('../models/Distribution');
const Traitement = require('../models/Traitement');
const EtatSante = require('../models/EtatSante');
const PlanTraitement = require('../models/PlanTraitement');
const Alerte = require('../models/Alerte');
const Parametres = require('../models/Parametres');
const { computeGMQ } = require('../utils/calculations');

async function run() {
  await connectDB();
  console.log('Clearing collections…');
  await Promise.all([
    User.deleteMany({}), Race.deleteMany({}), Parcelle.deleteMany({}), Lot.deleteMany({}),
    Animal.deleteMany({}), Pesee.deleteMany({}), StockArticle.deleteMany({}), StockMouvement.deleteMany({}),
    Ration.deleteMany({}), Distribution.deleteMany({}), Traitement.deleteMany({}), EtatSante.deleteMany({}),
    PlanTraitement.deleteMany({}), Alerte.deleteMany({}), Parametres.deleteMany({}),
  ]);

  // ── Users ──
  console.log('Seeding users…');
  await User.create([
    { prenom: 'Youness', nom: 'Ailal', email: 'youness@bovitrack.ma', password: 'password123', role: 'Admin', statut: 'Actif' },
    { prenom: 'Salma', nom: 'Benali', email: 'salma@bovitrack.ma', password: 'password123', role: 'Responsable', statut: 'Actif' },
    { prenom: 'Mohamed', nom: 'Ouali', email: 'mohamed@bovitrack.ma', password: 'password123', role: 'Vétérinaire', statut: 'Actif' },
    { prenom: 'Hajar', nom: 'Idrissi', email: 'hajar@bovitrack.ma', password: 'password123', role: 'Opérateur', statut: 'Inactif' },
  ]);

  // ── Races ──
  console.log('Seeding races…');
  const races = await Race.create([
    { nom: 'Holstein', origine: 'Europe du Nord', poidsAdulte: 650, gmqCible: 1.4, icCible: 6.5, poidsAbattage: 480, dureeEngraissement: 180, description: 'Race laitière à haute production.' },
    { nom: 'Angus', origine: 'Écosse', poidsAdulte: 600, gmqCible: 1.35, icCible: 6.0, poidsAbattage: 460, dureeEngraissement: 160, description: 'Race à viande rustique.' },
    { nom: 'Limousin', origine: 'France', poidsAdulte: 700, gmqCible: 1.5, icCible: 6.2, poidsAbattage: 480, dureeEngraissement: 170, description: 'Excellente conformation bouchère.' },
    { nom: 'Charolais', origine: 'France', poidsAdulte: 850, gmqCible: 1.6, icCible: 6.8, poidsAbattage: 500, dureeEngraissement: 175, description: 'Race à fort gabarit.' },
  ]);
  const raceByName = Object.fromEntries(races.map((r) => [r.nom, r]));

  // ── Stock articles ──
  console.log('Seeding stock…');
  const articles = await StockArticle.create([
    { designation: 'Orge', categorie: 'Céréales', unite: 'kg', quantite: 120, seuil: 200, prixUnitaire: 2.5 },
    { designation: 'Maïs concassé', categorie: 'Céréales', unite: 'kg', quantite: 320, seuil: 150, prixUnitaire: 1.8 },
    { designation: 'Foin de luzerne', categorie: 'Fourrages', unite: 'kg', quantite: 850, seuil: 500, prixUnitaire: 1.8 },
    { designation: 'Tourteau de soja', categorie: 'Concentrés', unite: 'kg', quantite: 45, seuil: 100, prixUnitaire: 6.0 },
    { designation: 'Minéraux bovins', categorie: 'Compléments', unite: 'kg', quantite: 30, seuil: 25, prixUnitaire: 12.0, datePeremption: new Date('2026-12-01') },
    { designation: 'Mélasse', categorie: 'Additifs', unite: 'L', quantite: 60, seuil: 50, prixUnitaire: 3.5, datePeremption: new Date('2026-06-30') },
    { designation: 'Amoxicilline', categorie: 'Médicaments', unite: 'doses', quantite: 24, seuil: 10, prixUnitaire: 45 },
    { designation: 'Ivermectine', categorie: 'Médicaments', unite: 'doses', quantite: 12, seuil: 15, prixUnitaire: 38 },
  ]);
  const artByName = Object.fromEntries(articles.map((a) => [a.designation, a]));

  // ── Rations ──
  console.log('Seeding rations…');
  const rations = await Ration.create([
    {
      nom: 'Ration Bovins Adultes', phase: 'Engraissement', cible: 'Parcelle Alpha',
      ingredients: [
        { nom: 'Orge', article: artByName['Orge']._id, quantite: 5, unite: 'kg', prixUnitaire: 2.5 },
        { nom: 'Foin de luzerne', article: artByName['Foin de luzerne']._id, quantite: 3, unite: 'kg', prixUnitaire: 1.8 },
        { nom: 'Tourteau de soja', article: artByName['Tourteau de soja']._id, quantite: 0.5, unite: 'kg', prixUnitaire: 6.0 },
      ],
    },
    {
      nom: 'Ration Veaux', phase: 'Croissance', cible: 'Parcelle Gamma',
      ingredients: [
        { nom: 'Maïs concassé', article: artByName['Maïs concassé']._id, quantite: 3, unite: 'kg', prixUnitaire: 1.8 },
        { nom: 'Foin de luzerne', article: artByName['Foin de luzerne']._id, quantite: 2, unite: 'kg', prixUnitaire: 1.8 },
      ],
    },
    {
      nom: 'Ration Finition', phase: 'Finition', cible: 'LOT-B',
      ingredients: [
        { nom: 'Orge', article: artByName['Orge']._id, quantite: 6, unite: 'kg', prixUnitaire: 2.5 },
        { nom: 'Tourteau de soja', article: artByName['Tourteau de soja']._id, quantite: 1, unite: 'kg', prixUnitaire: 6.0 },
        { nom: 'Mélasse', article: artByName['Mélasse']._id, quantite: 0.5, unite: 'L', prixUnitaire: 3.5 },
      ],
    },
  ]);
  const rationByName = Object.fromEntries(rations.map((r) => [r.nom, r]));

  // ── Parcelles ──
  console.log('Seeding parcelles…');
  const parcelles = await Parcelle.create([
    { nom: 'Parcelle Alpha', reference: 'P-01', capaciteMax: 120, superficie: 4.5, type: 'paturage', ration: rationByName['Ration Bovins Adultes']._id },
    { nom: 'Parcelle Beta', reference: 'P-02', capaciteMax: 80, superficie: 3.0, type: 'engraissement', ration: rationByName['Ration Bovins Adultes']._id },
    { nom: 'Parcelle Gamma', reference: 'P-03', capaciteMax: 100, superficie: 3.8, type: 'veaux', ration: rationByName['Ration Veaux']._id },
  ]);
  const parcelleByName = Object.fromEntries(parcelles.map((p) => [p.nom, p]));

  // ── Lots ──
  console.log('Seeding lots…');
  const lots = await Lot.create([
    { nom: 'LOT-A', phase: 'Engraissement', dateCreation: new Date('2026-01-12'), description: 'Lot engraissement Q1' },
    { nom: 'LOT-B', phase: 'Finition', dateCreation: new Date('2026-03-05'), description: 'Lot finition' },
  ]);
  const lotByName = Object.fromEntries(lots.map((l) => [l.nom, l]));

  // ── Animals ──
  console.log('Seeding animals…');
  const animalsData = [
    { identifiant: 'ANI-001', race: 'Holstein', sexe: 'Mâle', phase: 'Croissance', parcelle: 'Parcelle Alpha', lot: 'LOT-A', etatSante: 'Sain', poidsActuel: 320, gmqActuel: 0.82, coutCumule: 12450 },
    { identifiant: 'ANI-002', race: 'Angus', sexe: 'Femelle', phase: 'Engraissement', parcelle: 'Parcelle Beta', lot: 'LOT-A', etatSante: 'Sain', poidsActuel: 410, gmqActuel: 0.74, coutCumule: 8920 },
    { identifiant: 'ANI-003', race: 'Limousin', sexe: 'Mâle', phase: 'Finition', parcelle: 'Parcelle Alpha', lot: 'LOT-B', etatSante: 'Malade', poidsActuel: 510, gmqActuel: 0.65, coutCumule: 15780 },
    { identifiant: 'ANI-012', race: 'Holstein', sexe: 'Mâle', phase: 'Engraissement', parcelle: 'Parcelle Beta', lot: 'LOT-A', etatSante: 'En traitement', poidsActuel: 380, gmqActuel: 0.88, coutCumule: 10200 },
    { identifiant: 'ANI-019', race: 'Charolais', sexe: 'Mâle', phase: 'Finition', parcelle: 'Parcelle Beta', lot: 'LOT-A', etatSante: 'Sain', poidsActuel: 495, gmqActuel: 1.41, coutCumule: 18200 },
    { identifiant: 'ANI-022', race: 'Angus', sexe: 'Femelle', phase: 'Finition', parcelle: 'Parcelle Alpha', lot: 'LOT-A', etatSante: 'Sain', poidsActuel: 482, gmqActuel: 1.2, coutCumule: 12900 },
    { identifiant: 'ANI-031', race: 'Angus', sexe: 'Mâle', phase: 'Engraissement', parcelle: 'Parcelle Gamma', lot: 'LOT-B', etatSante: 'En observation', poidsActuel: 360, gmqActuel: 0.79, coutCumule: 9100 },
    { identifiant: 'ANI-047', race: 'Limousin', sexe: 'Mâle', phase: 'Croissance', parcelle: 'Parcelle Gamma', lot: 'LOT-B', etatSante: 'Malade', poidsActuel: 290, gmqActuel: 0.78, coutCumule: 7800 },
  ];
  const animals = await Animal.create(
    animalsData.map((a) => ({
      identifiant: a.identifiant,
      race: raceByName[a.race]._id,
      sexe: a.sexe,
      origine: 'ferme',
      phase: a.phase,
      poidsEntree: Math.round(a.poidsActuel * 0.4),
      poidsActuel: a.poidsActuel,
      dateEntree: new Date('2025-09-01'),
      parcelle: parcelleByName[a.parcelle]._id,
      lot: lotByName[a.lot]._id,
      etatSante: a.etatSante,
      gmqActuel: a.gmqActuel,
      coutCumule: a.coutCumule,
    }))
  );
  const animalByCode = Object.fromEntries(animals.map((a) => [a.identifiant, a]));

  // ── Pesées (2 per animal, compute GMQ) ──
  console.log('Seeding pesées…');
  for (const a of animals) {
    const d1 = new Date('2026-05-01');
    const d2 = new Date('2026-05-15');
    const p1 = Math.round(a.poidsActuel - a.gmqActuel * 14);
    const gmq = computeGMQ(a.poidsActuel, p1, d2, d1);
    await Pesee.create([
      { animal: a._id, date: d1, poids: p1, gmq: null, observateur: 'Salma B.' },
      { animal: a._id, date: d2, poids: a.poidsActuel, gmq, observateur: 'Salma B.' },
    ]);
  }

  // ── Traitements ──
  console.log('Seeding traitements…');
  await Traitement.create([
    { animal: animalByCode['ANI-012']._id, type: 'Antibiotique', produit: 'Amoxicilline', article: artByName['Amoxicilline']._id, dose: 2, doseUnite: 'ml', voie: 'injection-im', dateDebut: new Date('2026-06-01'), dateFin: new Date('2026-06-07'), veterinaire: 'Dr. Ouali', delaiRetrait: 5, statut: 'En cours' },
    { animal: animalByCode['ANI-031']._id, type: 'Antiparasitaire', produit: 'Ivermectine', article: artByName['Ivermectine']._id, dose: 1, doseUnite: 'dose', voie: 'injection-sc', dateDebut: new Date('2026-05-28'), dateFin: new Date('2026-06-01'), veterinaire: 'Dr. Ouali', delaiRetrait: 0, statut: 'Terminé' },
    { animal: animalByCode['ANI-047']._id, type: 'Anti-inflammatoire', produit: 'Méloxicam', dose: 3, doseUnite: 'ml', voie: 'injection-iv', dateDebut: new Date('2026-06-02'), veterinaire: 'Dr. Ouali', delaiRetrait: 3, statut: 'En cours' },
  ]);

  // ── États de santé ──
  console.log('Seeding états de santé…');
  await EtatSante.create([
    { animal: animalByCode['ANI-012']._id, date: new Date('2026-06-02'), etat: 'En traitement', temperature: 39.2 },
    { animal: animalByCode['ANI-047']._id, date: new Date('2026-06-02'), etat: 'Malade', temperature: 40.1 },
    { animal: animalByCode['ANI-031']._id, date: new Date('2026-06-01'), etat: 'En observation', temperature: 38.7 },
  ]);

  // ── Plans de traitement ──
  console.log('Seeding plans…');
  await PlanTraitement.create([
    { animal: animalByCode['ANI-001']._id, type: 'Vaccin', produit: 'FMD Vaccine', datePrevue: new Date('2026-06-10'), frequence: 'Annuel', statut: 'À faire' },
    { animal: animalByCode['ANI-019']._id, type: 'Antiparasitaire', produit: 'Ivermectine', datePrevue: new Date('2026-06-05'), frequence: 'Trimestriel', statut: 'Rappel J-3' },
    { animal: animalByCode['ANI-003']._id, type: 'Antibiotique', produit: 'Pénicilline', datePrevue: new Date('2026-06-01'), frequence: 'Ponctuel', statut: 'En retard' },
  ]);

  // ── Distributions ──
  console.log('Seeding distributions…');
  await Distribution.create([
    { ration: rationByName['Ration Bovins Adultes']._id, cible: 'Parcelle Alpha', date: new Date('2026-06-02'), quantite: 624, nbAnimaux: 78, coutEstime: 1435 },
    { ration: rationByName['Ration Veaux']._id, cible: 'Parcelle Gamma', date: new Date('2026-06-01'), quantite: 290, nbAnimaux: 58, coutEstime: 742 },
  ]);

  // ── Alertes ──
  console.log('Seeding alertes…');
  await Alerte.create([
    { niveau: 'Critique', categorie: 'mortalite', message: 'Mortalité signalée', concerne: 'ANI-047', traitee: false },
    { niveau: 'Avertissement', categorie: 'stock_faible', message: 'Stock faible: Orge (120 kg)', concerne: 'Orge', traitee: false },
    { niveau: 'Avertissement', categorie: 'retard_croissance', message: 'Retard croissance: ANI-047', concerne: 'ANI-047', traitee: false },
    { niveau: 'Info', categorie: 'stock_faible', message: 'Stock médicament faible: Ivermectine', concerne: 'Ivermectine', traitee: false },
    { niveau: 'Critique', categorie: 'delai_retrait', message: 'Délai de retrait actif: ANI-012', concerne: 'ANI-012', traitee: true },
  ]);

  // ── Mouvements de stock ──
  console.log('Seeding mouvements de stock…');
  await StockMouvement.create([
    { article: artByName['Orge']._id, type: 'sortie', quantite: 80, quantiteApres: 120, date: new Date('2026-06-02'), motif: 'Distribution Parcelle Alpha' },
    { article: artByName['Foin de luzerne']._id, type: 'entree', quantite: 500, quantiteApres: 850, date: new Date('2026-06-01'), prixUnitaire: 1.8, motif: 'Livraison fournisseur' },
    { article: artByName['Tourteau de soja']._id, type: 'sortie', quantite: 55, quantiteApres: 45, date: new Date('2026-06-01'), motif: 'Distribution LOT-B' },
    { article: artByName['Minéraux bovins']._id, type: 'ajustement', quantite: 30, quantiteApres: 30, date: new Date('2026-05-31'), motif: 'Correction inventaire' },
    { article: artByName['Mélasse']._id, type: 'entree', quantite: 60, quantiteApres: 60, date: new Date('2026-05-30'), prixUnitaire: 3.5, motif: 'Livraison fournisseur' },
    { article: artByName['Amoxicilline']._id, type: 'sortie', quantite: 2, quantiteApres: 24, date: new Date('2026-06-01'), motif: 'Traitement ANI-012' },
  ]);

  // ── Paramètres + config alertes (UC-24) ──
  console.log('Seeding paramètres…');
  await Parametres.create({
    nomFerme: 'Ferme Ailal',
    responsable: 'Youness Ailal',
    devise: 'MAD',
    alertesConfig: [
      { id: 'AC-001', nom: 'GMQ en dessous du seuil', description: "Alerte si le GMQ d'un animal est inférieur à la cible de sa race", seuil: '80', unite: '% de la cible', active: true, niveau: 'Critique' },
      { id: 'AC-002', nom: 'IC trop élevé', description: "Alerte si l'Indice de Consommation dépasse le seuil fixé", seuil: '8.0', unite: '', active: true, niveau: 'Avertissement' },
      { id: 'AC-003', nom: 'Pesée en retard', description: "Rappel si aucune pesée n'a été enregistrée depuis N jours", seuil: '14', unite: 'jours', active: true, niveau: 'Info' },
      { id: 'AC-004', nom: 'Stock sous seuil', description: "Alerte quand un article atteint son seuil d'alerte minimum", seuil: '—', unite: 'par article', active: true, niveau: 'Avertissement' },
      { id: 'AC-005', nom: 'Délai de retrait actif', description: "Notification quand un animal a un délai de retrait en cours", seuil: '—', unite: '', active: true, niveau: 'Critique' },
      { id: 'AC-006', nom: 'Traitement planifié', description: 'Rappel avant la date prévue d\'un traitement', seuil: '3', unite: 'jours avant', active: false, niveau: 'Info' },
    ],
  });

  console.log('\n✅ Seed terminé. Connexion: youness@bovitrack.ma / password123');
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
