"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialisation du client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TestDBPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Lecture de la table PROFILES
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("*");
        
        // Lecture de la table STAFF
        const { data: staffData } = await supabase
          .from("staff_prestataires")
          .select("*");

        if (profilesData) setProfiles(profilesData);
        if (staffData) setStaff(staffData);
      } catch (error) {
        console.error("Erreur de récupération:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-10 text-white bg-[#020617] min-h-screen">Chargement des tables...</div>;
  }

  return (
    <div className="min-h-screen bg-[#020617] p-10 text-white font-sans text-left">
      <h1 className="text-2xl font-black mb-8 text-emerald-500 uppercase">Inspecteur de Tables Supabase</h1>

      {/* SECTION TABLE PROFILES */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
          Table: profiles
        </h2>
        <div className="overflow-x-auto border border-white/10 rounded-2xl bg-[#0F172A]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-slate-400">
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Rôle</th>
                <th className="p-4 text-left">Nom/Prénom</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {profiles && profiles.length > 0 ? (
                profiles.map((p, i) => (
                  <tr key={`profile-${i}`} className="hover:bg-white/[0.02]">
                    <td className="p-4 text-emerald-400">{p.email}</td>
                    <td className="p-4 font-mono font-bold text-rose-400">"{p.role}"</td>
                    <td className="p-4">{p.prenom} {p.nom}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="p-4 text-slate-500">Aucune donnée ou RLS activé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION TABLE STAFF */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
          Table: staff_prestataires
        </h2>
        <div className="overflow-x-auto border border-white/10 rounded-2xl bg-[#0F172A]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-slate-400">
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">PIN</th>
                <th className="p-4 text-left">Rôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {staff && staff.length > 0 ? (
                staff.map((s, i) => (
                  <tr key={`staff-${i}`} className="hover:bg-white/[0.02]">
                    <td className="p-4 text-emerald-400">{s.email}</td>
                    <td className="p-4 font-mono font-bold">{s.pin_code}</td>
                    <td className="p-4 text-orange-400">{s.role}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="p-4 text-slate-500">Aucune donnée ou RLS activé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}