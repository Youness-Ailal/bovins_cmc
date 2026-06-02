import { use } from "react";
import AnimalForm from "@/components/forms/AnimalForm";

export default function ModifierAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AnimalForm mode="edit" animalId={id} />;
}
