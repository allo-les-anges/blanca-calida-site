import Link from 'next/link';
import { Gift, ShieldCheck, PieChart, ArrowLeft } from 'lucide-react';

export default function CashbackInfo() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Fil d'ariane / Retour */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-12 uppercase text-[10px] tracking-widest font-bold"
        >
          <ArrowLeft size={14} /> Retour à la collection
        </Link>

        <h1 className="text-5xl font-serif text-slate-900 mb-6">Le Programme Cashback</h1>
        <p className="text-xl text-slate-500 mb-16 leading-relaxed">
          Nous réinventons l'immobilier de luxe en partageant nos commissions avec vous. 
          Investissez intelligemment, récupérez une partie de votre capital dès la signature.
        </p>

        <div className="grid md:grid-cols-3 gap-12 mb-20">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><Gift /></div>
            <h3 className="font-bold uppercase text-[11px] tracking-widest">Récompense Directe</h3>
            <p className="text-sm text-slate-500">Recevez un pourcentage de la commission d'agence directement sur votre compte à la clôture de la vente.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><ShieldCheck /></div>
            <h3 className="font-bold uppercase text-[11px] tracking-widest">Totalement Légal</h3>
            <p className="text-sm text-slate-500">Un processus transparent, contractualisé et validé par nos conseillers juridiques en Espagne.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><PieChart /></div>
            <h3 className="font-bold uppercase text-[11px] tracking-widest">Optimisation</h3>
            <p className="text-sm text-slate-500">Utilisez ce capital pour couvrir vos frais de notaire ou financer l'aménagement de votre nouvelle villa.</p>
          </div>
        </div>

        {/* Section FAQ / Info */}
        <div className="border-t border-slate-100 pt-16">
            <h2 className="text-2xl font-serif mb-8 text-slate-900">Comment en bénéficier ?</h2>
            <p className="text-slate-500 mb-6">
                Le programme Cashback est exclusivement réservé aux clients ayant activé leur avantage via le formulaire présent sur chaque fiche propriété de notre catalogue.
            </p>
            <p className="text-slate-500 mb-12">
                Une fois votre intérêt manifesté pour une villa spécifique, notre équipe calcule votre simulation de remboursement personnalisée basée sur le prix de vente final.
            </p>

            <Link 
                href="/" 
                className="inline-block bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-slate-800 transition-all"
            >
                Explorer les propriétés
            </Link>
        </div>
      </div>
    </div>
  );
}