"use client";

"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Building2,
  ChartNoAxesCombined,
  HeartHandshake,
  Home,
  MapPin,
  Plane,
  ShieldCheck,
  Sun,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "@/contexts/I18nContext";

const regionImages = ["/images/regions/2.jpg", "/images/regions/1.jpg", "/images/regions/3.jpg", "/images/regions/4.jpg"];
const metricIcons = [Sun, Plane, HeartHandshake, Building2, ShieldCheck];

const regionExplorer = [
  {
    name: "Costa Blanca",
    image: "/images/regions/1.jpg",
    description: "Une cote elegante entre Alicante, Marina Alta et Marina Baixa.",
    subregions: [
      {
        name: "Costa Blanca Nord",
        description: "Villages premium, criques, ports de plaisance et vues mer.",
        towns: ["Moraira", "Javea", "Calpe", "Altea", "Denia"],
      },
      {
        name: "Costa Blanca Sud",
        description: "Stations balneaires, golf, plages longues et acces rapide a Alicante.",
        towns: ["Alicante", "Torrevieja", "Orihuela Costa", "Guardamar", "Santa Pola"],
      },
    ],
  },
  {
    name: "Costa Calida",
    image: "/images/regions/3.jpg",
    description: "Murcie, Mar Menor et resorts de golf avec fort potentiel.",
    subregions: [
      {
        name: "Murcia Coast",
        description: "Plages, marinas et golf autour de Cartagena et Mar Menor.",
        towns: ["Cartagena", "Los Alcazares", "San Javier", "La Manga", "Aguilas"],
      },
    ],
  },
  {
    name: "Costa del Sol",
    image: "/images/regions/2.jpg",
    description: "Marbella, Estepona et Sotogrande : le coeur lifestyle du sud.",
    subregions: [
      {
        name: "Golden Triangle",
        description: "Adresses prime, golf, beach clubs et forte demande internationale.",
        towns: ["Marbella", "Estepona", "Benahavis", "Mijas", "Sotogrande"],
      },
    ],
  },
];

