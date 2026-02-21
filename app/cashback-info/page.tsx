import Link from 'next/link';
import { Gift, ShieldCheck, PieChart, ArrowRight } from 'lucide-react';

export default function CashbackInfo() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-serif text-slate-900 mb-6">Le Programme Cashback</h1>
        <p className="text-xl text-slate-500 mb-16 leading-relaxed">
          Nous réinventons l'immobilier de luxe en partageant nos commissions avec vous. 
          Investissez intelligemment, récupérez une partie de votre capital dès la signature.
        </p>

        <div className="grid md:grid-cols-3 gap-12 mb-20">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><Gift /></div>
            <h3 className="font-bold uppercase text-[11px] tracking-widest">Récompense Directe</h3>
            <p className="text-sm text-slate-500">Recevez un pourcentage de la commission d'agence directement sur votre compte.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><ShieldCheck /></div>
            <h3 className="font-bold uppercase text-[11px] tracking-widest">Totalement Légal</h3>
            <p className="text-sm text-slate-500">Un processus transparent, contractualisé et validé par nos conseillers juridiques.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><PieChart /></div>
            <h3 className="font-bold uppercase text-[11px] tracking-widest">Optimisation</h3>
            <p className="text-sm text-slate-500">Utilisez ce cashback pour vos frais de notaire ou l'aménagement de votre nouvelle villa.</p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-12 text-center text-white">
          <h2 className="text-3xl font-serif mb-6">Prêt à en profiter ?</h2>
          <p className="text-slate-400 mb-10">Remplissez le formulaire pour recevoir une simulation personnalisée.</p>
          <a 
            href="https://forms.zohopublic.com/VOTRE_LIEN_ZOHO" 
            className="inline-flex items-center gap-3 bg-emerald-600 text-white px-10 py-5 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-emerald-700 transition-all"
          >
            Ouvrir le formulaire <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}