"use client";

import { useEffect, useState, useRef } from "react";
import type { ElementType } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import {
  Bed,
  Bath,
  Maximize,
  MessageCircle,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  Home,
  Waves,
  Car,
  ShieldCheck,
  Download,
  Calendar,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Expand,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useTranslation } from "@/contexts/I18nContext";
import { useSearchParams } from "next/navigation";

interface PropertyDetailClientProps {
  id: string;
}

type FactItem = {
  icon: ElementType;
  label: string;
  value: string;
};

type EditorialDescriptionSection = {
  heading: string | null;
  body: string;
};

const FALLBACK_IMAGE = "/images/regions/1.jpg";

function safeText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function hasUsableValue(value: unknown) {
  if (value === null || value === undefined) return false;
  const text = String(value).trim();
  return text.length > 0 && text !== "0" && text.toLowerCase() !== "non";
}

function cleanDescription(html: string) {
  if (!html) return "";
  return html
    .replace(/style="[^"]*"/gi, "")
    .replace(/color="[^"]*"/gi, "")
    .replace(/<font[^>]*>/gi, "")
    .replace(/<\/font>/gi, "")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isEditorialHeading(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return false;

  const knownHeadings = new Set(["OUTDOOR AREAS", "INDOOR AREAS", "COMMON AREAS", "LOCATION", "EQUIPMENT", "FEATURES"]);
  if (knownHeadings.has(normalized.toUpperCase())) return true;

  const hasLetter = /[A-Z]/.test(normalized);
  const hasLowercase = /[a-z]/.test(normalized);
  const wordCount = normalized.split(/\s+/).length;
  const endsAsSentence = /[.!?;:]$/.test(normalized);

  return hasLetter && !hasLowercase && wordCount <= 6 && normalized.length <= 60 && !endsAsSentence;
}

function parseEditorialDescription(description: string): EditorialDescriptionSection[] {
  const source = cleanDescription(description);
  if (!source.trim()) return [];

  const blockMatches = source.match(/<(p|div|h[1-6])\b[^>]*>[\s\S]*?<\/\1>/gi);
  const blocks = blockMatches && blockMatches.length > 0
    ? blockMatches
    : source
        .replace(/<br\s*\/?>/gi, "\n")
        .split(/\n{2,}|\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `<p>${line}</p>`);

  const sections: EditorialDescriptionSection[] = [];
  let current: EditorialDescriptionSection = { heading: null, body: "" };

  blocks.forEach((block) => {
    const text = stripHtml(block);
    if (!text) return;

    if (isEditorialHeading(text)) {
      if (stripHtml(current.body)) sections.push(current);
      current = { heading: text, body: "" };
      return;
    }

    current.body = `${current.body}${block}`;
  });

  if (stripHtml(current.body)) sections.push(current);

  return sections.length > 0 ? sections : [{ heading: null, body: source }];
}

function formatEditorialHeading(heading: string) {
  return heading
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M16.02 3.2A12.62 12.62 0 0 0 5.22 22.35L3.6 28.8l6.6-1.55a12.6 12.6 0 0 0 5.82 1.44h.01A12.75 12.75 0 0 0 28.8 16 12.75 12.75 0 0 0 16.02 3.2Zm0 23.33h-.01a10.48 10.48 0 0 1-5.34-1.46l-.38-.23-3.91.92.95-3.8-.25-.4a10.46 10.46 0 1 1 8.94 4.97Zm5.74-7.83c-.31-.16-1.85-.91-2.14-1.02-.29-.1-.5-.16-.71.16-.21.31-.82 1.02-1 1.23-.18.21-.37.23-.68.08-.31-.16-1.32-.49-2.52-1.55-.93-.83-1.56-1.86-1.74-2.17-.18-.31-.02-.48.14-.64.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.71-1.7-.97-2.33-.26-.61-.52-.53-.71-.54h-.6c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.62 0 1.55 1.13 3.04 1.29 3.25.16.21 2.23 3.4 5.4 4.77.75.33 1.34.52 1.8.66.76.24 1.45.21 1.99.13.61-.09 1.85-.76 2.11-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.6-.37Z"
      />
    </svg>
  );
}

