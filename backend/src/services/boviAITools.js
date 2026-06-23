/**
 * BoviAI tools — the bridge between the Gemini model and the real farm data.
 *
 * Each tool is (1) a JSON declaration the model sees, and (2) a JS handler that
 * runs a real MongoDB query / deterministic prediction. Predictions are computed
 * here (not by the LLM) so figures are accurate, never hallucinated.
 */
const Animal = require('../models/Animal');
const Alerte = require('../models/Alerte');
const StockArticle = require('../models/StockArticle');
const StockMouvement = require('../models/StockMouvement');
const Traitement = require('../models/Traitement');
const PlanTraitement = require('../models/PlanTraitement');
const Parametres = require('../models/Parametres');
// Registered so .populate('race'|'parcelle') works regardless of require order.
require('../models/Race');
require('../models/Parcelle');

const DAY = 86400000;

async function getPrix() {
  const p = await Parametres.findOne();
  return {
    prixVente: p?.prixVenteKgMoyen ?? 35,
    prixAchat: p?.prixAchatKgMoyen ?? 30,
    nomFerme: p?.nomFerme ?? 'BOVITRACK',
  };
}

// ── Prediction helpers ────────────────────────────────────────────────────────

/** Estimated days for an animal to reach its race slaughter weight. */
function joursVersCible(animal) {
  const cible = animal.race?.poidsAbattage || 0;
  if (!cible || !animal.gmqActuel || animal.gmqActuel <= 0) return null;
  const reste = cible - animal.poidsActuel;
  if (reste <= 0) return 0;
  return Math.ceil(reste / animal.gmqActuel);
}

/** Average daily out-flow of an article over the last 30 days → days of runway. */
async function stockRunwayDays(article) {
  const since = new Date(Date.now() - 30 * DAY);
  const sorties = await StockMouvement.find({ article: article._id, type: 'sortie', date: { $gte: since } });
  const totalOut = sorties.reduce((s, m) => s + (m.quantite || 0), 0);
  if (totalOut <= 0) return null; // no consumption signal
  const perDay = totalOut / 30;
  return Math.floor(article.quantite / perDay);
}

// ── Tool handlers ─────────────────────────────────────────────────────────────

async function getFarmOverview() {
  const { prixVente, nomFerme } = await getPrix();
  const actifs = await Animal.find({ statut: 'Actif' }).populate('race', 'nom poidsAbattage gmqCible');
  const parPhase = {};
  let sommePoids = 0;
  let sommeGmq = 0;
  let prets = 0;
  for (const a of actifs) {
    parPhase[a.phase] = (parPhase[a.phase] || 0) + 1;
    sommePoids += a.poidsActuel || 0;
    sommeGmq += a.gmqActuel || 0;
    const cible = a.race?.poidsAbattage || 0;
    const retraitOk = !a.delaiRetraitFin || a.delaiRetraitFin <= new Date();
    if (cible > 0 && a.poidsActuel >= cible && retraitOk) prets += 1;
  }
  const articles = await StockArticle.find();
  const sousSeuil = articles.filter((x) => x.statut !== 'OK');
  const valeurStock = Math.round(articles.reduce((s, x) => s + x.quantite * x.prixUnitaire, 0));
  const alertes = await Alerte.countDocuments({ traitee: false });

  return {
    ferme: nomFerme,
    animauxActifs: actifs.length,
    repartitionPhases: parPhase,
    poidsMoyen: actifs.length ? Math.round(sommePoids / actifs.length) : 0,
    gmqMoyen: actifs.length ? Number((sommeGmq / actifs.length).toFixed(2)) : 0,
    pretsAVendre: prets,
    alertesNonTraitees: alertes,
    valeurStockMAD: valeurStock,
    articlesSousSeuil: sousSeuil.length,
    prixVenteKgMoyen: prixVente,
  };
}

async function getAnimalDetails({ identifiant }) {
  const { prixVente } = await getPrix();
  const animal = await Animal.findOne({ identifiant: new RegExp(`^${String(identifiant).trim()}$`, 'i') })
    .populate('race', 'nom poidsAbattage gmqCible')
    .populate('parcelle', 'nom');
  if (!animal) return { trouve: false, message: `Aucun animal avec l'identifiant ${identifiant}.` };

  const [pesees, traitements] = await Promise.all([
    Pesee_safe(animal._id),
    Traitement.find({ animal: animal._id }).sort('-dateDebut').limit(5),
  ]);
  const jours = joursVersCible(animal);

  return {
    trouve: true,
    identifiant: animal.identifiant,
    nni: animal.nni || null,
    race: animal.race?.nom || null,
    sexe: animal.sexe,
    phase: animal.phase,
    statut: animal.statut,
    etatSante: animal.etatSante,
    parcelle: animal.parcelle?.nom || null,
    poidsActuel: animal.poidsActuel,
    poidsEntree: animal.poidsEntree,
    gmqActuel: animal.gmqActuel,
    gmqCible: animal.race?.gmqCible || null,
    poidsCibleAbattage: animal.race?.poidsAbattage || null,
    coutCumuleMAD: Math.round(animal.coutCumule),
    delaiRetraitActifJusquau: animal.delaiRetraitFin && animal.delaiRetraitFin > new Date() ? animal.delaiRetraitFin : null,
    prediction: {
      joursVersPoidsCible: jours,
      revenuProjeteMAD: animal.race?.poidsAbattage ? Math.round(animal.race.poidsAbattage * prixVente) : null,
    },
    dernieresPesees: pesees.map((p) => ({ date: p.date, poids: p.poids, gmq: p.gmq })),
    traitements: traitements.map((t) => ({ produit: t.produit, type: t.type, dateDebut: t.dateDebut, statut: t.statut })),
  };
}