const copy = {
  fr: {
    sidebarTitle: "Guide immobilier Espagne",
    nav: ["Apercu", "Marche immobilier", "Guide d'achat", "FAQ"],
    viewProperties: "Voir les biens",
    heroBadge: "Vivre mieux. Investir intelligemment.",
    heroTitle: "Guide immobilier Espagne",
    heroText: "Explorez les regions cotieres ou Amaru Homes selectionne des biens, des residences lifestyle aux opportunites pretes a investir.",
    exploreRegions: "Explorer les regions",
    metrics: [["Climat", "300+ jours de soleil"], ["Connectivite", "Aeroports majeurs"], ["Lifestyle", "Vie en bord de mer"], ["Marche", "Villas et appartements neufs"], ["Accompagnement", "Parcours guide"]],
    overviewBadge: "Apercu",
    overviewTitle: "Pourquoi investir en Espagne ?",
    overviewText: "L'Espagne associe un art de vivre mediterraneen, une demande immobiliere solide, une bonne connectivite et un large choix de destinations cotieres.",
    bullets: ["Regions cotieres et styles de biens varies", "Forte demande internationale dans les zones prime", "Attractivite lifestyle pour familles et retraites", "Meilleure lecture avant de planifier des visites"],
    lifestyleTitle: "Un art de vivre unique",
    lifestyleText: "Matins a la plage, dejeuners au port, apres-midi golf et villages historiques : chaque region a son rythme.",
    regionsBadge: "Apercu des regions",
    regionsTitle: "Explorer les meilleures regions d'Espagne",
    regionsText: "Des adresses glamour aux villages mediterraneens plus calmes, comparez les zones ou Amaru Homes selectionne des biens.",
    regions: [
      ["Costa del Sol", "Marbella, Estepona, Benahavis, Mijas et Sotogrande : golf, marinas, plages et forte demande internationale.", ["300+ jours de soleil", "Aeroport de Malaga", "Fort potentiel locatif"]],
      ["Costa Blanca", "Alicante, Calpe, Moraira, Altea et Javea : villes cotieres authentiques, eaux bleues et lifestyle raffine.", ["Villes mediterraneennes", "Aeroport d'Alicante", "Excellent rapport valeur"]],
      ["Costa Calida", "Murcia, Cartagena et Mar Menor : plages, resorts de golf et marche plus calme avec potentiel de croissance.", ["Climat chaud", "Resorts de golf", "Marche emergent"]],
      ["Costa Almeria", "Almeria, Mojacar, Vera et San Juan de los Terreros : paysages naturels, plages et budgets attractifs.", ["Nature et plages", "Lifestyle detendu", "Budgets accessibles"]],
    ],
    marketBadge: "Marche immobilier",
    marketTitle: "Snapshot du marche espagnol",
    marketStats: [["Appartements", "Des 500k EUR"], ["Villas", "Demande cotiere prime"], ["Croissance", "Marche lifestyle"], ["Location", "Potentiel saisonnier"]],
    buyingBadge: "Guide d'achat",
    buyingTitle: "Comment choisir la bonne region",
    buyingText: "La meilleure region depend de votre style de vie, de vos besoins d'acces, de votre usage et de vos objectifs d'investissement.",
    buyingItems: ["Acces aeroport et frequence de voyage", "Plage, golf, marina ou ville", "Famille, sante et ecoles", "Location et revente long terme"],
    ctaTitle: "Pret a trouver votre bien de reve en Espagne ?",
    ctaText: "Parcourez notre selection actuelle ou contactez l'equipe pour une shortlist regionale sur mesure.",
    contactTeam: "Contacter l'equipe",
    faq: [["Amaru Homes peut-il m'aider a comparer les regions ?", "Oui. Nous aidons les acheteurs a comprendre lifestyle, acces, budgets et options avant les visites."], ["Puis-je commencer par un guide region avant les biens ?", "Oui. Ces guides soutiennent la recherche initiale et ameliorent la qualite de chaque shortlist."]],
  },
  en: {
    sidebarTitle: "Spain Property Guide",
    nav: ["Overview", "Property market", "Buying guide", "FAQ"],
    viewProperties: "View properties",
    heroBadge: "Live beautifully. Invest wisely.",
    heroTitle: "Spain Property Guide",
    heroText: "Explore the coastal regions where Amaru Homes sells carefully selected properties, from lifestyle-led residences to investment-ready homes.",
    exploreRegions: "Explore regions",
    metrics: [["Climate", "300+ sunny days"], ["Connectivity", "Major airports"], ["Lifestyle", "Coastal living"], ["Market", "New-build villas & apartments"], ["Buyer support", "Guided process"]],
    overviewBadge: "Overview",
    overviewTitle: "Why invest in Spain?",
    overviewText: "Spain combines a relaxed Mediterranean lifestyle with resilient property demand, strong connectivity and a wide choice of coastal locations.",
    bullets: ["Diverse coastal regions and property styles", "International buyer demand in prime locations", "Strong lifestyle appeal for families and retirees", "Clearer decision-making before arranging visits"],
    lifestyleTitle: "A lifestyle like no other",
    lifestyleText: "Beach mornings, marina lunches, golf afternoons and historic towns: each region offers a different rhythm.",
    regionsBadge: "Regions overview",
    regionsTitle: "Explore Spain's top regions",
    regionsText: "From glamorous hotspots to quiet Mediterranean towns, compare the areas where Amaru Homes selects properties.",
    regions: [
      ["Costa del Sol", "Marbella, Estepona, Benahavis, Mijas and Sotogrande: golf, marinas, beaches and strong international demand.", ["300+ days of sun", "Malaga airport", "Premium rental appeal"]],
      ["Costa Blanca", "Alicante, Calpe, Moraira, Altea and Javea: authentic coastal towns, blue water and a refined lifestyle.", ["Mediterranean towns", "Alicante airport", "Excellent value"]],
      ["Costa Calida", "Murcia, Cartagena and the Mar Menor: beaches, golf resorts and a quieter market with room to grow.", ["Warm climate", "Golf resorts", "Emerging market"]],
      ["Costa Almeria", "Almeria, Mojacar, Vera and San Juan de los Terreros: natural landscapes, beaches and attractive pricing.", ["Nature and beaches", "Relaxed lifestyle", "Accessible budgets"]],
    ],
    marketBadge: "Property market",
    marketTitle: "Spain market snapshot",
    marketStats: [["Apartments", "From EUR 500k"], ["Villas", "Prime coastal demand"], ["Growth", "Lifestyle-led market"], ["Rental", "Seasonal potential"]],
    buyingBadge: "Buying guide",
    buyingTitle: "How to choose the right region",
    buyingText: "The best region depends on your lifestyle, access needs, usage plan and investment goals.",
    buyingItems: ["Airport access and travel frequency", "Beach, golf, marina or city lifestyle", "Family needs, healthcare and schools", "Rental expectations and long-term resale"],
    ctaTitle: "Ready to find your dream property in Spain?",
    ctaText: "Browse our current selection or contact the team for a tailored regional shortlist.",
    contactTeam: "Contact our team",
    faq: [["Can Amaru Homes help me compare regions?", "Yes. We help buyers understand lifestyle, access, budgets and property options before arranging viewings."], ["Can I start with a region guide before viewing properties?", "Yes. These guides support early research and improve the quality of each shortlist."]],
  },
  es: {
    sidebarTitle: "Guia inmobiliaria de Espana",
    nav: ["Resumen", "Mercado inmobiliario", "Guia de compra", "FAQ"],
    viewProperties: "Ver propiedades",
    heroBadge: "Viva mejor. Invierta con inteligencia.",
    heroTitle: "Guia inmobiliaria de Espana",
    heroText: "Explore las regiones costeras donde Amaru Homes selecciona propiedades, desde residencias lifestyle hasta oportunidades listas para invertir.",
    exploreRegions: "Explorar regiones",
    metrics: [["Clima", "300+ dias de sol"], ["Conectividad", "Aeropuertos principales"], ["Lifestyle", "Vida costera"], ["Mercado", "Villas y apartamentos nuevos"], ["Soporte", "Proceso guiado"]],
    overviewBadge: "Resumen",
    overviewTitle: "Por que invertir en Espana?",
    overviewText: "Espana combina estilo de vida mediterraneo, demanda inmobiliaria solida, buena conectividad y muchas zonas costeras.",
    bullets: ["Regiones costeras y estilos variados", "Demanda internacional en zonas prime", "Gran atractivo para familias y jubilados", "Decisiones mas claras antes de visitar"],
    lifestyleTitle: "Un estilo de vida unico",
    lifestyleText: "Mananas de playa, almuerzos en marina, tardes de golf y pueblos historicos: cada region tiene su ritmo.",
    regionsBadge: "Resumen de regiones",
    regionsTitle: "Explore las principales regiones de Espana",
    regionsText: "De zonas glamour a pueblos mediterraneos tranquilos, compare donde Amaru Homes selecciona propiedades.",
    regions: [
      ["Costa del Sol", "Marbella, Estepona, Benahavis, Mijas y Sotogrande: golf, marinas, playas y fuerte demanda internacional.", ["300+ dias de sol", "Aeropuerto de Malaga", "Alto atractivo de alquiler"]],
      ["Costa Blanca", "Alicante, Calpe, Moraira, Altea y Javea: pueblos costeros autenticos, agua azul y estilo de vida refinado.", ["Pueblos mediterraneos", "Aeropuerto de Alicante", "Excelente valor"]],
      ["Costa Calida", "Murcia, Cartagena y el Mar Menor: playas, resorts de golf y un mercado mas tranquilo con margen de crecimiento.", ["Clima calido", "Resorts de golf", "Mercado emergente"]],
      ["Costa Almeria", "Almeria, Mojacar, Vera y San Juan de los Terreros: paisajes naturales, playas y precios atractivos.", ["Naturaleza y playas", "Lifestyle relajado", "Presupuestos accesibles"]],
    ],
    marketBadge: "Mercado inmobiliario",
    marketTitle: "Instantanea del mercado espanol",
    marketStats: [["Apartamentos", "Desde EUR 500k"], ["Villas", "Demanda costera prime"], ["Crecimiento", "Mercado lifestyle"], ["Alquiler", "Potencial estacional"]],
    buyingBadge: "Guia de compra",
    buyingTitle: "Como elegir la region adecuada",
    buyingText: "La mejor region depende de su estilo de vida, acceso, uso previsto y objetivos de inversion.",
    buyingItems: ["Acceso al aeropuerto y frecuencia de viaje", "Playa, golf, marina o vida urbana", "Familia, sanidad y colegios", "Alquiler y reventa a largo plazo"],
    ctaTitle: "Listo para encontrar su propiedad ideal en Espana?",
    ctaText: "Consulte nuestra seleccion actual o contacte al equipo para una shortlist regional.",
    contactTeam: "Contactar al equipo",
    faq: [["Puede Amaru Homes ayudarme a comparar regiones?", "Si. Ayudamos a los compradores a entender lifestyle, acceso, presupuestos y opciones antes de organizar visitas."], ["Puedo empezar con una guia regional antes de ver propiedades?", "Si. Estas guias apoyan la investigacion inicial y mejoran la calidad de cada shortlist."]],
  },
  nl: {
    sidebarTitle: "Vastgoedgids Spanje",
    nav: ["Overzicht", "Vastgoedmarkt", "Koopgids", "FAQ"],
    viewProperties: "Bekijk woningen",
    heroBadge: "Mooi wonen. Slim investeren.",
    heroTitle: "Vastgoedgids Spanje",
    heroText: "Ontdek de kustregio's waar Amaru Homes zorgvuldig geselecteerde woningen aanbiedt.",
    exploreRegions: "Regio's bekijken",
    metrics: [["Klimaat", "300+ zonnige dagen"], ["Bereikbaarheid", "Grote luchthavens"], ["Lifestyle", "Wonen aan zee"], ["Markt", "Nieuwe villa's en appartementen"], ["Begeleiding", "Begeleid proces"]],
    overviewBadge: "Overzicht",
    overviewTitle: "Waarom investeren in Spanje?",
    overviewText: "Spanje combineert een mediterrane levensstijl met sterke vastgoedvraag, goede verbindingen en veel kustlocaties.",
    bullets: ["Diverse kustregio's en woningtypes", "Internationale vraag in toplocaties", "Sterke lifestyle-aantrekkingskracht", "Betere keuzes voor bezichtigingen"],
    lifestyleTitle: "Een unieke levensstijl",
    lifestyleText: "Strand, marina, golf en historische dorpen: elke regio heeft een eigen ritme.",
    regionsBadge: "Regio-overzicht",
    regionsTitle: "Ontdek de beste regio's van Spanje",
    regionsText: "Van glamoureuze hotspots tot rustige mediterrane dorpen: vergelijk de gebieden waar Amaru Homes selecteert.",
    regions: [
      ["Costa del Sol", "Marbella, Estepona, Benahavis, Mijas en Sotogrande: golf, jachthavens, stranden en sterke internationale vraag.", ["300+ zonnige dagen", "Luchthaven Malaga", "Sterke verhuurkans"]],
      ["Costa Blanca", "Alicante, Calpe, Moraira, Altea en Javea: authentieke kustplaatsen, blauw water en een verfijnde levensstijl.", ["Mediterrane dorpen", "Luchthaven Alicante", "Uitstekende waarde"]],
      ["Costa Calida", "Murcia, Cartagena en de Mar Menor: stranden, golfresorts en een rustigere markt met groeiruimte.", ["Warm klimaat", "Golfresorts", "Opkomende markt"]],
      ["Costa Almeria", "Almeria, Mojacar, Vera en San Juan de los Terreros: natuur, stranden en aantrekkelijke budgetten.", ["Natuur en stranden", "Ontspannen lifestyle", "Toegankelijke budgetten"]],
    ],
    marketBadge: "Vastgoedmarkt",
    marketTitle: "Momentopname Spaanse markt",
    marketStats: [["Appartementen", "Vanaf EUR 500k"], ["Villa's", "Vraag naar toplocaties"], ["Groei", "Lifestyle-gedreven markt"], ["Verhuur", "Seizoenspotentieel"]],
    buyingBadge: "Koopgids",
    buyingTitle: "Hoe kiest u de juiste regio",
    buyingText: "De beste regio hangt af van levensstijl, bereikbaarheid, gebruik en investeringsdoelen.",
    buyingItems: ["Toegang tot luchthaven en reisfrequentie", "Strand, golf, jachthaven of stadsleven", "Gezin, zorg en scholen", "Verhuurverwachting en latere herverkoop"],
    ctaTitle: "Klaar om uw droomwoning in Spanje te vinden?",
    ctaText: "Bekijk onze selectie of neem contact op voor een regionale shortlist.",
    contactTeam: "Contacteer ons team",
    faq: [["Kan Amaru Homes mij helpen regio's te vergelijken?", "Ja. We helpen kopers lifestyle, bereikbaarheid, budgetten en woningopties te begrijpen voordat bezichtigingen worden gepland."], ["Kan ik starten met een regiogids voordat ik woningen bekijk?", "Ja. Deze gidsen ondersteunen de eerste orientatie en verbeteren de kwaliteit van elke shortlist."]],
  },
  pl: {
    sidebarTitle: "Przewodnik po nieruchomosciach w Hiszpanii",
    nav: ["Przeglad", "Rynek nieruchomosci", "Przewodnik zakupu", "FAQ"],
    viewProperties: "Zobacz nieruchomosci",
    heroBadge: "Zyj pieknie. Inwestuj madrze.",
    heroTitle: "Przewodnik po nieruchomosciach w Hiszpanii",
    heroText: "Poznaj nadmorskie regiony, w ktorych Amaru Homes wybiera nieruchomosci: od domow lifestyle po gotowe okazje inwestycyjne.",
    exploreRegions: "Odkryj regiony",
    metrics: [["Klimat", "300+ slonecznych dni"], ["Dostepnosc", "Glowne lotniska"], ["Lifestyle", "Zycie nad morzem"], ["Rynek", "Nowe wille i apartamenty"], ["Wsparcie", "Proces z doradca"]],
    overviewBadge: "Przeglad",
    overviewTitle: "Dlaczego inwestowac w Hiszpanii?",
    overviewText: "Hiszpania laczy srodziemnomorski styl zycia, stabilny popyt na nieruchomosci, dobra komunikacje i szeroki wybor lokalizacji nad morzem.",
    bullets: ["Roznorodne regiony nadmorskie i typy nieruchomosci", "Miedzynarodowy popyt w lokalizacjach premium", "Silny atrakcyjny lifestyle dla rodzin i emerytow", "Lepsza decyzja przed planowaniem wizyt"],
    lifestyleTitle: "Styl zycia jak z marzen",
    lifestyleText: "Poranki na plazy, lunche w marinie, popoludnia na golfie i historyczne miasteczka: kazdy region ma wlasny rytm.",
    regionsBadge: "Przeglad regionow",
    regionsTitle: "Odkryj najlepsze regiony Hiszpanii",
    regionsText: "Od prestizowych adresow po spokojniejsze srodziemnomorskie miejscowosci: porownaj obszary, w ktorych Amaru Homes wybiera nieruchomosci.",
    regions: [
      ["Costa del Sol", "Marbella, Estepona, Benahavis, Mijas i Sotogrande: golf, mariny, plaze i silny popyt miedzynarodowy.", ["300+ dni slonca", "Lotnisko Malaga", "Wysoki potencjal najmu"]],
      ["Costa Blanca", "Alicante, Calpe, Moraira, Altea i Javea: autentyczne miasta nadmorskie, blekitna woda i elegancki lifestyle.", ["Srodziemnomorskie miasta", "Lotnisko Alicante", "Bardzo dobra wartosc"]],
      ["Costa Calida", "Murcja, Cartagena i Mar Menor: plaze, resorty golfowe i spokojniejszy rynek z potencjalem wzrostu.", ["Cieply klimat", "Resorty golfowe", "Rynek rozwijajacy sie"]],
      ["Costa Almeria", "Almeria, Mojacar, Vera i San Juan de los Terreros: natura, plaze i atrakcyjne ceny.", ["Natura i plaze", "Spokojny lifestyle", "Dostepne budzety"]],
    ],
    marketBadge: "Rynek nieruchomosci",
    marketTitle: "Obraz rynku w Hiszpanii",
    marketStats: [["Apartamenty", "Od EUR 500k"], ["Wille", "Popyt w lokalizacjach prime"], ["Wzrost", "Rynek lifestyle"], ["Najem", "Potencjal sezonowy"]],
    buyingBadge: "Przewodnik zakupu",
    buyingTitle: "Jak wybrac wlasciwy region",
    buyingText: "Najlepszy region zalezy od stylu zycia, dostepnosci, planowanego uzycia i celow inwestycyjnych.",
    buyingItems: ["Dostep do lotniska i czestotliwosc podrozy", "Plaza, golf, marina lub zycie miejskie", "Rodzina, opieka zdrowotna i szkoly", "Najem i odsprzedaz w dlugim terminie"],
    ctaTitle: "Gotowy znalezc wymarzona nieruchomosc w Hiszpanii?",
    ctaText: "Zobacz aktualna selekcje lub skontaktuj sie z zespolem po regionalna shortlist.",
    contactTeam: "Skontaktuj sie z zespolem",
    faq: [["Czy Amaru Homes pomoze porownac regiony?", "Tak. Pomagamy kupujacym zrozumiec lifestyle, dostep, budzety i opcje nieruchomosci przed organizacja wizyt."], ["Czy moge zaczac od przewodnika po regionie?", "Tak. Te przewodniki wspieraja pierwsze rozeznanie i poprawiaja jakosc kazdej shortlisty."]],
  },
  ar: {
    sidebarTitle: "دليل العقارات في إسبانيا",
    nav: ["نظرة عامة", "سوق العقارات", "دليل الشراء", "أسئلة شائعة"],
    viewProperties: "عرض العقارات",
    heroBadge: "عش بجمال. استثمر بذكاء.",
    heroTitle: "دليل العقارات في إسبانيا",
    heroText: "اكتشف المناطق الساحلية التي تختار فيها Amaru Homes عقارات بعناية، من مساكن نمط الحياة إلى الفرص الجاهزة للاستثمار.",
    exploreRegions: "استكشف المناطق",
    metrics: [["المناخ", "أكثر من 300 يوم مشمس"], ["الوصول", "مطارات رئيسية"], ["نمط الحياة", "العيش على الساحل"], ["السوق", "فلل وشقق جديدة"], ["الدعم", "مسار شراء موجه"]],
    overviewBadge: "نظرة عامة",
    overviewTitle: "لماذا الاستثمار في إسبانيا؟",
    overviewText: "تجمع إسبانيا بين أسلوب الحياة المتوسطي، والطلب العقاري القوي، وسهولة الوصول، وتنوع الوجهات الساحلية.",
    bullets: ["مناطق ساحلية وأنماط عقارات متنوعة", "طلب دولي قوي في المواقع المميزة", "جاذبية كبيرة للعائلات والمتقاعدين", "رؤية أوضح قبل ترتيب الزيارات"],
    lifestyleTitle: "أسلوب حياة استثنائي",
    lifestyleText: "صباح على الشاطئ، غداء في المارينا، بعد الظهر في ملاعب الغولف وقرى تاريخية: لكل منطقة إيقاعها الخاص.",
    regionsBadge: "نظرة على المناطق",
    regionsTitle: "استكشف أفضل مناطق إسبانيا",
    regionsText: "من الوجهات الراقية إلى القرى المتوسطية الهادئة، قارن المناطق التي تختار فيها Amaru Homes عقاراتها.",
    regions: [
      ["كوستا ديل سول", "ماربيا، إستيبونا، بيناهافيس، ميخاس وسوتوغراندي: غولف، مارينات، شواطئ وطلب دولي قوي.", ["أكثر من 300 يوم مشمس", "مطار مالقة", "جاذبية تأجير قوية"]],
      ["كوستا بلانكا", "أليكانتي، كالبي، مورايرا، ألتيا وخافيا: مدن ساحلية أصيلة، مياه زرقاء ونمط حياة راق.", ["مدن متوسطية", "مطار أليكانتي", "قيمة ممتازة"]],
      ["كوستا كاليدا", "مرسية، قرطاجنة ومار مينور: شواطئ، منتجعات غولف وسوق أكثر هدوءا مع مجال للنمو.", ["مناخ دافئ", "منتجعات غولف", "سوق ناشئ"]],
      ["كوستا ألميريا", "ألميريا، موخاكار، فيرا وسان خوان دي لوس تيريروس: طبيعة، شواطئ وأسعار جذابة.", ["طبيعة وشواطئ", "نمط حياة هادئ", "ميزانيات مناسبة"]],
    ],
    marketBadge: "سوق العقارات",
    marketTitle: "لمحة عن السوق الإسباني",
    marketStats: [["الشقق", "ابتداء من EUR 500k"], ["الفلل", "طلب ساحلي مميز"], ["النمو", "سوق يقوده نمط الحياة"], ["التأجير", "إمكانات موسمية"]],
    buyingBadge: "دليل الشراء",
    buyingTitle: "كيف تختار المنطقة المناسبة",
    buyingText: "تعتمد المنطقة المناسبة على نمط حياتك، وسهولة الوصول، وطريقة الاستخدام، وأهدافك الاستثمارية.",
    buyingItems: ["الوصول إلى المطار وتكرار السفر", "الشاطئ أو الغولف أو المارينا أو المدينة", "العائلة والرعاية الصحية والمدارس", "التأجير وإعادة البيع على المدى الطويل"],
    ctaTitle: "هل أنت مستعد للعثور على عقارك المثالي في إسبانيا؟",
    ctaText: "تصفح مجموعتنا الحالية أو تواصل مع الفريق للحصول على قائمة مختصرة حسب المنطقة.",
    contactTeam: "تواصل مع الفريق",
    faq: [["هل يمكن أن تساعدني Amaru Homes في مقارنة المناطق؟", "نعم. نساعد المشترين على فهم نمط الحياة، والوصول، والميزانيات، وخيارات العقارات قبل ترتيب الزيارات."], ["هل يمكنني البدء بدليل المنطقة قبل مشاهدة العقارات؟", "نعم. هذه الأدلة تدعم البحث الأولي وتحسن جودة كل قائمة مختصرة."]],
  },
} as const;

