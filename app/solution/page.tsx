"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Globe, ShieldCheck, Cpu, Layers,
  MapPin, Camera, ChevronDown, Home, ArrowRight,
  Settings, Palette, Languages, Workflow,
  Check, X, Zap, Star, Crown, Percent,
  LayoutDashboard, Users, BarChart3, Wallet,
  Bell, Search, Menu, ExternalLink, Eye, TrendingUp,
  UserPlus, ClipboardList, FileText, Image as ImageIcon,
  Send, Clock, Euro, Lock, HardDrive, LogOut, HardHat,
  Printer, Download, ChevronRight, Copy
} from 'lucide-react';

// ==================== DICTIONNAIRES MULTILANGUES ====================

const translations = {
  fr: {
    dir: 'ltr', label: "Français",
    nav: ["Vision", "Fonctionnement", "Master Template", "Tarifs", "Commencer"],
    hero: { tag: "OS Immobilier Global v1.2", title1: "L'Immobilier", title2: "Sans Frontières.", desc: "L'infrastructure logicielle qui unifie le marché mondial. Connectez vos clients locaux aux opportunités internationales en un clic." },
    gap: {
      title1: "Combler la", title2: "Fracture Immobilière.",
      desc1: "Aujourd'hui, lorsqu'un client vend un bien localement pour s'expatrier, le flux de données s'arrête. L'agence perd le contrôle et le client perd sa confiance.",
      desc2: "Modèle de Partage : data-home.io automatise la rétrocession de commissions. Vous générez des revenus sur chaque transaction internationale avec un suivi complet pour vous et votre client."
    },
    how: {
      title: "Comment ça marche :", subtitle: "Le Flux Global",
      steps: [
        { icon: MapPin, t: "1. Le Besoin Local", d: "Votre client veut investir à l'étranger. Vous activez son projet via votre Master Template pour garder la main sur la relation." },
        { icon: Layers, t: "2. Catalogue Unifié", d: "Accédez à un inventaire certifié. Les commissions de vente sont sécurisées contractuellement entre l'agence et nous." },
        { icon: Camera, t: "3. Suivi Partagé", d: "Experts sur place et rapports photos. Vous et votre client suivez l'avancement en temps réel sur l'interface." },
        { icon: ShieldCheck, t: "4. Commission & Cashback", d: "À la signature, la commission est partagée. L'agence perçoit sa part et le client bénéficie de son cashback." }
      ]
    },
    saas: {
      title: "Le Master Template", subtitle: "Configurable",
      desc: "Plus qu'un outil, c'est votre propre écosystème de revenus. Puisque chaque projet inclut un suivi tripartite (Nous, Agence, Client), l'interface devient le pivot de la transaction.",
      features: [
        { icon: Palette, t: "Branding Total", d: "L'agence reste l'unique point de contact visuel pour le client final." },
        { icon: Percent, t: "Revenue Share", d: "Suivi transparent des commissions partagées sur chaque dossier clos." },
        { icon: Workflow, t: "Cashback Piloté", d: "Gérez les avantages financiers reversés à vos clients pour fidéliser votre base." },
        { icon: Settings, t: "Accès Illimité", d: "Aucune limite de projets. Votre croissance est notre priorité commune." }
      ],
      admin_cta: "Explorer la Console Admin",
      mockup: {
        tabs: ["Console Agence", "Vue Client (Tracker)"],
        projects: "Projets",
        search_placeholder: "Rechercher...",
        project_list: [
          { name: "Villa Oasis", owner: "Martin V.", phase: "Fondations" },
          { name: "Casa del Sol", owner: "Dubois", phase: "Toiture" },
          { name: "Sky Residence", owner: "Leroy", phase: "Finitions" }
        ],
        selected_project: "Villa Oasis",
        project_owner: "Martin V.",
        current_phase: "Fondations",
        tabs_infos: ["Infos", "Suivi", "Docs"],
        client_info: "Client",
        email: "martin@example.com",
        phone: "+34 123 456 789",
        cashback: "Cashback",
        pin: "PIN",
        copy: "Copier",
        copied: "Copié !",
        encryption: "Chiffrement AES-256 Actif",
        agency_name: "AMARU-HOMES",
        quit: "Quitter",
        documents: "Documents",
        tech_reports: "Rapports techniques",
        report_date: "18 mars 2026",
        expert: "Gaëtan M.",
        doc_filenames: ["Contrat preliminaire.pdf", "Plan de masse.pdf", "Notice technique.pdf"],
        report_images: ["/mock/report1.jpg", "/mock/report2.jpg"],
        report_validated: "Rapport de Constat Validé",
        expertise: "Expertise"
      }
    },
    pricing: {
      tag: "Programme Partenaires Fondateurs (20 places)",
      title: "Investissez dans votre",
      subtitle: "Infrastructure.",
      desc: "Accès illimité aux projets pour tous les plans. Tarification basée sur le nombre d'utilisateurs et les options de marque blanche. -50% à vie.",
      cta: "Choisir ce pack",
      popular: "Recommandé",
      billing: { monthly: "Mensuel", yearly: "Annuel", save: "Économisez 20%" },
      perMonth: "/mois",
      packs: [
        { name: "Bronze", desc: "Pour les agents indépendants.", features: ["Projets illimités", "1 Accès Staff", "Suivi tripartite", "Système Cashback", "Support Email"] },
        { name: "Silver", desc: "Pour les agences structurées.", features: ["Projets illimités", "5 Accès Staff", "Custom Branding (Logo)", "Filtres XML", "Support Prioritaire"] },
        { name: "Gold", desc: "Pour les réseaux & holdings.", features: ["Projets illimités", "Staff illimité", "Full White-Label", "Accès API & Webhooks", "Account Manager"] }
      ]
    }
  },
  en: {
    dir: 'ltr', label: "English",
    nav: ["Vision", "How it works", "Master Template", "Pricing", "Get Started"],
    hero: { tag: "Global Real Estate OS v1.2", title1: "Real Estate", title2: "Beyond Borders.", desc: "The software infrastructure unifying the global market. Connect local clients to international opportunities in one click." },
    gap: {
      title1: "Bridging the", title2: "Real Estate Gap.",
      desc1: "Today, when a client sells locally to move abroad, the data flow stops. The agency loses control and the client loses trust.",
      desc2: "Revenue Model: data-home.io automates commission sharing. Generate income on every international transaction with full tracking for you and your client."
    },
    how: {
      title: "How it works:", subtitle: "Global Flow",
      steps: [
        { icon: MapPin, t: "1. Local Need", d: "Your client wants to invest abroad. Activate the project via your Master Template to maintain control over the relationship." },
        { icon: Layers, t: "2. Unified Catalogue", d: "Access certified inventory. Sales commissions are contractually secured between the agency and us." },
        { icon: Camera, t: "3. Shared Tracking", d: "On-site experts and photo reports. You and your client track progress in real time on the interface." },
        { icon: ShieldCheck, t: "4. Commission & Cashback", d: "At closing, the commission is shared. The agency receives its share and the client gets cashback." }
      ]
    },
    saas: {
      title: "Master Template", subtitle: "Configurable",
      desc: "More than a tool, it's your own revenue ecosystem. Since each project includes tripartite tracking (Us, Agency, Client), the interface becomes the pivot of the transaction.",
      features: [
        { icon: Palette, t: "Full Branding", d: "The agency remains the sole visual touchpoint for the end client." },
        { icon: Percent, t: "Revenue Share", d: "Transparent tracking of shared commissions on each closed file." },
        { icon: Workflow, t: "Managed Cashback", d: "Manage financial benefits returned to your clients to build loyalty." },
        { icon: Settings, t: "Unlimited Access", d: "No project limits. Your growth is our shared priority." }
      ],
      admin_cta: "Explore Admin Console",
      mockup: {
        tabs: ["Agency Console", "Client View (Tracker)"],
        projects: "Projects",
        search_placeholder: "Search...",
        project_list: [
          { name: "Villa Oasis", owner: "Martin V.", phase: "Foundations" },
          { name: "Casa del Sol", owner: "Dubois", phase: "Roofing" },
          { name: "Sky Residence", owner: "Leroy", phase: "Finishes" }
        ],
        selected_project: "Villa Oasis",
        project_owner: "Martin V.",
        current_phase: "Foundations",
        tabs_infos: ["Info", "Tracking", "Docs"],
        client_info: "Client",
        email: "martin@example.com",
        phone: "+34 123 456 789",
        cashback: "Cashback",
        pin: "PIN",
        copy: "Copy",
        copied: "Copied!",
        encryption: "AES-256 Encryption Active",
        agency_name: "AMARU-HOMES",
        quit: "Quit",
        documents: "Documents",
        tech_reports: "Technical Reports",
        report_date: "March 18, 2026",
        expert: "Gaëtan M.",
        doc_filenames: ["Preliminary contract.pdf", "Site plan.pdf", "Technical specs.pdf"],
        report_images: ["/mock/report1.jpg", "/mock/report2.jpg"],
        report_validated: "Validated Inspection Report",
        expertise: "Expertise"
      }
    },
    pricing: {
      tag: "Founder Partner Program (20 slots)",
      title: "Invest in your",
      subtitle: "Infrastructure.",
      desc: "Unlimited projects for all plans. Pricing based on number of users and white-label options. 50% off for life.",
      cta: "Choose this pack",
      popular: "Recommended",
      billing: { monthly: "Monthly", yearly: "Yearly", save: "Save 20%" },
      perMonth: "/mo",
      packs: [
        { name: "Bronze", desc: "For independent agents.", features: ["Unlimited projects", "1 Staff Access", "Tripartite tracking", "Cashback system", "Email support"] },
        { name: "Silver", desc: "For structured agencies.", features: ["Unlimited projects", "5 Staff Access", "Custom Branding (Logo)", "XML filters", "Priority support"] },
        { name: "Gold", desc: "For networks & holdings.", features: ["Unlimited projects", "Unlimited staff", "Full white-label", "API & Webhooks", "Account manager"] }
      ]
    }
  },
  es: {
    dir: 'ltr', label: "Español",
    nav: ["Visión", "Funcionamiento", "Master Template", "Precios", "Empezar"],
    hero: { tag: "Sistema Operativo Inmobiliario Global v1.2", title1: "Inmobiliaria", title2: "Sin Fronteras.", desc: "La infraestructura de software que unifica el mercado global. Conecta a tus clientes locales con oportunidades internacionales con un clic." },
    gap: {
      title1: "Cerrar la", title2: "Brecha Inmobiliaria.",
      desc1: "Hoy, cuando un cliente vende localmente para mudarse al extranjero, el flujo de datos se detiene. La agencia pierde el control y el cliente pierde la confianza.",
      desc2: "Modelo de Reparto: data-home.io automatiza la retrocesión de comisiones. Generas ingresos en cada transacción internacional con seguimiento completo para ti y tu cliente."
    },
    how: {
      title: "Cómo funciona:", subtitle: "Flujo Global",
      steps: [
        { icon: MapPin, t: "1. Necesidad Local", d: "Tu cliente quiere invertir en el extranjero. Activas su proyecto a través de tu Master Template para mantener el control de la relación." },
        { icon: Layers, t: "2. Catálogo Unificado", d: "Accede a un inventario certificado. Las comisiones de venta están aseguradas contractualmente entre la agencia y nosotros." },
        { icon: Camera, t: "3. Seguimiento Compartido", d: "Expertos in situ e informes fotográficos. Tú y tu cliente seguís el progreso en tiempo real en la interfaz." },
        { icon: ShieldCheck, t: "4. Comisión & Cashback", d: "En la firma, la comisión se comparte. La agencia recibe su parte y el cliente obtiene su cashback." }
      ]
    },
    saas: {
      title: "Master Template", subtitle: "Configurable",
      desc: "Más que una herramienta, es tu propio ecosistema de ingresos. Dado que cada proyecto incluye un seguimiento tripartito (Nosotros, Agencia, Cliente), la interfaz se convierte en el eje de la transacción.",
      features: [
        { icon: Palette, t: "Branding Total", d: "La agencia sigue siendo el único punto de contacto visual para el cliente final." },
        { icon: Percent, t: "Reparto de Ingresos", d: "Seguimiento transparente de las comisiones compartidas en cada expediente cerrado." },
        { icon: Workflow, t: "Cashback Gestionado", d: "Gestiona las ventajas financieras revertidas a tus clientes para fidelizarlos." },
        { icon: Settings, t: "Acceso Ilimitado", d: "Sin límite de proyectos. Tu crecimiento es nuestra prioridad común." }
      ],
      admin_cta: "Explorar Consola Admin",
      mockup: {
        tabs: ["Consola Agencia", "Vista Cliente (Tracker)"],
        projects: "Proyectos",
        search_placeholder: "Buscar...",
        project_list: [
          { name: "Villa Oasis", owner: "Martín V.", phase: "Cimientos" },
          { name: "Casa del Sol", owner: "Dubois", phase: "Tejado" },
          { name: "Sky Residence", owner: "Leroy", phase: "Acabados" }
        ],
        selected_project: "Villa Oasis",
        project_owner: "Martín V.",
        current_phase: "Cimientos",
        tabs_infos: ["Info", "Seguimiento", "Docs"],
        client_info: "Cliente",
        email: "martin@example.com",
        phone: "+34 123 456 789",
        cashback: "Cashback",
        pin: "PIN",
        copy: "Copiar",
        copied: "¡Copiado!",
        encryption: "Cifrado AES-256 Activo",
        agency_name: "AMARU-HOMES",
        quit: "Salir",
        documents: "Documentos",
        tech_reports: "Informes técnicos",
        report_date: "18 de marzo de 2026",
        expert: "Gaëtan M.",
        doc_filenames: ["Contrato preliminar.pdf", "Plano de situación.pdf", "Memoria técnica.pdf"],
        report_images: ["/mock/report1.jpg", "/mock/report2.jpg"],
        report_validated: "Informe de Inspección Validado",
        expertise: "Experticia"
      }
    },
    pricing: {
      tag: "Programa de Socios Fundadores (20 plazas)",
      title: "Invierte en tu",
      subtitle: "Infraestructura.",
      desc: "Acceso ilimitado a proyectos para todos los planes. Precios basados en número de usuarios y opciones de marca blanca. -50% de por vida.",
      cta: "Elegir este pack",
      popular: "Recomendado",
      billing: { monthly: "Mensual", yearly: "Anual", save: "Ahorra 20%" },
      perMonth: "/mes",
      packs: [
        { name: "Bronce", desc: "Para agentes independientes.", features: ["Proyectos ilimitados", "1 Acceso Staff", "Seguimiento tripartito", "Sistema Cashback", "Soporte email"] },
        { name: "Plata", desc: "Para agencias estructuradas.", features: ["Proyectos ilimitados", "5 Accesos Staff", "Branding personalizado", "Filtros XML", "Soporte prioritario"] },
        { name: "Oro", desc: "Para redes & holdings.", features: ["Proyectos ilimitados", "Staff ilimitado", "Marca blanca completa", "API & Webhooks", "Account manager"] }
      ]
    }
  },
  nl: {
    dir: 'ltr', label: "Nederlands",
    nav: ["Visie", "Werking", "Master Template", "Prijzen", "Beginnen"],
    hero: { tag: "Global Real Estate OS v1.2", title1: "Vastgoed", title2: "Zonder Grenzen.", desc: "De software-infrastructuur die de wereldwijde markt verenigt. Verbind uw lokale klanten met internationale kansen in één klik." },
    gap: {
      title1: "De", title2: "Vastgoedkloof overbruggen.",
      desc1: "Vandaag, wanneer een klant lokaal verkoopt om naar het buitenland te verhuizen, stopt de gegevensstroom. Het agentschap verliest controle en de klant verliest vertrouwen.",
      desc2: "Deelmodel: data-home.io automatiseert de commissie-terugbetaling. U genereert inkomsten op elke internationale transactie met volledige tracking voor u en uw klant."
    },
    how: {
      title: "Hoe het werkt:", subtitle: "Globale Stroom",
      steps: [
        { icon: MapPin, t: "1. Lokale Behoefte", d: "Uw klant wil in het buitenland investeren. Activeer zijn project via uw Master Template om de relatie te behouden." },
        { icon: Layers, t: "2. Verenigde Catalogus", d: "Krijg toegang tot gecertificeerde inventaris. Verkoopcommissies zijn contractueel vastgelegd tussen het agentschap en ons." },
        { icon: Camera, t: "3. Gedeelde Tracking", d: "Experts ter plaatse en fotoverslagen. U en uw klant volgen de voortgang in realtime op de interface." },
        { icon: ShieldCheck, t: "4. Commissie & Cashback", d: "Bij ondertekening wordt de commissie gedeeld. Het agentschap ontvangt zijn deel en de klant krijgt cashback." }
      ]
    },
    saas: {
      title: "Master Template", subtitle: "Configureerbaar",
      desc: "Meer dan een tool, het is uw eigen inkomsten-ecosysteem. Omdat elk project driedelige tracking (Wij, Agentschap, Klant) omvat, wordt de interface het draaipunt van de transactie.",
      features: [
        { icon: Palette, t: "Volledige Branding", d: "Het agentschap blijft het enige visuele contactpunt voor de eindklant." },
        { icon: Percent, t: "Inkomsten Delen", d: "Transparante tracking van gedeelde commissies op elk afgesloten dossier." },
        { icon: Workflow, t: "Cashback Beheer", d: "Beheer financiële voordelen die aan uw klanten worden teruggegeven om loyaliteit op te bouwen." },
        { icon: Settings, t: "Onbeperkte Toegang", d: "Geen projectlimieten. Uw groei is onze gedeelde prioriteit." }
      ],
      admin_cta: "Verken Admin Console",
      mockup: {
        tabs: ["Agentschap Console", "Klantweergave (Tracker)"],
        projects: "Projecten",
        search_placeholder: "Zoeken...",
        project_list: [
          { name: "Villa Oasis", owner: "Martin V.", phase: "Funderingen" },
          { name: "Casa del Sol", owner: "Dubois", phase: "Dakbedekking" },
          { name: "Sky Residence", owner: "Leroy", phase: "Afwerking" }
        ],
        selected_project: "Villa Oasis",
        project_owner: "Martin V.",
        current_phase: "Funderingen",
        tabs_infos: ["Info", "Opvolging", "Docs"],
        client_info: "Klant",
        email: "martin@example.com",
        phone: "+34 123 456 789",
        cashback: "Cashback",
        pin: "PIN",
        copy: "Kopiëren",
        copied: "Gekopieerd!",
        encryption: "AES-256 Versleuteling Actief",
        agency_name: "AMARU-HOMES",
        quit: "Afsluiten",
        documents: "Documenten",
        tech_reports: "Technische Rapporten",
        report_date: "18 maart 2026",
        expert: "Gaëtan M.",
        doc_filenames: ["Voorlopig contract.pdf", "Situatieplan.pdf", "Technische nota.pdf"],
        report_images: ["/mock/report1.jpg", "/mock/report2.jpg"],
        report_validated: "Gevalideerd Inspectierapport",
        expertise: "Expertise"
      }
    },
    pricing: {
      tag: "Founder Partner Program (20 plaatsen)",
      title: "Investeer in uw",
      subtitle: "Infrastructuur.",
      desc: "Onbeperkte projecten voor alle abonnementen. Prijzen op basis van aantal gebruikers en white-label opties. 50% korting voor het leven.",
      cta: "Kies dit pakket",
      popular: "Aanbevolen",
      billing: { monthly: "Maandelijks", yearly: "Jaarlijks", save: "Bespaar 20%" },
      perMonth: "/mnd",
      packs: [
        { name: "Brons", desc: "Voor onafhankelijke agenten.", features: ["Onbeperkte projecten", "1 Staff Toegang", "Driedelige tracking", "Cashback systeem", "E-mail ondersteuning"] },
        { name: "Zilver", desc: "Voor gestructureerde agentschappen.", features: ["Onbeperkte projecten", "5 Staff Toegangen", "Maatwerk branding", "XML filters", "Prioritaire ondersteuning"] },
        { name: "Goud", desc: "Voor netwerken & holdings.", features: ["Onbeperkte projecten", "Onbeperkt personeel", "Volledige white-label", "API & Webhooks", "Account manager"] }
      ]
    }
  },
  pl: {
    dir: 'ltr', label: "Polski",
    nav: ["Wizja", "Działanie", "Master Template", "Cennik", "Rozpocznij"],
    hero: { tag: "Globalny System Operacyjny Nieruchomości v1.2", title1: "Nieruchomości", title2: "Bez Granic.", desc: "Infrastruktura oprogramowania jednocząca globalny rynek. Połącz lokalnych klientów z międzynarodowymi możliwościami jednym kliknięciem." },
    gap: {
      title1: "Wypełnianie", title2: "Luki Nieruchomościowej.",
      desc1: "Dziś, gdy klient sprzedaje lokalnie, aby wyjechać za granicę, przepływ danych zatrzymuje się. Agencja traci kontrolę, a klient traci zaufanie.",
      desc2: "Model Udziału: data-home.io automatyzuje zwrot prowizji. Generujesz dochód z każdej międzynarodowej transakcji z pełnym śledzeniem dla Ciebie i Twojego klienta."
    },
    how: {
      title: "Jak to działa:", subtitle: "Globalny Przepływ",
      steps: [
        { icon: MapPin, t: "1. Lokalna Potrzeba", d: "Twój klient chce inwestować za granicą. Aktywujesz jego projekt za pomocą swojego Master Template, aby utrzymać kontrolę nad relacją." },
        { icon: Layers, t: "2. Ujednolicony Katalog", d: "Uzyskaj dostęp do certyfikowanego asortymentu. Prowizje ze sprzedaży są zabezpieczone umownie między agencją a nami." },
        { icon: Camera, t: "3. Wspólne Śledzenie", d: "Eksperci na miejscu i raporty zdjęciowe. Ty i Twój klient śledzicie postępy w czasie rzeczywistym w interfejsie." },
        { icon: ShieldCheck, t: "4. Prowizja i Cashback", d: "Przy podpisaniu prowizja jest dzielona. Agencja otrzymuje swoją część, a klient otrzymuje cashback." }
      ]
    },
    saas: {
      title: "Master Template", subtitle: "Konfigurowalny",
      desc: "To więcej niż narzędzie – to Twój własny ekosystem przychodów. Ponieważ każdy projekt obejmuje trójstronne śledzenie (My, Agencja, Klient), interfejs staje się osią transakcji.",
      features: [
        { icon: Palette, t: "Pełny Branding", d: "Agencja pozostaje jedynym wizualnym punktem kontaktowym dla klienta końcowego." },
        { icon: Percent, t: "Udział w Przychodach", d: "Przejrzyste śledzenie dzielonych prowizji w każdym zamkniętym pliku." },
        { icon: Workflow, t: "Zarządzany Cashback", d: "Zarządzaj korzyściami finansowymi zwracanymi klientom, aby budować lojalność." },
        { icon: Settings, t: "Nieograniczony Dostęp", d: "Bez limitów projektów. Twój rozwój jest naszym wspólnym priorytetem." }
      ],
      admin_cta: "Poznaj Konsolę Admina",
      mockup: {
        tabs: ["Konsola Agencji", "Widok Klienta (Tracker)"],
        projects: "Projekty",
        search_placeholder: "Szukaj...",
        project_list: [
          { name: "Villa Oasis", owner: "Marcin V.", phase: "Fundamenty" },
          { name: "Casa del Sol", owner: "Dubois", phase: "Dach" },
          { name: "Sky Residence", owner: "Leroy", phase: "Wykończenia" }
        ],
        selected_project: "Villa Oasis",
        project_owner: "Marcin V.",
        current_phase: "Fundamenty",
        tabs_infos: ["Info", "Postęp", "Dokumenty"],
        client_info: "Klient",
        email: "martin@example.com",
        phone: "+34 123 456 789",
        cashback: "Cashback",
        pin: "PIN",
        copy: "Kopiuj",
        copied: "Skopiowano!",
        encryption: "Szyfrowanie AES-256 Aktywne",
        agency_name: "AMARU-HOMES",
        quit: "Wyjdź",
        documents: "Dokumenty",
        tech_reports: "Raporty techniczne",
        report_date: "18 marca 2026",
        expert: "Gaëtan M.",
        doc_filenames: ["Umowa wstępna.pdf", "Plan sytuacyjny.pdf", "Dokumentacja techniczna.pdf"],
        report_images: ["/mock/report1.jpg", "/mock/report2.jpg"],
        report_validated: "Zatwierdzony Raport z Inspekcji",
        expertise: "Ekspertyza"
      }
    },
    pricing: {
      tag: "Program Partnerski Założycieli (20 miejsc)",
      title: "Zainwestuj w swoją",
      subtitle: "Infrastrukturę.",
      desc: "Nieograniczone projekty dla wszystkich planów. Ceny oparte na liczbie użytkowników i opcjach white-label. 50% zniżki dożywotnio.",
      cta: "Wybierz ten pakiet",
      popular: "Polecany",
      billing: { monthly: "Miesięcznie", yearly: "Rocznie", save: "Oszczędź 20%" },
      perMonth: "/mc",
      packs: [
        { name: "Brązowy", desc: "Dla niezależnych agentów.", features: ["Nieograniczone projekty", "1 dostęp dla personelu", "Śledzenie trójstronne", "System cashback", "Wsparcie email"] },
        { name: "Srebrny", desc: "Dla zorganizowanych agencji.", features: ["Nieograniczone projekty", "5 dostępów dla personelu", "Marka własna (logo)", "Filtry XML", "Priorytetowe wsparcie"] },
        { name: "Złoty", desc: "Dla sieci i holdingów.", features: ["Nieograniczone projekty", "Nieograniczony personel", "Pełny white-label", "API i webhooki", "Opiekun klienta"] }
      ]
    }
  },
  ar: {
    dir: 'rtl', label: "العربية",
    nav: ["الرؤية", "كيف يعمل", "القالب الرئيسي", "الأسعار", "ابدأ"],
    hero: { tag: "نظام التشغيل العقاري العالمي v1.2", title1: "العقارات", title2: "بلا حدود.", desc: "البنية التحتية البرمجية التي توحد السوق العالمية. اربط عملاءك المحليين بالفرص الدولية بنقرة واحدة." },
    gap: {
      title1: "سد", title2: "الفجوة العقارية.",
      desc1: "اليوم، عندما يبيع العميل محليًا للانتقال إلى الخارج، يتوقف تدفق البيانات. تفقد الوكالة السيطرة ويفقد العميل الثقة.",
      desc2: "نموذج المشاركة: تقوم data-home.io بأتمتة إعادة العمولات. يمكنك توليد دخل من كل صفقة دولية مع تتبع كامل لك ولعميلك."
    },
    how: {
      title: "كيف يعمل:", subtitle: "التدفق العالمي",
      steps: [
        { icon: MapPin, t: "١. الحاجة المحلية", d: "يريد عميلك الاستثمار في الخارج. قم بتفعيل مشروعه عبر قالبك الرئيسي للحفاظ على السيطرة على العلاقة." },
        { icon: Layers, t: "٢. كتالوج موحد", d: "الوصول إلى مخزون معتمد. عمولات البيع مضمونة تعاقديًا بين الوكالة ونحن." },
        { icon: Camera, t: "٣. تتبع مشترك", d: "خبراء في الموقع وتقارير مصورة. أنت وعميلك تتابعان التقدم في الوقت الفعلي على الواجهة." },
        { icon: ShieldCheck, t: "٤. العمولة واسترداد النقود", d: "عند التوقيع، يتم تقاسم العمولة. تحصل الوكالة على حصتها ويحصل العميل على الكاش باك." }
      ]
    },
    saas: {
      title: "القالب الرئيسي", subtitle: "قابل للتخصيص",
      desc: "أكثر من أداة، إنه نظام الإيرادات الخاص بك. نظرًا لأن كل مشروع يتضمن تتبعًا ثلاثيًا (نحن، الوكالة، العميل)، تصبح الواجهة محور الصفقة.",
      features: [
        { icon: Palette, t: "علامة تجارية كاملة", d: "تظل الوكالة نقطة الاتصال البصرية الوحيدة للعميل النهائي." },
        { icon: Percent, t: "مشاركة الإيرادات", d: "تتبع شفاف للعمولات المشتركة في كل ملف مغلق." },
        { icon: Workflow, t: "كاش باك مُدار", d: "إدارة المزايا المالية المعاد تقديمها لعملائك لبناء الولاء." },
        { icon: Settings, t: "وصول غير محدود", d: "لا حدود للمشاريع. نموك هو أولويتنا المشتركة." }
      ],
      admin_cta: "استكشاف لوحة التحكم",
      mockup: {
        tabs: ["وحدة تحكم الوكالة", "عرض العميل (المتعقب)"],
        projects: "المشاريع",
        search_placeholder: "بحث...",
        project_list: [
          { name: "فيلا الواحة", owner: "مارتن ف.", phase: "الأساسات" },
          { name: "كازا ديل سول", owner: "دوبوا", phase: "السقف" },
          { name: "سكاي ريزيدنس", owner: "لوروا", phase: "التشطيبات" }
        ],
        selected_project: "فيلا الواحة",
        project_owner: "مارتن ف.",
        current_phase: "الأساسات",
        tabs_infos: ["معلومات", "تتبع", "مستندات"],
        client_info: "العميل",
        email: "martin@example.com",
        phone: "+34 123 456 789",
        cashback: "كاش باك",
        pin: "رقم سري",
        copy: "نسخ",
        copied: "تم النسخ!",
        encryption: "تشفير AES-256 نشط",
        agency_name: "AMARU-HOMES",
        quit: "خروج",
        documents: "المستندات",
        tech_reports: "تقارير فنية",
        report_date: "١٨ مارس ٢٠٢٦",
        expert: "غايتان م.",
        doc_filenames: ["عقد مبدئي.pdf", "مخطط الموقع.pdf", "مذكرة فنية.pdf"],
        report_images: ["/mock/report1.jpg", "/mock/report2.jpg"],
        report_validated: "تقرير فحص موثق",
        expertise: "خبرة"
      }
    },
    pricing: {
      tag: "برنامج الشركاء المؤسسين (20 مقعدًا)",
      title: "استثمر في",
      subtitle: "بنيتك التحتية.",
      desc: "مشاريع غير محدودة لجميع الخطط. تسعير يعتمد على عدد المستخدمين وخيارات العلامة البيضاء. خصم 50٪ مدى الحياة.",
      cta: "اختر هذه الباقة",
      popular: "موصى به",
      billing: { monthly: "شهري", yearly: "سنوي", save: "وفر 20٪" },
      perMonth: "/شهر",
      packs: [
        { name: "برونزي", desc: "للوكلاء المستقلين.", features: ["مشاريع غير محدودة", "وصول 1 موظف", "تتبع ثلاثي", "نظام كاش باك", "دعم بالبريد"] },
        { name: "فضي", desc: "للوكالات المنظمة.", features: ["مشاريع غير محدودة", "وصول 5 موظفين", "علامة تجارية مخصصة", "مرشحات XML", "دعم ذو أولوية"] },
        { name: "ذهبي", desc: "للشبكات والشركات القابضة.", features: ["مشاريع غير محدودة", "موظفين غير محدود", "علامة بيضاء كاملة", "API وخطافات الويب", "مدير حساب"] }
      ]
    }
  }
};

