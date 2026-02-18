"use client";

import { useEffect, useState, use } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Bed,
  Bath,
  Maximize,
  MapPin,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function PropertyDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    async function fetchProperty() {
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        const found = data.find((p: any) => String(p.id) === String(id));
        if (found) setProperty(found);
      } catch (err) {
        console.error("Erreur detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6">
        <p className="font-serif text-3xl text-brand-primary">
          Propriété introuvable
        </p>
        <Link
          href="/"
          className="px-8 py-3 bg-brand-primary text-white text-[10px] uppercase tracking-widest font-bold"
        >
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  // --- DÉFINIR LES IMAGES AVANT LES useEffect ---
  const images: string[] = property.images ?? [];
  const beds = property.beds ?? "—";
  const baths = property.baths ?? "—";
  const built = property.surface_area?.built ?? "—";
  const useful = property.surface_area?.useful ?? built;

  // --- RESET SLIDER QUAND LA PROPRIÉTÉ CHANGE ---
  useEffect(() => {
    setActiveImage(0);
    setImageLoaded(false);
  }, [property]);

  // --- FORCE IMAGE LOAD EVEN IF CACHED ---
  useEffect(() => {
    if (!images || images.length === 0) return;

    setImageLoaded(false);

    const img = new Image();
    img.src = images[activeImage];
    img.onload = () => setImageLoaded(true);
  }, [activeImage, images]);
