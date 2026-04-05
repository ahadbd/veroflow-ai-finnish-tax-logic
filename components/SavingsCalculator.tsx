'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Euro, ShieldCheck, ArrowRight } from 'lucide-react';

interface SavingsCalculatorProps {
  lang: 'en' | 'fi';
}

const SavingsCalculator: React.FC<SavingsCalculatorProps> = ({ lang }) => {
  const [weeklyGross, setWeeklyGross] = useState(800);

  const t = {
    en: {
      header: "How much are you losing?",
      sub: "Enter your average weekly gross to see your potential savings with VeroFlow.",
      label: "My Weekly Gross",
      estimatedSavings: "Estimated Monthly Recovery",
      deductions: "Missed Deductions",
      yelSafety: "YEL Overpayment Protection",
      vatReturn: "Optimized VAT Return",
      cta: "STOP LEAKING PROFIT",
      disclaimer: "Estimates based on average Finnish delivery courier tax profiles (2026)."
    },
    fi: {
      header: "Kuinka paljon menetät?",
      sub: "Syötä viikoittainen bruttosi nähdäksesi potentiaaliset säästösi VeroFlow'lla.",
      label: "Viikoittainen Bruttoni",
      estimatedSavings: "Arvioitu kuukausittainen palautus",
      deductions: "Ohitetut vähennykset",
      yelSafety: "YEL-yliasetussuoja",
      vatReturn: "Optimoitu ALV-palautus",
      cta: "LOPETA TUOTON MENETYS",
      disclaimer: "Arviot perustuvat suomalaisten lähettiyrittäjien keskimääräisiin veroprofiileihin (2026)."
    }
  }[lang];

  // Logic: 
  // 1. Deductions (km + small expenses) ~ 8% of gross
  // 2. YEL protection (preventing overpayment) ~ 3% of gross
  // 3. VAT optimization (25.5% recovery on expenses) ~ 4% of gross
  const savings = useMemo(() => {
    const d = weeklyGross * 0.08 * 4;
    const y = weeklyGross * 0.03 * 4;
    const v = weeklyGross * 0.04 * 4;
    return {
      total: d + y + v,
      deductions: d,
      yel: y,
      vat: v
    };
  }, [weeklyGross]);

  return (
    <div className="w-full max-w-4xl mx-auto p-1 bg-gradient-to-br from-brand/20 to-transparent rounded-[40px] border border-white/10 shadow-2xl">
      <div className="bg-[#0a0a0a] rounded-[38px] p-8 md:p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter italic leading-none">
                {t.header}
              </h3>
              <p className="text-gray-500 font-medium italic text-lg leading-relaxed">
                {t.sub}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand">{t.label}</label>
                <span className="text-3xl font-display font-black text-white italic">€{weeklyGross}</span>
              </div>
              <input 
                type="range" 
                min="200" 
                max="2500" 
                step="50"
                value={weeklyGross}
                onChange={(e) => setWeeklyGross(parseInt(e.target.value))}
                className="w-full h-3 bg-white/5 rounded-full appearance-none cursor-pointer accent-brand transition-all hover:bg-white/10"
              />
              <div className="flex justify-between text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                <span>€200</span>
                <span>€2500+</span>
              </div>
            </div>

            <button className="hidden lg:flex w-full h-16 bg-white/5 border border-white/10 rounded-2xl items-center justify-center gap-3 text-sm font-black uppercase tracking-widest hover:bg-brand hover:text-bg hover:border-brand transition-all group">
              {t.cta} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="space-y-8 p-8 bg-white/[0.03] border border-white/5 rounded-[32px] relative backdrop-blur-sm shadow-inner">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t.estimatedSavings}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl md:text-7xl font-display font-black text-brand italic">€{savings.total.toFixed(0)}</span>
                <span className="text-xl text-white/20 font-black italic">/ mo</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              {[
                { label: t.deductions, val: savings.deductions, icon: TrendingUp },
                { label: t.yelSafety, val: savings.yel, icon: ShieldCheck },
                { label: t.vatReturn, val: savings.vat, icon: Euro }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand/10 transition-colors">
                      <item.icon size={14} className="text-gray-500 group-hover:text-brand" />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</span>
                  </div>
                  <span className="text-sm font-black text-white italic">+€{item.val.toFixed(0)}</span>
                </div>
              ))}
            </div>

            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter text-center italic">
              {t.disclaimer}
            </p>

            <button className="lg:hidden w-full h-16 bg-brand text-bg rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest transition-all">
              {t.cta} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsCalculator;
