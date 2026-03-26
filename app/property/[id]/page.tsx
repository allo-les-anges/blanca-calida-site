import PropertyDetailClient from "@/components/PropertyDetailClient";

// On définit précisément les types pour Next.js 15
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params }: PageProps) {
  // Extraction sécurisée de l'ID
  const { id } = await params;
  
  if (!id) return null;

  return <PropertyDetailClient id={id} />;
}