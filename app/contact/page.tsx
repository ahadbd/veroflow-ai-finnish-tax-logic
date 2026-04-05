import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Phone, MapPin, CheckCircle, Globe } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans py-24 px-6 md:px-12 selection:bg-brand/30 selection:text-brand">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 relative z-10">
        
        {/* Left Content */}
        <div className="space-y-12">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all mb-8"
            >
              <ArrowLeft size={14} /> BACK TO HOME
            </Link>

            <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[10px] font-black uppercase tracking-widest text-brand">
                    <MessageSquare size={14} /> DRIVER SUPPORT
                </div>
                <h1 className="text-6xl md:text-[5.5rem] font-display font-black uppercase tracking-tighter italic leading-[0.9]">
                    Get in <br />
                    <span className="text-brand">The Flow.</span>
                </h1>
                <p className="text-gray-400 font-medium italic text-lg md:text-xl max-w-md leading-relaxed">
                    Have questions about YEL thresholds, tax deductions, or integration? <br />
                    Our Helsinki-based team is ready to help you optimize your delivery business.
                </p>
            </div>

            <div className="space-y-8 pt-12 border-t border-white/5">
                {[
                  { icon: Mail, title: "EMAIL US", value: "support@veroflow.fi", sub: "Response within 24 hours" },
                  { icon: MapPin, title: "VISIT US", value: "Mannerheimintie 12 B", sub: "00100 Helsinki, Finland" },
                  { icon: Globe, title: "COMMUNITY", value: "@veroflow", sub: "Join our driver network" }
                ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-start group">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center transition-all group-hover:bg-brand/10 group-hover:border-brand/30">
                            <item.icon className="text-white/30 group-hover:text-brand transition-all" size={24} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-brand">{item.title}</h4>
                            <p className="text-xl font-display font-black uppercase italic tracking-tight">{item.value}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">{item.sub}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Right Form Area (Glassmorphism card) */}
        <div className="relative group">
            <div className="absolute inset-0 bg-brand/10 blur-[130px] rounded-full opacity-20 pointer-events-none" />
            <div className="p-1 px-1.5 pb-0 bg-gradient-to-b from-white/10 to-transparent rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-2xl">
                <div className="w-full h-full bg-[#0a0a0a]/80 p-8 md:p-12 space-y-10 rounded-[2.8rem]">
                    <h3 className="text-3xl font-display font-black uppercase italic tracking-tighter">Send a Message</h3>
                    
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">YOUR NAME</label>
                                <input type="text" placeholder="JOHAN VERO" className="w-full h-16 bg-white/[0.03] border border-white/5 rounded-2xl px-6 font-bold uppercase placeholder:text-white/10 focus:border-brand/40 focus:ring-0 transition-all outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">EMAIL ADDRESS</label>
                                <input type="email" placeholder="COURIER@FLOW.FI" className="w-full h-16 bg-white/[0.03] border border-white/5 rounded-2xl px-6 font-bold uppercase placeholder:text-white/10 focus:border-brand/40 focus:ring-0 transition-all outline-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">SERVICE AREA</label>
                            <select className="w-full h-16 bg-white/[0.03] border border-white/5 rounded-2xl px-6 font-bold uppercase focus:border-brand/40 outline-none text-white appearance-none">
                                <option>Tax Integration Support</option>
                                <option>Stripe Billing Enquiries</option>
                                <option>Enterprise Fleet Access</option>
                                <option>General Information</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-4">MESSAGE</label>
                            <textarea rows={5} placeholder="DESCRIBE YOUR REQUEST..." className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-6 font-bold uppercase placeholder:text-white/10 focus:border-brand/40 outline-none transition-all resize-none"></textarea>
                        </div>

                        <button type="submit" className="w-full h-20 bg-brand text-[#050505] rounded-3xl font-display font-black text-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(57,255,20,0.2)]">
                            SEND DISPATCH
                        </button>
                    </form>

                    <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                        <CheckCircle className="text-brand" size={16} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">VeroFlow is the #1 tool for Finnish couriers. Professional grade.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <footer className="pt-24 max-w-7xl mx-auto border-t border-white/5 text-center px-6">
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">© 2026 VeroFlow AI | HELSINKI, FINLAND</p>
      </footer>
    </div>
  );
}
