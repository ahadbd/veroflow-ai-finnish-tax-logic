import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Cookie, Lock, Eye, Trash2, CheckCircle2 } from 'lucide-react';

export default function CookiePolicyPage() {
  const categories = [
    { icon: Lock, title: "ESSENTIAL", desc: "Always on. Used for secure login, subscription management, and core financial security. These cannot be disabled.", status: "REQUIRED" },
    { icon: Cookie, title: "DATA PERFORMANCE", desc: "Used to track how you navigate VeroFlow. This help us optimize the UI for drivers on the go.", status: "ENABLED" },
    { icon: Eye, title: "TAX ANALYTICS", desc: "Helper cookies for localizing your Finnish tax regions and optimizing your mileage deduction engine.", status: "ENABLED" },
    { icon: ShieldCheck, title: "SECURITY & FRAUD", desc: "Essential for protecting your Stripe billing portal and ensuring your financial data is safe.", status: "REQUIRED" }
  ];

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans py-24 px-6 md:px-12 selection:bg-brand/30 selection:text-brand">
      <div className="max-w-4xl mx-auto space-y-16">
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all mb-8"
        >
          <ArrowLeft size={14} /> BACK TO HOME
        </Link>
        
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[10px] font-black uppercase tracking-widest text-brand">
            <Cookie size={14} /> TRUST & PRIVACY
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter italic leading-none">
            Cookie <span className="text-brand">Policy</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
            Last updated: April 5, 2026 - ENSURING COMPLIANCE WITH FINNISH E-PRIVACY LAWS
          </p>
        </div>

        {/* Action center */}
        <div className="p-12 bg-white/[0.03] border border-white/5 rounded-[48px] space-y-8 group">
            <div className="space-y-4">
                <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter leading-none">Your Consent Center</h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">TAKE CONTROL OF YOUR DATA FLOW.</p>
            </div>
            
            <div className="space-y-4">
                {categories.map((c, i) => (
                    <div key={i} className="p-8 bg-[#0a0a0a] border border-white/5 rounded-[32px] flex items-center justify-between gap-8 group/item hover:border-brand/30 transition-all">
                        <div className="flex items-center gap-6">
                           <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/30 group-hover/item:text-brand transition-all">
                                <c.icon size={24} />
                           </div>
                           <div className="space-y-1">
                                <h4 className="text-sm font-black uppercase tracking-tight italic transition-all group-hover/item:text-white">{c.title}</h4>
                                <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest leading-relaxed italic max-w-sm">{c.desc}</p>
                           </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand">{c.status}</span>
                            <div className="w-12 h-6 bg-brand/20 rounded-full border border-brand/30 relative mt-2 opacity-50">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-brand rounded-full shadow-lg" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 pt-8">
                <button className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white/50 hover:text-white">SAVE PREFERENCES</button>
                <button className="flex-1 h-14 bg-brand text-black rounded-2xl font-display font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl">ACCEPT ALL COOKIES</button>
            </div>
        </div>

        <article className="prose prose-invert prose-headings:font-display prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-p:text-gray-400 prose-p:italic prose-p:font-medium prose-p:leading-relaxed max-w-none pb-24 space-y-12">
            <div className="space-y-4">
                <h2 className="text-4xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">Why we use Cookies</h2>
                <p>
                    Cookies are small text files that are stored on your device when you visit our platform. 
                    For VeroFlow AI, these files are essential for maintaining your secure session with Firebase, 
                    processing your subscription status through Stripe, and allowing the Shift Tracker to remain persistent across browser tabs.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-4xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">Data Expiry</h2>
                <p>
                    Most of our cookies are "Session Cookies," meaning they are cleared when you close your browser. 
                    Persistent cookies are used exclusively for "Remember Me" features and saved preferences, 
                    and typically expire within 30 days unless you explicitly refresh your consent.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-4xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">Removing Data</h2>
                <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-[32px] space-y-4">
                    <p className="text-red-400 font-bold uppercase tracking-widest text-[10px] m-0">DANGER ZONE</p>
                    <p className="m-0 text-sm italic">Need a fresh start? You can purge all local VeroFlow data with the button below. This will log you out immediately.</p>
                    <button className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={14} /> PURGE ALL SITE DATA
                    </button>
                </div>
            </div>
        </article>

        <footer className="pt-24 border-t border-white/5 text-center px-6">
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">© 2026 VeroFlow AI | HELSINKI, FINLAND | COMPLIANCE: E-PRIVACY DIRECTIVE</p>
        </footer>
      </div>
    </div>
  );
}
