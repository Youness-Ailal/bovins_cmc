# Tâches de Salma

Tu as **2 pages** à compléter :
- `frontend/app/(dashboard)/lots/page.tsx` — Liste des lots
- `frontend/app/(dashboard)/lots/[id]/page.tsx` — Fiche lot

---

## Étape 1 — Récupérer le projet

```bash
git clone https://github.com/Youness-Ailal/bovins_cmc.git
cd bovins_cmc
```

---

## Étape 2 — Créer ta branche

```bash
git checkout -b salma
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

### Page 1 — `frontend/app/(dashboard)/lots/page.tsx`

Ouvre ce fichier et **remplace tout le contenu** par le code ci-dessous :

```tsx
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

const LOTS = [
  {
    id: "LOT-A",
    nbAnimaux: 15,
    phase: "Engraissement" as const,
    gmq: "0.78 kg/j",
    ic: "5.2",
    cout: "48 250",
    date: "12/01/2024",
  },
  {
    id: "LOT-B",
    nbAnimaux: 8,
    phase: "Croissance" as const,
    gmq: "0.82 kg/j",
    ic: "6.4",
    cout: "28 900",
    date: "05/03/2024",
  },
];

const PHASE_VARIANT = {
  Croissance: "phase-croissance",
  Engraissement: "phase-engraissement",
  Finition: "phase-finition",
} as const;

