# Tâches de Mohamed

Tu as **2 pages** à compléter :
- `frontend/app/(dashboard)/animaux/page.tsx` — Liste des animaux
- `frontend/app/(dashboard)/animaux/[id]/page.tsx` — Fiche animal

---

## Étape 1 — Récupérer le projet

```bash
git clone https://github.com/Youness-Ailal/bovins_cmc.git
cd bovins_cmc
```

---

## Étape 2 — Créer ta branche

```bash
git checkout -b mohamed
```

---

## Étape 3 — Installer les dépendances

```bash
cd frontend
npm install
npm run dev
```

Ouvre http://localhost:3000 dans ton navigateur.

---

## Étape 4 — Compléter tes pages

### Page 1 — `frontend/app/(dashboard)/animaux/page.tsx`

Ouvre ce fichier et **remplace tout le contenu** par le code ci-dessous :

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import DataTable, { Column } from "@/components/ui/DataTable";

type Phase = "Croissance" | "Engraissement" | "Finition";
type Sante = "Sain" | "Malade";

interface Animal {
  id: string;
  race: string;
  sexe: string;
  phase: Phase;
  parcelle: string;
  lot: string;
  sante: Sante;
  gmq: string;
  cout: string;
}

const ANIMALS: Animal[] = [
  { id: "ANI-001", race: "Holstein",  sexe: "Mâle",    phase: "Croissance",    parcelle: "P-01", lot: "LOT-A", sante: "Sain",   gmq: "0.82", cout: "12 450" },
  { id: "ANI-002", race: "Angus",     sexe: "Femelle",  phase: "Engraissement", parcelle: "P-02", lot: "LOT-A", sante: "Sain",   gmq: "0.74", cout: "8 920"  },
  { id: "ANI-003", race: "Limousin",  sexe: "Mâle",    phase: "Finition",      parcelle: "P-01", lot: "LOT-B", sante: "Malade", gmq: "0.65", cout: "15 780" },
];

const PHASE_VARIANT: Record<Phase, string> = {
  Croissance:    "phase-croissance",
  Engraissement: "phase-engraissement",
  Finition:      "phase-finition",
};

const SANTE_VARIANT: Record<Sante, string> = {
  Sain:   "sain",
  Malade: "malade",
};

const COLUMNS: Column<Animal>[] = [
  {
    key: "id",
    label: "Identifiant",
    width: "w-[110px]",
    render: (row) => (
      <span className="font-inter text-[13px] font-semibold text-label">{row.id}</span>
    ),
  },
  { key: "race",     label: "Race",     width: "w-[90px]"  },
  { key: "sexe",     label: "Sexe",     width: "w-[60px]"  },
  {
    key: "phase",
    label: "Phase",
    width: "w-[110px]",
    render: (row) => (
      <Badge variant={PHASE_VARIANT[row.phase] as Parameters<typeof Badge>[0]["variant"]}>{row.phase}</Badge>
    ),
  },
  { key: "parcelle", label: "Parcelle", width: "w-[75px]"  },
  { key: "lot",      label: "Lot",      width: "w-[60px]"  },
  {
    key: "sante",
    label: "Santé",
    width: "w-[90px]",
    render: (row) => (
      <Badge variant={SANTE_VARIANT[row.sante] as Parameters<typeof Badge>[0]["variant"]}>{row.sante}</Badge>
    ),
  },
  { key: "gmq",  label: "GMQ (kg/j)", width: "w-[80px]"  },
  { key: "cout", label: "Coût (MAD)", width: "w-[100px]" },
  {
    key: "_actions",
    label: "Actions",
    width: "w-[60px]",
    align: "right",
    render: (row) => (
      <div className="flex items-center gap-3">
        <Link href={`/animaux/${row.id}`} className="text-placeholder hover:text-primary transition-colors">
          <Icon name="eye" size={15} />
        </Link>
        <Link href={`/animaux/${row.id}/modifier`} className="text-placeholder hover:text-primary transition-colors">
          <Icon name="pencil" size={15} />
        </Link>
      </div>
    ),
  },
];

const DROPDOWNS = ["Race", "Phase", "Parcelle", "Lot", "État santé"];