// Pesee is required lazily to avoid a circular concern; keep it simple.
async function Pesee_safe(animalId) {
  const Pesee = require('../models/Pesee');
  return Pesee.find({ animal: animalId }).sort('-date').limit(5);
}

async function listAnimals({ phase, etatSante, pretsAVendre, limit } = {}) {
  const filter = { statut: 'Actif' };
  if (phase) filter.phase = phase;
  if (etatSante) filter.etatSante = etatSante;
  const animaux = await Animal.find(filter).populate('race', 'nom poidsAbattage').populate('parcelle', 'nom').limit(200);

  let rows = animaux;
  if (pretsAVendre) {
    const now = new Date();
    rows = animaux.filter((a) => {
      const cible = a.race?.poidsAbattage || 0;
      const retraitOk = !a.delaiRetraitFin || a.delaiRetraitFin <= now;
      return cible > 0 && a.poidsActuel >= cible && retraitOk;
    });
  }
  const max = Math.min(Number(limit) || 50, 100);
  return {
    total: rows.length,
    animaux: rows.slice(0, max).map((a) => ({
      identifiant: a.identifiant,
      race: a.race?.nom || null,
      phase: a.phase,
      poidsActuel: a.poidsActuel,
      gmqActuel: a.gmqActuel,
      etatSante: a.etatSante,
      parcelle: a.parcelle?.nom || null,
    })),
  };
}

async function getFinancesSummary() {
  const { prixVente, prixAchat } = await getPrix();
  const actifs = await Animal.find({ statut: 'Actif' }).populate('race', 'nom');
  const rows = actifs.map((a) => {
    const revenu = Math.round((a.poidsActuel || 0) * prixVente);
    const benefice = revenu - Math.round(a.coutCumule);
    const marge = a.coutCumule > 0 ? Math.round((benefice / a.coutCumule) * 100) : 0;
    return { identifiant: a.identifiant, race: a.race?.nom || '', coutTotal: Math.round(a.coutCumule), revenu, benefice, marge };
  });
  const coutTotal = rows.reduce((s, r) => s + r.coutTotal, 0);
  const revenuTotal = rows.reduce((s, r) => s + r.revenu, 0);
  const beneficeTotal = revenuTotal - coutTotal;
  const sorted = [...rows].sort((a, b) => b.marge - a.marge);
  return {
    coutTotalMAD: coutTotal,
    revenuProjeteMAD: revenuTotal,
    beneficeProjeteMAD: beneficeTotal,
    margeGlobalePct: coutTotal > 0 ? Math.round((beneficeTotal / coutTotal) * 100) : 0,
    nbRentables: rows.filter((r) => r.marge > 0).length,
    total: rows.length,
    prixVenteKgMoyen: prixVente,
    prixAchatKgMoyen: prixAchat,
    top3: sorted.slice(0, 3),
    bottom3: sorted.slice(-3).reverse(),
  };
}

async function getStockStatus() {
  const articles = await StockArticle.find().sort('designation');
  const out = [];
  for (const a of articles) {
    const runway = a.statut !== 'OK' ? await stockRunwayDays(a) : null;
    out.push({
      designation: a.designation,
      categorie: a.categorie,
      quantite: a.quantite,
      unite: a.unite,
      seuil: a.seuil,
      statut: a.statut,
      valeurMAD: Math.round(a.quantite * a.prixUnitaire),
      joursDeStockRestants: runway,
    });
  }
  return {
    total: out.length,
    valeurTotaleMAD: out.reduce((s, x) => s + x.valeurMAD, 0),
    sousSeuil: out.filter((x) => x.statut !== 'OK'),
    articles: out,
  };
}

async function getHealthOverview() {
  const now = new Date();
  const actifs = await Animal.find({ statut: 'Actif' }).populate('race', 'nom');
  const malades = actifs.filter((a) => a.etatSante === 'Malade').map((a) => a.identifiant);
  const enTraitement = actifs.filter((a) => a.etatSante === 'En traitement').map((a) => a.identifiant);
  const delaisRetrait = actifs
    .filter((a) => a.delaiRetraitFin && a.delaiRetraitFin > now)
    .map((a) => ({ identifiant: a.identifiant, jusquau: a.delaiRetraitFin }));

  const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const plans = await PlanTraitement.find({ datePrevue: { $lte: finMois }, statut: { $ne: 'Fait' } })
    .populate('animal', 'identifiant')
    .sort('datePrevue');

  return {
    malades,
    enTraitement,
    delaisRetraitActifs: delaisRetrait,
    interventionsAVenir: plans.map((p) => ({
      animal: p.animal?.identifiant || '—',
      type: p.type,
      produit: p.produit,
      datePrevue: p.datePrevue,
      statut: p.statut,
    })),
  };
}

