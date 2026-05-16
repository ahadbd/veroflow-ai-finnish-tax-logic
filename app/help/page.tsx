import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Search, Zap, ShieldCheck, CreditCard, ChevronRight, Trophy, Wrench, Gauge } from 'lucide-react';

export const metadata = {
  title: 'Help Center — VeroFlow AI',
  description: 'Get answers about YEL thresholds, mileage deductions, Predictive Maintenance, Gamification, and Finnish tax compliance.',
};

export default function HelpCenter() {
  const faqs = [
    { title: "YEL Threshold Monitoring", content: "VeroFlow automatically tracks your real-time annual income against the official Finnish YEL threshold. We alert you when you approach the limit, so you can manage your hours or adjust your insurance, ensuring you stay in control of your mandatory costs." },
    { title: "2026 Mileage Deductions (€0.57/km)", content: "The tool is pre-configured with the latest Finnish tax authorities' (Vero) mileage deduction rate of €0.57/km for 2026. Every trip tracked by our GPS engine or manually logged via voice is automatically translated into a deduction value for your tax report." },
    { title: "VAT Integration (25.5% ALV)", content: "We fully support the 25.5% VAT rate in Finland. VeroFlow automatically handles VAT calculations for your delivery receipts and payouts, presenting your 'True Profit' after tax obligations." },
    { title: "Gemini 2.5 Flash OCR Receipt Extraction", content: "Snap a photo of any fuel or maintenance receipt. Our Gemini 2.5 Flash engine extracts the date, merchant, amount, VAT category, and mileage in under 500ms. Confidence scoring flags low-quality scans for manual review." },
    { title: "Predictive Maintenance Engine", content: "VeroFlow tracks a 28-day rolling average of your kilometres driven and applies the ETSC wear model (5,000 km/mm of tread) to forecast your next oil service date, tire replacement window, and annual maintenance spend — all before problems arise." },
    { title: "Gamification System (XP & Achievements)", content: "Earn XP by completing shifts, maintaining daily streaks, and hitting weekly earnings goals. Progress through 10 courier ranks from 'Rookie Rider' to 'Finnish Legend'. Unlock 12 achievements with animated confetti rewards. Your leaderboard position updates in real time." },
    { title: "Adaptive Driving HUD", content: "When your GPS speed exceeds 15 km/h, VeroFlow automatically switches to the Driving Mode HUD — a full-screen layout with a speed ring, live earnings counter, trip timer, and mileage deduction banner. Tap the chevron to minimize to a floating pill." },
    { title: "SHA-256 Tamper-Detection PDF Reports", content: "Every exported audit PDF includes a SHA-256 cryptographic hash of its contents. This hash proves the document has not been altered after generation, satisfying Finnish accounting integrity requirements (Kirimarkku compatible)." },
    { title: "Stripe Billing & Subscriptions", content: "Manage your subscription (Starter/Pro/Elite) via the Stripe customer portal. Change plans, update payment methods, or download official invoices for your company records." }
  ];

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans py-24 px-6 md:px-12 selection:bg-brand/30 selection:text-brand">
      <div className="max-w-6xl mx-auto space-y-20 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-12">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all"
            >
              <ArrowLeft size={14} /> BACK TO HOME
            </Link>

            <div className="space-y-6 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[10px] font-black uppercase tracking-widest text-brand">
                    <MessageSquare size={14} /> KNOWLEDGE HUB
                </div>
                <h1 className="text-6xl md:text-[5.5rem] font-display font-black uppercase tracking-tighter italic leading-[0.9]">
                    Master your <br />
                    <span className="text-brand">VeroFlow.</span>
                </h1>
                <div className="relative w-full mt-10">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                    <input 
                       disabled
                       type="text" 
                       placeholder="SEARCH DOCUMENTATION (COMING SOON...)" 
                       className="w-full h-20 bg-white/[0.03] border border-white/5 rounded-[30px] pl-16 pr-8 font-black uppercase tracking-widest text-white/50 placeholder:text-white/10 outline-none cursor-not-allowed" 
                    />
                </div>
            </div>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap, label: "Quick Start Guide", desc: "Setting up your first shift with Wolt or Uber Eats." },
              { icon: ShieldCheck, label: "Tax Compliance", desc: "Understanding 2026 ALV, YEL, and mileage deductions." },
              { icon: CreditCard, label: "Billing & Plans", desc: "Managing your VeroPro subscription details." },
              { icon: Trophy, label: "Gamification", desc: "XP, levels, achievements, and streak rewards." },
              { icon: Wrench, label: "Predictive Maintenance", desc: "Service forecasts, tire wear, and cost projections." },
              { icon: Gauge, label: "Driving HUD", desc: "Adaptive driving mode and speed ring configuration." },
            ].map((cat, i) => (
                <div key={i} className="group p-10 bg-white/[0.03] border border-white/5 rounded-[40px] space-y-6 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-brand transition-all group-hover:scale-110">
                        <cat.icon size={32} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-display font-black uppercase tracking-tight italic">{cat.label}</h3>
                        <p className="text-gray-500 italic text-[12px] uppercase font-bold leading-relaxed">{cat.desc}</p>
                    </div>
                </div>
            ))}
        </div>


        {/* FAQs */}
        <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <div key={i} className="group p-8 bg-[#0a0a0a] border border-white/5 rounded-[32px] space-y-4 hover:border-brand/30 transition-all">
                        <div className="flex items-center justify-between pointer-events-none">
                            <h3 className="text-lg font-black uppercase tracking-tight italic transition-all group-hover:text-brand">{faq.title}</h3>
                            <ChevronRight className="text-white/10 transition-all group-hover:text-brand group-hover:translate-x-2" size={20} />
                        </div>
                        <p className="text-gray-500 text-sm font-medium italic leading-relaxed duration-300">
                            {faq.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>

        <div className="pt-24 border-t border-white/5 text-center px-6 space-y-6">
            <h4 className="text-xl font-black uppercase italic tracking-tighter">Still have questions?</h4>
            <Link href="/contact" className="inline-flex h-16 px-12 items-center justify-center bg-brand text-black rounded-full font-display font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl">
                CONTACT DISPATCH SUPPORT
            </Link>
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em] pt-12 italic leading-relaxed max-w-sm mx-auto">© 2026 VeroFlow AI | HELSINKI, FINLAND | ALL RIGHTS RESERVED WORLDWIDE</p>
        </div>
      </div>
    </div>
  );
}
