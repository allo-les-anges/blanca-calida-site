import Link from 'next/link';
import { Gift, ShieldCheck, PieChart, ArrowLeft, Sofa, Banknote, CheckCircle2, Home } from 'lucide-react';

export default function CashbackInfo() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Fil d'ariane / Retour */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-12 uppercase text-[10px] tracking-widest font-bold"
        >
          <ArrowLeft size={14} /> Retour à l'accueil
        </Link>

        <h1 className="text-5xl font-serif text-slate-900 mb-6">Le Programme Cashback</h1>
        <p className="text-xl text-slate-500 mb-16 leading-relaxed">
          Nous réinventons l'immobilier de luxe en transformant une partie du capital de la transaction en avantage direct pour vous. 
          Investissez intelligemment, récupérez de la valeur dès la signature.
        </p>

        {/* --- SECTION EXEMPLE CONCRET --- */}
        <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-12 mb-20 border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold text-emerald-600 mb-2">Exemple de simulation</h2>
              <p className="text-2xl font-serif text-slate-900">Villa de prestige à 1 500 000 €</p>
            </div>
            <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-1">Votre Avantage</span>
              <span className="text-3xl font-bold text-emerald-600">15 000 €*</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-emerald-500 mt-1" size={18} />
              <p className="text-sm text-slate-600">Montant disponible dès la signature de l'acte authentique.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-emerald-500 mt-1" size={18} />
              <p className="text-sm text-slate-600">Aucun frais administratif supplémentaire pour l'acquéreur.</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-8 italic">*Ce montant est donné à titre indicatif et varie selon les propriétés et les accords spécifiques.</p>
        </div>

        {/* --- GRILLE D'AVANTAGES --- */}
        <div className="grid md:grid-cols-3 gap-12 mb-20">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><Banknote /></div>
            <h3 className="font-bold uppercase text-[11px] tracking-widest">Versement Cash</h3>
            <p className="text-sm text-slate-500">Un virement bancaire direct pour booster votre apport ou couvrir vos frais annexes.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><Sofa /></div>
            <h3 className="font-bold uppercase text-[11px] tracking-widest">Mobilier & Déco</h3>
            <p className="text-sm text-slate-500">Transformez votre cashback en crédit pour l'aménagement complet (mobilier de designer, cuisine d'été, etc.).</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><ShieldCheck /></div>
            <h3 className="font-bold uppercase text-[11px] tracking-widest">Totalement Légal</h3>
            <p className="text-sm text-slate-500">Un processus transparent, contractualisé et validé par nos conseillers juridiques.</p>
          </div>
        </div>

        {/* Section FAQ / Info */}
        <div className="border-t border-slate-100 pt-16">
            <h2 className="text-3xl font-serif mb-8 text-slate-900">Comment en bénéficier ?</h2>
            <div className="space-y-6 text-slate-500 mb-12">
              <p>
                Le programme Cashback est une exclusivité **Luxury Estates**. Il est activé dès lors que vous manifestez votre intérêt via le bouton "Réclamer mon Cashback" sur la fiche d'une propriété.
              </p>
              <p>
                Vous avez la liberté de choisir la forme de votre avantage : que ce soit pour financer vos frais de notaire ou équiper votre nouveau salon avec du mobilier haut de gamme, nous adaptons le versement à votre projet.
              </p>
            </div>

            {/* BOUTON RETOUR HOME PAGE */}
            <Link 
                href="/" 
                className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
            >
                <Home size={16} />
                Retour à l'accueil
            </Link>
        </div>
      </div>
    </div>
  );
}