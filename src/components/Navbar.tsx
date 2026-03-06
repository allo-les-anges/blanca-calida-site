"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Globe,
  ChevronDown,
  Menu,
  X,
  User,
  Search,
  Home,
  MapPin,
  Euro,
  BedDouble,
  ShieldCheck,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  /* ------------------- STATES ------------------- */

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const [currentLang, setCurrentLang] = useState("FR");

  const [passwordInput, setPasswordInput] = useState("");
  const [user, setUser] = useState(null);
  const [clientPin, setClientPin] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  /* ------------------- FILTRES ------------------- */

  const [maxPrice, setMaxPrice] = useState(2500000);
  const [propertyType, setPropertyType] = useState(null);
  const [bedrooms, setBedrooms] = useState(null);
  const [region, setRegion] = useState("Espagne (Toutes)");

  const langMenuRef = useRef(null);

  const regions = [
    { name: "Costa Blanca", slug: "costa-blanca" },
    { name: "Costa Calida", slug: "costa-calida" },
    { name: "Costa Almeria", slug: "costa-almeria" },
    { name: "Costa del Sol", slug: "costa-del-sol" },
  ];

  const languages = [
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "nl", label: "Nederlands" },
  ];

  /* ------------------- EFFETS ------------------- */

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchModalOpen(false);
    setIsLoginModalOpen(false);
  }, [pathname]);

  /* ------------------- GOOGLE TRANSLATE ------------------- */

  const changeLanguage = (langCode) => {
    const select = document.querySelector(".goog-te-combo");

    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));
      setCurrentLang(langCode.toUpperCase());
      setShowLangMenu(false);
    }
  };

  /* ------------------- LOGIN PIN ------------------- */

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);

    const { data } = await supabase
      .from("suivi_chantier")
      .select("pin_code")
      .eq("pin_code", passwordInput)
      .maybeSingle();

    if (data) {
      localStorage.setItem("client_access_pin", data.pin_code);
      setClientPin(data.pin_code);
      setIsLoginModalOpen(false);
      setPasswordInput("");
      router.push("/project-tracker");
    } else {
      alert("Code PIN incorrect.");
    }

    setAuthLoading(false);
  };

  /* ------------------- APPLIQUER FILTRES ------------------- */

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (propertyType) params.append("type", propertyType);
    if (bedrooms) params.append("bedrooms", bedrooms.toString());
    if (maxPrice) params.append("maxPrice", maxPrice.toString());
    if (region && region !== "Espagne (Toutes)")
      params.append("region", region);

    router.push(`/proprietes?${params.toString()}`);

    setIsSearchModalOpen(false);
  };

  /* ------------------- RESET FILTRES ------------------- */

  const resetFilters = () => {
    setPropertyType(null);
    setBedrooms(null);
    setMaxPrice(2500000);
    setRegion("Espagne (Toutes)");
  };

  /* ------------------- UI ------------------- */

  return (
    <>
      <style jsx global>{`
        input[type="range"] {
          -webkit-appearance: none;
        }

        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 22px;
          height: 22px;
          background: #d4af37;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
      `}</style>

      {/* NAVBAR */}

      <nav
        className={`fixed w-full top-0 z-[100] transition-all duration-700 h-24 flex items-center ${
          isScrolled
            ? "bg-[#020617] shadow-xl border-b border-white/5"
            : "bg-transparent backdrop-blur-sm"
        }`}
      >
        <div className="max-w-[1600px] w-full mx-auto px-6 md:px-10 flex justify-between items-center">
          <Link href="/" className="flex flex-col">
            <span className="text-3xl font-serif italic text-white">
              Amaru
            </span>
            <span className="text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase">
              Excellence
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="lg:hidden p-3 bg-white/10 rounded-full text-[#D4AF37]"
            >
              <Search size={20} />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-white"
            >
              <Menu size={28} />
            </button>

            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="hidden md:flex items-center space-x-2 px-6 py-3 rounded-full border border-white/20 bg-white/10 text-white"
            >
              <User size={14} /> <span>Accès Client</span>
            </button>
          </div>
        </div>
      </nav>

      {/* SEARCH MODAL */}

      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsSearchModalOpen(false)}
          />

          <div className="relative bg-[#F8FAFC] w-full sm:max-w-lg sm:rounded-[2.5rem] rounded-t-[2.5rem] flex flex-col max-h-[92vh]">

            {/* HEADER */}

            <div className="bg-white px-8 py-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-serif italic">Recherche</h3>

              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            {/* CONTENU */}

            <div className="p-8 overflow-y-auto space-y-8 pb-40">

              {/* REGION */}

              <div>
                <label className="text-xs uppercase text-slate-400">
                  Région
                </label>

                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full mt-2 border px-4 py-3 rounded-xl"
                >
                  <option>Espagne (Toutes)</option>

                  {regions.map((r) => (
                    <option key={r.slug}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* TYPE */}

              <div>

                <label className="text-xs uppercase text-slate-400">
                  Type
                </label>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  {["Villa", "Appartement", "Terrain", "Penthouse"].map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => setPropertyType(type)}
                        className={`py-3 rounded-xl border text-xs font-bold transition-all
                        ${
                          propertyType === type
                            ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                            : "border-slate-200"
                        }`}
                      >
                        {type}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* CHAMBRES */}

              <div>

                <label className="text-xs uppercase text-slate-400">
                  Chambres
                </label>

                <div className="flex gap-2 mt-3">
                  {[1, 2, 3, 4, "5+"].map((n) => (
                    <button
                      key={n}
                      onClick={() => setBedrooms(n)}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition
                      ${
                        bedrooms === n
                          ? "bg-slate-900 text-[#D4AF37]"
                          : "bg-white"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* BUDGET */}

              <div>

                <div className="flex justify-between">
                  <label className="text-xs uppercase text-slate-400">
                    Budget Max
                  </label>

                  <span className="font-serif">
                    {maxPrice.toLocaleString()} €
                  </span>
                </div>

                <input
                  type="range"
                  min="100000"
                  max="5000000"
                  step="50000"
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(parseInt(e.target.value))
                  }
                  className="w-full mt-4"
                />

                <div className="flex justify-between text-xs text-slate-400">
                  <span>100k</span>
                  <span>5M+</span>
                </div>
              </div>

            </div>

            {/* FOOTER FIXE */}

            <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t flex gap-3">

              <button
                onClick={resetFilters}
                className="px-6 py-4 border rounded-xl text-xs font-bold"
              >
                Reset
              </button>

              <button
                onClick={applyFilters}
                className="flex-1 bg-slate-900 text-white py-4 rounded-xl text-xs font-bold"
              >
                Afficher les résultats
              </button>

            </div>

          </div>
        </div>
      )}

      {/* LOGIN MODAL */}

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80">

          <div className="bg-[#0f172a] w-full max-w-sm rounded-3xl p-10">

            <form onSubmit={handleAuthSubmit} className="space-y-4">

              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Code PIN"
                className="w-full px-6 py-4 rounded-xl text-center"
              />

              <button
                type="submit"
                className="w-full bg-[#D4AF37] py-4 rounded-xl font-bold"
              >
                {authLoading ? "Validation..." : "Se connecter"}
              </button>

            </form>

          </div>

        </div>
      )}
    </>
  );
}