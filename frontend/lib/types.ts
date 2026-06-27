// Shared domain types mirroring the backend models (JSON shapes).

export interface User {
  id: string;
  prenom: string;
  nom: string;
  fullName?: string;
  email: string;
  role: "Admin" | "Responsable" | "Vétérinaire";
  statut: "Actif" | "Inactif";
  derniereConnexion?: string;
}

export interface Race {
  id: string;
  nom: string;
  origine: string;
  poidsAdulte: number;
  gmqCible: number;
  icCible: number;
  poidsAbattage: number;
  dureeEngraissement: number;
  description: string;
  nbAnimaux?: number;
}

export interface Ref {
  id: string;
  nom?: string;
}

export interface Animal {
  id: string;
  identifiant: string;
  nni: string;
  race: Ref & { poidsAbattage?: number; gmqCible?: number };
  sexe: "Mâle" | "Femelle";
  pere: string;
  mere: string;
  origine: string;
  phase: "Veau" | "Croissance" | "Engraissement" | "Finition";
  poidsEntree: number;
  poidsActuel: number;
  dateEntree: string;
  parcelle: Ref | null;
  etatSante: "Sain" | "En traitement" | "Malade";
  gmqActuel: number;
  coutCumule: number;
  statut: "Actif" | "Sorti";
  sortie?: { motif?: string; date?: string; poids?: number; prix?: number; notes?: string };
  notes: string;
  pesees?: Pesee[];
  traitements?: Traitement[];
  coutJour?: number;
}

export interface Pesee {
  id: string;
  animal: string;
  date: string;
  poids: number;
  gmq: number | null;
  observateur: string;
  notes: string;
}

export interface Parcelle {
  id: string;
  nom: string;
  reference: string;
  capaciteMax: number;
  superficie: number;
  type: string;
  ration: Ref | null;
  notes: string;
  nbActuels?: number;
  occupation?: number;
  animaux?: Animal[];
}

export interface StockArticle {
  id: string;
  designation: string;
  reference: string;
  categorie: string;
  unite: string;
  quantite: number;
  seuil: number;
  prixUnitaire: number;
  datePeremption: string | null;
  fournisseur: (Ref & { nom?: string; region?: string; type?: string }) | null;
  notes: string;
  statut: "OK" | "Faible" | "Critique";
}

export interface StockMouvement {
  id: string;
  article: Ref & { designation?: string; unite?: string };
  type: "entree" | "sortie" | "ajustement";
  quantite: number;
  quantiteApres: number;
  prixUnitaire: number;
  date: string;
  motif: string;
  notes: string;
  utilisateur: { prenom?: string; nom?: string } | null;
  commandeSource: (Ref & { fournisseur?: Ref; montantTotal?: number; date?: string }) | null;
}

export interface Ingredient {
  nom: string;
  article: string | null;
  quantite: number;
  unite: string;
  prixUnitaire: number;
}

export interface Ration {
  id: string;
  nom: string;
  phase: string;
  cible: string;
  ingredients: Ingredient[];
  coutJour: number;
  nbIngredients: number;
}

export interface Distribution {
  id: string;
  ration: Ref;
  cible: string;
  date: string;
  quantite: number;
  nbAnimaux: number;
  coutEstime: number;
}

export interface Traitement {
  id: string;
  animal: (Ref & { identifiant?: string; race?: Ref }) | string;
  type: string;
  produit: string;
  dose: number;
  doseUnite: string;
  voie: string;
  dateDebut: string;
  dateFin: string | null;
  veterinaire: string;
  delaiRetrait: number;
  statut: "En cours" | "Terminé" | "Planifié";
  observations: string;
}

export interface EtatSanteRow {
  id: string;
  identifiant: string;
  race: string;
  etat: string;
  temperature: string;
  derniereObs: string | null;
  delaiRetrait: string;
}

export interface PlanTraitement {
  id: string;
  animal: Ref & { identifiant?: string };
  type: string;
  produit: string;
  datePrevue: string;
  frequence: string;
  statut: "À faire" | "Rappel J-3" | "En retard" | "Fait";
}

export interface Alerte {
  id: string;
  niveau: "Critique" | "Avertissement" | "Info";
  categorie: string;
  message: string;
  concerne: string;
  date: string;
  traitee: boolean;
}

export interface DashboardSummary {
  kpis: { gmqMoyen: number; troupeauTotal: number; coutKgMoyen: number; alertesActives: number; pretsAVendre: number };
  repartition: Record<string, number>;
  coutTotal: number;
  stock: { id: string; nom: string; quantite: number; unite: string; seuil: number; statut: string }[];
  traitements: Traitement[];
  alertes: Alerte[];
}

export interface Parametres {
  id: string;
  nomFerme: string;
  siret: string;
  adresse: string;
  responsable: string;
  devise: string;
  unitePoids: string;
  frequencePesee: number;
  seuilIC: number;
  poidsMinVente: number;
  notifs: { email: boolean; rapport: boolean; pesee: boolean; stock: boolean };
  alertesConfig?: AlerteConfig[];
}

export interface FinancesAnimal {
  id: string;
  identifiant: string;
  race: string;
  phase: string;
  poidsEntree: number;
  poidsActuel: number;
  gmqActuel: number;
  coutAchat: number;
  coutAlimentation: number;
  coutSante: number;
  coutTotal: number;
  revenu: number;
  benefice: number;
  marge: number;
  jours: number;
  coutJour?: number;
  prixVente?: number;
  prixAchat?: number;
}

export interface FinancesTroupeau {
  kpis: {
    coutTotal: number;
    revenuTotal: number;
    beneficeTotal: number;
    margeGlobale: number;
    nbRentables: number;
    total: number;
  };
  top5: FinancesAnimal[];
  bottom5: FinancesAnimal[];
  animaux: FinancesAnimal[];
  prixVente: number;
  prixAchat: number;
}

export interface ArticleHabituel {
  article: Ref & { designation?: string; unite?: string; prixUnitaire?: number };
  prixHabituel: number;
}

export interface Fournisseur {
  id: string;
  nom: string;
  contact: string;
  region: string;
  type: "Aliments" | "Médicaments" | "Équipements" | "Autre";
  articlesHabituels: ArticleHabituel[];
  notes: string;
  nbCommandes?: number;
  commandes?: CommandeAchat[];
}

export interface LigneCommande {
  article: Ref & { designation?: string; unite?: string };
  quantite: number;
  prixUnitaire: number;
}

export interface CommandeAchat {
  id: string;
  fournisseur: Ref & { nom?: string; region?: string; type?: string };
  date: string;
  lignes: LigneCommande[];
  montantTotal: number;
  notes: string;
}

export interface AlerteConfig {
  id: string;
  nom: string;
  description: string;
  seuil: string;
  unite: string;
  active: boolean;
  niveau: "Critique" | "Avertissement" | "Info";
}