export default function GuidesContent() {
  const { locale, dir } = useTranslation();
  const c = { ...copy.en, ...(copy[locale as keyof typeof copy] || {}) };
  const [activeRegionName, setActiveRegionName] = useState(regionExplorer[0].name);
  const activeRegion = regionExplorer.find((region) => region.name === activeRegionName) || regionExplorer[0];
  const [activeSubregionName, setActiveSubregionName] = useState(activeRegion.subregions[0].name);
  const activeSubregion = activeRegion.subregions.find((subregion) => subregion.name === activeSubregionName) || activeRegion.subregions[0];
  const regions = c.regions || copy.en.regions;
  const metrics = c.metrics || copy.en.metrics;
  const marketStats = c.marketStats || copy.en.marketStats;
  const buyingItems = c.buyingItems || copy.en.buyingItems;
  const faq = c.faq || copy.en.faq;
  const chooseRegion = (name: string) => {
    const nextRegion = regionExplorer.find((region) => region.name === name) || regionExplorer[0];
    setActiveRegionName(nextRegion.name);
    setActiveSubregionName(nextRegion.subregions[0].name);
  };

  return (
    <main dir={dir} className="guide-shell min-h-screen bg-[#FAFAFA] text-[#171716]">
      <Navbar />
      <div className="mx-auto flex max-w-[1800px]">
        <aside className="guide-surface sticky top-0 hidden h-screen w-72 shrink-0 border-r border-[#D8C9B6] bg-[#F2EFEA] px-6 py-8 pt-28 xl:block">
          <div className="mb-10">
            <p className="guide-text text-[10px] font-black uppercase tracking-[0.35em] text-[#171716]">Amaru Homes</p>
            <h2 className="mt-4 text-2xl font-serif uppercase leading-tight">{c.sidebarTitle}</h2>
          </div>
          <nav className="space-y-3">
            {["overview", "property-market", "buying-guide", "faq"].map((id, index) => (
              <a key={id} href={`#${id}`} className="guide-surface flex items-center gap-3 border border-[#D8C9B6] bg-[#FAFAFA] px-4 py-4 text-[10px] font-black uppercase tracking-[0.18em] transition-colors hover:bg-[#D8C9B6]">
                <span>{String(index + 1).padStart(2, "0")}</span>
                {c.nav[index]}
              </a>
            ))}
          </nav>
          <Link href="/#collection" className="mt-10 flex items-center justify-between border border-[#171716] px-5 py-5 text-[10px] font-black uppercase tracking-[0.22em] transition-colors hover:bg-[#171716] hover:text-[#FAFAFA]">
            {c.viewProperties}
            <ArrowRight size={16} />
          </Link>
        </aside>

        <div className="min-w-0 flex-1 pt-24">
          <section className="relative min-h-[72vh] overflow-hidden">
            <img src="/images/regions/2.jpg" alt={c.heroTitle} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#010101]/80 via-[#010101]/35 to-transparent" />
            <div className="relative z-10 flex min-h-[72vh] max-w-5xl flex-col justify-center px-6 py-20 md:px-12 lg:px-20">
              <p className="mb-6 text-[11px] font-black uppercase tracking-[0.45em] text-[#D8C9B6]">{c.heroBadge}</p>
              <h1 className="max-w-4xl text-6xl font-serif uppercase leading-[0.9] text-[#FAFAFA] md:text-8xl">{c.heroTitle}</h1>
              <p className="mt-8 max-w-xl text-base leading-8 text-[#FAFAFA]">{c.heroText}</p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a href="#regions-overview" className="inline-flex items-center justify-center gap-3 bg-[#D8C9B6] px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#010101]">{c.exploreRegions} <ArrowRight size={16} /></a>
                <Link href="/#collection" className="inline-flex items-center justify-center gap-3 border border-[#FAFAFA] px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#FAFAFA]">{c.viewProperties} <ArrowRight size={16} /></Link>
              </div>
            </div>
          </section>

          <section className="guide-surface grid grid-cols-1 border-b border-[#D8C9B6] bg-[#FAFAFA] md:grid-cols-5">
            {metrics.map(([label, value], index) => {
              const Icon = metricIcons[index];
              return (
                <div key={label} className="flex items-center gap-4 border-r border-[#D8C9B6] px-6 py-8">
                  <Icon className="text-[#D8C9B6]" size={30} strokeWidth={1.4} />
                  <div><p className="text-[9px] font-black uppercase tracking-[0.25em]">{label}</p><p className="guide-text mt-1 text-sm text-[#171716]">{value}</p></div>
                </div>
              );
            })}
          </section>

          <section id="overview" className="grid grid-cols-1 gap-12 px-6 py-16 md:px-12 lg:grid-cols-2 lg:px-20">
            <div>
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">{c.overviewBadge}</p>
              <h2 className="text-4xl font-serif uppercase leading-tight">{c.overviewTitle}</h2>
              <p className="mt-6 max-w-2xl leading-8">{c.overviewText}</p>
              <ul className="mt-8 space-y-3 text-sm">{c.bullets.map((item) => <li key={item} className="flex gap-3"><ShieldCheck className="mt-0.5 text-[#D8C9B6]" size={16} />{item}</li>)}</ul>
            </div>
            <div className="relative min-h-[360px] overflow-hidden bg-[#171716]">
              <img src="/images/regions/1.jpg" alt={c.lifestyleTitle} className="absolute inset-0 h-full w-full object-cover opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#010101]/70 to-transparent" />
              <div className="relative z-10 max-w-sm p-10 text-[#FAFAFA]"><h3 className="text-3xl font-serif uppercase leading-tight">{c.lifestyleTitle}</h3><p className="mt-5 text-sm leading-7">{c.lifestyleText}</p></div>
            </div>
          </section>

          <section id="regions-overview" className="guide-soft border-y border-[#D8C9B6] bg-[#F2EFEA] px-6 py-16 md:px-12 lg:px-20">
            <div className="mb-10 max-w-3xl"><p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">{c.regionsBadge}</p><h2 className="text-4xl font-serif uppercase leading-tight">{c.regionsTitle}</h2><p className="mt-5 leading-8">{c.regionsText}</p></div>
            <div className="guide-surface mb-12 grid grid-cols-1 border border-[#D8C9B6] bg-[#FAFAFA] lg:grid-cols-[1fr_1fr_1.35fr]">
              <div className="border-b border-[#D8C9B6] p-6 lg:border-b-0 lg:border-r">
                <p className="mb-4 text-[9px] font-black uppercase tracking-[0.3em] text-[#D8C9B6]">01. Choisir la cote</p>
                <div className="space-y-3">
                  {regionExplorer.map((region) => (
                    <button
                      key={region.name}
                      type="button"
                      onClick={() => chooseRegion(region.name)}
                      className={`flex w-full items-center justify-between border px-4 py-4 text-left transition-colors ${
                        activeRegion.name === region.name
                          ? "border-[#171716] bg-[#171716] text-[#FAFAFA]"
                          : "border-[#D8C9B6] bg-[#FAFAFA] text-[#171716] hover:bg-[#F2EFEA]"
                      }`}
                    >
                      <span>
                        <span className="block text-[11px] font-black uppercase tracking-[0.18em]">{region.name}</span>
                        <span className={`mt-2 block text-xs leading-5 ${activeRegion.name === region.name ? "text-[#F2EFEA]" : "text-[#171716]"}`}>{region.description}</span>
                      </span>
                      <ArrowRight size={16} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-b border-[#D8C9B6] p-6 lg:border-b-0 lg:border-r">
                <p className="mb-4 text-[9px] font-black uppercase tracking-[0.3em] text-[#D8C9B6]">02. Choisir la zone</p>
                <div className="space-y-3">
                  {activeRegion.subregions.map((subregion) => (
                    <button
                      key={subregion.name}
                      type="button"
                      onClick={() => setActiveSubregionName(subregion.name)}
                      className={`w-full border px-4 py-4 text-left transition-colors ${
                        activeSubregion.name === subregion.name
                          ? "border-[#171716] bg-[#171716] text-[#FAFAFA]"
                          : "border-[#D8C9B6] bg-[#FAFAFA] text-[#171716] hover:bg-[#F2EFEA]"
                      }`}
                    >
                      <span className="block text-[11px] font-black uppercase tracking-[0.18em]">{subregion.name}</span>
                      <span className={`mt-2 block text-xs leading-5 ${activeSubregion.name === subregion.name ? "text-[#F2EFEA]" : "text-[#171716]"}`}>{subregion.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <div className="mb-5 overflow-hidden">
                  <img src={activeRegion.image} alt={activeRegion.name} className="h-44 w-full object-cover" />
                </div>
                <p className="mb-4 text-[9px] font-black uppercase tracking-[0.3em] text-[#D8C9B6]">03. Explorer les villes</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {activeSubregion.towns.map((town) => (
                    <Link
                      key={town}
                      href={`/?region=${encodeURIComponent(activeRegion.name)}&town=${encodeURIComponent(town)}#collection`}
                      className="group flex items-center justify-between border border-[#D8C9B6] bg-[#FAFAFA] px-4 py-4 text-[#171716] transition-colors hover:bg-[#171716] hover:text-[#FAFAFA]"
                    >
                      <span>
                        <span className="block text-sm font-serif uppercase">{town}</span>
                        <span className="mt-1 block text-[9px] font-black uppercase tracking-[0.18em] text-[#D8C9B6]">Voir les biens</span>
                      </span>
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {regions.map(([name, description, highlights], index) => (
                <article key={name} className="guide-surface group bg-[#FAFAFA]">
                  <div className="aspect-[4/3] overflow-hidden"><img src={regionImages[index]} alt={`${name} property guide`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /></div>
                  <div className="p-6"><h3 className="text-xl font-serif uppercase">{name}</h3><p className="mt-3 min-h-24 text-sm leading-7">{description}</p><div className="mt-5 space-y-2">{highlights.map((highlight) => <p key={highlight} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em]"><MapPin size={13} className="text-[#D8C9B6]" />{highlight}</p>)}</div></div>
                </article>
              ))}
            </div>
          </section>

          <section id="property-market" className="grid grid-cols-1 gap-6 px-6 py-16 md:px-12 lg:grid-cols-2 lg:px-20">
            <div className="guide-surface bg-[#FAFAFA] p-10 ring-1 ring-[#D8C9B6]"><p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">{c.marketBadge}</p><h2 className="text-3xl font-serif uppercase">{c.marketTitle}</h2><div className="mt-10 grid grid-cols-2 gap-8">{marketStats.map(([label, value]) => <div key={label}><ChartNoAxesCombined className="mb-3 text-[#D8C9B6]" size={28} /><p className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</p><p className="mt-2 text-lg font-bold">{value}</p></div>)}</div></div>
            <div id="buying-guide" className="guide-surface bg-[#F2EFEA] p-10 ring-1 ring-[#D8C9B6]"><p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em] text-[#D8C9B6]">{c.buyingBadge}</p><h2 className="text-3xl font-serif uppercase">{c.buyingTitle}</h2><p className="mt-6 leading-8">{c.buyingText}</p><div className="mt-8 grid gap-3 text-sm">{buyingItems.map((item) => <div key={item} className="flex items-center gap-3"><Home size={16} className="text-[#D8C9B6]" />{item}</div>)}</div></div>
          </section>

          <section className="mx-6 mb-16 bg-[#171716] px-8 py-10 text-[#FAFAFA] md:mx-12 lg:mx-20">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center"><div><h2 className="text-3xl font-serif uppercase">{c.ctaTitle}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#F2EFEA]">{c.ctaText}</p></div><div className="flex flex-col gap-3 sm:flex-row"><Link href="/#collection" className="inline-flex items-center justify-center gap-3 bg-[#D8C9B6] px-7 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#010101]">{c.viewProperties} <ArrowRight size={15} /></Link><Link href="/contact" className="inline-flex items-center justify-center gap-3 border border-[#FAFAFA] px-7 py-4 text-[10px] font-black uppercase tracking-[0.2em]">{c.contactTeam} <ArrowRight size={15} /></Link></div></div>
          </section>

          <section id="faq" className="px-6 pb-20 md:px-12 lg:px-20"><h2 className="text-3xl font-serif uppercase">FAQ</h2><div className="mt-8 grid gap-4 md:grid-cols-2">{faq.map(([question, answer]) => <div key={question} className="guide-surface border border-[#D8C9B6] bg-[#FAFAFA] p-6"><h3 className="font-bold uppercase tracking-[0.12em]">{question}</h3><p className="mt-4 text-sm leading-7">{answer}</p></div>)}</div></section>

          <Footer />
        </div>
      </div>
    </main>
  );
}