export default function ListeAnimauxPage() {
  const [search, setSearch] = useState("");

  const filtered = ANIMALS.filter(
    (a) =>
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.race.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Liste des animaux</span>
          <span className="font-inter text-sm text-placeholder">/ Animaux</span>
        </div>
        <Link
          href="/animaux/nouveau"
          className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors"
        >
          <Icon name="plus" size={14} />
          Nouvel animal
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <div className="flex flex-wrap items-center gap-2 rounded-[8px] border border-border-light bg-card p-3">
          {DROPDOWNS.map((d) => (
            <button
              key={d}
              className="flex items-center gap-1 rounded-[6px] border border-border-light px-2.5 py-1.5 font-inter text-[13px] text-subtle hover:bg-surface transition-colors"
            >
              {d}
              <Icon name="chevron-down" size={12} className="text-placeholder" />
            </button>
          ))}
          <div className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3 py-1.5">
            <Icon name="search" size={14} className="text-placeholder" />
            <input
              type="text"
              placeholder="Rechercher un animal…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 bg-transparent font-inter text-[13px] text-label placeholder:text-placeholder focus:outline-none"
            />
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-[#E8F5E9] px-3 py-1.5 font-inter text-xs font-medium text-primary">
            <Icon name="check" size={12} />
            Prêts à vendre
          </span>
        </div>

        <DataTable
          columns={COLUMNS}
          data={filtered}
          keyExtractor={(a) => a.id}
          pagination={{ page: 1, total: 12, count: 48 }}
        />
      </div>
    </div>
  );
}
```

---

### Page 2 — `frontend/app/(dashboard)/animaux/[id]/page.tsx`

Ouvre ce fichier et **remplace tout le contenu** par le code ci-dessous :

```tsx
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

export default async function FicheAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tabs = ["Infos", "Pesées", "Phases", "Rentabilité"];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Fiche animal</span>
          <span className="font-inter text-sm text-placeholder">/ {id}</span>
        </div>
        <Link
          href={`/animaux/${id}/modifier`}
          className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
        >
          <Icon name="pencil" size={14} />
          Modifier
        </Link>
      </header>

      <div className="flex h-12 shrink-0 items-center border-b border-border-light bg-card px-6">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            className={`flex h-12 items-center px-4 font-inter text-sm transition-colors ${
              i === 0
                ? "border-b-2 border-primary font-semibold text-primary"
                : "font-normal text-placeholder hover:text-subtle"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <div className="flex items-center justify-between rounded-[10px] border border-border-light bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary font-dm-sans text-[22px] font-bold text-white">
              A
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-dm-sans text-lg font-bold text-label">{id} — Holstein</span>
              <span className="font-inter text-[13px] text-subtle">Mâle · Bovin laitier</span>
              <div className="flex items-center gap-2">
                <Badge variant="origin">Né à la ferme</Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="flex items-center gap-1.5 rounded-full bg-[#DFE6E1] px-3.5 py-1.5 font-inter text-xs font-semibold text-[#004D1A]">
              <Icon name="check" size={12} />
              Sain
            </span>
            <span className="font-inter text-[11px] text-placeholder">État de santé</span>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-3 rounded-[10px] border border-border-light bg-card p-5">
            <span className="font-dm-sans text-sm font-semibold text-label">Identité</span>
            <Row label="NNI" value="MA-2023-00174" />
            <Row label="Race" value="Holstein" />
            <Row label="Sexe" value="Mâle" />
            <Row label="Père" value="BL-450-P" />
            <Row label="Mère" value="BL-312-M" />
          </div>

          <div className="flex flex-1 flex-col gap-3 rounded-[10px] border border-border-light bg-card p-5">
            <span className="font-dm-sans text-sm font-semibold text-label">Performance</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-inter text-[11px] text-placeholder">GMQ actuel</span>
              <span className="font-dm-sans text-base font-bold text-primary">0.82 kg/j</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-inter text-[11px] text-placeholder">Indice de consommation (IC)</span>
              <span className="font-dm-sans text-base font-bold text-label">6.4</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-inter text-[11px] text-placeholder">Projection abattage</span>
              <span className="font-inter text-[13px] font-medium text-label">Janvier 2025</span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 rounded-[10px] border border-border-light bg-card p-5">
            <span className="font-dm-sans text-sm font-semibold text-label">Localisation</span>
            <Row label="Parcelle" value="P-01 — Champ Nord" />
            <Row label="Lot" value="LOT-A" />
            <div className="flex flex-col gap-1.5">
              <span className="font-inter text-[11px] text-placeholder">Phase actuelle</span>
              <Badge variant="phase-finition">Croissance</Badge>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href={`/animaux/${id}/sortie`}
            className="flex items-center gap-1.5 rounded-[6px] border border-danger bg-white px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-danger hover:bg-red-50 transition-colors"
          >
            Enregistrer une sortie
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-inter text-[11px] text-placeholder">{label}</span>
      <span className="font-inter text-[13px] font-medium text-label">{value}</span>
    </div>
  );
}
```

---

## Étape 5 — Sauvegarder et envoyer

```bash
git add frontend/app/\(dashboard\)/animaux/page.tsx
git add frontend/app/\(dashboard\)/animaux/\[id\]/page.tsx
git commit -m "feat: complete animaux pages - Mohamed"
git push origin mohamed
```

---

## Étape 6 — Créer une Pull Request

1. Va sur https://github.com/Youness-Ailal/bovins_cmc
2. Clique sur **"Compare & pull request"**
3. Titre : `feat: animaux pages - Mohamed`
4. Clique **"Create pull request"**