async function getPredictions() {
  const { prixVente } = await getPrix();
  const now = new Date();
  const actifs = await Animal.find({ statut: 'Actif' }).populate('race', 'nom poidsAbattage gmqCible');

  const ventes = [];
  const retards = [];
  for (const a of actifs) {
    const jours = joursVersCible(a);
    const cible = a.race?.poidsAbattage || 0;
    const retraitOk = !a.delaiRetraitFin || a.delaiRetraitFin <= now;
    if (cible > 0 && jours != null && retraitOk) {
      ventes.push({
        identifiant: a.identifiant,
        joursVersCible: jours,
        dateEstimee: new Date(now.getTime() + jours * DAY),
        revenuProjeteMAD: Math.round(cible * prixVente),
      });
    }
    const gmqCible = a.race?.gmqCible || 0;
    if (gmqCible > 0 && a.gmqActuel > 0 && a.gmqActuel < gmqCible * 0.8) {
      retards.push({ identifiant: a.identifiant, gmqActuel: a.gmqActuel, gmqCible });
    }
  }
  ventes.sort((x, y) => x.joursVersCible - y.joursVersCible);

  const articles = await StockArticle.find();
  const ruptures = [];
  for (const art of articles) {
    const runway = await stockRunwayDays(art);
    if (runway != null && runway <= 30) {
      ruptures.push({ designation: art.designation, quantite: art.quantite, unite: art.unite, joursRestants: runway });
    }
  }
  ruptures.sort((x, y) => x.joursRestants - y.joursRestants);

  return {
    ventesAVenir: ventes.slice(0, 20),
    retardsCroissance: retards,
    rupturesStockEstimees: ruptures,
  };
}

// ── Declarations exposed to the model ─────────────────────────────────────────

const toolDeclarations = [
  {
    name: 'get_farm_overview',
    description: "Vue d'ensemble chiffrée de la ferme : nombre d'animaux actifs, répartition par phase, poids/GMQ moyens, animaux prêts à vendre, alertes non traitées, valeur et articles de stock sous seuil.",
    parametersJsonSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_animal_details',
    description: "Détails complets d'un animal précis par son identifiant (ex: ANI-019) : race, phase, poids, GMQ, état de santé, coût, délai de retrait, prédiction du nombre de jours avant le poids d'abattage et revenu projeté.",
    parametersJsonSchema: {
      type: 'object',
      properties: { identifiant: { type: 'string', description: "Identifiant de l'animal, ex: ANI-019" } },
      required: ['identifiant'],
    },
  },
  {
    name: 'list_animals',
    description: 'Liste les animaux actifs, avec filtres optionnels par phase, état de santé, ou uniquement ceux prêts à vendre.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        phase: { type: 'string', description: 'Veau | Croissance | Engraissement | Finition' },
        etatSante: { type: 'string', description: 'Sain | En traitement | Malade' },
        pretsAVendre: { type: 'boolean', description: 'true pour ne retourner que les animaux ayant atteint le poids cible' },
        limit: { type: 'number', description: 'Nombre maximum de lignes (défaut 50)' },
      },
    },
  },
  {
    name: 'get_finances_summary',
    description: 'Bilan financier du troupeau : coût total, revenu projeté, bénéfice, marge globale, et les 3 meilleurs / 3 moins rentables.',
    parametersJsonSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_stock_status',
    description: "État des stocks : pour chaque article quantité, seuil, statut (OK/Faible/Critique), valeur, et estimation des jours de stock restants pour les articles sous seuil.",
    parametersJsonSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_health_overview',
    description: 'Synthèse santé : animaux malades ou en traitement, délais de retrait actifs, et interventions vétérinaires planifiées ce mois.',
    parametersJsonSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_predictions',
    description: 'Prédictions : animaux bientôt prêts à vendre (jours estimés + revenu projeté), animaux en retard de croissance, et articles de stock proches de la rupture (≤30 jours).',
    parametersJsonSchema: { type: 'object', properties: {} },
  },
];

const handlers = {
  get_farm_overview: getFarmOverview,
  get_animal_details: getAnimalDetails,
  list_animals: listAnimals,
  get_finances_summary: getFinancesSummary,
  get_stock_status: getStockStatus,
  get_health_overview: getHealthOverview,
  get_predictions: getPredictions,
};

async function executeTool(name, args) {
  const fn = handlers[name];
  if (!fn) return { error: `Outil inconnu: ${name}` };
  try {
    return await fn(args || {});
  } catch (err) {
    return { error: `Erreur lors de l'exécution de ${name}: ${err.message}` };
  }
}

module.exports = { toolDeclarations, executeTool, getFarmOverview };
