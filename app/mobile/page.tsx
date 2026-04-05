import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Smartphone, Radio, QrCode, Mail, Bell, Globe } from 'lucide-react';

export default function MobileAppPage() {
  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans py-24 px-6 md:px-12 selection:bg-brand/30 selection:text-brand flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-20 text-center relative z-10">
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all mb-12"
        >
          <ArrowLeft size={14} /> BACK TO HOME
        </Link>
        
        <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 border border-brand/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-brand shadow-[0_0_20px_rgba(57,255,20,0.1)]">
                <Radio size={14} className="animate-pulse" /> COMING IN 2026
            </div>
            <h1 className="text-6xl md:text-[8rem] font-display font-black uppercase tracking-tighter italic leading-[0.85]">
                Your Flow. <br />
                <span className="text-brand">Mobile.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-medium italic opacity-80 max-w-2xl mx-auto leading-relaxed">
                The full power of VeroFlow AI, optimized for your cockpit. <br />Hands-free shifts, instant OCR scanning, and native push notifications.
            </p>
        </div>

        {/* Mockup / Feature Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-24 text-left">
            {[
              { icon: Smartphone, title: "NATIVE iOS / ANDROID", desc: "Built with React Native for maximum performance and GPS accuracy during long delivery shifts." },
              { icon: Bell, title: "SMART ALERTS", desc: "Real-time notifications for tip streaks and upcoming YEL threshold milestones." },
              { icon: QrCode, title: "QR SCANNING", desc: "Instantly pair your dashboard with your vehicle's head unit for distraction-free tracking." },
              { icon: Globe, title: "OFFLINE CAPABLE", desc: "Log shifts even in basements or elevators. VeroFlow syncs automatically when you're back on the web." }
            ].map((f, i) => (
                <div key={i} className="group p-10 bg-white/[0.03] border border-white/5 rounded-[40px] space-y-6 hover:bg-white/[0.06] hover:border-white/10 transition-all">
                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-brand transition-all group-hover:scale-110">
                        <f.icon size={28} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-display font-black uppercase tracking-tight italic">{f.title}</h3>
                        <p className="text-gray-500 italic text-[12px] uppercase font-bold leading-relaxed">{f.desc}</p>
                    </div>
                </div>
            ))}
        </div>

        {/* Notification Subscription */}
        <div className="p-12 bg-white/[0.03] border border-white/5 rounded-[48px] space-y-8 mt-24">
            <div className="space-y-4">
                <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter">Get on the VIP Dispatch</h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">WE WILL EMAIL YOU AS SOON AS THE APP IS IN CLOSED BETA.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <input type="email" placeholder="COURIER@FLOW.FI" className="flex-1 h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-6 font-bold uppercase placeholder:text-white/10 outline-none focus:border-brand/40 transition-all text-center sm:text-left" />
                <button className="h-16 px-10 bg-brand text-black rounded-2xl font-display font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl">
                    NOTIFY ME
                </button>
            </div>
        </div>

        <footer className="pt-40 pb-12 border-t border-white/5 text-center">
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">© 2026 VeroFlow AI | HELSINKI, FINLAND</p>
        </footer>
      </div>
    </div>
  );
}
