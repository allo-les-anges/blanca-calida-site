import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ChartNoAxesCombined,
  HeartHandshake,
  Home,
  MapPin,
  Plane,
  ShieldCheck,
  Sun,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Spain Property Guide | Amaru Homes",
  description:
    "Explore the Spanish regions where Amaru Homes sells property: Costa Blanca, Costa del Sol, Costa Calida and Costa Almeria.",
};

const regions = [
  {
    name: "Costa del Sol",
    image: "/images/regions/2.jpg",
    description: "Marbella, Estepona, Benahavis, Mijas and Sotogrande: golf, marinas, beaches and strong international demand.",
    highlights: ["300+ days of sun", "Malaga airport", "Premium rental appeal"],
  },
  {
    name: "Costa Blanca",
    image: "/images/regions/1.jpg",
    description: "Alicante, Calpe, Moraira, Altea and Javea: authentic coastal towns, blue water and a refined lifestyle.",
    highlights: ["Mediterranean towns", "Alicante airport", "Excellent value"],
  },
  {
    name: "Costa Calida",
    image: "/images/regions/3.jpg",
    description: "Murcia, Cartagena and the Mar Menor: beaches, golf resorts and a quieter property market with room to grow.",
    highlights: ["Warm climate", "Golf resorts", "Emerging market"],
  },
  {
    name: "Costa Almeria",
    image: "/images/regions/4.jpg",
    description: "Almeria, Mojacar, Vera and San Juan de los Terreros: natural landscapes, beaches and attractive pricing.",
    highlights: ["Nature and beaches", "Relaxed lifestyle", "Accessible budgets"],
  },
];

const guideSections = [
  { title: "Overview", text: "A clear introduction to the Spanish coastal regions where Amaru Homes helps international buyers purchase property." },
  { title: "Property market", text: "Understand lifestyle, price positioning, demand, rental potential and the profile of each region." },
  { title: "Buying guide", text: "Learn what to consider before choosing a location: airports, healthcare, schools, legal process and long-term use." },
  { title: "FAQ", text: "Answers to common buyer questions before arranging visits or requesting a shortlist." },
];

const metrics = [
  { icon: Sun, label: "Climate", value: "300+ sunny days" },
  { icon: Plane, label: "Connectivity", value: "Major airports" },
  { icon: HeartHandshake, label: "Lifestyle", value: "Coastal living" },
  { icon: Building2, label: "Market", value: "New-build villas & apartments" },
  { icon: ShieldCheck, label: "Buyer support", value: "Guided process" },
];