export default function DataHomeSolution() {
  const [lang, setLang] = useState<keyof typeof translations>('fr');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const DashboardMockup = () => {
    const [pinCopied, setPinCopied] = useState(false);

    return (
      <div className="w-full bg-[#0f172a] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[400px] sm:h-[500px] md:h-[600px] relative">
        <div className="h-12 sm:h-14 md:h-16 border-b border-white/5 bg-slate-900/50 flex items-center justify-between px-3 sm:px-4 md:px-6 shrink-0">
          <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-1 scrollbar-hide">
            {t.saas.mockup.tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all pb-1 border-b-2 ${activeTab === i ? 'border-emerald-500 text-white' : 'border-transparent text-slate-500'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-[7px] sm:text-[8px] font-black uppercase text-slate-500 tracking-tighter hidden sm:block">System_v1.2</div>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 flex items-center justify-center"><Users size={10} className="sm:size-12 text-emerald-500" /></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#020617]/40 custom-scrollbar">
          {activeTab === 0 ? (
            /* --- CONSOLE AGENCE (responsive) --- */
            <div className="flex flex-col sm:flex-row h-full">
              {/* Sidebar projets - sur mobile, pleine largeur */}
              <div className="w-full sm:w-2/5 border-r border-white/5 p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4 bg-black/20">
                <div className="relative">
                  <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-600" size={12} />
                  <input
                    type="text"
                    placeholder={t.saas.mockup.search_placeholder}
                    className="w-full pl-7 sm:pl-9 pr-2 sm:pr-3 py-2 sm:py-3 bg-white/5 rounded-xl text-[8px] sm:text-[10px] font-black border border-white/5 outline-none focus:border-emerald-500/50 placeholder:text-slate-700"
                  />
                </div>
                <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.saas.mockup.projects}</p>
                <div className="space-y-1 sm:space-y-2">
                  {t.saas.mockup.project_list.map((proj, idx) => (
                    <button
                      key={idx}
                      className={`w-full text-left p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border transition-all ${idx === 0 ? 'bg-emerald-500/10 border-emerald-500/50' : 'border-white/5 hover:bg-white/5'}`}
                    >
                      <p className="font-black text-[9px] sm:text-[10px] md:text-[11px] text-white uppercase tracking-tighter">{proj.owner}</p>
                      <p className="text-[7px] sm:text-[8px] md:text-[9px] font-black text-emerald-500 flex items-center gap-1 tracking-widest">
                        <MapPin size={8} className="sm:size-10" /> {proj.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenu principal du projet sélectionné */}
              <div className="w-full sm:w-3/5 p-2 sm:p-3 md:p-5 overflow-y-auto space-y-3 sm:space-y-4 md:space-y-5">
                <div className="flex justify-between items-start border-b border-white/5 pb-2 sm:pb-3 md:pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-black text-white uppercase tracking-tighter">{t.saas.mockup.selected_project}</h3>
                    <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                      <UserPlus size={10} className="sm:size-12" /> {t.saas.mockup.project_owner}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] sm:text-[10px] md:text-xs font-black text-emerald-500 uppercase tracking-widest">{t.saas.mockup.current_phase}</span>
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3 md:gap-6 border-b border-white/5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest overflow-x-auto pb-1">
                  {t.saas.mockup.tabs_infos.map((tab, i) => (
                    <button key={i} className={`pb-1 sm:pb-2 whitespace-nowrap ${i === 0 ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500'}`}>{tab}</button>
                  ))}
                </div>

                <div className="space-y-3 sm:space-y-4 md:space-y-5 pt-1 sm:pt-2">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                    <div>
                      <label className="text-[6px] sm:text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest">{t.saas.mockup.client_info}</label>
                      <p className="text-xs sm:text-sm font-bold text-white">Martin V.</p>
                    </div>
                    <div>
                      <label className="text-[6px] sm:text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest">Email</label>
                      <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-300">{t.saas.mockup.email}</p>
                    </div>
                    <div>
                      <label className="text-[6px] sm:text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest">Tél.</label>
                      <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-300">{t.saas.mockup.phone}</p>
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Euro size={14} className="sm:size-18 text-emerald-500" />
                      <span className="text-[7px] sm:text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest">{t.saas.mockup.cashback}</span>
                    </div>
                    <span className="text-sm sm:text-base md:text-lg font-black text-emerald-400">3 500 €</span>
                  </div>

                  <div className="bg-white/5 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock size={12} className="text-slate-500" />
                      <span className="text-[7px] sm:text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.saas.mockup.pin}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-white tracking-[0.3em]">240226</span>
                      <button
                        onClick={() => { setPinCopied(true); setTimeout(() => setPinCopied(false), 1500); }}
                        className="p-1 bg-white/5 rounded-lg text-slate-400 hover:text-emerald-500"
                      >
                        {pinCopied ? <Check size={10} /> : <Copy size={10} />}
                      </button>
                    </div>
                  </div>
                  <p className="text-[6px] sm:text-[7px] md:text-[8px] text-slate-600 font-bold uppercase flex items-center gap-2">
                    <ShieldCheck size={8} /> {t.saas.mockup.encryption}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* --- VUE CLIENT (Tracker) responsive --- */
            <div className="p-2 sm:p-3 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
              <div className="flex justify-between items-center bg-white/5 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500 p-1 sm:p-2 rounded-lg sm:rounded-xl"><HardHat size={14} className="sm:size-16 text-black" /></div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-black text-white">{t.saas.mockup.agency_name}</h2>
                    <p className="text-[7px] sm:text-[8px] text-emerald-400 font-black uppercase tracking-widest">{t.saas.mockup.current_phase}</p>
                  </div>
                </div>
                <button className="text-slate-500 hover:text-rose-500 text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                  <LogOut size={10} className="sm:size-12" /> {t.saas.mockup.quit}
                </button>
              </div>

              <div>
                <h3 className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FileText size={12} className="sm:size-14" /> {t.saas.mockup.documents}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {t.saas.mockup.doc_filenames.map((name, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white/5 border border-white/5 rounded-lg hover:bg-emerald-500/10 transition-all">
                      <span className="text-[7px] sm:text-[8px] font-bold truncate pr-2">{name}</span>
                      <Download size={10} className="text-slate-500" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <ShieldCheck size={12} className="sm:size-14" /> {t.saas.mockup.tech_reports}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  {[0, 1].map((idx) => (
                    <div key={idx} className="group bg-white/5 rounded-xl sm:rounded-2xl md:rounded-3xl border border-white/5 overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-all">
                      <div className="h-20 sm:h-24 md:h-32 relative bg-slate-800">
                        <div className="absolute inset-0 flex items-center justify-center text-slate-700"><ImageIcon size={18} className="sm:size-24" /></div>
                      </div>
                      <div className="p-2 sm:p-3 md:p-4 flex justify-between items-center">
                        <div>
                          <p className="text-[9px] sm:text-[10px] md:text-xs font-black text-white">{t.saas.mockup.report_date}</p>
                          <p className="text-[6px] sm:text-[7px] md:text-[8px] text-emerald-500 font-bold uppercase tracking-widest">{t.saas.mockup.report_validated}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[6px] sm:text-[7px] md:text-[8px] font-black text-slate-500 uppercase">{t.saas.mockup.expertise}</span>
                          <p className="text-[7px] sm:text-[8px] md:text-[9px] text-slate-300 font-bold">{t.saas.mockup.expert}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const PricingSection = () => {
    const icons = [<Zap size={20} />, <Star size={20} />, <Crown size={20} />];
    const monthlyBeta = [125, 249, 499];
    const getPrice = (base: number) => isYearly ? Math.floor(base * 0.8) : base;

    return (
      <section id="pricing" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-[#020617] relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[8px] sm:text-[10px] font-black uppercase mb-4 sm:mb-6 tracking-[0.2em]">{t.pricing.tag}</div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter">
              {t.pricing.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white italic font-light block sm:inline">{t.pricing.subtitle}</span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mb-10 sm:mb-12 md:mb-16">
            <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-colors ${!isYearly ? 'text-white' : 'text-slate-600'}`}>{t.pricing.billing.monthly}</span>
            <button onClick={() => setIsYearly(!isYearly)} className="w-14 h-7 sm:w-16 sm:h-8 bg-white/5 border border-white/10 rounded-full p-1 hover:bg-white/10 transition-all"><div className={`w-5 h-5 bg-emerald-500 rounded-full transition-transform duration-300 ${isYearly ? 'translate-x-8' : 'translate-x-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} /></button>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-colors ${isYearly ? 'text-white' : 'text-slate-600'}`}>{t.pricing.billing.yearly}</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[7px] sm:text-[9px] font-black px-1 sm:px-2 py-0.5 sm:py-1 rounded-md uppercase animate-pulse">{t.pricing.billing.save}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {t.pricing.packs.map((pack, i) => (
              <div key={i} className={`p-4 sm:p-6 md:p-8 lg:p-10 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] border transition-all duration-500 ${i === 1 ? 'bg-emerald-500/5 border-emerald-500/40 scale-105 shadow-2xl relative' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                {i === 1 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[8px] sm:text-[10px] font-black px-3 sm:px-6 py-1 sm:py-2 rounded-full uppercase tracking-widest">{t.pricing.popular}</div>}
                <div className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 md:p-5 bg-white/5 w-fit rounded-[1.5rem] sm:rounded-[2rem] text-emerald-400 border border-white/5">{icons[i]}</div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase mb-2 tracking-tighter">{pack.name}</h3>
                <p className="text-slate-500 text-[9px] sm:text-[10px] md:text-[11px] italic mb-4 sm:mb-6 md:mb-8 uppercase tracking-widest">{pack.desc}</p>
                <div className="flex items-baseline gap-2 mb-4 sm:mb-6 md:mb-8 border-b border-white/5 pb-4 sm:pb-6 md:pb-8">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white">{getPrice(monthlyBeta[i])}€</span>
                  <span className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-500 uppercase font-black">{t.pricing.perMonth}</span>
                </div>
                <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-6 sm:mb-8 md:mb-10">
                  {pack.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-400 font-medium tracking-tight"><Check size={16} className="sm:size-18 text-emerald-500 shrink-0" /> {f}</div>
                  ))}
                </div>
                <button className={`w-full py-3 sm:py-4 md:py-5 lg:py-6 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all ${i === 1 ? 'bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/30 hover:bg-emerald-400 hover:scale-[1.02]' : 'bg-white/10 text-white hover:bg-white/20'}`}>{t.pricing.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="bg-[#020617] text-white min-h-screen font-sans selection:bg-emerald-500/30 overflow-x-hidden relative" dir={t.dir}>

      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none">
        <Image src="/1.jpg" alt="Background" fill className="object-cover" priority />
      </div>

      <nav className="border-b border-white/5 px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center backdrop-blur-2xl sticky top-0 z-50 bg-[#020617]/90">
        <div className="relative h-10 w-24 sm:h-12 sm:w-32 md:w-64">
          <Image src="/logo_1.png" alt="Logo" fill className="object-contain object-left" />
        </div>

        {/* Menu desktop */}
        <div className="hidden lg:flex gap-8 xl:gap-10 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
          {t.nav.slice(0, 4).map((item, i) => <a key={i} href={`#${['vision','how','saas','pricing'][i]}`} className="hover:text-emerald-400 transition-colors">{item}</a>)}
        </div>

        <div className="flex items-center gap-2 sm:gap-5">
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsLangOpen(!isLangOpen)} className="p-2 hover:bg-white/5 rounded-full flex items-center gap-1 group transition-all">
              <Globe size={16} className="sm:size-20 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              <ChevronDown size={12} className={`text-slate-600 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>
            {isLangOpen && (
              <div className="absolute right-0 mt-4 w-36 sm:w-48 bg-[#0f172a] border border-white/10 rounded-[1.5rem] overflow-hidden shadow-3xl z-50 p-2">
                {(Object.keys(translations) as Array<keyof typeof translations>).map((l) => (
                  <button key={l} onClick={() => { setLang(l); setIsLangOpen(false); }} className={`w-full text-left px-3 sm:px-5 py-2 sm:py-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${lang === l ? 'text-emerald-400 bg-white/5' : 'text-slate-400 hover:bg-emerald-500 hover:text-slate-950'}`}>
                    {translations[l].label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="bg-emerald-500 text-slate-950 px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all whitespace-nowrap">{t.nav[4]}</button>
          
          {/* Bouton menu mobile */}
          <button className="lg:hidden p-2 text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu size={24} />
          </button>
        </div>

        {/* Menu mobile déroulant */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#0f172a] border-t border-white/5 p-4 flex flex-col gap-4 lg:hidden z-50">
            {t.nav.slice(0, 4).map((item, i) => (
              <a key={i} href={`#${['vision','how','saas','pricing'][i]}`} className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-emerald-400 py-2" onClick={() => setMobileMenuOpen(false)}>
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>

      <section id="vision" className="relative h-[70vh] sm:h-[80vh] md:h-[90vh] flex items-center justify-center overflow-hidden z-10">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-lighten">
          <source src="/hero_datahome.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/20 via-[#020617]/40 to-[#020617]"></div>
        <div className="relative z-10 text-center px-4 max-w-5xl">
          <div className="inline-block px-3 sm:px-5 py-1 sm:py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[9px] sm:text-[11px] font-black uppercase mb-6 sm:mb-10 tracking-[0.2em] sm:tracking-[0.3em]">{t.hero.tag}</div>
          <h1 className="text-[12vw] sm:text-[11vw] md:text-[95px] font-black tracking-tighter leading-[0.85] mb-6 sm:mb-10 uppercase">
            {t.hero.title1} <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-400 italic font-light block">{t.hero.title2}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-xl lg:text-2xl text-slate-300 font-light italic leading-relaxed tracking-tight">{t.hero.desc}</p>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 bg-slate-950/60 z-10 relative border-y border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-24 items-center">
          <div className="space-y-6 sm:space-y-8 md:space-y-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">{t.gap.title1} <br /><span className="text-emerald-500 font-light italic">{t.gap.title2}</span></h2>
            <div className="space-y-4 sm:space-y-6 md:space-y-8 text-slate-400 font-light text-base sm:text-lg md:text-xl leading-relaxed italic">
              <p>{t.gap.desc1}</p>
              <div className="p-4 sm:p-6 md:p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] sm:rounded-[2.5rem] flex gap-4 sm:gap-6"><Percent size={24} className="sm:size-28 text-emerald-500 shrink-0" /><p className="text-sm sm:text-base text-slate-300 not-italic tracking-tight leading-relaxed">{t.gap.desc2}</p></div>
            </div>
          </div>
          <div className="relative aspect-square md:aspect-video rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-emerald-500/20 shadow-3xl group">
            <Image src="/2.jpg" alt="Gap" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
          </div>
        </div>
      </section>

      <section id="how" className="py-16 sm:py-20 md:py-32 px-4 sm:px-6 z-10 relative">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter mb-12 sm:mb-16 md:mb-24 leading-none">{t.how.title} <br /><span className="text-emerald-500 font-light italic">{t.how.subtitle}</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {t.how.steps.map((step, i) => (
              <div key={i} className="bg-white/5 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 overflow-hidden text-left group hover:border-emerald-500/30 transition-all duration-500">
                <div className="relative aspect-video overflow-hidden border-b border-white/5">
                  <Image src={`/3.${i+1}.jpg`} alt={step.t} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4 md:space-y-5">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-emerald-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-500"><step.icon size={18} className="sm:size-24" /></div>
                  <h3 className="font-black text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-white leading-tight">{step.t}</h3>
                  <p className="text-slate-500 text-[9px] sm:text-[10px] md:text-[11px] leading-relaxed font-medium">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="saas" className="py-16 sm:py-20 md:py-32 lg:py-40 px-4 sm:px-6 bg-slate-950 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            <div className="space-y-8 sm:space-y-12 md:space-y-16">
              <div className="space-y-4 sm:space-y-6 md:space-y-8">
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85]">{t.saas.title} <br /><span className="text-emerald-500 font-light italic">{t.saas.subtitle}</span></h2>
                <p className="text-slate-400 font-light text-base sm:text-lg md:text-xl leading-relaxed italic border-l-4 border-emerald-500 pl-4 sm:pl-6 md:pl-8">{t.saas.desc}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {t.saas.features.map((f, i) => (
                  <div key={i} className="p-4 sm:p-6 md:p-8 bg-white/5 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] hover:border-emerald-500/20 transition-all duration-500">
                    <f.icon className="text-emerald-500 mb-4 sm:mb-6" size={24} />
                    <h4 className="font-black text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.2em] mb-2 text-white">{f.t}</h4>
                    <p className="text-slate-500 text-[9px] sm:text-[10px] md:text-[11px] leading-relaxed font-medium">{f.d}</p>
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-3 sm:gap-4 text-emerald-500 font-black uppercase text-[10px] sm:text-[11px] tracking-[0.3em] group">
                {t.saas.admin_cta} <ArrowRight size={16} className="sm:size-18 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

            <div className="relative group lg:sticky lg:top-40">
              <div className="absolute -inset-6 sm:-inset-8 md:-inset-10 bg-emerald-500/10 rounded-[3rem] sm:rounded-[4rem] md:rounded-[5rem] blur-[80px] sm:blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
              <DashboardMockup />
              <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-600 italic mt-4 sm:mt-6 md:mt-8 text-center uppercase tracking-[0.2em] sm:tracking-[0.25em] font-black opacity-60">
                Explore Dashboard Ecosystem • Tripartite Visualization
              </p>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

      <footer className="py-16 sm:py-20 md:py-24 border-t border-white/5 text-center opacity-40 z-10 relative bg-[#020617]">
        <div className="flex justify-center mb-6 sm:mb-8 md:mb-10">
          <div className="relative h-8 w-32 sm:h-10 sm:w-48 grayscale hover:grayscale-0 transition-all duration-700 cursor-pointer">
            <Image src="/logo_1.png" alt="Logo" fill className="object-contain" />
          </div>
        </div>
        <p className="text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-500">© 2026 data-home.io / Global SaaS Infrastructure / Mons, Belgium</p>
      </footer>
    </div>
  );
}