import { AnimalForm } from "../../nouveau/page";

export default async function ModifierAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AnimalForm mode="edit" animalId={id} />;
}
