"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import DataTable, { Column } from "@/components/ui/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

interface Race {
  id: string;
  nom: string;
  origine: string;
  poidsAdulte: string;
  gmqCible: string;
  nbAnimaux: number;
}

const INITIAL_RACES: Race[] = [
  { id: "RAC-001", nom: "Holstein", origine: "Europe du Nord", poidsAdulte: "650 kg", gmqCible: "1.40 kg/j", nbAnimaux: 52 },
  { id: "RAC-002", nom: "Angus", origine: "Écosse", poidsAdulte: "600 kg", gmqCible: "1.35 kg/j", nbAnimaux: 48 },
  { id: "RAC-003", nom: "Limousin", origine: "France", poidsAdulte: "700 kg", gmqCible: "1.50 kg/j", nbAnimaux: 32 },
  { id: "RAC-004", nom: "Charolais", origine: "France", poidsAdulte: "850 kg", gmqCible: "1.60 kg/j", nbAnimaux: 15 },
];

export default function RacesPage() {
  const { success, error } = useToast();
  const [races, setRaces] = useState<Race[]>(INITIAL_RACES);
  const [toDelete, setToDelete] = useState<Race | null>(null);

  function requestDelete(race: Race) {
    if (race.nbAnimaux > 0) {
      // Cannot delete a race still linked to animals
      error(`Impossible : ${race.nbAnimaux} animaux sont liés à la race ${race.nom}`);
      return;
    }
    setToDelete(race);
  }

  function confirmDelete() {
    if (!toDelete) return;
    // TODO: DELETE /api/races/:id
    setRaces((prev) => prev.filter((r) => r.id !== toDelete.id));
    success(`Race « ${toDelete.nom} » supprimée`);
    setToDelete(null);
  }

  const COLUMNS: Column<Race>[] = [
    { key: "id", label: "Réf.", width: "w-[100px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.id}</span> },
    { key: "nom", label: "Race", width: "w-[150px]", render: (r) => <span className="font-inter text-[13px] font-semibold text-label">{r.nom}</span> },
    { key: "origine", label: "Origine", width: "w-[160px]" },
    { key: "poidsAdulte", label: "Poids adulte", width: "w-[120px]" },
    { key: "gmqCible", label: "GMQ cible", width: "w-[120px]" },
    { key: "nbAnimaux", label: "Animaux", width: "w-[90px]", render: (r) => <span className="font-inter text-[13px] text-subtle">{r.nbAnimaux}</span> },
    {
      key: "_actions", label: "Actions", width: "w-[70px]", align: "right",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Link href={`/administration/races/${r.id}`} className="text-placeholder hover:text-primary transition-colors"><Icon name="pencil" size={15} /></Link>
          <button onClick={() => requestDelete(r)} title="Supprimer" className="text-placeholder hover:text-danger transition-colors"><Icon name="x" size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-surface">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-card px-7">
        <div className="flex items-center gap-1.5">
          <Link href="/administration" className="font-inter text-sm text-placeholder hover:text-subtle transition-colors">Administration</Link>
          <span className="font-inter text-sm text-placeholder">/</span>
          <span className="font-dm-sans text-xl font-semibold text-label">Races bovines</span>
        </div>
        <Link href="/administration/races/nouveau" className="flex items-center gap-1.5 rounded-[6px] bg-primary px-3.5 py-2 font-dm-sans text-[13px] font-semibold text-white hover:bg-primary-hover transition-colors">
          <Icon name="plus" size={14} />
          Nouvelle race
        </Link>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
        <DataTable
          columns={COLUMNS}
          data={races}
          keyExtractor={(r) => r.id}
          pagination={{ page: 1, total: 1, count: races.length }}
        />
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer la race ?"
        message={`La race « ${toDelete?.nom ?? ""} » sera supprimée définitivement.`}
        confirmLabel="Supprimer"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
