"use client";

import React, { useEffect } from 'react';

export default function CashbackForm() {
  
  useEffect(() => {
    // Logique de capture de l'ID Propriété depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const propId = urlParams.get('Property_ID');
    const designationField = document.getElementById('Designation') as HTMLInputElement;
    
    if (propId && designationField) {
      designationField.value = propId;
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Simulation de la validation Zoho avant soumission
    const mndFileds = ['Company', 'Last Name', 'Email'];
    const fldLangVal = ['Prénom', 'Nom', 'E-mail'];
    const form = e.currentTarget;

    for (let i = 0; i < mndFileds.length; i++) {
      const field = form.elements.namedItem(mndFileds[i]) as HTMLInputElement;
      if (field && field.value.trim().length === 0) {
        alert(`${fldLangVal[i]} ne peut pas être vide.`);
        field.focus();
        e.preventDefault();
        return false;
      }
    }
    
    // Désactiver le bouton pour éviter les doubles soumissions
    const submitBtn = document.getElementById('formsubmit') as HTMLButtonElement;
    if (submitBtn) submitBtn.disabled = true;
  };

  return (
    <div 
      id='crmWebToEntityForm' 
      className='zcwf_lblLeft crmWebToEntityForm' 
      style={{
        backgroundColor: 'white', 
        color: '#1e293b', 
        maxWidth: '600px', 
        margin: '0 auto', 
        fontFamily: 'sans-serif',
        padding: '20px',
        borderRadius: '24px'
      }}
    >
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <meta httpEquiv='content-type' content='text/html;charset=UTF-8' />
      
      <style>{`
        .zcwf_title { 
            font-family: serif; 
            font-size: 28px; 
            color: #0f172a; 
            margin-bottom: 30px; 
            text-align: center; 
        }
        .zcwf_row { margin-bottom: 20px; clear: both; }
        .zcwf_col_lab { 
            font-size: 11px; 
            text-transform: uppercase; 
            letter-spacing: 0.1em; 
            font-weight: 700; 
            color: #64748b; 
            margin-bottom: 8px; 
            display: block;
        }
        .zcwf_col_fld input[type=text] {
            width: 100% !important;
            border: 1px solid #e2e8f0 !important;
            background-color: #f8fafc !important;
            padding: 14px !important;
            border-radius: 12px !important;
            font-size: 15px !important;
            transition: all 0.2s ease;
            outline: none;
        }
        .zcwf_col_fld input[type=text]:focus {
            border-color: #94a3b8 !important;
            background-color: #ffffff !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .formsubmit.zcwf_button {
            background: #0f172a !important;
            color: white !important;
            border: none !important;
            border-radius: 14px !important;
            padding: 16px 40px !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
            letter-spacing: 0.2em !important;
            font-size: 11px !important;
            cursor: pointer !important;
            width: 100%;
            margin-top: 10px;
            transition: transform 0.2s ease, background 0.2s ease !important;
        }
        .formsubmit.zcwf_button:hover {
            background: #1e293b !important;
            transform: translateY(-2px);
        }
        .wfrm_fld_dpNn { display: none !important; }
        @media (max-width: 600px) {
            #crmWebToEntityForm { padding: 10px; }
        }
      `}</style>

      <form 
        id='webform926137000000620001' 
        action='https://crm.zoho.eu/crm/WebToLeadForm' 
        name='WebToLeads926137000000620001' 
        method='POST' 
        onSubmit={handleSubmit}
        acceptCharset='UTF-8'
      >
        {/* Champs cachés Zoho */}
        <input type='text' style={{display:'none'}} name='xnQsjsdp' value='89dec12b0f4964ef48eb1146afdf728288b1067dc6b63cb582637ae5b06a02fb' readOnly />
        <input type='hidden' name='zc_gad' id='zc_gad' value='' />
        <input type='text' style={{display:'none'}} name='xmIwtLD' value='a31c3c626df8e3bd4a030929931d95f293b65e415d7072f7b6a8cb68d029701b7626c355eb89a4275cd16caebd9c7c40' readOnly />
        <input type='text' style={{display:'none'}} name='actionType' value='TGVhZHM=' readOnly />
        <input type='text' style={{display:'none'}} name='returnURL' value='https://blanca-calida-site.vercel.app/merci' readOnly />

        <div className='zcwf_title'>Activer mon Cashback</div>

        <div className='zcwf_row'>
          <div className='zcwf_col_lab'><label htmlFor='Company'>Prénom <span style={{color:'#ef4444'}}>*</span></label></div>
          <div className='zcwf_col_fld'><input type='text' id='Company' name='Company' maxLength={200} placeholder='Jean' /></div>
        </div>

        <div className='zcwf_row'>
          <div className='zcwf_col_lab'><label htmlFor='Last_Name'>Nom <span style={{color:'#ef4444'}}>*</span></label></div>
          <div className='zcwf_col_fld'><input type='text' id='Last_Name' name='Last Name' maxLength={80} placeholder='Dupont' /></div>
        </div>

        <div className='zcwf_row'>
          <div className='zcwf_col_lab'><label htmlFor='Email'>E-mail <span style={{color:'#ef4444'}}>*</span></label></div>
          <div className='zcwf_col_fld'><input type='text' id='Email' name='Email' maxLength={100} placeholder='jean@exemple.com' /></div>
        </div>

        <div className='zcwf_row'>
          <div className='zcwf_col_lab'><label htmlFor='Mobile'>Portable</label></div>
          <div className='zcwf_col_fld'><input type='text' id='Mobile' name='Mobile' maxLength={30} placeholder='+33 6 ...' /></div>
        </div>

        {/* Champ caché pour l'ID Propriété */}
        <div className='zcwf_row wfrm_fld_dpNn'>
          <div className='zcwf_col_fld'><input type='text' id='Designation' name='Designation' defaultValue='General_Interest' /></div>
        </div>

        <div className='zcwf_row'>
          <div className='zcwf_col_fld'>
            <input type='submit' id='formsubmit' className='formsubmit zcwf_button' value='Demander mon avantage' />
          </div>
        </div>
      </form>
    </div>
  );
}