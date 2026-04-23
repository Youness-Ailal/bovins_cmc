# Tâches de Safouane

Tu as **2 pages** à compléter :
- `frontend/app/(dashboard)/animaux/nouveau/page.tsx` — Formulaire nouvel animal
- `frontend/app/(dashboard)/animaux/[id]/sortie/page.tsx` — Formulaire de sortie

---

## Étape 1 — Récupérer le projet

```bash
git clone https://github.com/Youness-Ailal/bovins_cmc.git
cd bovins_cmc
```

---

## Étape 2 — Créer ta branche

```bash
git checkout -b safouane
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

### Page 1 — `frontend/app/(dashboard)/animaux/nouveau/page.tsx`

Ouvre ce fichier et **remplace tout le contenu** par le code ci-dessous :

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DatePicker from "@/components/ui/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NouvelAnimalPage() {
  return <AnimalForm mode="create" />;
}

export function AnimalForm({ mode, animalId }: { mode: "create" | "edit"; animalId?: string }) {
  const [sexe, setSexe] = useState<"male" | "female">("male");
  const [dateEntree, setDateEntree] = useState<Date | undefined>();
  const breadcrumb = mode === "create" ? "Nouvel animal" : animalId ?? "Modifier";
  const cancelHref = mode === "create" ? "/animaux" : `/animaux/${animalId}`;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Formulaire animal</span>
          <span className="font-inter text-sm text-placeholder">/ {breadcrumb}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={cancelHref}
            className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
          >
            Annuler
          </Link>
          <button className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
            <Icon name="save" size={14} />
            Enregistrer
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-auto p-8">
        <div className="w-full">
          <div className="rounded-[12px] border border-border-light bg-card p-7">
            <h2 className="font-dm-sans text-base font-bold text-label">
              Informations de l&apos;animal
            </h2>
            <p className="mt-1 font-inter text-[13px] text-subtle">
              Remplissez les champs ci-dessous pour {mode === "create" ? "créer une nouvelle fiche animal" : "modifier cette fiche animal"}.
            </p>

            <div className="mt-6 flex gap-5">
              <div className="flex flex-1 flex-col gap-4">
                <FormField label="NNI / Identifiant *">
                  <input
                    type="text"
                    placeholder="Ex: MA-2024-00175"
                    className="h-10 w-full rounded-[6px] border border-border px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </FormField>

                <FormField label="Race *">
                  <Select>
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card font-inter text-[13px] text-label focus:border-primary focus:ring-primary">
                      <SelectValue placeholder="Sélectionner une race" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="holstein">Holstein</SelectItem>
                      <SelectItem value="angus">Angus</SelectItem>
                      <SelectItem value="limousin">Limousin</SelectItem>
                      <SelectItem value="charolais">Charolais</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Sexe *">
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSexe("male")}
                      className={`flex items-center gap-2 rounded-[6px] px-3.5 py-2 font-inter text-[13px] transition-colors ${
                        sexe === "male"
                          ? "border-2 border-primary bg-[#E8F5E9] font-medium text-primary"
                          : "border border-border bg-card text-subtle"
                      }`}
                    >
                      Mâle
                    </button>
                    <button
                      type="button"
                      onClick={() => setSexe("female")}
                      className={`flex items-center gap-2 rounded-[6px] px-3.5 py-2 font-inter text-[13px] transition-colors ${
                        sexe === "female"
                          ? "border-2 border-primary bg-[#E8F5E9] font-medium text-primary"
                          : "border border-border bg-card text-subtle"
                      }`}
                    >
                      Femelle
                    </button>
                  </div>
                </FormField>

                <FormField label="Origine">
                  <Select defaultValue="ferme">
                    <SelectTrigger className="h-10 w-full rounded-[6px] border border-border bg-card font-inter text-[13px] text-label focus:border-primary focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ferme">Né à la ferme</SelectItem>
                      <SelectItem value="achat">Acheté</SelectItem>
                      <SelectItem value="transfert">Transféré</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className="flex flex-1 flex-col gap-4">
                <FormField label="Père (optionnel)">
                  <input
                    type="text"
                    placeholder="Identifiant du père…"
                    className="h-10 w-full rounded-[6px] border border-border px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </FormField>

                <FormField label="Mère (optionnel)">
                  <input
                    type="text"
                    placeholder="Identifiant de la mère…"
                    className="h-10 w-full rounded-[6px] border border-border px-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </FormField>

                <FormField label="Poids d'entrée (kg) *">
                  <div className="flex h-10 items-center justify-between rounded-[6px] border border-primary bg-surface px-3">
                    <input
                      type="number"
                      defaultValue="0.00"
                      className="w-full bg-transparent font-inter text-[13px] text-label focus:outline-none"
                    />
                    <span className="font-inter text-xs text-placeholder">kg</span>
                  </div>
                </FormField>

                <FormField label="Date d'entrée *">
                  <DatePicker value={dateEntree} onChange={setDateEntree} />
                </FormField>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-label">Notes</label>
              <textarea
                rows={3}
                className="w-full rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="Notes ou observations…"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <Link
                href={cancelHref}
                className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
              >
                Annuler
              </Link>
              <button className="flex items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
                <Icon name="save" size={14} />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-inter text-xs font-medium text-label">{label}</label>
      {children}
    </div>
  );
}
```

