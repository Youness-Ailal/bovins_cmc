// Shared domain types mirroring the backend models (JSON shapes).

export interface User {
  id: string;
  prenom: string;
  nom: string;
  fullName?: string;
  email: string;
  role: "Admin" | "Responsable" | "Vétérinaire" | "Opérateur";
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
  lot: Ref | null;
  etatSante: "Sain" | "En observation" | "En traitement" | "Malade";
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

export interface Lot {
  id: string;
  nom: string;
  phase: string;
  dateCreation: string;
  description: string;
  nbAnimaux?: number;
  gmqMoyen?: number;
  coutTotal?: number;
  animaux?: Animal[];
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
  fournisseur: string;
  notes: string;
  statut: "OK" | "Faible" | "Critique";
}

export interface StockMouvement {
  id: string;
  article: Ref & { designation?: string; unite?: string };
  type: "entree" | "sortie" | "ajustement";
  quantite: number;
  quantiteApres: number;
  date: string;
  motif: string;
  utilisateur: { prenom?: string; nom?: string } | null;
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

export interface AlerteConfig {
  id: string;
  nom: string;
  description: string;
  seuil: string;
  unite: string;
  active: boolean;
  niveau: "Critique" | "Avertissement" | "Info";
}