export default function PropertyDetailClient({ id }: PropertyDetailClientProps) {
  const { t, locale } = useTranslation();
  const { resolvedTheme } = useTheme();
  const searchParams = useSearchParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<number | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [brochureModalOpen, setBrochureModalOpen] = useState(false);
  const [brochureLead, setBrochureLead] = useState({ firstName: "", lastName: "", email: "" });
  const [brochureStatus, setBrochureStatus] = useState<"idle" | "sending" | "error">("idle");
  const [brochureError, setBrochureError] = useState("");
  const galleryRef = useRef<HTMLDivElement>(null);

  const isLight = searchParams.get("pack") === "light";
  const isDarkVisual = resolvedTheme === "dark" && !isLight;

  const currentAgency = {
    id: "AGENCE_HANNIBAL_001",
    package_level: isLight ? "light" : "gold",
    name: "Data Home",
  };

  const images = property && Array.isArray(property.images)
    ? property.images
        .map((image: any) => (typeof image === "string" ? image : image?.url))
        .filter((image: any): image is string => typeof image === "string" && image.trim().length > 0)
    : [];
  const galleryImages = images.length > 0 ? images : [FALLBACK_IMAGE];

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      try {
        const res = await fetch(`/api/properties?lang=${locale}&id=${encodeURIComponent(id)}`);
        const data = await res.json();
        const propertiesArray = Array.isArray(data) ? data : data.properties || [];
        const current = propertiesArray.find(
          (p: any) => String(p.id_externe) === String(id) || String(p.id) === String(id)
        );
        if (current) setProperty(current);
      } catch (err) {
        console.error("Erreur Fetch:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, locale]);

  useEffect(() => {
    if (lightboxImage === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxImage(null);
      if (event.key === "ArrowLeft") {
        setLightboxZoom(false);
        setLightboxImage((current) => (current === null ? current : (current - 1 + galleryImages.length) % galleryImages.length));
      }
      if (event.key === "ArrowRight") {
        setLightboxZoom(false);
        setLightboxImage((current) => (current === null ? current : (current + 1) % galleryImages.length));
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxImage, galleryImages.length]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#010101] text-[#D8C9B6]">
        <Loader2 className="mb-4 animate-spin" size={40} />
        <span className="font-serif text-xl italic">{t("propertyDetail.loading")}</span>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#FAFAFA] p-6 text-center">
        <h1 className="mb-4 font-serif text-2xl text-[#010101]">{t("propertyDetail.propertyNotFound")}</h1>
        <Link href="/" className="bg-[#171716] px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-[#FAFAFA]">
          {t("propertyDetail.backToCatalogue")}
        </Link>
      </div>
    );
  }

  const heroImage = galleryImages[activeImage] || galleryImages[0];
  const propertyImage = galleryImages[1] || heroImage;
  const visibleGalleryImages = galleryImages.slice(0, Math.min(galleryImages.length, 5));
  const remainingGalleryCount = Math.max(galleryImages.length - visibleGalleryImages.length, 0);

  const planUrls = Array.isArray(property.plans)
    ? property.plans
        .map((item: any) => {
          if (typeof item === "string") return item;
          if (typeof item?.url === "string") return item.url;
          if (typeof item?.plan?.url === "string") return item.plan.url;
          return null;
        })
        .filter((url: any): url is string => typeof url === "string" && /^https?:\/\//i.test(url))
    : [];
  const brochureUrl = planUrls[0];
  const numericPrice = Number(property.price || property.prix || 0);
  const formattedPrice = numericPrice > 0 ? `${numericPrice.toLocaleString("fr-FR")} €` : t("propertyDetail.priceOnRequest");
  const propertyType = safeText(property.type, t("propertyDetail.property"));
  const town = safeText(property.town || property.ville, t("propertyDetail.spain"));
  const region = safeText(property.region, t("propertyDetail.mediterranean"));
  const reference = safeText(property.ref || property.id_externe || property.id, t("propertyDetail.notAvailable"));
  const title = safeText(property.titre, `${propertyType} - ${town}`);
  const editorialTitle = t("propertyDetail.editorialTitle", { type: propertyType, town });
  const description = cleanDescription(property.description || "");
  const hasDescription = description.trim().length > 0;
  const editorialSections = hasDescription ? parseEditorialDescription(description) : [];
  const mapQuery = encodeURIComponent(`${town}, ${region}, Espagne`);
  const fallbackMapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  const downloadBrochureUrl = brochureUrl ? `/api/download-brochure?url=${encodeURIComponent(brochureUrl)}` : "";

  const handleBrochureLeadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!brochureUrl) return;

    setBrochureStatus("sending");
    setBrochureError("");

    try {
      const response = await fetch("/api/brochure-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...brochureLead,
          propertyRef: reference,
          propertyTitle: title,
          brochureUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to save lead");
      }

      setBrochureModalOpen(false);
      setBrochureLead({ firstName: "", lastName: "", email: "" });
      window.location.href = downloadBrochureUrl;
    } catch (error) {
      setBrochureError(t("propertyDetail.brochureLeadError"));
      setBrochureStatus("error");
    }
  };

  const overviewItems: FactItem[] = [
    { icon: Bed, label: t("propertyDetail.bedrooms"), value: hasUsableValue(property.beds) ? String(property.beds) : t("propertyDetail.notAvailable") },
    { icon: Bath, label: t("propertyDetail.bathrooms"), value: hasUsableValue(property.baths) ? String(property.baths) : t("propertyDetail.notAvailable") },
    {
      icon: Maximize,
      label: t("propertyDetail.built"),
      value: hasUsableValue(property.surface_built) ? `${property.surface_built} m²` : t("propertyDetail.notAvailable"),
    },
    {
      icon: Home,
      label: t("propertyDetail.plot"),
      value: hasUsableValue(property.surface_plot) ? `${property.surface_plot} m²` : t("propertyDetail.notAvailable"),
    },
    { icon: Waves, label: t("propertyDetail.pool"), value: property.pool === "Oui" ? t("propertyDetail.poolPrivate") : t("propertyDetail.poolNo") },
    { icon: Car, label: t("propertyDetail.parking"), value: t("propertyDetail.parking") },
    { icon: FileText, label: t("propertyDetail.refLabel"), value: reference },
  ];

  return (
    <main className="property-detail-editorial min-h-screen bg-[#FAFAFA] text-[#171716]">
      <Navbar />

      <section className="editorial-bg-ink relative min-h-screen overflow-hidden bg-[#010101] text-[#FAFAFA]">
        <img src={heroImage} alt={title} className="absolute inset-0 h-full w-full object-cover opacity-70" style={{ objectPosition: "center 45%" }} />
        <div className="absolute inset-0 bg-[#010101]/45" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#010101] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-6 pb-14 pt-32 md:px-10 md:pb-20">
          <Link href="/" className="mb-auto inline-flex w-fit items-center gap-2 text-[10px] font-bold uppercase tracking-[0.32em] text-[#FAFAFA]/80 transition-colors hover:text-[#D8C9B6]">
            <ArrowLeft size={14} /> {t("propertyDetail.back")}
          </Link>

          <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-6 flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#D8C9B6]">
              <span>{town}</span>
              <span className="text-[#FAFAFA]/40">/</span>
              <span>{region}</span>
              <span className="text-[#FAFAFA]/40">/</span>
              <span>{propertyType}</span>
            </div>

            <h1 className="max-w-4xl font-serif text-5xl italic leading-[0.95] text-[#FAFAFA] md:text-7xl lg:text-8xl">
              {editorialTitle}
            </h1>

            <div className="mt-8 flex flex-col gap-5 border-l border-[#D8C9B6]/50 pl-6 md:flex-row md:items-center md:gap-8">
              <p className="font-serif text-3xl text-[#D8C9B6] md:text-4xl">{formattedPrice}</p>
              <p className="max-w-2xl text-[11px] font-bold uppercase leading-loose tracking-[0.28em] text-[#FAFAFA]/75">
                {title} · {t("propertyDetail.ref", { ref: reference })}
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href="#property-contact" className="sticky bottom-6 z-20 border border-[#D8C9B6] bg-[#D8C9B6] px-7 py-4 text-center text-[10px] font-black uppercase tracking-[0.28em] text-[#010101] transition-colors hover:bg-[#FAFAFA]">
                {t("propertyDetail.bookViewing")}
              </a>
              <a href="#property-contact" className="border border-[#FAFAFA]/35 px-7 py-4 text-center text-[10px] font-black uppercase tracking-[0.28em] text-[#FAFAFA] transition-colors hover:border-[#D8C9B6] hover:text-[#D8C9B6]">
                {t("propertyDetail.requestInformation")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-bg-soft border-b border-[#D8C9B6]/35 bg-[#F2EFEA] px-6 py-8 md:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-[#D8C9B6]/35 md:grid-cols-4 lg:grid-cols-7">
          {overviewItems.map((item) => (
            <div key={`${item.label}-${item.value}`} className="bg-[#F2EFEA] p-5 md:p-6">
              <item.icon size={18} className="mb-4 text-[#D8C9B6]" />
              <p className="font-serif text-2xl text-[#010101]">{item.value}</p>
              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.28em] text-[#171716]/60">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {editorialSections.length > 0 ? (
        editorialSections.map((section, index) => {
          const image = galleryImages[index + 1] || galleryImages[index] || heroImage || FALLBACK_IMAGE;
          const imageIndex = Math.max(galleryImages.indexOf(image), 0);
          const textFirst = index % 2 === 0;
          const sectionBg = index % 2 === 0 ? "editorial-bg-paper bg-[#FAFAFA]" : "editorial-bg-soft bg-[#F2EFEA]";
          const label = section.heading || t("propertyDetail.thePropertyEyebrow");
          const titleText = section.heading ? formatEditorialHeading(section.heading) : t("propertyDetail.theProperty");

          const textBlock = (
            <div className="pt-1 lg:pt-8">
              <p className="mb-5 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">{label}</p>
              <h2 className="max-w-xl font-serif text-4xl italic leading-tight text-[#010101] md:text-6xl">{titleText}</h2>
              <article className="mt-8 max-w-xl">
                <div
                  className="text-lg leading-[1.9] text-[#171716]/80 [&_p]:mb-6 [&_strong]:text-[#010101]"
                  dangerouslySetInnerHTML={{ __html: section.body }}
                />
              </article>
              {index === 0 && (
                <a href="#property-contact" className="mt-10 inline-flex w-fit items-center gap-3 border border-[#D8C9B6] px-7 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#171716] transition-colors hover:bg-[#171716] hover:text-[#FAFAFA]">
                  <Calendar size={15} /> {t("propertyDetail.bookViewing")}
                </a>
              )}
            </div>
          );

          const imageBlock = (
            <button
              type="button"
              onClick={() => setLightboxImage(imageIndex)}
              className="group relative min-h-[360px] overflow-hidden border border-[#D8C9B6]/35 bg-[#F2EFEA] text-left md:min-h-[520px] lg:min-h-[620px]"
            >
              <img src={image} alt={titleText} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute bottom-5 left-5 flex items-center gap-2 bg-[#010101]/75 px-4 py-3 text-[9px] font-black uppercase tracking-[0.24em] text-[#FAFAFA] backdrop-blur-md">
                <Expand size={13} /> {t("propertyDetail.viewPhoto")}
              </span>
            </button>
          );

          return (
            <section key={`${label}-${index}`} className={`${sectionBg} px-6 py-20 md:px-10 md:py-28`}>
              <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
                {textFirst ? (
                  <>
                    {textBlock}
                    {imageBlock}
                  </>
                ) : (
                  <>
                    {imageBlock}
                    {textBlock}
                  </>
                )}
              </div>
            </section>
          );
        })
      ) : (
        <section className="editorial-bg-paper bg-[#FAFAFA] px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
            <div className="pt-1 lg:pt-8">
              <p className="mb-5 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">{t("propertyDetail.thePropertyEyebrow")}</p>
              <h2 className="max-w-xl font-serif text-4xl italic leading-tight text-[#010101] md:text-6xl">{t("propertyDetail.theProperty")}</h2>
              <p className="mt-8 max-w-xl text-lg leading-[1.9] text-[#171716]/70">{t("propertyDetail.descriptionFallback")}</p>
            </div>
            <button
              type="button"
              onClick={() => setLightboxImage(galleryImages.indexOf(propertyImage))}
              className="group relative min-h-[360px] overflow-hidden border border-[#D8C9B6]/35 bg-[#F2EFEA] text-left md:min-h-[520px] lg:min-h-[620px]"
            >
              <img src={propertyImage} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute bottom-5 left-5 flex items-center gap-2 bg-[#010101]/75 px-4 py-3 text-[9px] font-black uppercase tracking-[0.24em] text-[#FAFAFA] backdrop-blur-md">
                <Expand size={13} /> {t("propertyDetail.viewPhoto")}
              </span>
            </button>
          </div>
        </section>
      )}

      <section className="editorial-bg-soft bg-[#F2EFEA] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl text-center">
          <p className="font-serif text-5xl italic leading-tight text-[#010101] md:text-7xl">
            “{t("propertyDetail.editorialQuote")}”
          </p>
        </div>
      </section>

      <section className="editorial-bg-paper bg-[#FAFAFA] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.85fr] lg:items-start lg:gap-14">
          <div className="pt-1 lg:pt-8">
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">{t("propertyDetail.galleryEyebrow")}</p>
              <h2 className="max-w-sm font-serif text-4xl italic leading-tight text-[#010101] md:text-6xl">{t("propertyDetail.magazineGallery")}</h2>
            <div className="mt-12 flex items-center gap-8 text-[#171716]/60">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em]">
              <ImageIcon size={14} /> 1 / {galleryImages.length}
            </p>
              <div className="hidden items-center gap-4 md:flex">
                <button type="button" onClick={() => setLightboxImage(galleryImages.length - 1)} className="text-[#171716]/60 transition-colors hover:text-[#010101]" aria-label={t("propertyDetail.previousImage")}>
                  <ChevronLeft size={22} />
                </button>
                <button type="button" onClick={() => setLightboxImage(1 % galleryImages.length)} className="text-[#171716]/60 transition-colors hover:text-[#010101]" aria-label={t("propertyDetail.nextImage")}>
                  <ChevronRight size={22} />
                </button>
              </div>
          </div>
          <button
            type="button"
            onClick={() => setLightboxImage(0)}
            className="mt-10 border border-[#D8C9B6] px-7 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#171716] transition-colors hover:bg-[#171716] hover:text-[#FAFAFA]"
          >
            {t("propertyDetail.viewFullGallery")}
          </button>
          </div>

          <div ref={galleryRef} className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:grid-rows-[220px_220px]">
            {visibleGalleryImages.map((image: string, index: number) => (
              <button
                key={`${image}-${index}`}
                onClick={() => {
                  setActiveImage(index);
                  setLightboxImage(index);
                }}
                className={`group relative overflow-hidden border border-[#D8C9B6]/25 bg-[#F2EFEA] text-left ${
                  index === 0 ? "min-h-[280px] lg:col-span-2 lg:row-span-2" : "min-h-[180px]"
                }`}
              >
                <img
                  src={image}
                  alt={`${title} ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center bg-[#010101]/70 text-[#FAFAFA] opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                  <Expand size={15} />
                </span>
                {index === visibleGalleryImages.length - 1 && remainingGalleryCount > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-[#010101]/55 text-center font-serif text-3xl italic text-[#FAFAFA] backdrop-blur-[2px]">
                    +{remainingGalleryCount} {t("propertyDetail.morePhotos")}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-bg-paper bg-[#FAFAFA] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">{t("propertyDetail.locationEyebrow")}</p>
            <h2 className="mb-8 font-serif text-4xl italic text-[#010101] md:text-6xl">{t("propertyDetail.location")}</h2>
            <div className="space-y-4 border-l border-[#D8C9B6]/60 pl-6">
              <p className="text-2xl text-[#010101]">{town}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#171716]/60">{region}</p>
              <p className="text-sm leading-7 text-[#171716]/70">{t("propertyDetail.locationIntro", { town, region })}</p>
            </div>
          </div>
          <div className="relative h-[420px] overflow-hidden border border-[#D8C9B6]/40 bg-[#F2EFEA] md:h-[520px]">
            <iframe title={t("propertyDetail.location")} width="100%" height="100%" frameBorder="0" scrolling="no" src={fallbackMapUrl} className="grayscale" />
          </div>
        </div>
      </section>

      <section className="editorial-bg-soft bg-[#F2EFEA] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-5xl border-y border-[#D8C9B6]/45 py-16 text-center">
          <p className="mb-5 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">{t("propertyDetail.whyEyebrow")}</p>
          <h2 className="mb-8 font-serif text-4xl italic text-[#010101] md:text-6xl">{t("propertyDetail.whyTitle")}</h2>
          <p className="mx-auto max-w-3xl text-lg leading-9 text-[#171716]/75">{t("propertyDetail.whyText")}</p>
        </div>
      </section>

      <section id="property-contact" className="editorial-bg-paper bg-[#FAFAFA] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-stretch">
          <aside className="flex">
            <div className="flex w-full flex-col justify-between border border-[#D8C9B6]/40 bg-[#F2EFEA] p-8 md:p-10">
              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#D8C9B6]">{t("propertyDetail.price")}</p>
                <p className="mb-6 font-serif text-5xl text-[#010101] md:text-6xl">{formattedPrice}</p>
                <p className="max-w-md text-sm leading-7 text-[#171716]/65">{title} · {t("propertyDetail.ref", { ref: reference })}</p>
              </div>
              <div className="space-y-3">
                {brochureUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setBrochureError("");
                      setBrochureStatus("idle");
                      setBrochureModalOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-3 border border-[#171716] px-5 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#171716] transition-colors hover:bg-[#171716] hover:text-[#FAFAFA]"
                  >
                    <Download size={16} /> {t("propertyDetail.brochure")}
                  </button>
                )}
                {!isLight && (
                  <Link href={`/contact-cashback?Property_ID=${property.id_externe || property.id}`} className="flex items-center justify-center gap-3 bg-[#171716] px-5 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#FAFAFA] transition-colors hover:bg-[#010101]">
                    <ShieldCheck size={16} /> {t("propertyDetail.activateCashback")}
                  </Link>
                )}
                <a href={`https://wa.me/34627768233?text=Info ref: ${reference}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 border border-[#D8C9B6] bg-[#D8C9B6] px-5 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#010101] transition-colors hover:bg-[#FAFAFA]">
                  <WhatsAppIcon className="h-5 w-5 text-[#25D366]" /> {t("propertyDetail.whatsappDirect")}
                </a>
              </div>
            </div>
          </aside>
          <div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">{t("propertyDetail.expertEyebrow")}</p>
            <h2 className="mb-8 font-serif text-4xl italic text-[#010101] md:text-6xl">{t("propertyDetail.yourLocalExpert")}</h2>
            <ContactForm agency={currentAgency} propertyRef={property.id_externe || property.id} isLight variant="card" />
          </div>
        </div>
      </section>

      <section className="editorial-bg-charcoal bg-[#171716] px-6 py-20 text-[#FAFAFA] md:px-10 md:py-28">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">{t("propertyDetail.finalEyebrow")}</p>
            <h2 className="font-serif text-5xl italic leading-tight md:text-7xl">{t("propertyDetail.finalTitle")}</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#property-contact" className="flex items-center justify-center gap-3 bg-[#D8C9B6] px-7 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#010101] transition-colors hover:bg-[#FAFAFA]">
              <Calendar size={16} /> {t("propertyDetail.scheduleViewing")}
            </a>
            <a href="#property-contact" className="flex items-center justify-center gap-3 border border-[#FAFAFA]/30 px-7 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#FAFAFA] transition-colors hover:border-[#D8C9B6] hover:text-[#D8C9B6]">
              <MessageCircle size={16} /> {t("propertyDetail.requestInformation")}
            </a>
          </div>
        </div>
      </section>

      <Footer isLight={!isDarkVisual} />

      {brochureModalOpen && (
        <div className="fixed inset-0 z-[190] flex items-center justify-center bg-[#010101]/70 px-5 py-8 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-[#D8C9B6]/45 bg-[#FAFAFA] p-6 shadow-2xl md:p-8">
            <div className="mb-7 flex items-start justify-between gap-5 border-b border-[#D8C9B6]/35 pb-5">
              <div>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.32em] text-[#D8C9B6]">{t("propertyDetail.brochureLeadEyebrow")}</p>
                <h2 className="font-serif text-3xl italic leading-tight text-[#010101] md:text-4xl">{t("propertyDetail.brochureLeadTitle")}</h2>
                <p className="mt-3 text-sm leading-7 text-[#171716]/65">{t("propertyDetail.brochureLeadText")}</p>
              </div>
              <button
                type="button"
                onClick={() => setBrochureModalOpen(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#D8C9B6]/55 text-[#171716] transition-colors hover:bg-[#171716] hover:text-[#FAFAFA]"
                aria-label={t("common.close")}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBrochureLeadSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  value={brochureLead.firstName}
                  onChange={(event) => setBrochureLead((current) => ({ ...current, firstName: event.target.value }))}
                  placeholder={t("propertyDetail.firstNamePlaceholder")}
                  className="w-full border border-[#D8C9B6]/45 bg-[#F2EFEA] p-4 text-[10px] uppercase tracking-widest text-[#010101] outline-none transition-colors placeholder:text-[#171716]/45 focus:border-[#010101]"
                />
                <input
                  type="text"
                  required
                  value={brochureLead.lastName}
                  onChange={(event) => setBrochureLead((current) => ({ ...current, lastName: event.target.value }))}
                  placeholder={t("propertyDetail.lastNamePlaceholder")}
                  className="w-full border border-[#D8C9B6]/45 bg-[#F2EFEA] p-4 text-[10px] uppercase tracking-widest text-[#010101] outline-none transition-colors placeholder:text-[#171716]/45 focus:border-[#010101]"
                />
              </div>
              <input
                type="email"
                required
                value={brochureLead.email}
                onChange={(event) => setBrochureLead((current) => ({ ...current, email: event.target.value }))}
                placeholder={t("contact.emailPlaceholder")}
                className="w-full border border-[#D8C9B6]/45 bg-[#F2EFEA] p-4 text-[10px] uppercase tracking-widest text-[#010101] outline-none transition-colors placeholder:text-[#171716]/45 focus:border-[#010101]"
              />
              <p className="text-[8px] uppercase leading-5 tracking-widest text-[#171716]/45">{t("propertyDetail.brochureLeadPrivacy")}</p>
              {brochureError && (
                <p className="border border-[#D8C9B6]/45 bg-[#F2EFEA] p-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#171716]">{brochureError}</p>
              )}
              <button
                type="submit"
                disabled={brochureStatus === "sending"}
                className="flex w-full items-center justify-center gap-3 bg-[#010101] px-6 py-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#FAFAFA] transition-colors hover:bg-[#D8C9B6] hover:text-[#010101] disabled:cursor-wait disabled:opacity-70"
              >
                {brochureStatus === "sending" ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                {brochureStatus === "sending" ? t("propertyDetail.brochureLeadSending") : t("propertyDetail.brochureLeadSubmit")}
              </button>
            </form>
          </div>
        </div>
      )}

      {lightboxImage !== null && (
        <div
          className="fixed inset-0 z-[200] bg-[#010101] text-[#FAFAFA]"
          onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
          onTouchEnd={(event) => {
            if (touchStartX === null) return;
            const delta = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
            if (Math.abs(delta) > 45) {
              setLightboxZoom(false);
              setLightboxImage((delta > 0 ? lightboxImage - 1 + galleryImages.length : lightboxImage + 1) % galleryImages.length);
            }
            setTouchStartX(null);
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center border border-[#FAFAFA]/20 bg-[#171716]/80 text-[#FAFAFA] backdrop-blur-md transition-colors hover:bg-[#D8C9B6] hover:text-[#010101]"
            aria-label={t("propertyDetail.closeGallery")}
          >
            <X size={22} />
          </button>
          <button
            type="button"
            onClick={() => setLightboxZoom((current) => !current)}
            className="absolute left-1/2 top-4 z-20 flex h-12 -translate-x-1/2 items-center justify-center border border-[#FAFAFA]/20 bg-[#171716]/80 px-5 text-[10px] font-black uppercase tracking-[0.22em] text-[#FAFAFA] backdrop-blur-md transition-colors hover:bg-[#D8C9B6] hover:text-[#010101]"
            aria-label={t("propertyDetail.zoomImage")}
          >
            {lightboxZoom ? "1x" : t("propertyDetail.zoomImage")}
          </button>
          <button
            type="button"
            onClick={() => {
              setLightboxZoom(false);
              setLightboxImage((lightboxImage - 1 + galleryImages.length) % galleryImages.length);
            }}
            className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[#FAFAFA]/20 bg-[#171716]/80 text-[#FAFAFA] backdrop-blur-md transition-colors hover:bg-[#D8C9B6] hover:text-[#010101]"
            aria-label={t("propertyDetail.previousImage")}
          >
            <ChevronLeft size={26} />
          </button>
          <img
            src={galleryImages[lightboxImage]}
            alt={`${title} ${lightboxImage + 1}`}
            className={`h-full w-full object-contain transition-transform duration-300 ${lightboxZoom ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"}`}
            onClick={() => setLightboxZoom((current) => !current)}
          />
          <button
            type="button"
            onClick={() => {
              setLightboxZoom(false);
              setLightboxImage((lightboxImage + 1) % galleryImages.length);
            }}
            className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[#FAFAFA]/20 bg-[#171716]/80 text-[#FAFAFA] backdrop-blur-md transition-colors hover:bg-[#D8C9B6] hover:text-[#010101]"
            aria-label={t("propertyDetail.nextImage")}
          >
            <ChevronRight size={26} />
          </button>
          <div className="absolute bottom-5 left-5 bg-[#171716]/80 px-5 py-3 text-[10px] font-black uppercase tracking-[0.26em] text-[#D8C9B6] backdrop-blur-md">
            {lightboxImage + 1} / {galleryImages.length}
          </div>
        </div>
      )}
    </main>
  );
}
