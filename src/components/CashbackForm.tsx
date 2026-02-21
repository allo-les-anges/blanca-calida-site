<div id='crmWebToEntityForm' class='zcwf_lblLeft crmWebToEntityForm' style='background-color: white; color: #1e293b; max-width: 600px; margin: 0 auto; font-family: sans-serif;'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <meta http-equiv='content-type' content='text/html;charset=UTF-8'>
    
    <form id='webform926137000000620001' action='https://crm.zoho.eu/crm/WebToLeadForm' name='WebToLeads926137000000620001' method='POST' onSubmit='javascript:document.charset="UTF-8"; return checkMandatory926137000000620001()' accept-charset='UTF-8'>
        
        <input type='text' style='display:none;' name='xnQsjsdp' value='89dec12b0f4964ef48eb1146afdf728288b1067dc6b63cb582637ae5b06a02fb'>
        <input type='hidden' name='zc_gad' id='zc_gad' value=''>
        <input type='text' style='display:none;' name='xmIwtLD' value='a31c3c626df8e3bd4a030929931d95f293b65e415d7072f7b6a8cb68d029701b7626c355eb89a4275cd16caebd9c7c40'>
        <input type='text' style='display:none;' name='actionType' value='TGVhZHM='>
        <input type='text' style='display:none;' name='returnURL' value='https://blanca-calida-site.vercel.app/merci'>

        <style>
            /* Reset & Container */
            #crmWebToEntityForm { padding: 20px; border-radius: 24px; }
            .zcwf_title { 
                font-family: serif; 
                font-size: 28px; 
                color: #0f172a; 
                margin-bottom: 30px; 
                text-align: center; 
            }

            /* Rows & Labels */
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

            /* Inputs Style */
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

            /* Button Style */
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

            /* Hide unwanted Reset button & Property ID field */
            .zcwf_button[type=reset] { display: none !important; }
            .wfrm_fld_dpNn { display: none !important; }

            @media (max-width: 600px) {
                #crmWebToEntityForm { padding: 10px; }
            }
        </style>

        <div class='zcwf_title'>Activer mon Cashback</div>

        <div class='zcwf_row'>
            <div class='zcwf_col_lab'><label for='Company'>Prénom <span style='color:#ef4444;'>*</span></label></div>
            <div class='zcwf_col_fld'><input type='text' id='Company' name='Company' maxlength='200' placeholder='Jean'></div>
        </div>

        <div class='zcwf_row'>
            <div class='zcwf_col_lab'><label for='Last_Name'>Nom <span style='color:#ef4444;'>*</span></label></div>
            <div class='zcwf_col_fld'><input type='text' id='Last_Name' name='Last Name' maxlength='80' placeholder='Dupont'></div>
        </div>

        <div class='zcwf_row'>
            <div class='zcwf_col_lab'><label for='Email'>E-mail <span style='color:#ef4444;'>*</span></label></div>
            <div class='zcwf_col_fld'><input type='text' ftype='email' id='Email' name='Email' maxlength='100' placeholder='jean@exemple.com'></div>
        </div>

        <div class='zcwf_row'>
            <div class='zcwf_col_lab'><label for='Mobile'>Portable</label></div>
            <div class='zcwf_col_fld'><input type='text' id='Mobile' name='Mobile' maxlength='30' placeholder='+33 6 ...'></div>
        </div>

        <div class='zcwf_row wfrm_fld_dpNn'>
            <div class='zcwf_col_fld'><input type='text' id='Designation' name='Designation' value='General_Interest'></div>
        </div>

        <div class='zcwf_row'>
            <div class='zcwf_col_fld'>
                <input type='submit' id='formsubmit' class='formsubmit zcwf_button' value='Demander mon avantage'>
            </div>
        </div>

        <script>
            function validateEmail926137000000620001(){
                var form = document.forms['WebToLeads926137000000620001'];
                var emailFld = form.querySelectorAll('[ftype=email]');
                for(var i=0; i<emailFld.length; i++){
                    var emailVal = emailFld[i].value;
                    if(emailVal.replace(/^\s+|\s+$/g,'').length!=0){
                        var atpos=emailVal.indexOf('@');
                        var dotpos=emailVal.lastIndexOf('.');
                        if(atpos<1||dotpos<atpos+2||dotpos+2>=emailVal.length){
                            alert('Veuillez entrer une adresse e-mail valide.');
                            emailFld[i].focus();
                            return false;
                        }
                    }
                }
                return true;
            }

            function checkMandatory926137000000620001(){
                var mndFileds = new Array('Company', 'Last Name', 'Email');
                var fldLangVal = new Array('Prénom', 'Nom', 'E-mail');
                for(var i=0; i<mndFileds.length; i++){
                    var fieldObj = document.forms['WebToLeads926137000000620001'][mndFileds[i]];
                    if(fieldObj){
                        if((fieldObj.value).replace(/^\s+|\s+$/g,'').length==0){
                            alert(fldLangVal[i] + ' ne peut pas être vide.');
                            fieldObj.focus();
                            return false;
                        }
                    }
                }
                if(!validateEmail926137000000620001()){ return false; }
                document.querySelector('.crmWebToEntityForm .formsubmit').setAttribute('disabled', true);
            }

            // CAPTURE DE L'ID PROPRIÉTÉ DEPUIS L'URL (?Property_ID=...)
            window.onload = function() {
                var urlParams = new URLSearchParams(window.location.search);
                var propId = urlParams.get('Property_ID');
                if (propId) {
                    document.getElementById('Designation').value = propId;
                }
            };
        </script>
    </form>
</div>