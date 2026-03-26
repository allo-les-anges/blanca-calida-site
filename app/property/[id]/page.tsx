import PropertyDetailClient from "@/components/PropertyDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  // 1. On attend la résolution des paramètres (Obligatoire Next 15)
  const { id } = await params;
  
  // 2. On passe l'id au composant Client
  return <PropertyDetailClient id={id} />;
}