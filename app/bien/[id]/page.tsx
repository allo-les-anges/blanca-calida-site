import PropertyDetailClient from "@/components/PropertyDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  if (!id) return null;

  return <PropertyDetailClient id={id} />;
}
