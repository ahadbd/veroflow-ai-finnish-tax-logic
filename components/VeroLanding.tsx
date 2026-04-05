'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Youtube
} from 'lucide-react';
import Link from 'next/link';

interface VeroLandingProps {
  login: () => void;
  guestLogin: () => void;
}

const VeroLanding: React.FC<VeroLandingProps> = ({ login, guestLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'fi'>('en');

  const t = {
    en: {
      hero: "MAXIMIZE EVERY EURO",
      retain: "RETAIN",
      everyEuro: "EVERY EURO",
      sub: "The #1 automated tax & profitability engine for Finnish delivery entrepreneurs.",
      cta: "START EARNING",
      demo: "FREE DEMO",
      features: "Features",
      pricing: "Pricing",
      legal: "Legal",
      badge: "Built for Finnish Couriers",
      login: "Login",
      launch: "Launch App",
      getStarted: "Get Started",
      trust: {
        vat: { title: "25.5% VAT Update", desc: "Always compliant with latest rules" },
        ai: { title: "Gemini 1.5 Powered", desc: "Elite AI for receipt & voice" },
        gdpr: { title: "GDPR Compliant", desc: "Data stored in EU (Helsinki)" },
        sync: { title: "Multi-App Sync", desc: "Wolt, Foodora, Uber Eats" }
      },
      pillars: {
        header: "Engineered for those who",
        headerAccent: "Ride to Win.",
        subHeader: "Professional tools for professional delivery entrepreneurs.",
        handsFree: { title: "Hands-Free Logging", desc: 'Log tips and vehicle updates while driving. "Got a 5€ tip" - VeroFlow handles the rest.' },
        profit: { title: "Profit Optimization", desc: "See exactly where your money goes. Fuel, maintenance, insurance, and taxes - visualized." },
        ocr: { title: "Instant OCR Intake", desc: "Take a photo of your fuel receipt or weekly Wolt summary. extracted in milliseconds." },
        yel: { title: "YEL Safety Net", desc: "Real-time monitoring of your annual income for YEL insurance thresholds. No surprise bills." },
        tax: { title: "Finnish Tax Pre-Set", desc: "Pre-configured with ALV thresholds and mileage deduction rates (2026 pricing enabled)." },
        export: { title: "Accountant Export", desc: "Export tax-ready CSV/PDF reports tailored for Finnish accounting standards (Kirimarkku compatible)." }
      },
      pricingSection: {
        header: "Choose your Flow",
        payAsYouGrow: "Pay-as-you-grow",
        riskFree: "Risk-free trial",
        mostPopular: "MOST POPULAR",
        starter: {
          name: "Starter",
          freq: "/ Free Forever",
          desc: "Perfect for new couriers just starting their journey.",
          f1: "Manual Shift Logging",
          f2: "Basic Daily Analytics",
          f3: "Finnish Tax Cheat Sheet",
          f4: "Max 10 shifts per month",
          f5: "Local data storage only",
          cta: "SELECT PLAN"
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
      }
    },
    fi: {
      hero: "MAKSIMOI TULOSI",
      retain: "SÄÄSTÄ",
      everyEuro: "JOKAINEN EURO",
      sub: "Suomen #1 automaattinen vero- ja kannattavuusmoottori läheteille.",
      cta: "ALOITA NYT",
      demo: "ILMAINEN DEMO",
      features: "Ominaisuudet",
      pricing: "Hinnasto",
      legal: "Lakiasiat",
      badge: "Rakennettu Suomen Läheteille",
      login: "Kirjaudu",
      launch: "Avaa Sovellus",
      getStarted: "Aloita",
      trust: {
        vat: { title: "ALV 25.5% Päivitys", desc: "Aina ajan tasalla säännösten kanssa" },
        ai: { title: "Gemini 1.5 Teho", desc: "Huippuluokan tekoäly kuiteille ja äänelle" },
        gdpr: { title: "GDPR-Yhteensopiva", desc: "Tiedot EU:ssa (Helsinki)" },
        sync: { title: "Multi-App Synkronointi", desc: "Wolt, Foodora, Uber Eats" }
      },
      pillars: {
        header: "Suunniteltu heille, jotka",
        headerAccent: "Ajavat Voittaakseen.",
        subHeader: "Ammattilaistyökalut ammattimaisille lähettiyrittäjille.",
        handsFree: { title: "Hands-Free Kirjaus", desc: 'Kirjaa tipit ja ajoneuvopäivitykset ajaessasi. "Sain 5€ tipin" - VeroFlow hoitaa loput.' },
        profit: { title: "Voiton Optimointi", desc: "Näe tarkalleen minne rahasi menevät. Polttoaine, huolto, vakuutukset ja verot - visualisoituna." },
        ocr: { title: "Välitön OCR-luku", desc: "Ota kuva polttoainekuitista tai viikoittaisesta Wolt-yhteenvedosta. Tiedot luettu millisekunneissa." },
        yel: { title: "YEL-Turvaverkko", desc: "Seuraa vuositulojasi reaaliajassa YEL-työtulorajojen suhteen. Ei yllätyslaskuja." },
        tax: { title: "Suomen Veroasetukset", desc: "Valmiiksi konfiguroidut ALV-rajat ja kilometrivähennykset (2026 hinnasto käytössä)." },
        export: { title: "Kirjanpitäjän Export", desc: "Lataa verovalmiit CSV/PDF-raportit suomalaisille kirjanpitostandardeille (Kirimarkku-yhteensopiva)." }
      },
      pricingSection: {
        header: "Valitse Tasosi",
        payAsYouGrow: "Maksa kun kasvat",
        riskFree: "Riskitön kokeilu",
        mostPopular: "SUOSITUIN",
        starter: {
          name: "Starter",
          freq: "/ Ilmainen Ikuisesti",
          desc: "Täydellinen uusille läheteille polun alussa.",
          f1: "Manuaalinen vuorojen kirjaus",
          f2: "Päivittäinen perusanalyysi",
          f3: "Suomen vero-opas luntille",
          f4: "Max 10 vuoroa kuukaudessa",
          f5: "Vain paikallinen tallennus",
          cta: "VALITSE TASO"
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
      }
    }
  }[lang];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
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
      price: "€9.99",
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
      price: "€19.99",
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
      alert(lang === 'en' ? 'This tier is coming soon or require real Stripe Price IDs.' : 'Tämä taso on tulossa pian tai vaatii oikeat Stripe Hintatunnukset.');
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
        window.location.href = url;
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <img src="/logo.svg" alt="VeroFlow" className="w-7 h-7" />
          </div>
          <span className="font-display font-black text-2xl tracking-tighter uppercase italic">VeroFlow</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6">
                {[
                  { name: t.features, id: 'features' },
                  { name: t.pricing, id: 'pricing' },
                  { name: t.legal, id: 'legal' }
                ].map((item) => (
                    <a 
                      key={item.id} 
                      href={`#${item.id}`}
                      className="text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-brand transition-colors"
                    >
                        {item.name}
                    </a>
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
              <button onClick={login} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors border border-white/5 rounded-full hover:bg-white/5">
                {t.login}
              </button>
              <button 
                onClick={login}
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
                <div className="flex flex-col gap-6">
                   {[
                      { name: t.features, id: 'features' },
                      { name: t.pricing, id: 'pricing' },
                      { name: t.legal, id: 'legal' }
                   ].map(item => (
                       <a 
                         key={item.id} 
                         href={`#${item.id}`} 
                         onClick={() => setMobileMenuOpen(false)}
                         className="text-3xl font-display font-black uppercase italic tracking-tighter"
                       >
                           {item.name}
                       </a>
                   ))}
                   <hr className="border-white/10" />
                   <button onClick={login} className="w-full py-5 bg-brand text-[#050505] rounded-2xl font-display font-black uppercase text-xl">{t.getStarted}</button>
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
              onClick={login}
              className="group relative w-full sm:w-[280px] h-[72px] bg-brand text-[#050505] rounded-[24px] font-display font-black text-xl flex items-center justify-center gap-3 overflow-hidden shadow-[0_10px_40px_rgba(57,255,20,0.3)] hover:shadow-[0_15px_50px_rgba(57,255,20,0.5)] transition-all hover:scale-[1.03] active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2 uppercase tracking-tight">{t.cta} <ArrowRight size={20} className="group-hover:translate-x-1 duration-300" /></span>
            </button>
            <button 
              onClick={guestLogin}
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
              <div className="text-xl font-black italic tracking-widest uppercase opacity-40">FOODORA</div>
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
                        <img 
                          src="/dashboard_snapshot.png" 
                          alt="VeroFlow Dashboard Mockup" 
                          className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                    </div>
                </div>
            </div>
        </motion.div>
      </section>

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
                gradient: "from-blue-500/20"
              },
              { 
                icon: PieChart, 
                title: t.pillars.profit.title, 
                desc: t.pillars.profit.desc,
                gradient: "from-brand/20"
              },
              { 
                icon: CreditCard, 
                title: t.pillars.ocr.title, 
                desc: t.pillars.ocr.desc,
                gradient: "from-purple-500/20"
              },
              { 
                icon: Smartphone, 
                title: t.pillars.yel.title, 
                desc: t.pillars.yel.desc,
                gradient: "from-orange-500/20"
              },
              { 
                icon: ShieldCheck, 
                title: t.pillars.tax.title, 
                desc: t.pillars.tax.desc,
                gradient: "from-emerald-500/20"
              },
              { 
                icon: ExternalLink, 
                title: t.pillars.export.title, 
                desc: t.pillars.export.desc,
                gradient: "from-pink-500/20"
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -8 }}
                className={`group p-10 bg-white/[0.03] border border-white/5 rounded-[40px] space-y-6 transition-all hover:bg-white/[0.06] hover:border-white/10 relative overflow-hidden`}
              >
                <div className={`absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-tl ${f.gradient} blur-[60px] opacity-0 group-hover:opacity-100 duration-700 transition-opacity`} />
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <f.icon className="text-brand" size={32} />
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
                  onClick={() => tier.priceId ? handleCheckout(tier.priceId) : (tier.id === 'starter' ? guestLogin() : login())}
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
                onClick={login}
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-white/10">
                <img src="/logo.svg" alt="VeroFlow" className="w-7 h-7" />
              </div>
              <span className="font-display font-black text-2xl tracking-tighter uppercase italic">VeroFlow</span>
            </div>
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
    </div>
  );
};

export default VeroLanding;
