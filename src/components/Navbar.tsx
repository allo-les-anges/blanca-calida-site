"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Globe, Menu, X, User, Search,
  ShieldCheck, MapPin, Euro, BedDouble, Home
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

/* ---------------- SUPABASE FIX ---------------- */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables missing");
}

const supabase = createBrowserClient(supabaseUrl, supabaseKey);

/* ---------------- COMPONENT ---------------- */

export default function Navbar() {

  const router = useRouter();
  const pathname = usePathname();

  /* ---------------- STATES ---------------- */

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const [currentLang, setCurrentLang] = useState("FR");
  const [passwordInput, setPasswordInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [clientPin, setClientPin] = useState<string | null>(null);

  const [isScrolled, setIsScrolled] = useState(false);

  const [maxPrice, setMaxPrice] = useState(2500000);
  const [bedrooms, setBedrooms] = useState<number | string | null>(null);

  const langMenuRef = useRef<HTMLDivElement>(null);

  /* ---------------- DATA ---------------- */

  const regions = [
    { name: "Costa Blanca", slug: "costa-blanca" },
    { name: "Costa Calida", slug: "costa-calida" },
    { name: "Costa Almeria", slug: "costa-almeria" },
    { name: "Costa del Sol", slug: "costa-del-sol" }
  ];

  const languages = [
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "nl", label: "Nederlands" }
  ];

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  useEffect(() => {

    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };

    checkUser();

    const savedPin = localStorage.getItem("client_access_pin");

    if (savedPin) setClientPin(savedPin);

  }, []);

  useEffect(() => {

    setIsMobileMenuOpen(false);
    setIsSearchModalOpen(false);
    setIsLoginModalOpen(false);

  }, [pathname]);

  /* ---------------- LANGUAGE ---------------- */

  const changeLanguage = (langCode: string) => {

    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;

    if (select) {

      select.value = langCode;

      select.dispatchEvent(new Event("change"));

      setCurrentLang(langCode.toUpperCase());

      setShowLangMenu(false);

    }

  };

  /* ---------------- LOGIN ---------------- */

  const handleAuthSubmit = async (e: React.FormEvent) => {

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

      router.push("/project-tracker");

      setIsLoginModalOpen(false);

      setPasswordInput("");

    } else {

      alert("Code PIN incorrect");

    }

    setAuthLoading(false);

  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <nav
        className={`fixed w-full top-0 z-50 transition-all duration-500 h-24 flex items-center ${
          isScrolled
            ? "bg-[#020617] border-b border-white/5 shadow-xl"
            : "bg-transparent backdrop-blur-sm"
        }`}
      >
        <div className="max-w-[1600px] mx-auto w-full px-6 flex justify-between items-center">

          {/* LOGO */}

          <Link href="/" className="flex flex-col">

            <span className="text-3xl italic text-white font-serif">
              Amaru
            </span>

            <span className="text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase">
              Excellence
            </span>

          </Link>

          {/* ACTIONS */}

          <div className="flex items-center gap-4">

            {/* LANGUAGE */}

            <div className="relative hidden md:block" ref={langMenuRef}>

              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 text-white text-xs"
              >
                <Globe size={14} />
                {currentLang}
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-3 bg-[#020617] border border-white/10 rounded-xl p-2">

                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => changeLanguage(l.code)}
                      className="block w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-[#D4AF37]"
                    >
                      {l.label}
                    </button>
                  ))}

                </div>
              )}

            </div>

            {/* SEARCH */}

            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="p-3 bg-white/10 rounded-full text-[#D4AF37]"
            >
              <Search size={20} />
            </button>

            {/* MOBILE MENU */}

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-white"
            >
              <Menu size={28} />
            </button>

            {/* LOGIN */}

            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="hidden md:flex items-center gap-2 border border-white/20 px-6 py-3 rounded-full text-white text-xs"
            >
              <User size={14} />
              Accès Client
            </button>

          </div>
        </div>
      </nav>

      {/* ---------------- SEARCH MODAL ---------------- */}

      {isSearchModalOpen && (

        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">

          <div
            className="absolute inset-0 bg-black/80 backdrop-blur"
            onClick={() => setIsSearchModalOpen(false)}
          />

          <div className="relative bg-[#F8FAFC] w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-[2rem] flex flex-col max-h-[90vh]">

            {/* HEADER */}

            <div className="bg-white px-8 py-6 border-b flex justify-between">

              <h3 className="text-xl italic font-serif">
                Recherche
              </h3>

              <button
                onClick={() => setIsSearchModalOpen(false)}
              >
                <X size={22} />
              </button>

            </div>

            {/* CONTENT */}

            <div className="p-8 overflow-y-auto space-y-8 pb-32">

              {/* REGION */}

              <div>

                <label className="text-xs uppercase text-slate-400 flex gap-2 mb-2">

                  <MapPin size={14} /> Région

                </label>

                <select className="w-full border rounded-xl px-4 py-3">

                  <option>Espagne (Toutes)</option>

                  {regions.map((r) => (
                    <option key={r.slug}>{r.name}</option>
                  ))}

                </select>

              </div>

              {/* BEDROOMS */}

              <div>

                <label className="text-xs uppercase text-slate-400 flex gap-2 mb-2">

                  <BedDouble size={14} /> Chambres

                </label>

                <div className="flex gap-2">

                  {[1, 2, 3, 4, "5+"].map((n) => (

                    <button
                      key={n}
                      onClick={() => setBedrooms(n)}
                      className={`flex-1 py-3 rounded-xl border ${
                        bedrooms === n
                          ? "bg-[#D4AF37] text-black"
                          : "bg-white"
                      }`}
                    >
                      {n}
                    </button>

                  ))}

                </div>

              </div>

              {/* PRICE */}

              <div>

                <div className="flex justify-between mb-2">

                  <span className="text-xs uppercase text-slate-400 flex gap-2">
                    <Euro size={14} /> Budget Max
                  </span>

                  <span className="font-serif text-lg">
                    {maxPrice.toLocaleString()} €
                  </span>

                </div>

                <input
                  type="range"
                  min="100000"
                  max="5000000"
                  step="50000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full"
                />

              </div>

            </div>

            {/* FOOTER */}

            <div className="absolute bottom-0 w-full p-6 bg-white border-t">

              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-xl"
              >
                Afficher les résultats
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );

}