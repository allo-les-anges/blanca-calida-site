"use client";
import React, { useEffect, useState } from "react";

export default function PropertyGrid({ activeFilters }) {
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProps, setFilteredProps] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalize = (v) =>
    typeof v === "string" ? v.trim().toLowerCase() : "";

  const getKindFromTitle = (p) =>
    p?.title ? p.title.split(" ")[0] : "";

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        setAllProperties(data);
        setFilteredProps(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Erreur chargement properties :", e);
        setLoading(false);
      });
  }, []);

  // --- FILTRAGE ---
  useEffect(() => {
    if (!allProperties.length) return;

    const result = allProperties.filter((p) => {
      const pTown = normalize(p.town);
      const pType = normalize(getKindFromTitle(p));
      const pRef = normalize(p.ref);
      const pPrice = Number(p.price);

      const fTown = normalize(activeFilters.town);
      const fType = normalize(activeFilters.type);
      const fRef = normalize(activeFilters.reference);
      const fDev = activeFilters.development;
      const availableOnly = activeFilters.availableOnly;

      if (fTown && pTown !== fTown) return false;
      if (fType && pType !== fType) return false;
      if (fDev && p.development_name !== fDev) return false;
      if (activeFilters.beds && p.features.beds < Number(activeFilters.beds))
        return false;
      if (activeFilters.minPrice && pPrice < Number(activeFilters.minPrice))
        return false;
      if (activeFilters.maxPrice && pPrice > Number(activeFilters.maxPrice))
        return false;
      if (fRef && !pRef.includes(fRef)) return false;
      if (availableOnly && p.availability !== "available") return false;

      return true;
    });

    setFilteredProps(result);
  }, [activeFilters, allProperties]);

  if (loading) return <div className="p-10 text-center">Chargement…</div>;

  // --- INFOS DU DÉVELOPPEMENT SÉLECTIONNÉ ---
  const selectedDev =
    activeFilters.development &&
    allProperties.find(
      (p) => p.development_name === activeFilters.development
    );

  return (
    <section className="max-w-7xl mx-auto px-6">

      {/* --- BLOC DÉVELOPPEMENT --- */}
      {selectedDev && (
        <div className="mb-10 p-6 bg-gray-50 border rounded-lg">
          <h2 className="text-3xl font-bold mb-1">
            {selectedDev.development_name}
          </h2>

          {selectedDev.development_location && (
            <p className="text-gray-600 mb-3">
              {selectedDev.development_location}
            </p>
          )}

          {selectedDev.development_description && (
            <p className="text-gray-700 mb-6">
              {selectedDev.development_description}
            </p>
          )}

          {selectedDev.development_images?.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {selectedDev.development_images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={selectedDev.development_name}
                  className="rounded-lg object-cover w-full h-32"
                />
              ))}
            </div>
          )}

          <p className="text-xs uppercase text-gray-500 font-bold">
            Unités disponibles :{" "}
            {
              filteredProps.filter(
                (p) => p.development_name === selectedDev.development_name
              ).length
            }
          </p>
        </div>
      )}

      {/* --- LISTE DES PROPRIÉTÉS FILTRÉES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {filteredProps.map((prop) => (
          <div key={prop.id} className="border p-4 rounded-lg shadow-sm">

            {/* IMAGE */}
            {prop.images?.[0] && (
              <img
                src={prop.images[0]}
                alt={prop.title}
                className="w-full h-40 object-cover mb-3 rounded"
              />
            )}

            {/* NOM DU DÉVELOPPEMENT */}
            <p className="text-xs uppercase text-gray-400 mb-1">
              {prop.development_name}
            </p>

            {/* TITRE */}
            <p className="font-bold text-lg">
              {prop.town} — {getKindFromTitle(prop)}
            </p>

            <p className="text-sm text-gray-600 mt-1">{prop.title}</p>

            {/* PRIX */}
            <p className="mt-2 font-semibold text-xl">
              {prop.price.toLocaleString()} €
            </p>

            {/* FEATURES */}
            <p className="text-xs text-gray-500 mt-1">
              {prop.features.beds} ch · {prop.features.baths} sdb ·{" "}
              {prop.features.surface} m²
            </p>

            {/* RÉFÉRENCE */}
            <p className="text-[10px] uppercase text-gray-400 mt-2">
              Ref : {prop.ref}
            </p>

            {/* DISPONIBILITÉ */}
            <p
              className={`text-[10px] uppercase mt-1 font-bold ${
                prop.availability === "available"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {prop.availability === "available"
                ? "Disponible"
                : "Non disponible"}
            </p>

            {/* LIEN VERS LE DÉVELOPPEMENT */}
            <a
              href={`/developpement/${prop.development_id}`}
              className="mt-3 inline-block text-xs uppercase font-bold text-blue-600 hover:underline"
            >
              Voir le développement →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
