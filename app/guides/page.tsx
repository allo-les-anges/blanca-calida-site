import type { Metadata } from "next";

import GuidesContent from "@/components/GuidesContent";

export const metadata: Metadata = {
  title: "Spain Property Guide | Amaru Homes",
  description:
    "Explore the Spanish regions where Amaru Homes sells property: Costa Blanca, Costa del Sol, Costa Calida and Costa Almeria.",
};

export default function GuidesPage() {
  return <GuidesContent />;
}