export default function GuidesPage() {
  return (
    <main className="guide-shell min-h-screen bg-[#FAFAFA] text-[#171716]">
      <Navbar />

      <div className="mx-auto flex max-w-[1800px]">
        <aside className="guide-surface sticky top-0 hidden h-screen w-72 shrink-0 border-r border-[#D8C9B6] bg-[#F2EFEA] px-6 py-8 pt-28 xl:block">
          <div className="mb-10">
            <p className="guide-text text-[10px] font-black uppercase tracking-[0.35em] text-[#171716]">Amaru Homes</p>
            <h2 className="mt-4 text-2xl font-serif uppercase leading-tight">Spain Property Guide</h2>
          </div>

          <nav className="space-y-3">
            {guideSections.map((section, index) => (
              <a
                key={section.title}
                href={`#${section.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="guide-surface flex items-center gap-3 border border-[#D8C9B6] bg-[#FAFAFA] px-4 py-4 text-[10px] font-black uppercase tracking-[0.18em] transition-colors hover:bg-[#D8C9B6]"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {section.title}
              </a>
            ))}
          </nav>

          <Link
            href="/#collection"
            className="mt-10 flex items-center justify-between border border-[#171716] px-5 py-5 text-[10px] font-black uppercase tracking-[0.22em] transition-colors hover:bg-[#171716] hover:text-[#FAFAFA]"
          >
            View properties
            <ArrowRight size={16} />
          </Link>
        </aside>

        <div className="min-w-0 flex-1 pt-24">
          <section className="relative min-h-[72vh] overflow-hidden">
            <img src="/images/regions/2.jpg" alt="Spain coastline property guide" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#010101]/80 via-[#010101]/35 to-transparent" />
            <div className="relative z-10 flex min-h-[72vh] max-w-5xl flex-col justify-center px-6 py-20 md:px-12 lg:px-20">
              <p className="mb-6 text-[11px] font-black uppercase tracking-[0.45em] text-[#D8C9B6]">Live beautifully. Invest wisely.</p>
              <h1 className="max-w-4xl text-6xl font-serif uppercase leading-[0.9] text-[#FAFAFA] md:text-8xl">
                Spain Property Guide
              </h1>
              <p className="mt-8 max-w-xl text-base leading-8 text-[#FAFAFA]">
                Explore the coastal regions where Amaru Homes sells carefully selected properties, from lifestyle-led residences to investment-ready homes.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a href="#regions-overview" className="inline-flex items-center justify-center gap-3 bg-[#D8C9B6] px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#010101]">
                  Explore regions <ArrowRight size={16} />
                </a>
                <Link href="/#collection" className="inline-flex items-center justify-center gap-3 border border-[#FAFAFA] px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#FAFAFA]">
                  View properties <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>

          <section className="guide-surface grid grid-cols-1 border-b border-[#D8C9B6] bg-[#FAFAFA] md:grid-cols-5">
            {metrics.map((metric) => (
              <div key={metric.label} className="flex items-center gap-4 border-r border-[#D8C9B6] px-6 py-8">
                <metric.icon className="text-[#D8C9B6]" size={30} strokeWidth={1.4} />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em]">{metric.label}</p>
                  <p className="guide-text mt-1 text-sm text-[#171716]">{metric.value}</p>
                </div>
              </div>
            ))}
          </section>

          <section id="overview" className="grid grid-cols-1 gap-12 px-6 py-16 md:px-12 lg:grid-cols-2 lg:px-20">
            <div>
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">Overview</p>
              <h2 className="text-4xl font-serif uppercase leading-tight">Why invest in Spain?</h2>
              <p className="mt-6 max-w-2xl leading-8">
                Spain combines a relaxed Mediterranean lifestyle with resilient property demand, strong connectivity and a wide choice of coastal locations. This guide helps buyers compare regions before requesting a focused property shortlist.
              </p>
              <ul className="mt-8 space-y-3 text-sm">
                {["Diverse coastal regions and property styles", "International buyer demand in prime locations", "Strong lifestyle appeal for families and retirees", "Clearer decision-making before arranging visits"].map((item) => (
                  <li key={item} className="flex gap-3">
                    <ShieldCheck className="mt-0.5 text-[#D8C9B6]" size={16} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative min-h-[360px] overflow-hidden bg-[#171716]">
              <img src="/images/regions/1.jpg" alt="Spanish Mediterranean lifestyle" className="absolute inset-0 h-full w-full object-cover opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#010101]/70 to-transparent" />
              <div className="relative z-10 max-w-sm p-10 text-[#FAFAFA]">
                <h3 className="text-3xl font-serif uppercase leading-tight">A lifestyle like no other</h3>
                <p className="mt-5 text-sm leading-7">Beach mornings, marina lunches, golf afternoons and historic towns: each region offers a different rhythm.</p>
              </div>
            </div>
          </section>

          <section id="regions-overview" className="guide-soft border-y border-[#D8C9B6] bg-[#F2EFEA] px-6 py-16 md:px-12 lg:px-20">
            <div className="mb-10 max-w-3xl">
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">Regions overview</p>
              <h2 className="text-4xl font-serif uppercase leading-tight">Explore Spain&apos;s top regions</h2>
              <p className="mt-5 leading-8">From glamorous hotspots to quiet Mediterranean towns, compare the areas where Amaru Homes selects properties for international buyers.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {regions.map((region) => (
                <article key={region.name} className="guide-surface group bg-[#FAFAFA]">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={region.image} alt={`${region.name} property guide`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif uppercase">{region.name}</h3>
                    <p className="mt-3 min-h-24 text-sm leading-7">{region.description}</p>
                    <div className="mt-5 space-y-2">
                      {region.highlights.map((highlight) => (
                        <p key={highlight} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">
                          <MapPin size={13} className="text-[#D8C9B6]" />
                          {highlight}
                        </p>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="property-market" className="grid grid-cols-1 gap-6 px-6 py-16 md:px-12 lg:grid-cols-2 lg:px-20">
            <div className="guide-surface bg-[#FAFAFA] p-10 ring-1 ring-[#D8C9B6]">
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">Property market</p>
              <h2 className="text-3xl font-serif uppercase">Spain market snapshot</h2>
              <div className="mt-10 grid grid-cols-2 gap-8">
                {[
                  ["Apartments", "From €500k"],
                  ["Villas", "Prime coastal demand"],
                  ["Growth", "Lifestyle-led market"],
                  ["Rental", "Seasonal potential"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <ChartNoAxesCombined className="mb-3 text-[#D8C9B6]" size={28} />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</p>
                    <p className="mt-2 text-lg font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="buying-guide" className="guide-surface bg-[#F2EFEA] p-10 ring-1 ring-[#D8C9B6]">
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">Buying guide</p>
              <h2 className="text-3xl font-serif uppercase">How to choose the right region</h2>
              <p className="mt-6 leading-8">The best region depends on your lifestyle, access needs, usage plan and investment goals. Amaru Homes helps buyers compare areas before selecting properties to visit.</p>
              <div className="mt-8 grid gap-3 text-sm">
                {["Airport access and travel frequency", "Beach, golf, marina or city lifestyle", "Family needs, healthcare and schools", "Rental expectations and long-term resale"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Home size={16} className="text-[#D8C9B6]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-6 mb-16 bg-[#171716] px-8 py-10 text-[#FAFAFA] md:mx-12 lg:mx-20">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-3xl font-serif uppercase">Ready to find your dream property in Spain?</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#F2EFEA]">Browse our current selection or contact the team for a tailored regional shortlist.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/#collection" className="inline-flex items-center justify-center gap-3 bg-[#D8C9B6] px-7 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#010101]">
                  View properties <ArrowRight size={15} />
                </Link>
                <Link href="/contact" className="inline-flex items-center justify-center gap-3 border border-[#FAFAFA] px-7 py-4 text-[10px] font-black uppercase tracking-[0.2em]">
                  Contact our team <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>

          <section id="faq" className="px-6 pb-20 md:px-12 lg:px-20">
            <h2 className="text-3xl font-serif uppercase">FAQ</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                ["Can Amaru Homes help me compare regions?", "Yes. We help buyers understand lifestyle, access, budgets and property options before arranging viewings."],
                ["Can I start with a region guide before viewing properties?", "Yes. These guides are designed to support early research and improve the quality of each shortlist."],
              ].map(([question, answer]) => (
                <div key={question} className="guide-surface border border-[#D8C9B6] bg-[#FAFAFA] p-6">
                  <h3 className="font-bold uppercase tracking-[0.12em]">{question}</h3>
                  <p className="mt-4 text-sm leading-7">{answer}</p>
                </div>
              ))}
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </main>
  );
}
