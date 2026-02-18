import PropertyDetailClient from "./PropertyDetailClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PropertyDetailClient id={id} />;
}
