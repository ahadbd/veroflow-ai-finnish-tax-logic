'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  TrendingUp, 
  ChevronRight, 
  ShieldCheck, 
  Cpu, 
  Euro, 
  Check, 
  Zap,
  Smartphone,
  Mic,
  LogIn,
  Star,
  ArrowRight,
  Menu,
  X,
  CreditCard,
  Lock,
  ExternalLink,
  PieChart,
  Target,
  Globe,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  CheckCircle,
  Activity,
  Fingerprint,
  MapPin,
  Bike,
  Car,
  Zap as Truck,
  ArrowUp,
  Trophy,
  Wrench,
  Gauge
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SavingsCalculator from './SavingsCalculator';
import AppDemoCarousel from './AppDemoCarousel';
import IntegrationsWall from './IntegrationsWall';

interface VeroLandingProps {
  login: () => void;
  guestLogin: () => void;
}

const VeroLanding: React.FC<VeroLandingProps> = ({ login, guestLogin }) => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'fi'>('en');
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSent, setWaitlistSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const t = {
    en: {
      referral: {
        header: "Refer a Driver, Get Paid",
        sub: "Invite another courier and you both get €15 credit. Spread the flow.",
        cta: "GENERATE MY LINK",
        reward: "€15 / REFERRAL"
      },
      hero: "STOP LEAKING PROFIT",
      retain: "PROTECT",
      everyEuro: "EVERY EURO",
      sub: "Automate your Finnish tax returns. Track mileage. Predict maintenance. Unlock gamified goals. Built for Wolt & Uber Eats entrepreneurs — v1.7.",
      cta: "START SAVING NOW",
      demo: "INTERACTIVE DEMO",
      features: "Features",
      pricing: "Pricing",
      legal: "Legal",
      help: "Help",
      contact: "Contact",
      badge: "Built for Finnish Couriers",
      login: "Login",
      launch: "Launch App",
      getStarted: "Get Started",
      trust: {
        vat: { title: "25.5% VAT Ready", desc: "Always compliant with latest rules" },
        ai: { title: "Gemini 2.5 Flash", desc: "OCR, voice & shift intelligence" },
        gdpr: { title: "GDPR Compliant", desc: "Data stored in EU (Helsinki)" },
        sync: { title: "Multi-App Sync", desc: "Wolt & Uber Eats" },
      },
      pillars: {
        header: "Engineered for those who",
        headerAccent: "Ride to Win.",
        subHeader: "Professional tools for professional delivery entrepreneurs — v1.7 release.",
        handsFree: { title: "Hands-Free Logging", desc: 'Log tips and vehicle updates while driving. "Got a 5€ tip" — VeroFlow handles the rest. Auto-activates above 15 km/h.' },
        profit: { title: "Profit Optimization", desc: "See exactly where your money goes. Fuel, maintenance, insurance, and taxes — all visualized in real time." },
        ocr: { title: "Gemini OCR Intake", desc: "Snap a photo of any fuel receipt or weekly Wolt summary. Gemini 2.5 Flash extracts every cent in milliseconds." },
        yel: { title: "YEL Safety Net", desc: "Real-time monitoring of your annual income for YEL insurance thresholds. No surprise bills at year-end." },
        tax: { title: "Finnish Tax Pre-Set", desc: "Pre-configured with 2026 ALV thresholds and mileage deduction rates (€0.57/km). Auto-updates on law changes." },
        export: { title: "Accountant Export", desc: "Export tax-ready CSV/PDF with SHA-256 tamper-detection hash for Finnish accounting (Kirimarkku compatible)." },
        gamification: { title: "Gamified Goals", desc: "12 achievements, XP levels, streak heatmaps and confetti. Stay motivated across every shift, every week." },
        drivingMode: { title: "Adaptive HUD", desc: "Full-screen speed ring, live earnings, and mileage deduction banner. Glanceable 2-button layout while you ride." },
        maintenance: { title: "Predictive Maintenance", desc: "28-day rolling mileage average forecasts your next service date and tire wear before problems appear." }
      },
      ticker: {
        live: "LIVE:",
        drivers: "DRIVERS ACTIVE IN FINLAND",
        tracked: "SAVINGS UNLOCKED TODAY:",
        currency: "€",
        version: "V1.7 NOW LIVE"
      },
      privacy: {
        header: "Your Data Stays in",
        headerAccent: "Helsinki",
        sub: "Fully GDPR compliant. All financial data is processed and stored in the Google Cloud (europe-north1) server in Hamina, Finland.",
        secure: "AES-256 Encrypted",
        local: "Finnish Data Sovereignty",
        encryption: "End-to-End Security"
      },
      pricingSection: {
        header: "Choose your Flow",
        payAsYouGrow: "Pay-as-you-grow",
        riskFree: "Risk-free trial",
        mostPopular: "MOST POPULAR",
        starter: {
          name: "Starter",
          freq: "/ Free Forever",
          desc: "Perfect for new couriers. No credit card required.",
          f1: "Manual Shift Logging",
          f2: "Basic Daily Analytics",
          f3: "Finnish Tax Cheat Sheet",
          f4: "Max 10 shifts per month",
          f5: "Local data storage only",
          cta: "START FOR FREE"
        },
        pro: {
          name: "VeroPro",
          freq: "/ Month",
          desc: "For the professional courier who values their time.",
          f1: "Unlimited AI Shift Scanning",
          f2: "Gemini AI Voice Commands",
          f3: "Automatic YEL Threshold Alerts",
          f4: "OCR Receipt Expense Tracking",
          f5: "Priority Driver Support",
          cta: "GO PRO NOW"
        },
        elite: {
          name: "Elite",
          freq: "/ Month",
          desc: "Full automation for high-volume delivery businesses.",
          f1: "Direct Accountant Data Export",
          f2: "Fleet Management (Up to 3 vehicles)",
          f3: "Full 2026 Tax Engine Access",
          f4: "Exclusive Beta Feature Access",
          f5: "Monthly Profit Optimization Call",
          cta: "CONTACT SALES"
        }
      },
      ctaSection: {
        header: "Ready to ",
        headerAccent: "Secure ",
        headerEnd: "Your Future?",
        sub: "Join hundreds of Finnish delivery entrepreneurs automating their success.",
        join: "JOIN NOW",
        secure: "SECURE STORAGE",
        stripe: "STRIPE PAYMENTS"
      },
      footer: {
        about: "Automated financial intelligence for the Finnish platform economy. Helping couriers focus on what they do best - delivering success.",
        platform: "Platform",
        legalTitle: "Legal",
        support: "Support",
        links: {
          demo: "Live Demo",
          features: "Features",
          pricing: "Pricing",
          mobile: "Mobile App",
          terms: "Terms of Service",
          privacy: "Privacy Policy",
          notice: "Legal Notice",
          cookies: "Cookie Settings",
          help: "Help Center",
          api: "API Status",
          contact: "Contact Us"
        },
        rights: "© 2026 VeroFlow AI Inc. | HELSINKI, FINLAND",
        trusted: "Trusted by ",
        drivers: " drivers"
      },
      howItWorks: {
        header: "Three Steps to",
        headerAccent: "Profit.",
        step1: { title: "Automated Sync", desc: "Connect your apps or upload screenshots. Gemini AI extracts every cent." },
        step2: { title: "Daily Insight", desc: "See your real earnings after taxes, YEL, and fuel. No more guessing." },
        step3: { title: "Tax-Ready", desc: "Export your data directly to your accountant. Focus on the road, not the books." }
      },
      lossAversion: {
        header: "The Cost of",
        headerAccent: "Inaction.",
        sub: "Manual tracking isn't just slow—it's expensive.",
        items: [
          { title: "€1,400+", label: "Avg. annual missed deductions in Finland" },
          { title: "16 Hours", label: "Monthly spent on manual receipt management" },
          { title: "Risk", label: "Of incorrect YEL contributions & tax audits" }
        ]
      },
      testimonials: {
        header: "Driver",
        headerAccent: "Voices",
        verified: "Verified Entrepreneur",
        t1: { name: "Antti K.", platform: "Wolt / Helsinki", quote: "VeroFlow saved me €180 in my first month just by tracking mileage I used to forget.", vehicle: "Car" },
        t2: { name: "Maria S.", platform: "Uber Eats / Espoo", quote: "The YEL alert is a life-saver. I finally know exactly where I stand with my insurance.", vehicle: "Bike" },
        t3: { name: "Omar F.", platform: "Uber Eats / Vantaa", quote: "Finally, a tool that understands the Finnish tax system. The 25.5% ALV update was instant.", vehicle: "Truck" }
      },
      faq: {
        header: "Common",
        headerAccent: "Questions",
        items: [
          { q: "Is VeroFlow legally compliant with Finnish tax rules?", a: "Yes, VeroFlow is engineered for the 2026 Finnish tax environment, including the 25.5% ALV (VAT) and standard mileage deductions at €0.57/km." },
          { q: "Does it work with Wolt and Uber Eats?", a: "Absolutely. Our Gemini 2.5 Flash OCR can parse weekly summaries and shift screenshots from Wolt and Uber Eats in Finland in under 500ms." },
          { q: "What is the 'YEL Safety Net'?", a: "VeroFlow monitors your cumulative annual income to alert you when you approach the Finnish YEL insurance thresholds, preventing year-end surprise bills." },
          { q: "Can I use this for my accounting?", a: "Yes. Every PDF report includes a SHA-256 tamper-detection hash and is formatted to meet Finnish accounting standards (Kirimarkku compatible)." },
          { q: "What is Predictive Maintenance?", a: "VeroFlow calculates a 28-day rolling average of your driven kilometres and uses it to forecast your next oil service date and tire wear level — so you're never caught off guard." },
          { q: "What does the Gamification system do?", a: "You earn XP and level up through 10 courier ranks by completing shifts, maintaining streaks, and hitting weekly earnings goals. 12 achievements unlock with animated confetti rewards." }
        ]
      },
      waitlist: {
        title: "Join the Waitlist",
        desc: "VeroPro and Elite are launching in waves to ensure zero-downtime for our drivers. Secure your spot now.",
        placeholder: "Enter your email",
        cta: "NOTIFY ME",
        success: "You're on the list! We'll reach out directly with your early access invite."
      }
    },
    fi: {
      referral: {
        header: "Suosittele kuskia, ansaitse",
        sub: "Kutsu toinen lähetti ja molemmat saatte 15 € krediittiä. Anna hyvän kiertää.",
        cta: "LUO SUOSITTELULINKKI",
        reward: "15 € / SUOSITTELU"
      },
      hero: "LOPETA TUOTON MENETYS",
      retain: "TURVAA",
      everyEuro: "JOKAINEN EURO",
      sub: "Automatisoi veroilmoituksesi ja säästä tuhansia euroja kilometrivähennyksissä. Suunniteltu suomalaisille Wolt ja Uber Eats -yrittäjille.",
      cta: "ALOITA SÄÄSTÄMINEN",
      demo: "INTERAKTIIVINEN DEMO",
      features: "Ominaisuudet",
      pricing: "Hinnoittelu",
      legal: "Laki",
      help: "Tuki",
      contact: "Ota Yhteyttä",
      badge: "Suomalaisille Läheteille",
      login: "Kirjaudu",
      launch: "Käynnistä Sovellus",
      getStarted: "Aloita Nyt",
      trust: {
        vat: { title: "ALV 25.5% Valmis", desc: "Aina ajan tasalla säännösten kanssa" },
        ai: { title: "Gemini 2.5 Flash", desc: "OCR, ääni ja vuoroäly" },
        gdpr: { title: "GDPR-Yhteensopiva", desc: "Tiedot EU:ssa (Helsinki)" },
        sync: { title: "Multi-App Synkronointi", desc: "Wolt & Uber Eats" },
      },
      pillars: {
        header: "Suunniteltu heille, jotka",
        headerAccent: "Ajavat Voittaakseen.",
        subHeader: "Ammattilaistyökalut ammattimaisille lähettiyrittäjille — v1.7 julkaisu.",
        handsFree: { title: "Hands-Free Kirjaus", desc: 'Kirjaa tipit ja ajoneuvopäivitykset ajaessasi. "Sain 5€ tipin" — VeroFlow hoitaa loput. Aktivoituu automaattisesti yli 15 km/h.' },
        profit: { title: "Voiton Optimointi", desc: "Näe tarkalleen minne rahasi menevät. Polttoaine, huolto, vakuutukset ja verot — visualisoituna reaaliajassa." },
        ocr: { title: "Gemini OCR-luku", desc: "Ota kuva polttoainekuitista tai Wolt-yhteenvedosta. Gemini 2.5 Flash lukee jokaisen sentin millisekunneissa." },
        yel: { title: "YEL-Turvaverkko", desc: "Seuraa vuositulojasi reaaliajassa YEL-työtulorajojen suhteen. Ei yllätyslaskuja vuoden lopussa." },
        tax: { title: "Suomen Veroasetukset", desc: "Valmiiksi konfiguroidut 2026 ALV-rajat ja kilometrivähennykset (0,57€/km). Päivittyy lainmuutoksilla." },
        export: { title: "Kirjanpitäjän Export", desc: "Lataa verovalmiit CSV/PDF-raportit SHA-256-tiivisteellä suomalaisille kirjanpitostandardeille (Kirimarkku-yhteensopiva)." },
        gamification: { title: "Pelillistetyt Tavoitteet", desc: "12 saavutusta, XP-tasot, streakikartat ja konfettianimaatiot. Pysy motivoituneena jokaisessa vuorossa." },
        drivingMode: { title: "Adaptiivinen HUD", desc: "Koko näytön nopeusmittari, reaaliaikaiset ansiot ja kilometrivähennysbanneri. Helppolukuinen 2-painikkeen layout ajaessa." },
        maintenance: { title: "Ennakoiva Huolto", desc: "28 päivän rullaava kilometrikeskiarvo ennustaa seuraavan huollon ja renkaiden kulumisen ennen ongelmia." }
      },
      ticker: {
        live: "LIVE:",
        drivers: "KUSKIA AKTIIVISENA SUOMESSA",
        tracked: "TÄNÄÄN LÖYTYNEET SÄÄSTÖT:",
        currency: "€",
        version: "V1.7 NYT LIVE"
      },
      privacy: {
        header: "Tietosi Pysyvät",
        headerAccent: "Helsingissä",
        sub: "Täysin GDPR-yhteensopiva. Kaikki taloustiedot käsitellään ja säilytetään Google Cloudin (europe-north1) palvelimella Haminassa.",
        secure: "AES-256 Salattu",
        local: "Kotimainen Tietosuoja",
        encryption: "Päästä-päähän Suojaus"
      },
      pricingSection: {
        header: "Valitse Tasosi",
        payAsYouGrow: "Maksa kun kasvat",
        riskFree: "Riskitön kokeilu",
        mostPopular: "SUOSITUIN",
        starter: {
          name: "Starter",
          freq: "/ Ilmainen Ikuisesti",
          desc: "Täydellinen uusille läheteille. Ei luottokorttia.",
          f1: "Manuaalinen vuorojen kirjaus",
          f2: "Päivittäinen perusanalyysi",
          f3: "Suomen vero-opas luntille",
          f4: "Max 10 vuoroa kuukaudessa",
          f5: "Vain paikallinen tallennus",
          cta: "ALOITA ILMAISEKSI"
        },
        pro: {
          name: "VeroPro",
          freq: "/ Kuukausi",
          desc: "Ammattimaiselle lähetille, joka arvostaa aikaansa.",
          f1: "Rajoittamaton AI-vuoroskannaus",
          f2: "Gemini AI -äänikomennot",
          f3: "Automaattiset YEL-rajahälytykset",
          f4: "OCR-kuittien kuluseuranta",
          f5: "Priorisoitu tuki kuljettajille",
          cta: "SIIRRY PRO-TASOON"
        },
        elite: {
          name: "Elite",
          freq: "/ Kuukausi",
          desc: "Täysi automaatio suuren volyymin lähettiyrityksille.",
          f1: "Suora vienti kirjanpitäjälle",
          f2: "Kaluston hallinta (Max 3 autoa)",
          f3: "Täysi 2026 veromoottorin käyttö",
          f4: "Pääsy eksklusiivisiin beta-ominaisuuksiin",
          f5: "Kuukausittainen tuoton optimointipuhelu",
          cta: "OTA YHTEYTTÄ MYYNTIIN"
        }
      },
      ctaSection: {
        header: "Oletko valmis ",
        headerAccent: "Turvaamaan ",
        headerEnd: "Tulevaisuutesi?",
        sub: "Liity satojen suomalaisten lähettiyrittäjien joukkoon ja automatisoi menestyksesi.",
        join: "LIITY NYT",
        secure: "TURVALLINEN TALLENNUS",
        secure_desc: "Tiedot salattu ja tallennettu Helsinkiin.",
        stripe: "STRIPE-MAKSUT"
      },
      footer: {
        about: "Automatisoitu talousäly suomalaiselle alustataloudelle. Autamme lähettejä keskittymään siihen, mitä he tekevät parhaiten - toimittamaan menestystä.",
        platform: "Alusta",
        legalTitle: "Laki",
        support: "Tuki",
        links: {
          demo: "Live-demo",
          features: "Ominaisuudet",
          pricing: "Hinnasto",
          mobile: "Mobiilisovellus",
          terms: "Käyttöehdot",
          privacy: "Tietosuojaseloste",
          notice: "Oikeudellinen huomautus",
          cookies: "Evästeasetukset",
          help: "Tukikeskus",
          api: "API-tila",
          contact: "Ota yhteyttä"
        },
        rights: "© 2026 VeroFlow AI Inc. | HELSINKI, SUOMI",
        trusted: "Luotettu ",
        drivers: " kuljettajan toimesta"
      },
      howItWorks: {
        header: "Kolme askelta",
        headerAccent: "Tuottoon.",
        step1: { title: "Automatisoitu Synkronointi", desc: "Yhdistä sovelluksesi tai lataa kuvat. Gemini AI lukee jokaisen sentin." },
        step2: { title: "Päivittäinen Näkemys", desc: "Näe todelliset tulosi verojen, YEL:n ja polttoaineen jälkeen. Ei enää arvailua." },
        step3: { title: "Verovalmis Export", desc: "Vie tietosi suoraan kirjanpitäjälle. Keskity tiehen, älä kirjanpitoon." }
      },
      lossAversion: {
        header: "Toimettomuuden",
        headerAccent: "Hinta.",
        sub: "Manuaalinen seuranta ei ole vain hidasta – se on kallista.",
        items: [
          { title: "1 400€+", label: "Keskimääräiset menetetyt vähennykset Suomessa" },
          { title: "16 Tuntia", label: "Kuukaudessa käytetty manuaaliseen kuitinhallintaan" },
          { title: "Riski", label: "Virheellisistä YEL-maksuista ja verotarkastuksista" }
        ]
      },
      testimonials: {
        header: "Kuskien",
        headerAccent: "Ääni",
        verified: "Vahvistettu Yrittäjä",
        t1: { name: "Antti K.", platform: "Wolt / Helsinki", quote: "VeroFlow säästi minulta 180€ ensimmäisessä kuussa pelkästään unohtuneiden kilometrien kirjauksella.", vehicle: "Car" },
        t2: { name: "Maria S.", platform: "Uber Eats / Espoo", quote: "YEL-hälytys on hengenpelastaja. Tiedän vihdoin tarkalleen, missä menen vakuutukseni suhteen.", vehicle: "Bike" },
        t3: { name: "Omar F.", platform: "Uber Eats / Vantaa", quote: "Vihdoinkin työkalu, joka ymmärtää Suomen verotusta. 25.5% ALV-päivitys oli välitön.", vehicle: "Truck" }
      },
      faq: {
        header: "Yleiset",
        headerAccent: "Kysymykset",
        items: [
          { q: "Onko VeroFlow laillisesti pätevä Suomen verotuksessa?", a: "Kyllä, VeroFlow on suunniteltu Suomen 2026 veroympäristöön, sisältäen 25.5% ALV:n ja viralliset kilometrivähennykset." },
          { q: "Toimiiko se Woltin ja Uber Eatsin kanssa?", a: "Ehdottomasti. Gemini 2.5 Flash OCR lukee viikkoyhteenvedot ja kuvakaappaukset Woltista ja Uber Eatsista alle 500ms." },
          { q: "Mikä on 'YEL-turvaverkko'?", a: "VeroFlow seuraa kertyneitä vuositulojasi ja varoittaa, kun lähestyt YEL-vakuutuksen työtulorajoja, välttäen yllätyslaskut." },
          { q: "Voinko käyttää tätä kirjanpitoon?", a: "Kyllä. Voit ladata verovalmiit CSV- ja PDF-raportit, jotka on muotoiltu vastaamaan suomalaisia kirjanpitostandardeja (Kirimarkku-yhteensopiva)." }
        ]
      },
      waitlist: {
        title: "Liity Odotuslistalle",
        desc: "VeroPro ja Elite julkaistaan vaiheittain taataksemme kuskien häiriöttömän käytön. Varaa paikkasi nyt.",
        placeholder: "Syötä sähköpostisi",
        cta: "ILMOITA MINULLE",
        success: "Olet listalla! Otamme sinuun yhteyttä suoraan ennakko-osallistumiskutsulla."
      }
    }
  }[lang];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tiers = [
    {
      name: t.pricingSection.starter.name,
      id: "starter",
      price: "€0",
      frequency: t.pricingSection.starter.freq,
      description: t.pricingSection.starter.desc,
      features: [
        t.pricingSection.starter.f1,
        t.pricingSection.starter.f2,
        t.pricingSection.starter.f3,
        t.pricingSection.starter.f4,
        t.pricingSection.starter.f5
      ],
      cta: t.pricingSection.starter.cta,
      popular: false,
      tierIcon: Target
    },
    {
      name: t.pricingSection.pro.name,
      id: "pro",
      price: "€29.99",
      frequency: t.pricingSection.pro.freq,
      description: t.pricingSection.pro.desc,
      features: [
        t.pricingSection.pro.f1,
        t.pricingSection.pro.f2,
        t.pricingSection.pro.f3,
        t.pricingSection.pro.f4,
        t.pricingSection.pro.f5
      ],
      cta: t.pricingSection.pro.cta,
      popular: true,
      tierIcon: Zap,
      priceId: "price_PRO_STUB" // Replace with real Stripe Price ID
    },
    {
      name: t.pricingSection.elite.name,
      id: "elite",
      price: "€44.99",
      frequency: t.pricingSection.elite.freq,
      description: t.pricingSection.elite.desc,
      features: [
        t.pricingSection.elite.f1,
        t.pricingSection.elite.f2,
        t.pricingSection.elite.f3,
        t.pricingSection.elite.f4,
        t.pricingSection.elite.f5
      ],
      cta: t.pricingSection.elite.cta,
      popular: false,
      tierIcon: Star,
      priceId: "price_ELITE_STUB" // Replace with real Stripe Price ID
    }
  ];

  const handleCheckout = async (priceId: string) => {
    if (!priceId || priceId.includes('STUB')) {
      setShowWaitlist(true);
      return;
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: 'ANONYMOUS', // Ideally from Auth, but we can pass a dummy for now
          userEmail: 'courier@example.com',
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.assign(url);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert(lang === 'en' ? 'Failed to launch checkout.' : 'Kassan avaaminen epäonnistui.');
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans overflow-x-hidden selection:bg-brand/30 selection:text-brand">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 right-0 h-screen pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 py-4 flex justify-between items-center ${isScrolled ? 'bg-black/60 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent'}`}>
        <Link 
          href="/" 
          className="flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 group cursor-pointer"
        >
          <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group-hover:border-brand/30 group-hover:shadow-[0_0_20px_rgba(57,255,20,0.1)] transition-all">
            <Image src="/logo.svg" alt="VeroFlow" width={28} height={28} />
          </div>
          <span className="font-display font-black text-2xl tracking-tighter uppercase italic group-hover:text-brand transition-colors">VeroFlow</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-6">
                  {[
                    { name: t.features, id: 'features', href: '#features' },
                    { name: t.pricing, id: 'pricing', href: '#pricing' },
                    { name: t.help, id: 'help', href: '/help', isLink: true },
                    { name: t.contact, id: 'contact', href: '/contact', isLink: true }
                  ].map((item) => (
                      item.isLink ? (
                        <Link 
                          key={item.id} 
                          href={item.href}
                          className="text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-brand transition-colors"
                        >
                            {item.name}
                        </Link>
                      ) : (
                        <a 
                          key={item.id} 
                          href={item.href}
                          className="text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-brand transition-colors"
                        >
                            {item.name}
                        </a>
                      )
                  ))}
              </nav>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLang(lang === 'en' ? 'fi' : 'en')}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all"
              >
                <Globe size={14} /> {lang === 'en' ? 'FI' : 'EN'}
              </button>
              <button onClick={() => router.push('/login')} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors border border-white/5 rounded-full hover:bg-white/5">
                {t.login}
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="px-6 py-2.5 bg-brand text-[#050505] rounded-full font-display font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(57,255,20,0.3)] hover:shadow-[0_4px_30px_rgba(57,255,20,0.5)]"
              >
                {t.launch}
              </button>
            </div>
        </div>

        {/* Mobile menu trigger */}
        <button 
          className="md:hidden text-white/50 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
            {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-3xl pt-24 px-8 md:hidden"
            >
                 <div className="flex flex-col gap-8">
                    {[
                       { name: t.features, id: 'features', href: '#features' },
                       { name: t.pricing, id: 'pricing', href: '#pricing' },
                       { name: t.help, id: 'help', href: '/help', isLink: true },
                       { name: t.contact, id: 'contact', href: '/contact', isLink: true }
                    ].map(item => (
                        item.isLink ? (
                          <Link 
                            key={item.id} 
                            href={item.href} 
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-4xl font-display font-black uppercase italic tracking-tighter"
                          >
                              {item.name}
                          </Link>
                        ) : (
                          <a 
                            key={item.id} 
                            href={item.href} 
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-4xl font-display font-black uppercase italic tracking-tighter"
                          >
                              {item.name}
                          </a>
                        )
                    ))}
                    <hr className="border-white/10" />
                    <button onClick={() => router.push('/login')} className="w-full py-6 bg-brand text-[#050505] rounded-3xl font-display font-black uppercase text-2xl shadow-xl">{t.getStarted}</button>
                 </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-10 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-1.5 bg-brand/10 border border-brand/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-brand shadow-[0_0_20px_rgba(57,255,20,0.1)] mb-4"
          >
            {t.badge}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-[7.5rem] font-display font-black tracking-tighter leading-[0.85] uppercase italic"
          >
            {t.hero} <br />
            <span className="text-white/20">{t.retain}</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-emerald-400 to-emerald-600 animate-gradient-x">{t.everyEuro}</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto text-xl md:text-[1.3rem] leading-relaxed font-medium italic opacity-80"
          >
            {t.sub}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 w-full"
          >
            <button 
              onClick={() => router.push('/login')}
              className="group relative w-full sm:w-[280px] h-[72px] bg-brand text-[#050505] rounded-[24px] font-display font-black text-xl flex items-center justify-center gap-3 overflow-hidden shadow-[0_10px_40px_rgba(57,255,20,0.3)] hover:shadow-[0_15px_50px_rgba(57,255,20,0.5)] transition-all hover:scale-[1.03] active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2 uppercase tracking-tight">{t.cta} <ArrowRight size={20} className="group-hover:translate-x-1 duration-300" /></span>
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="w-full sm:w-[280px] h-[72px] bg-white/5 border border-white/10 rounded-[24px] font-display font-black text-xl flex items-center justify-center hover:bg-white/[0.08] transition-all active:scale-95 text-white/50 hover:text-white uppercase tracking-tight"
            >
              {t.demo}
            </button>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center items-center gap-8 pt-16 opacity-30 grayscale contrast-125"
          >
              <div className="text-xl font-black italic tracking-widest uppercase opacity-40">WOLT</div>

              <div className="text-xl font-black italic tracking-widest uppercase opacity-40">UBER EATS</div>
          </motion.div>
        </div>

        {/* Dashboard Preview Layer */}
        <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: 'spring', damping: 20 }}
            className="mt-20 max-w-6xl mx-auto relative group"
        >
            <div className="absolute inset-0 bg-brand/20 blur-[130px] rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="p-1 px-1.5 pb-0 bg-gradient-to-b from-white/15 to-transparent rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9]">
                <div className="w-full h-full bg-[#0a0a0a] rounded-[2.2rem] overflow-hidden flex flex-col">
                    <div className="h-10 border-b border-white/5 flex items-center justify-between px-6 bg-white/[0.02]">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                        </div>
                        <div className="px-3 py-1 bg-white/5 rounded-md text-[8px] font-black tracking-widest text-white/20 uppercase italic">https://app.veroflow.fi</div>
                        <div className="w-10" />
                    </div>
                    <div className="flex-1 relative overflow-hidden group">
                        <Image 
                          src="/dashboard_snapshot.png" 
                          alt="VeroFlow Dashboard — Real Product Screenshot" 
                          fill
                          className="object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                        />
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Interactive Calculator Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 w-full"
        >
          <SavingsCalculator lang={lang} onAction={() => router.push('/login')} />
        </motion.div>
      </section>

      {/* Compliance Badges */}
      <section className="py-12 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 h-full flex flex-wrap justify-center items-center gap-12 md:gap-24 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
           <div className="flex items-center gap-2 font-display font-black italic text-xl tracking-tighter uppercase"><ShieldCheck className="text-brand" size={24} /> ALV 25.5% READY</div>
           <div className="flex items-center gap-2 font-display font-black italic text-xl tracking-tighter uppercase"><Check className="text-brand" size={24} /> VERO COMPLIANT</div>
           <div className="flex items-center gap-2 font-display font-black italic text-xl tracking-tighter uppercase"><Lock className="text-brand" size={24} /> GDPR HELSINKI</div>
           <div className="flex items-center gap-2 font-display font-black italic text-xl tracking-tighter uppercase"><TrendingUp className="text-brand" size={24} /> YEL SECURE</div>
        </div>
      </section>

      {/* Live Ticker */}
      <div className="bg-brand py-4 overflow-hidden relative z-10 border-y border-black">
        <div className="flex animate-scroll whitespace-nowrap gap-12">
           {[1,2,3,4,5,6].map(i => (
             <div key={i} className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-[#050505] animate-pulse" />
                  <span className="text-[#050505] font-display font-black italic text-sm tracking-widest uppercase">
                    {t.ticker.live} <span className="text-black/60">2,100+</span> {t.ticker.drivers}
                  </span>
                </div>
                <div className="w-1 h-1 bg-black/40 rounded-full" />
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-[#050505] fill-black" />
                  <span className="text-[#050505] font-display font-black italic text-sm tracking-widest uppercase">
                    {t.ticker.tracked} <span className="text-black/60">58,200</span>{t.ticker.currency}
                  </span>
                </div>
                <div className="w-1 h-1 bg-black/40 rounded-full" />
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-[#050505]" />
                  <span className="text-[#050505] font-display font-black italic text-sm tracking-widest uppercase">
                    {t.ticker.version}
                  </span>
                </div>
                <div className="w-1 h-1 bg-black/40 rounded-full" />
             </div>
           ))}
        </div>
      </div>

      {/* Trust Badges */}
      <section className="py-20 px-6 border-y border-white/5">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                  { title: t.trust.vat.title, desc: t.trust.vat.desc, icon: ShieldCheck },
                  { title: t.trust.ai.title, desc: t.trust.ai.desc, icon: Cpu },
                  { title: t.trust.gdpr.title, desc: t.trust.gdpr.desc, icon: Lock },
                  { title: t.trust.sync.title, desc: t.trust.sync.desc, icon: Smartphone }
              ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                          <item.icon size={18} className="text-brand" />
                      </div>
                      <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase tracking-wider">{item.title}</h4>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{item.desc}</p>
                      </div>
                  </div>
              ))}
          </div>
      </section>

      {/* Value Pillars */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="max-w-3xl space-y-6">
            <h2 className="text-4xl md:text-7xl font-display font-black uppercase tracking-tighter italic leading-[0.9]">
                {t.pillars.header} <span className="text-brand">{t.pillars.headerAccent}</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs italic">
                {t.pillars.subHeader}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: Mic, 
                title: t.pillars.handsFree.title, 
                desc: t.pillars.handsFree.desc,
                gradient: "from-blue-500/20",
                badge: null
              },
              { 
                icon: PieChart, 
                title: t.pillars.profit.title, 
                desc: t.pillars.profit.desc,
                gradient: "from-brand/20",
                badge: null
              },
              { 
                icon: CreditCard, 
                title: t.pillars.ocr.title, 
                desc: t.pillars.ocr.desc,
                gradient: "from-purple-500/20",
                badge: "Gemini 2.5 Flash"
              },
              { 
                icon: Smartphone, 
                title: t.pillars.yel.title, 
                desc: t.pillars.yel.desc,
                gradient: "from-orange-500/20",
                badge: null
              },
              { 
                icon: ShieldCheck, 
                title: t.pillars.tax.title, 
                desc: t.pillars.tax.desc,
                gradient: "from-emerald-500/20",
                badge: "2026 Rate"
              },
              { 
                icon: ExternalLink, 
                title: t.pillars.export.title, 
                desc: t.pillars.export.desc,
                gradient: "from-pink-500/20",
                badge: "SHA-256"
              },
              { 
                icon: Trophy, 
                title: t.pillars.gamification.title, 
                desc: t.pillars.gamification.desc,
                gradient: "from-yellow-500/20",
                badge: "NEW ★ v1.6"
              },
              { 
                icon: Gauge, 
                title: t.pillars.drivingMode.title, 
                desc: t.pillars.drivingMode.desc,
                gradient: "from-cyan-500/20",
                badge: "NEW ★ v1.5"
              },
              { 
                icon: Wrench, 
                title: t.pillars.maintenance.title, 
                desc: t.pillars.maintenance.desc,
                gradient: "from-rose-500/20",
                badge: "NEW ★ v1.7"
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -8 }}
                className={`group p-10 bg-white/[0.03] border border-white/5 rounded-[40px] space-y-6 transition-all hover:bg-white/[0.06] hover:border-white/10 relative overflow-hidden`}
              >
                <div className={`absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-tl ${f.gradient} blur-[60px] opacity-0 group-hover:opacity-100 duration-700 transition-opacity`} />
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <f.icon className="text-brand" size={32} />
                  </div>
                  {f.badge && (
                    <span className="px-2.5 py-1 text-[8px] font-black uppercase tracking-widest bg-brand/10 border border-brand/20 text-brand rounded-full whitespace-nowrap">{f.badge}</span>
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-display font-black uppercase tracking-tight italic transition-all group-hover:text-brand">{f.title}</h3>
                  <p className="text-gray-500 group-hover:text-gray-300 italic text-sm leading-relaxed duration-300">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Loss Aversion Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-[60px] p-12 md:p-24 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter italic leading-none">
                  {t.lossAversion.header} <span className="text-red-500">{t.lossAversion.headerAccent}</span>
                </h2>
                <p className="text-xl text-gray-500 font-bold uppercase tracking-widest italic">{t.lossAversion.sub}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {t.lossAversion.items.map((item, i) => (
                  <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-2 text-center group-hover:border-red-500/20 transition-all duration-500">
                    <div className="text-4xl font-display font-black tracking-tighter italic text-red-500">{item.title}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-32 px-6 bg-white/[0.01] border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter italic">
              {t.howItWorks.header} <span className="text-brand">{t.howItWorks.headerAccent}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-[60px] left-[20%] right-[20%] h-px bg-white/10 z-0" />
            
            {[
              { num: "01", title: t.howItWorks.step1.title, desc: t.howItWorks.step1.desc },
              { num: "02", title: t.howItWorks.step2.title, desc: t.howItWorks.step2.desc },
              { num: "03", title: t.howItWorks.step3.title, desc: t.howItWorks.step3.desc }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-6 group">
                <div className="w-20 h-20 bg-[#0a0a0a] border border-white/10 rounded-full flex items-center justify-center text-2xl font-display font-black italic text-brand group-hover:scale-110 group-hover:border-brand/40 transition-all shadow-xl">
                  {step.num}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-display font-black uppercase italic tracking-tight">{step.title}</h3>
                  <p className="text-gray-500 italic font-medium leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inside the App Carousel */}
      <AppDemoCarousel />

      {/* Pricing Tiers */}
      <section id="pricing" className="py-32 px-6 bg-white/[0.02] relative border-y border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-24 relative z-10">
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-8xl font-display font-black uppercase tracking-tighter italic">{t.pricingSection.header}</h2>
            <div className="flex items-center justify-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{t.pricingSection.payAsYouGrow}</span>
                <div className="w-8 h-px bg-white/10" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand">{t.pricingSection.riskFree}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {tiers.map((tier) => (
              <motion.div 
                key={tier.id}
                whileHover={{ scale: tier.popular ? 1.02 : 1.01 }}
                className={`flex flex-col p-10 rounded-[48px] border transition-all duration-500 ${
                  tier.popular 
                    ? 'bg-gradient-to-b from-brand/20 via-white/5 to-black border-brand/40 shadow-[0_20px_60px_rgba(57,255,20,0.15)] relative scale-105 z-10' 
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-brand text-[#050505] rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                    {t.pricingSection.mostPopular}
                  </div>
                )}
                
                <div className="space-y-6 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <tier.tierIcon className={tier.popular ? "text-brand" : "text-white/20"} size={40} strokeWidth={2.5} />
                        <h3 className={`text-2xl font-black uppercase tracking-tighter italic mt-4 ${tier.popular ? 'text-brand' : 'text-white'}`}>{tier.name}</h3>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/5 pt-6 space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-6xl font-display font-black tracking-tighter italic">{tier.price}</span>
                      <span className="text-white/30 font-black uppercase text-[12px] italic">{tier.frequency}</span>
                    </div>
                    <p className="text-xs text-white/40 italic leading-relaxed">{tier.description}</p>
                  </div>

                  <ul className="space-y-5 pt-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3.5 text-sm font-medium italic group/feat">
                        <Check className={`shrink-0 mt-0.5 ${tier.popular ? 'text-brand' : 'text-white/20'}`} size={16} />
                        <span className={tier.popular ? 'text-white' : 'text-white/60'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button 
                  onClick={() => tier.priceId ? handleCheckout(tier.priceId) : router.push('/login')}
                  className={`w-full mt-12 py-6 rounded-[30px] font-display font-black uppercase tracking-widest text-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    tier.popular 
                      ? 'bg-brand text-[#050505] shadow-[0_10px_30px_rgba(57,255,20,0.3)] hover:brightness-110' 
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {tier.cta} <ArrowRight size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Integrations Wall */}
      <IntegrationsWall lang={lang} />

      {/* Referral Incentive Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
           <div className="bg-gradient-to-br from-brand/20 via-[#111] to-[#050505] p-12 md:p-32 rounded-[64px] border border-brand/20 overflow-hidden relative group text-center space-y-12 shadow-[0_40px_120px_rgba(57,255,20,0.1)]">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.1)_0%,transparent_100%)] opacity-30 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="space-y-6 relative z-10 max-w-2xl mx-auto">
                 <div className="inline-flex items-center gap-3 px-6 py-2 bg-brand/10 border border-brand/20 rounded-full text-brand text-xs font-black tracking-widest uppercase italic">
                    <Star size={16} fill="currentColor" /> {t.referral.reward}
                 </div>
                 <h2 className="text-4xl md:text-8xl font-display font-black uppercase tracking-tighter italic leading-none">{t.referral.header}</h2>
                 <p className="text-gray-500 font-bold uppercase tracking-widest italic">{t.referral.sub}</p>
              </div>
              <div className="relative z-10 pt-4">
                 <button className="h-24 px-16 bg-brand text-bg rounded-full text-2xl font-display font-black uppercase italic tracking-tighter shadow-2xl hover:scale-105 transition-all active:scale-95 group">
                    {t.referral.cta} <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto space-y-20">
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter italic">
              {t.faq.header} <span className="text-brand">{t.faq.headerAccent}</span>
            </h2>
          </div>

          <div className="space-y-4">
            {t.faq.items.map((item, i) => (
              <div 
                key={i} 
                className="group bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden transition-all hover:bg-white/[0.04]"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-8 py-8 flex justify-between items-center text-left"
                >
                  <span className="text-xl font-display font-black uppercase tracking-tight italic group-hover:text-brand transition-colors">{item.q}</span>
                  <div className={`transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-brand' : 'text-white/20'}`}>
                    <ChevronRight size={24} />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-8"
                    >
                      <p className="text-gray-400 italic font-medium leading-relaxed border-t border-white/5 pt-6">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-6 right-6 z-[100] lg:hidden"
          >
             <button
               onClick={() => router.push('/login')}
               className="w-full h-20 bg-brand text-[#050505] rounded-full font-display font-black uppercase italic tracking-tighter text-xl shadow-[0_20px_50px_rgba(57,255,20,0.4)] flex items-center justify-center gap-3 border-4 border-black"
             >
                {t.getStarted} <ArrowRight size={24} />
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-8xl font-display font-black uppercase tracking-tighter italic leading-none">
              {t.testimonials.header} <span className="text-brand">{t.testimonials.headerAccent}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { t: t.testimonials.t1 },
              { t: t.testimonials.t2 },
              { t: t.testimonials.t3 }
            ].map((test, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -8 }}
                className="p-10 bg-white/[0.03] border border-white/5 rounded-[40px] space-y-8 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 font-display font-black italic text-8xl line-height-none group-hover:opacity-10 transition-opacity">&quot;</div>
                <div className="flex gap-1 items-center">
                  {[1,2,3,4,5].map(star => <Star key={star} size={14} className="fill-brand text-brand" />)}
                </div>
                <p className="text-lg italic font-medium leading-relaxed relative z-10">
                  {test.t.quote}
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                    {test.t.vehicle === 'Car' && <Car size={20} />}
                    {test.t.vehicle === 'Bike' && <Bike size={20} />}
                    {test.t.vehicle === 'Truck' && <Truck size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black uppercase tracking-widest">{test.t.name}</h4>
                        <div className="px-2 py-0.5 bg-brand/10 border border-brand/20 rounded-md text-[8px] font-black text-brand uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle size={8} /> {t.testimonials.verified}
                        </div>
                    </div>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{test.t.platform}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
               <div className="space-y-6">
                  <h2 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter italic leading-none">
                    {t.privacy.header} <span className="text-brand">{t.privacy.headerAccent}</span>
                  </h2>
                  <p className="text-xl text-gray-500 italic font-medium leading-relaxed max-w-xl">
                    {t.privacy.sub}
                  </p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                         <Fingerprint className="text-brand" size={24} />
                      </div>
                      <div className="pt-1">
                        <h5 className="font-black uppercase tracking-widest text-xs mb-1">{t.privacy.local}</h5>
                        <p className="text-[10px] text-white/40 font-medium italic">{t.privacy.secure}</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                         <Lock className="text-brand" size={24} />
                      </div>
                      <div className="pt-1">
                        <h5 className="font-black uppercase tracking-widest text-xs mb-1">{t.privacy.encryption}</h5>
                        <p className="text-[10px] text-white/40 font-medium italic">{t.privacy.secure}</p>
                      </div>
                  </div>
               </div>

               <div className="flex items-center gap-6 pt-8 grayscale opacity-40">
                  <Globe size={40} className="text-white" />
                  <div className="h-8 w-px bg-white/10" />
                  <MapPin size={40} className="text-white" />
                  <div className="space-y-1">
                    <div className="text-[8px] font-black uppercase tracking-widest text-white/40">Data Region</div>
                    <div className="text-xs font-black uppercase tracking-tighter italic">EU-NORTH-1 (HAMINA)</div>
                  </div>
               </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 bg-brand/5 blur-[100px] rounded-full" />
                <div className="bg-[#050505] border border-white/10 p-1 rounded-[48px] overflow-hidden rotate-3 shadow-2xl relative z-10 group">
                    <Image 
                      src="/privacy_map.png" 
                      alt="Helsinki Data Map" 
                      width={600}
                      height={450}
                      className="w-full aspect-[4/3] object-cover opacity-60 rounded-[40px] group-hover:scale-105 transition-transform duration-1000" 
                    />
                    <motion.div 
                      animate={{ 
                        opacity: [0, 0.5, 0],
                        scale: [0.8, 1.2],
                        borderWidth: ["1px", "5px"]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 border-brand/40 rounded-[40px] pointer-events-none"
                    />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-brand/5 blur-[150px] opacity-30" />
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          <h2 className="text-5xl md:text-8xl font-display font-black uppercase tracking-tighter italic leading-none">
            {t.ctaSection.header} <span className="text-brand">{t.ctaSection.headerAccent}</span> {t.ctaSection.headerEnd}
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 italic font-medium opacity-80">
            {t.ctaSection.sub}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <button 
                onClick={() => router.push('/login')}
                className="w-full sm:w-80 h-20 bg-brand text-[#050505] rounded-[28px] font-display font-black text-2xl uppercase tracking-tighter italic flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-[0_15px_50px_rgba(57,255,20,0.3)]"
              >
                  {t.ctaSection.join}
              </button>
          </div>
          <div className="flex items-center justify-center gap-8 pt-8 opacity-40">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><ShieldCheck size={14} className="text-brand" /> {t.ctaSection.secure}</div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><CreditCard size={14} className="text-brand" /> {t.ctaSection.stripe}</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="legal" className="py-24 px-6 border-t border-white/5 relative z-10 bg-[#070707]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="space-y-8 max-w-sm">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 group cursor-pointer">
              <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-brand/30 transition-all">
                <Image src="/logo.svg" alt="VeroFlow" width={28} height={28} />
              </div>
              <span className="font-display font-black text-2xl tracking-tighter uppercase italic group-hover:text-brand transition-colors">VeroFlow</span>
            </Link>
            <p className="text-gray-500 text-sm font-medium italic leading-relaxed">
              {t.footer.about}
            </p>
            <div className="flex gap-4">
                {[
                  { Icon: Instagram, href: "#" },
                  { Icon: Twitter, href: "#" },
                  { Icon: Linkedin, href: "#" },
                  { Icon: Facebook, href: "#" }
                ].map((item, i) => (
                    <a 
                      key={i} 
                      href={item.href}
                      className="w-10 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-brand hover:border-brand/40 hover:bg-brand/5 transition-all transition-all duration-300"
                    >
                        <item.Icon size={18} />
                    </a>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand">{t.footer.platform}</h5>
              <ul className="space-y-4 text-sm font-bold uppercase tracking-wider text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">{t.footer.links.demo}</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">{t.footer.links.features}</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">{t.footer.links.pricing}</a></li>
                <li><Link href="/mobile" className="hover:text-white transition-colors">{t.footer.links.mobile}</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand">{t.footer.legalTitle}</h5>
              <ul className="space-y-4 text-sm font-bold uppercase tracking-wider text-gray-500">
                <li><Link href="/terms" className="hover:text-white transition-colors">{t.footer.links.terms}</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">{t.footer.links.privacy}</Link></li>
                <li><Link href="/legal" className="hover:text-white transition-colors">{t.footer.links.notice}</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">{t.footer.links.cookies}</Link></li>
              </ul>
            </div>
            <div className="hidden md:block space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand">{t.footer.support}</h5>
              <ul className="space-y-4 text-sm font-bold uppercase tracking-wider text-gray-500">
                <li><Link href="/help" className="hover:text-white transition-colors">{t.footer.links.help}</Link></li>
                <li><Link href="/api-status" className="hover:text-white transition-colors">{t.footer.links.api}</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">{t.footer.links.contact}</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-24 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">{t.footer.rights}</p>
            <div className="flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-[#070707] bg-white/10 overflow-hidden" />
                  ))}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{t.footer.trusted} <span className="text-brand">800+</span> {t.footer.drivers}</div>
            </div>
        </div>
      </footer>

      {/* Waitlist Modal */}
      <AnimatePresence>
        {showWaitlist && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowWaitlist(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 p-10 rounded-[48px] relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setShowWaitlist(false)}
                className="absolute top-8 right-8 text-white/20 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="space-y-8">
                <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center">
                  <Zap className="text-brand" size={32} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-display font-black uppercase italic tracking-tighter leading-none">{t.waitlist.title}</h3>
                  <p className="text-gray-400 italic font-medium leading-relaxed">{t.waitlist.desc}</p>
                </div>

                {!waitlistSent ? (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setWaitlistSent(true);
                      // In a real app, send to Firebase here
                    }}
                    className="space-y-4"
                  >
                    <input 
                      type="email" 
                      required
                      placeholder={t.waitlist.placeholder}
                      className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-6 font-display font-black text-lg uppercase italic tracking-tight focus:outline-none focus:border-brand/40 transition-all"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                    />
                    <button className="w-full h-20 bg-brand text-bg rounded-2xl font-display font-black text-xl uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl">
                      {t.waitlist.cta}
                    </button>
                  </form>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-8 bg-brand/10 border border-brand/20 rounded-3xl space-y-4"
                  >
                    <div className="flex items-center gap-3 text-brand">
                      <CheckCircle size={24} />
                      <span className="font-display font-black uppercase tracking-widest text-sm italic">Confirmed</span>
                    </div>
                    <p className="text-white/80 font-medium italic">{t.waitlist.success}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
};

export default VeroLanding;