---

### Page 2 — `frontend/app/(dashboard)/animaux/[id]/sortie/page.tsx`

Ouvre ce fichier et **remplace tout le contenu** par le code ci-dessous :

```tsx
"use client";

import { use, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DatePicker from "@/components/ui/DatePicker";

type Motif = "vente" | "abattage" | "mort";

const MOTIFS: { id: Motif; icon: string; label: string }[] = [
  { id: "vente", icon: "tag", label: "Vente" },
  { id: "abattage", icon: "scissors", label: "Abattage" },
  { id: "mort", icon: "skull", label: "Mort" },
];

export default function SortieAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [motif, setMotif] = useState<Motif>("vente");
  const [dateSortie, setDateSortie] = useState<Date | undefined>();

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <span className="font-dm-sans text-xl font-semibold text-label">Formulaire de sortie</span>
          <span className="font-inter text-sm text-placeholder">/ {id}</span>
        </div>
        <Link
          href={`/animaux/${id}`}
          className="flex items-center gap-1.5 rounded-[6px] border border-border-light bg-surface px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
        >
          Annuler
        </Link>
      </header>

      <div className="flex flex-1 overflow-auto p-8">
        <div className="w-full">
          <div className="mb-4 flex items-start gap-3 rounded-[8px] border border-[#804200] bg-[#E9E3D8] px-4 py-3.5">
            <Icon name="triangle-alert" size={16} className="mt-0.5 shrink-0 text-[#804200]" />
            <p className="font-inter text-[13px] leading-relaxed text-[#804200]">
              Le délai de retrait n&apos;est pas encore écoulé. Vérifiez que l&apos;animal répond aux critères de sortie avant de confirmer.
            </p>
          </div>

          <div className="rounded-[12px] border border-border-light bg-card p-7">
            <div className="flex flex-col gap-2.5">
              <label className="font-inter text-xs font-medium text-label">Motif de sortie *</label>
              <div className="flex gap-3">
                {MOTIFS.map(({ id: mId, icon, label }) => (
                  <button
                    key={mId}
                    type="button"
                    onClick={() => setMotif(mId)}
                    className={`flex flex-1 flex-col items-center gap-2 rounded-[8px] p-4 font-dm-sans text-[13px] font-semibold transition-colors ${
                      motif === mId
                        ? "border-2 border-primary bg-[#E8F5E9] text-primary"
                        : "border border-border bg-card text-subtle"
                    }`}
                  >
                    <Icon
                      name={icon}
                      size={22}
                      className={motif === mId ? "text-primary" : "text-subtle"}
                    />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-label">Date de sortie *</label>
              <DatePicker value={dateSortie} onChange={setDateSortie} />
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-label">Poids final (kg)</label>
              <div className="flex h-10 items-center justify-between rounded-[6px] border border-border bg-card px-3">
                <input
                  type="number"
                  defaultValue="0.00"
                  className="w-full bg-transparent font-inter text-[13px] text-placeholder focus:outline-none"
                />
                <span className="font-inter text-xs text-placeholder">kg</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <label className="font-inter text-xs font-medium text-label">Notes</label>
              <textarea
                rows={3}
                className="w-full resize-none rounded-[6px] border border-border bg-card p-3 font-inter text-[13px] text-label placeholder:text-placeholder focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Remarques, contexte de sortie…"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Link
                href={`/animaux/${id}`}
                className="flex items-center rounded-[6px] border border-border bg-surface px-4 py-2 font-dm-sans text-[13px] font-semibold text-subtle hover:bg-border-light transition-colors"
              >
                Annuler
              </Link>
              <button className="flex items-center gap-2 rounded-[6px] bg-danger px-4 py-2.5 font-dm-sans text-[13px] font-semibold text-white hover:bg-red-700 transition-colors">
                <Icon name="check" size={15} />
                Confirmer la sortie
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Étape 5 — Sauvegarder et envoyer

```bash
git add frontend/app/\(dashboard\)/animaux/nouveau/page.tsx
git add frontend/app/\(dashboard\)/animaux/\[id\]/sortie/page.tsx
git commit -m "feat: complete formulaires animaux - Safouane"
git push origin safouane
```

---

## Étape 6 — Créer une Pull Request

1. Va sur https://github.com/Youness-Ailal/bovins_cmc
2. Clique sur **"Compare & pull request"**
3. Titre : `feat: formulaires animaux - Safouane`
4. Clique **"Create pull request"**
