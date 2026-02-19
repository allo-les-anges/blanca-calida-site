import PropertyDetailClient from "../../../src/components/PropertyDetailClient";

// Next.js 15 : params est une Promise
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return <PropertyDetailClient id={id} />;
}