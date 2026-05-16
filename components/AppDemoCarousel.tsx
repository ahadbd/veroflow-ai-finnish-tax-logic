'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Scan, 
  TrendingUp, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Play, 
  Receipt,
  Sparkles,
  Smartphone,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';

const AppDemoCarousel = () => {
  const [activeTab, setActiveTab] = useState(0);

  const demoSteps = [
    {
      id: 'voice',
      title: 'Voice Activation',
      label: 'HANDS-FREE',
      icon: Mic,
      color: 'from-blue-500/20 to-blue-600/20',
      accent: 'blue',
      description: 'Start shifts or log tips while driving using natural voice commands.'
    },
    {
      id: 'ocr',
      title: 'AI Receipt Scanning',
      label: 'ZERO DATA ENTRY',
      icon: Scan,
      color: 'from-purple-500/20 to-purple-600/20',
      accent: 'purple',
      description: 'Snap a photo. Our Gemini-powered AI extracts VAT, Category, and Date in seconds.'
    },
    {
      id: 'tax',
      title: 'Live Tax Intelligence',
      label: 'REAL-TIME PROFIT',
      icon: TrendingUp,
      color: 'from-emerald-500/20 to-emerald-600/20',
      accent: 'emerald',
      description: 'See exactly how much tax you owe and how much profit goes to your pocket.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % demoSteps.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [demoSteps.length]);

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto space-y-20">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
           <div className="space-y-6 max-w-2xl">
              <h2 className="text-5xl md:text-8xl font-display font-black uppercase tracking-tighter italic leading-none">
                INSIDE THE <span className="text-brand">FLOW</span>
              </h2>
              <p className="text-gray-500 font-bold italic text-xl uppercase tracking-tight">
                Stop guessing. Start knowing. See how the AI manages your entrepreneurship.
              </p>
           </div>
           
           <div className="flex gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
              {demoSteps.map((step, i) => (
                <button
                  key={step.id}
                  onClick={() => setActiveTab(i)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === i ? 'bg-brand text-bg' : 'text-white/40 hover:text-white'}`}
                >
                  {step.label}
                </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
           {/* Visual Demo Area */}
           <div className="lg:col-span-12 relative aspect-[21/9] bg-[#111] rounded-[48px] border border-white/5 overflow-hidden shadow-2xl group">
             {/* Background Glow */}
             <div className={`absolute inset-0 bg-gradient-to-br ${demoSteps[activeTab].color} transition-all duration-1000 opacity-60`} />
             
             <AnimatePresence mode="wait">
               {activeTab === 0 && (
                 <motion.div 
                   key="voice-demo"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 1.05 }}
                   className="absolute inset-0 flex items-center justify-center"
                 >
                    <div className="relative flex flex-col items-center gap-12">
                       <motion.div 
                         animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                         transition={{ duration: 2, repeat: Infinity }}
                         className="absolute w-64 h-64 bg-blue-500/20 blur-3xl rounded-full"
                       />
                       <div className="w-32 h-32 bg-white flex items-center justify-center rounded-full shadow-2xl relative z-10">
                          <Mic size={48} className="text-blue-600" />
                       </div>
                       
                       <div className="space-y-6 text-center max-w-md relative z-10 px-6">
                          <div className="p-6 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl space-y-4">
                             <div className="flex items-center gap-3 text-blue-400">
                                <Sparkles size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Voice Processing</span>
                             </div>
                             <p className="text-xl font-display font-black italic uppercase tracking-tight text-white/90">
                               &quot;Aloita työvuoro Woltissa&quot;
                             </p>
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: '100%' }}
                               transition={{ duration: 3, repeat: Infinity }}
                               className="h-1 bg-blue-500 rounded-full"
                             />
                          </div>
                          
                          <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="bg-emerald-500 text-[#050505] px-6 py-3 rounded-2xl font-display font-black text-sm uppercase italic tracking-widest shadow-xl flex items-center gap-2"
                          >
                             <CheckCircle2 size={18} /> SHIFT STARTED IN HELSINKI
                          </motion.div>
                       </div>
                    </div>
                 </motion.div>
               )}

               {activeTab === 1 && (
                 <motion.div 
                   key="ocr-demo"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 1.1 }}
                   className="absolute inset-0 flex items-center justify-around px-12 md:px-32"
                 >
                    <div className="relative w-64 h-80 bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                       <Image src="/placeholder_receipt.png" fill className="object-cover opacity-70 group-hover:scale-110 transition-transform duration-700" alt="Receipt" />
                       <motion.div 
                         animate={{ top: ['0%', '100%', '0%'] }}
                         transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                         className="absolute left-0 right-0 h-1 bg-purple-500 shadow-[0_0_20px_#a855f7] z-20"
                       />
                    </div>
                    
                    <div className="space-y-4 max-w-sm hidden md:block">
                       {[
                         { l: 'MERCHANT', v: 'NESTE EXPRESS', i: MapPin },
                         { l: 'DATE', v: '06.04.2026', i: Clock },
                         { l: 'VAT 25.5%', v: '€12.35', i: ShieldCheck },
                         { l: 'TOTAL', v: '€48.44', i: Receipt }
                       ].map((field, idx) => (
                         <motion.div 
                           key={idx}
                           initial={{ x: 20, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           transition={{ delay: 0.5 + (idx * 0.2) }}
                           className="p-5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl flex justify-between items-center"
                         >
                            <div className="flex items-center gap-3">
                               <field.i size={16} className="text-purple-400" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{field.l}</span>
                            </div>
                            <span className="text-sm font-display font-black text-white italic">{field.v}</span>
                         </motion.div>
                       ))}
                    </div>
                 </motion.div>
               )}

               {activeTab === 2 && (
                 <motion.div 
                   key="tax-demo"
                   initial={{ opacity: 0, scale: 1.1 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="absolute inset-0 flex items-center justify-center p-12"
                 >
                    <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                       <div className="space-y-8">
                          <div className="space-y-2">
                             <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Monthly Performance</div>
                             <div className="text-6xl font-display font-black italic text-white leading-none">ETENEMINEN</div>
                          </div>
                          <div className="space-y-6">
                             {[
                               { l: 'PROFIT', p: '82%', c: 'bg-emerald-500' },
                               { l: 'TAX OBLIGATION', p: '14%', c: 'bg-white/20' },
                               { l: 'COMMISSIONS', p: '4%', c: 'bg-brand/40' }
                             ].map((bar, idx) => (
                               <div key={idx} className="space-y-2">
                                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                     <span>{bar.l}</span>
                                     <span className="text-white/60">{bar.p}</span>
                                  </div>
                                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                     <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: bar.p }}
                                       transition={{ duration: 1.5, delay: 0.5 }}
                                       className={`h-full ${bar.c}`}
                                     />
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                       
                       <div className="p-8 bg-emerald-500 text-[#050505] rounded-[40px] shadow-2xl relative overflow-hidden">
                          <TrendingUp size={120} className="absolute -right-8 -bottom-8 opacity-10" />
                          <div className="space-y-4 relative z-10">
                             <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Estimated Payout</div>
                             <div className="text-7xl font-display font-black italic leading-none tracking-tighter">€4,420</div>
                             <p className="text-xs font-bold uppercase italic opacity-80">Including €642 in optimized tax recovery this month.</p>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>

             {/* Description Overlay Bottom Right */}
             <div className="absolute bottom-10 right-10 max-w-sm p-8 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl space-y-4 hidden md:block">
                <motion.div 
                  key={demoSteps[activeTab].title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                   <h4 className="text-2xl font-display font-black uppercase tracking-tighter italic text-brand">{demoSteps[activeTab].title}</h4>
                   <p className="text-sm text-white/60 italic font-medium leading-relaxed">{demoSteps[activeTab].description}</p>
                </motion.div>
             </div>
           </div>
        </div>

        {/* Brand App Showcase Device (Mobile Preview) */}
        <div className="pt-20 text-center">
           <div className="inline-flex items-center gap-6 px-10 py-5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all cursor-pointer group">
              <Smartphone size={24} className="text-brand group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-black uppercase tracking-widest italic">{activeTab === 0 ? 'START SCANNING' : 'VIEW MY DASHBOARD'}</span>
              <ArrowRight size={20} className="text-brand" />
           </div>
        </div>
      </div>
    </section>
  );
};

export default AppDemoCarousel;
