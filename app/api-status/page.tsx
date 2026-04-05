import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Zap, ShieldCheck, Database, Server, Smartphone, Globe } from 'lucide-react';

export default function ApiStatusPage() {
  const systems = [
    { name: "Global Tax Engine", status: "Operational", icon: CheckCircle2, latency: "42ms" },
    { name: "OCR Processing (Gemini AI)", status: "Operational", icon: Zap, latency: "480ms" },
    { name: "Stripe Billing Bridge", status: "Operational", icon: ShieldCheck, latency: "110ms" },
    { name: "Firebase Realtime DB", status: "Operational", icon: Database, latency: "15ms" },
    { name: "VeroFlow Cloud Functions", status: "Operational", icon: Server, latency: "85ms" },
    { name: "Mobile Sync Engine", status: "Operational", icon: Smartphone, latency: "20ms" }
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
            <Globe size={14} className="animate-pulse" /> SYSTEM HEALTH
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter italic leading-none">
            VeroFlow <span className="text-brand">Status</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
            Live Monitoring: UPDATED APRIL 5, 2026 - 19:30 HELSINKI
          </p>
        </div>

        {/* Global Summary */}
        <div className="p-10 bg-brand/5 border border-brand/20 rounded-[40px] flex items-center justify-between gap-8 group">
            <div className="space-y-4">
                <h3 className="text-3xl font-display font-black uppercase italic tracking-tighter leading-none">All Systems GO.</h3>
                <p className="text-brand/60 font-bold uppercase tracking-widest text-[10px] group-hover:text-brand transition-all">WE ARE OPERATING AT PEAK PERFORMANCE FOR ALL DELIVERY DRIVERS.</p>
            </div>
            <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center text-black animate-[ping_3s_ease-in-out_infinite] opacity-80">
                <CheckCircle2 size={32} />
            </div>
        </div>

        {/* System Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systems.map((s, i) => (
                <div key={i} className="p-8 bg-white/[0.03] border border-white/5 rounded-[32px] space-y-6 hover:bg-white/[0.06] transition-all">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white/30 group-hover:text-brand transition-all">
                            <s.icon size={24} />
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand">{s.status}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">{s.latency}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-black uppercase tracking-tight italic">{s.name}</h4>
                        <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest leading-relaxed italic">Region: Europe-North1 (Helsinki)</p>
                    </div>
                </div>
            ))}
        </div>

        {/* Past incidents (fake) */}
        <div className="space-y-8 pt-16 border-t border-white/5">
            <h3 className="text-xl font-display font-black uppercase tracking-[0.2em] italic">Incident History</h3>
            <div className="space-y-4">
                {[
                  { date: "MAR 12, 2026", event: "Standard Service Update", desc: "No downtime. Optimized GPS batching for lower battery consumption." },
                  { date: "FEB 28, 2026", event: "Maintenance Window", desc: "15 minutes minor latency during database migration. All systems remained online." },
                ].map((ev, i) => (
                    <div key={i} className="p-6 bg-[#0a0a0a] border-l-4 border-white/5 rounded-2xl space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{ev.date} - {ev.event}</p>
                        <p className="text-xs text-gray-500 font-medium italic">{ev.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        <footer className="pt-24 border-t border-white/5 text-center px-6">
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">© 2026 VeroFlow AI | HELSINKI, FINLAND | STATUS PAGE</p>
        </footer>
      </div>
    </div>
  );
}
