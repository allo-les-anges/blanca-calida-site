"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function DevelopmentPage() {
  const { id } = useParams(); // ID du développement
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        setProperties(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center">Chargement…</div>;

  // Toutes les unités de ce développement
  const devUnits = properties.filter(
    (p) => String(p.development_id) === String(id)
  );

  if (devUnits.length === 0)
    return (
      <div className="p-10 text-center">
        Aucun développement trouvé pour l’ID {id}
      </div>
    );

  // Infos générales du développement (identiques pour toutes les unités)
  const dev = devUnits[0];

  const availableUnits = devUnits.filter((u) => u.availability === "available");
  const soldUnits = devUnits.filter((u) => u.availability !== "available");

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* TITRE DU DÉVELOPPEMENT */}
      <h1 className="text-4xl font-bold mb-2">{dev.development_name}</h1>
      <p className="text-gray-600 mb-6">{dev.development_location}</p>

      {/* DESCRIPTION */}
      {dev.development_description && (
        <p className="text-lg text-gray-700 mb-10">
          {dev.development_description}
        </p>
      )}

      {/* IMAGES DU DÉVELOPPEMENT */}
      {dev.development_images?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {dev.development_images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={dev.development_name}
              className="rounded-lg object-cover w-full h-40"
            />
          ))}
        </div>
      )}

      {/* UNITÉS DISPONIBLES */}
      <h2 className="text-2xl font-bold mb-4">
        Unités disponibles ({availableUnits.length})
      </h2>

      {availableUnits.length === 0 && (
        <p className="text-gray-500 mb-10">Aucune unité disponible.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
        {availableUnits.map((unit) => (
          <div key={unit.id} className="border rounded-lg p-4 shadow-sm">
            {unit.images?.[0] && (
              <img
                src={unit.images[0]}
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}

            <h3 className="font-bold text-lg mb-1">{unit.title}</h3>
            <p className="text-gray-600 mb-2">{unit.town}</p>

            <p className="font-semibold text-xl mb-2">
              {unit.price.toLocaleString()} €
            </p>

            <p className="text-sm text-gray-500 mb-1">
              {unit.features.beds} ch · {unit.features.baths} sdb ·{" "}
              {unit.features.surface} m²
            </p>

            <p className="text-xs text-gray-400">Ref : {unit.ref}</p>

            <p className="text-green-600 text-xs font-bold mt-2 uppercase">
              Disponible
            </p>
          </div>
        ))}
      </div>

      {/* UNITÉS VENDUES */}
      <h2 className="text-2xl font-bold mb-4">
        Unités vendues ({soldUnits.length})
      </h2>

      {soldUnits.length === 0 && (
        <p className="text-gray-500">Aucune unité vendue.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {soldUnits.map((unit) => (
          <div key={unit.id} className="border rounded-lg p-4 opacity-60">
            {unit.images?.[0] && (
              <img
                src={unit.images[0]}
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}

            <h3 className="font-bold text-lg mb-1">{unit.title}</h3>
            <p className="text-gray-600 mb-2">{unit.town}</p>

            <p className="font-semibold text-xl mb-2">
              {unit.price.toLocaleString()} €
            </p>

            <p className="text-sm text-gray-500 mb-1">
              {unit.features.beds} ch · {unit.features.baths} sdb ·{" "}
              {unit.features.surface} m²
            </p>

            <p className="text-xs text-gray-400">Ref : {unit.ref}</p>

            <p className="text-red-600 text-xs font-bold mt-2 uppercase">
              Non disponible
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
