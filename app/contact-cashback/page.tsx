"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";

export default function ContactCashback() {
  const { t } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get("Property_ID");
    const idField = document.getElementById("Designation") as HTMLInputElement;
    if (idField && propertyId) {
      idField.value = propertyId;
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-8 uppercase text-[10px] tracking-widest font-bold transition-colors">
          <ArrowLeft size={14} /> {t('contactCashback.back')}
        </Link>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100">
          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-serif text-slate-900 mb-2">{t('contactCashback.title')}</h1>
            <p className="text-slate-500 text-sm">{t('contactCashback.description')}</p>
          </div>

          {/* FORMULAIRE ZOHO */}
          <div id="crmWebToEntityForm" className="zcwf_lblLeft crmWebToEntityForm">
            <form id="webform926137000000620001" action="https://crm.zoho.eu/crm/WebToLeadForm" name="WebToLeads926137000000620001" method="POST" acceptCharset="UTF-8" className="space-y-4">
              <input type="text" style={{ display: 'none' }} name="xnQsjsdp" value="89dec12b0f4964ef48eb1146afdf728288b1067dc6b63cb582637ae5b06a02fb" />
              <input type="hidden" name="zc_gad" id="zc_gad" value="" />
              <input type="text" style={{ display: 'none' }} name="xmIwtLD" value="a31c3c626df8e3bd4a030929931d95f293b65e415d7072f7b6a8cb68d029701b7626c355eb89a4275cd16caebd9c7c40" />
              <input type="text" style={{ display: 'none' }} name="actionType" value="TGVhZHM=" />
              <input type="text" style={{ display: 'none' }} name="returnURL" value="https://blanca-calida-site.vercel.app/merci" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">{t('contactCashback.firstName')}</label>
                  <input type="text" name="Company" required className="w-full px-5 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">{t('contactCashback.lastName')}</label>
                  <input type="text" name="Last Name" required className="w-full px-5 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:border-emerald-500 transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">{t('contactCashback.email')}</label>
                <input type="email" name="Email" required className="w-full px-5 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:border-emerald-500 transition-colors" />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">{t('contactCashback.phone')}</label>
                <input type="text" name="Mobile" className="w-full px-5 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:border-emerald-500 transition-colors" />
              </div>

              <input type="hidden" id="Designation" name="Designation" value="General_Interest" />

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-emerald-600 transition-all mt-6 shadow-lg shadow-slate-900/10">
                {t('contactCashback.submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}