export default function ListeLotsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Liste des lots</span>
          <span className="font-inter text-sm text-placeholder">/ Lots</span>
        </div>
        <button className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
          <Icon name="plus" size={14} />
          Nouveau lot
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <div className="overflow-hidden rounded-[10px] border border-border-light bg-card">
          <div className="flex items-center gap-4 bg-surface px-4" style={{ height: 44 }}>
            <span className="w-[140px] shrink-0 font-dm-sans text-xs font-semibold text-placeholder">Nom du lot</span>
            <span className="w-[100px] shrink-0 font-dm-sans text-xs font-semibold text-placeholder">Nb animaux</span>
            <span className="w-[140px] shrink-0 font-dm-sans text-xs font-semibold text-placeholder">Phase majoritaire</span>
            <span className="w-[110px] shrink-0 font-dm-sans text-xs font-semibold text-placeholder">GMQ moyen</span>
            <span className="w-[100px] shrink-0 font-dm-sans text-xs font-semibold text-placeholder">IC moyen</span>
            <span className="w-[130px] shrink-0 font-dm-sans text-xs font-semibold text-placeholder">Coût total (MAD)</span>
            <span className="w-[120px] shrink-0 font-dm-sans text-xs font-semibold text-placeholder">Date création</span>
            <span className="flex-1 font-dm-sans text-xs font-semibold text-placeholder">Actions</span>
          </div>

          {LOTS.map((lot) => (
            <div
              key={lot.id}
              className="flex items-center gap-4 border-b border-border-light px-4 last:border-b-0"
              style={{ height: 52 }}
            >
              <span className="w-[140px] shrink-0 font-inter text-[13px] font-semibold text-label">{lot.id}</span>
              <span className="w-[100px] shrink-0 font-inter text-[13px] text-subtle">{lot.nbAnimaux}</span>
              <div className="flex w-[140px] shrink-0 items-center">
                <Badge variant={PHASE_VARIANT[lot.phase]}>{lot.phase}</Badge>
              </div>
              <span className="w-[110px] shrink-0 font-inter text-[13px] text-subtle">{lot.gmq}</span>
              <span className="w-[100px] shrink-0 font-inter text-[13px] text-subtle">{lot.ic}</span>
              <span className="w-[130px] shrink-0 font-inter text-[13px] text-label">{lot.cout}</span>
              <span className="w-[120px] shrink-0 font-inter text-[13px] text-subtle">{lot.date}</span>
              <div className="flex flex-1 items-center gap-2">
                <Link href={`/lots/${lot.id}`} className="text-placeholder hover:text-subtle transition-colors">
                  <Icon name="eye" size={15} />
                </Link>
                <button className="text-placeholder hover:text-subtle transition-colors">
                  <Icon name="pencil" size={15} />
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between bg-surface px-4" style={{ height: 48 }}>
            <span className="font-inter text-[13px] text-placeholder">← Précédent</span>
            <span className="font-inter text-xs text-placeholder">Page 1 sur 5 lots actifs — Suivant →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Page 2 — `frontend/app/(dashboard)/lots/[id]/page.tsx`

Ouvre ce fichier et **remplace tout le contenu** par le code ci-dessous :

```tsx
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";

const LOT_ANIMALS = [
  { id: "ANI-001", race: "Holstein", phase: "Croissance" as const, sante: "Sain" as const, gmq: "0.82" },
  { id: "ANI-002", race: "Angus", phase: "Engraissement" as const, sante: "Malade" as const, gmq: "0.74" },
  { id: "ANI-003", race: "Limousin", phase: "Finition" as const, sante: "Malade" as const, gmq: "0.65" },
];

const PHASE_VARIANT = {
  Croissance: "phase-croissance",
  Engraissement: "phase-engraissement",
  Finition: "phase-finition",
} as const;

const SANTE_VARIANT = {
  Sain: "sain",
  Malade: "malade",
} as const;

export default async function FicheLotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-2">
          <span className="font-dm-sans text-[22px] font-bold text-label">{id}</span>
          <span className="font-inter text-sm text-placeholder">/ Lots</span>
        </div>
        <button className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors">
          <Icon name="pencil" size={14} />
          Modifier
        </button>
      </header>

      <div className="flex shrink-0 border-b border-border-light bg-card">
        <StatCell label="Animaux" value="15" color="text-label" />
        <StatCell label="GMQ moyen" value="0.78 kg/j" color="text-primary" />
        <StatCell label="IC moyen" value="5.2" color="text-label" />
        <StatCell label="Coût total" value="48 250 MAD" color="text-label" last />
      </div>

      <div className="flex flex-1 gap-4 overflow-auto p-6">
        <div className="flex flex-1 flex-col gap-3">
          <span className="font-dm-sans text-sm font-semibold text-label">Animaux du lot (15)</span>
          <div className="overflow-hidden rounded-[10px] border border-border-light bg-card">
            <div className="flex items-center gap-4 bg-surface px-3.5" style={{ height: 40 }}>
              <span className="w-[130px] shrink-0 font-dm-sans text-[11px] font-semibold text-placeholder">Identifiant</span>
              <span className="w-[110px] shrink-0 font-dm-sans text-[11px] font-semibold text-placeholder">Race</span>
              <span className="w-[120px] shrink-0 font-dm-sans text-[11px] font-semibold text-placeholder">Phase</span>
              <span className="w-[120px] shrink-0 font-dm-sans text-[11px] font-semibold text-placeholder">État santé</span>
              <span className="w-[90px] shrink-0 font-dm-sans text-[11px] font-semibold text-placeholder">GMQ</span>
              <span className="flex-1 font-dm-sans text-[11px] font-semibold text-placeholder">Actions</span>
            </div>

            {LOT_ANIMALS.map((a, i) => (
              <div
                key={a.id}
                className={`flex items-center gap-4 px-3.5 ${i < LOT_ANIMALS.length - 1 ? "border-b border-border-light" : ""}`}
                style={{ height: 46 }}
              >
                <span className="w-[130px] shrink-0 font-inter text-xs font-medium text-label">{a.id}</span>
                <span className="w-[110px] shrink-0 font-inter text-xs text-subtle">{a.race}</span>
                <div className="flex w-[120px] shrink-0 items-center">
                  <Badge variant={PHASE_VARIANT[a.phase]} className="text-[10px]">{a.phase}</Badge>
                </div>
                <div className="flex w-[120px] shrink-0 items-center">
                  <Badge variant={SANTE_VARIANT[a.sante]} className="text-[10px]">{a.sante}</Badge>
                </div>
                <span className="w-[90px] shrink-0 font-inter text-xs text-subtle">{a.gmq}</span>
                <div className="flex flex-1 items-center">
                  <Link href={`/animaux/${a.id}`} className="text-placeholder hover:text-subtle transition-colors">
                    <Icon name="eye" size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-[280px] shrink-0 flex-col gap-3">
          <span className="font-dm-sans text-sm font-semibold text-label">Alertes du groupe</span>

          <div className="flex flex-col gap-2 rounded-[8px] border border-[#C5A8A0] bg-[#E5DCDA] p-3">
            <div className="flex items-center gap-1.5">
              <Icon name="triangle-alert" size={14} className="shrink-0 text-[#8C1C00]" />
              <span className="font-dm-sans text-xs font-semibold text-[#8C1C00]">ANI-003 — Santé critique</span>
            </div>
            <p className="font-inter text-[11px] leading-relaxed text-[#8C1C00]">
              Cet animal est marqué malade. Consulter un vétérinaire.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-[8px] border border-[#C9B896] bg-[#E9E3D8] p-3">
            <div className="flex items-center gap-1.5">
              <Icon name="trending-down" size={14} className="shrink-0 text-[#804200]" />
              <span className="font-dm-sans text-xs font-semibold text-[#804200]">GMQ en baisse ce mois</span>
            </div>
            <p className="font-inter text-[11px] leading-relaxed text-[#804200]">
              Le GMQ moyen du lot a chuté de 12% par rapport au mois précédent.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-[8px] border border-[#B4B4CC] bg-[#DFDFE6] p-3">
            <div className="flex items-center gap-1.5">
              <Icon name="syringe" size={14} className="shrink-0 text-[#000066]" />
              <span className="font-dm-sans text-xs font-semibold text-[#000066]">Vaccination à prévoir</span>
            </div>
            <p className="font-inter text-[11px] leading-relaxed text-[#000066]">
              Rappel : vaccin bovin prévu dans 7 jours pour 5 animaux.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value, color, last }: { label: string; value: string; color: string; last?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-1 px-6 py-4 ${!last ? "border-r border-border-light" : ""}`}>
      <span className={`font-dm-sans text-2xl font-bold ${color}`}>{value}</span>
      <span className="font-inter text-xs text-placeholder">{label}</span>
    </div>
  );
}
```

---

## Étape 5 — Sauvegarder et envoyer

```bash
git add frontend/app/\(dashboard\)/lots/page.tsx
git add frontend/app/\(dashboard\)/lots/\[id\]/page.tsx
git commit -m "feat: complete lots pages - Salma"
git push origin salma
```

---

## Étape 6 — Créer une Pull Request

1. Va sur https://github.com/Youness-Ailal/bovins_cmc
2. Clique sur **"Compare & pull request"**
3. Titre : `feat: lots pages - Salma`
4. Clique **"Create pull request"**
