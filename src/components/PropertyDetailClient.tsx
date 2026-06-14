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
  MapPin,
  MessageCircle,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  Home,
  Waves,
  Car,
  ShieldCheck,
  Navigation,
  Download,
  Calendar,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  Expand,
} from "lucide-react";
import Link from "next/link";
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

function formatDistance(value: unknown) {
  if (value === null || value === undefined) return null;

  const normalized =
    typeof value === "number"
      ? value
      : Number(String(value).trim().replace(",", ".").replace(/[^\d.]/g, ""));

  if (!Number.isFinite(normalized) || normalized <= 0) return null;

  if (normalized >= 1000) {
    const kilometers = normalized / 1000;
    const formatted = Number.isInteger(kilometers) ? String(kilometers) : kilometers.toFixed(1).replace(/\.0$/, "");
    return `${formatted} km`;
  }

  return `${Math.round(normalized)} m`;
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

export default function PropertyDetailClient({ id }: PropertyDetailClientProps) {
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  const isLight = searchParams.get("pack") === "light";

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
        setLightboxImage((current) => (current === null ? current : (current - 1 + galleryImages.length) % galleryImages.length));
      }
      if (event.key === "ArrowRight") {
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
  const outdoorImage = galleryImages[2] || propertyImage;
  const visibleGalleryImages = galleryImages.slice(0, Math.min(galleryImages.length, 12));

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
  const distanceBeach = formatDistance(property.distance_beach);
  const distanceGolf = formatDistance(property.distance_golf);
  const mapQuery = encodeURIComponent(`${town}, ${region}, Espagne`);
  const fallbackMapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

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

  const lifestyleItems = [
    property.pool === "Oui" ? { icon: Waves, title: t("propertyDetail.lifestyle.pool"), text: t("propertyDetail.lifestyle.poolText") } : null,
    hasUsableValue(property.surface_plot)
      ? { icon: Home, title: t("propertyDetail.lifestyle.outdoor"), text: t("propertyDetail.lifestyle.outdoorText") }
      : null,
    distanceBeach
      ? { icon: Navigation, title: t("propertyDetail.lifestyle.sea"), text: t("propertyDetail.distanceSea", { distance: distanceBeach }) }
      : null,
    distanceGolf
      ? { icon: ShieldCheck, title: t("propertyDetail.lifestyle.golf"), text: t("propertyDetail.golf", { distance: distanceGolf }) }
      : null,
    hasUsableValue(property.type)
      ? { icon: Home, title: t("propertyDetail.lifestyle.architecture"), text: propertyType }
      : null,
  ].filter(Boolean) as { icon: ElementType; title: string; text: string }[];

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

      <section className="editorial-bg-paper bg-[#FAFAFA] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">{t("propertyDetail.thePropertyEyebrow")}</p>
            <h2 className="font-serif text-4xl italic leading-tight text-[#010101] md:text-6xl">{t("propertyDetail.theProperty")}</h2>
            <article className="mt-8">
            {hasDescription ? (
              <div
                className="space-y-6 text-lg leading-[1.9] text-[#171716]/80 [&_p]:mb-6 [&_strong]:text-[#010101]"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="text-lg leading-[1.9] text-[#171716]/70">{t("propertyDetail.descriptionFallback")}</p>
            )}
          </article>
          </div>
          <button
            type="button"
            onClick={() => setLightboxImage(galleryImages.indexOf(propertyImage))}
            className="group relative min-h-[420px] overflow-hidden border border-[#D8C9B6]/35 bg-[#F2EFEA] text-left md:min-h-[560px]"
          >
            <img src={propertyImage} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute bottom-5 left-5 flex items-center gap-2 bg-[#010101]/75 px-4 py-3 text-[9px] font-black uppercase tracking-[0.24em] text-[#FAFAFA] backdrop-blur-md">
              <Expand size={13} /> {t("propertyDetail.viewPhoto")}
            </span>
          </button>
        </div>
      </section>

      <section className="editorial-bg-soft bg-[#F2EFEA] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-6xl text-center">
          <p className="font-serif text-5xl italic leading-tight text-[#010101] md:text-7xl">
            “{t("propertyDetail.editorialQuote")}”
          </p>
        </div>
      </section>

      <section className="editorial-bg-paper bg-[#FAFAFA] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">{t("propertyDetail.galleryEyebrow")}</p>
              <h2 className="font-serif text-4xl italic text-[#010101] md:text-6xl">{t("propertyDetail.magazineGallery")}</h2>
            </div>
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[#171716]/60">
              <ImageIcon size={14} /> {activeImage + 1} / {galleryImages.length}
            </p>
          </div>

          <div ref={galleryRef} className="columns-2 gap-4 md:columns-3 lg:columns-4">
            {visibleGalleryImages.map((image: string, index: number) => (
              <button
                key={`${image}-${index}`}
                onClick={() => {
                  setActiveImage(index);
                  setLightboxImage(index);
                }}
                className="group relative mb-4 block w-full overflow-hidden border border-[#D8C9B6]/25 bg-[#F2EFEA] text-left"
              >
                <img
                  src={image}
                  alt={`${title} ${index + 1}`}
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                    index % 5 === 0 ? "aspect-[4/5]" : index % 3 === 0 ? "aspect-[5/4]" : "aspect-[4/3]"
                  }`}
                />
                <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center bg-[#010101]/70 text-[#FAFAFA] opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                  <Expand size={15} />
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setLightboxImage(0)}
            className="mt-8 border border-[#D8C9B6] px-7 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#171716] transition-colors hover:bg-[#171716] hover:text-[#FAFAFA]"
          >
            {t("propertyDetail.viewFullGallery")}
          </button>
        </div>
      </section>

      <section className="editorial-bg-soft bg-[#F2EFEA] px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <button
            type="button"
            onClick={() => setLightboxImage(galleryImages.indexOf(outdoorImage))}
            className="group relative min-h-[420px] overflow-hidden border border-[#D8C9B6]/35 bg-[#FAFAFA] text-left md:min-h-[600px]"
          >
            <img src={outdoorImage} alt={t("propertyDetail.mediterraneanLifestyle")} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute bottom-5 left-5 flex items-center gap-2 bg-[#010101]/75 px-4 py-3 text-[9px] font-black uppercase tracking-[0.24em] text-[#FAFAFA] backdrop-blur-md">
              <Expand size={13} /> {t("propertyDetail.viewPhoto")}
            </span>
          </button>

          <div>
          <div className="mb-12 max-w-3xl">
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">{t("propertyDetail.lifestyleEyebrow")}</p>
            <h2 className="font-serif text-4xl italic leading-tight text-[#010101] md:text-6xl">{t("propertyDetail.mediterraneanLifestyle")}</h2>
          </div>

          {lifestyleItems.length > 0 ? (
            <div className="grid gap-px bg-[#D8C9B6]/35 md:grid-cols-2">
              {lifestyleItems.map((item) => (
                <div key={`${item.title}-${item.text}`} className="bg-[#F2EFEA] p-8">
                  <item.icon size={22} className="mb-8 text-[#D8C9B6]" />
                  <h3 className="mb-4 font-serif text-2xl italic text-[#010101]">{item.title}</h3>
                  <p className="text-sm leading-7 text-[#171716]/70">{item.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="max-w-2xl text-lg leading-8 text-[#171716]/70">{t("propertyDetail.lifestyleFallback")}</p>
          )}
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
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-5">
            <div className="border border-[#D8C9B6]/40 bg-[#F2EFEA] p-8 md:p-10">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#D8C9B6]">{t("propertyDetail.price")}</p>
              <p className="mb-8 font-serif text-4xl text-[#010101] md:text-5xl">{formattedPrice}</p>
              <div className="space-y-3">
                {brochureUrl && (
                  <a href={`/api/download-brochure?url=${encodeURIComponent(brochureUrl)}`} className="flex items-center justify-center gap-3 border border-[#171716] px-5 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#171716] transition-colors hover:bg-[#171716] hover:text-[#FAFAFA]">
                    <Download size={16} /> {t("propertyDetail.brochure")}
                  </a>
                )}
                {!isLight && (
                  <Link href={`/contact-cashback?Property_ID=${property.id_externe || property.id}`} className="flex items-center justify-center gap-3 bg-[#171716] px-5 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#FAFAFA] transition-colors hover:bg-[#010101]">
                    <ShieldCheck size={16} /> {t("propertyDetail.activateCashback")}
                  </Link>
                )}
                <a href={`https://wa.me/34627768233?text=Info ref: ${reference}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 border border-[#D8C9B6] bg-[#D8C9B6] px-5 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#010101] transition-colors hover:bg-[#FAFAFA]">
                  <MessageCircle size={17} /> {t("propertyDetail.whatsappDirect")}
                </a>
              </div>
            </div>
          </aside>
          <div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">{t("propertyDetail.expertEyebrow")}</p>
            <h2 className="mb-8 font-serif text-4xl italic text-[#010101] md:text-6xl">{t("propertyDetail.yourLocalExpert")}</h2>
            <ContactForm agency={currentAgency} propertyRef={property.id_externe || property.id} isLight />
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

      <Footer isLight />

      {lightboxImage !== null && (
        <div className="fixed inset-0 z-[200] bg-[#010101] text-[#FAFAFA]">
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
            onClick={() => setLightboxImage((lightboxImage - 1 + galleryImages.length) % galleryImages.length)}
            className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-[#FAFAFA]/20 bg-[#171716]/80 text-[#FAFAFA] backdrop-blur-md transition-colors hover:bg-[#D8C9B6] hover:text-[#010101]"
            aria-label={t("propertyDetail.previousImage")}
          >
            <ChevronLeft size={26} />
          </button>
          <img
            src={galleryImages[lightboxImage]}
            alt={`${title} ${lightboxImage + 1}`}
            className="h-full w-full object-contain"
          />
          <button
            type="button"
            onClick={() => setLightboxImage((lightboxImage + 1) % galleryImages.length)}
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
