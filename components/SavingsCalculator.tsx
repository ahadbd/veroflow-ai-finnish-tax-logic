'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Euro, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Settings2, 
  Fuel, 
  Car, 
  Bike, 
  Zap as Truck,
  Info
} from 'lucide-react';

interface SavingsCalculatorProps {
  lang: 'en' | 'fi';
  onAction?: () => void;
}

const SavingsCalculator: React.FC<SavingsCalculatorProps> = ({ lang, onAction }) => {
  const [weeklyGross, setWeeklyGross] = useState(800);
  const [isProMode, setIsProMode] = useState(false);
  const [vehicleType, setVehicleType] = useState<'car' | 'bike' | 'van'>('car');
  const [fuelPrice, setFuelPrice] = useState(1.95);

  const t = {
    en: {
      header: "The Real Cost of Delivery",
      sub: "Most couriers lose 15% of their gross to untracked expenses. See your recovery potential.",
      label: "Average Weekly Gross",
      estimatedSavings: "Estimated Monthly Recovery",
      deductions: "Untracked Deductions",
      yelSafety: "YEL Risk Mitigation",
      vatReturn: "VAT 25.5% Optimization",
      cta: "CLAIM MY RECOVERY",
      disclaimer: "Estimates based on 2026 Finnish tax laws. Actual recovery depends on individual bookkeeping.",
      proMode: "PRO MODE",
      simpleMode: "SIMPLE MODE",
      vehicle: "Vehicle Type",
      fuel: "Fuel Price Index",
      yelThreshold: "YEL Limit Alert",
      yelSafe: "SAFE (Under €9k)",
      yelWarning: "WARNING (Near €9k)",
      yelDanger: "MANDATORY (Over €9k)"
    },
    fi: {
      header: "Lähetystyön todellinen hinta",
      sub: "Useimmat kuskit menettävät 15% tuloistaan kirjaamattomiin kuluihin. Katso palautuspotentiaalisi.",
      label: "Viikoittainen Brutto",
      estimatedSavings: "Arvioitu kuukausipalautus",
      deductions: "Kirjaamattomat vähennykset",
      yelSafety: "YEL-riskinhallinta",
      vatReturn: "ALV 25.5%-optimoiti",
      cta: "VALTAA PALAUTUKSESI",
      disclaimer: "Arviot perustuvat 2026 Suomen verolakiin. Lopullinen summa riippuu kirjanpidosta.",
      proMode: "PRO-TILA",
      simpleMode: "PERUSTILA",
      vehicle: "Kulkuneuvo",
      fuel: "Polttoaineindeksi",
      yelThreshold: "YEL-raja-analyysi",
      yelSafe: "TURVASSA (Alle 9k€)",
      yelWarning: "VAROITUS (Lähellä 9k€)",
      yelDanger: "PAKOLLINEN (Yli 9k€)"
    }
  }[lang];

  const savings = useMemo(() => {
    // Base multipliers
    let deductionRate = 0.08;
    let vAtRate = 0.04;
    
    // Vehicle Adjustments
    if (vehicleType === 'bike') {
      deductionRate = 0.03; // Minor repairs/gear
      vAtRate = 0.02;
    } else if (vehicleType === 'van') {
      deductionRate = 0.12; // High fuel + maintenance
      vAtRate = 0.06;
    }

    // Fuel Index Adjustment (Linear scale around 2.00€)
    const fuelMultiplier = isProMode ? (fuelPrice / 2.00) : 1;
    
    const d = weeklyGross * deductionRate * fuelMultiplier * 4.3;
    const y = weeklyGross * 0.03 * 4.3;
    const v = weeklyGross * vAtRate * 4.3;
    
    // YEL Threshold Logic ($9011.57 is the 2026 limit)
    const annualProjected = weeklyGross * 52;
    const yelStatus = annualProjected < 8500 ? 'safe' : (annualProjected < 9500 ? 'warning' : 'danger');

    return {
      total: d + y + v,
      deductions: d,
      yel: y,
      vat: v,
      yelStatus
    };
  }, [weeklyGross, vehicleType, fuelPrice, isProMode]);

  return (
    <div className="w-full max-w-5xl mx-auto p-1 bg-gradient-to-br from-brand/20 to-transparent rounded-[48px] border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="bg-[#050505] rounded-[46px] p-8 md:p-16 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Inputs Section */}
          <div className="lg:col-span-7 space-y-12">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <h3 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter italic leading-[0.9]">
                  {t.header}
                </h3>
                <p className="text-gray-500 font-bold italic text-lg opacity-80 uppercase tracking-tight">
                  {t.sub}
                </p>
              </div>
              <button 
                onClick={() => setIsProMode(!isProMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-[10px] font-black tracking-widest uppercase italic ${isProMode ? 'bg-brand border-brand text-bg shadow-[0_0_20px_rgba(57,255,20,0.4)]' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
              >
                <Settings2 size={14} className={isProMode ? 'animate-spin-slow' : ''} /> {isProMode ? t.proMode : t.simpleMode}
              </button>
            </div>

            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand/60">{t.label}</label>
                  <span className="text-4xl font-display font-black text-white italic tracking-tighter">€{weeklyGross}</span>
                </div>
                <input 
                  type="range" 
                  min="200" 
                  max="2500" 
                  step="50"
                  value={weeklyGross}
                  onChange={(e) => setWeeklyGross(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-brand transition-all hover:bg-white/10"
                />
              </div>

              <AnimatePresence>
                {isProMode && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-10 pt-4"
                  >
                    <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'bike', icon: Bike, label: 'BIKE' },
                          { id: 'car', icon: Car, label: 'CAR' },
                          { id: 'van', icon: Truck, label: 'VAN' }
                        ].map(v => (
                          <button 
                            key={v.id}
                            onClick={() => setVehicleType(v.id as any)}
                            className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all ${vehicleType === v.id ? 'bg-brand/10 border-brand text-brand' : 'bg-white/5 border-white/10 text-white/30 hover:border-white/20'}`}
                          >
                            <v.icon size={24} />
                            <span className="text-[10px] font-black tracking-widest">{v.label}</span>
                          </button>
                        ))}
                    </div>

                    {vehicleType !== 'bike' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40"><Fuel size={14} /> {t.fuel}</div>
                          <span className="text-xl font-display font-black text-white italic">€{fuelPrice.toFixed(2)}</span>
                        </div>
                        <input 
                          type="range" 
                          min="1.50" 
                          max="2.50" 
                          step="0.01"
                          value={fuelPrice}
                          onChange={(e) => setFuelPrice(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={onAction}
              className="hidden lg:flex w-full h-20 bg-brand text-bg rounded-3xl items-center justify-center gap-4 text-xl font-display font-black uppercase tracking-tighter italic transition-all group overflow-hidden relative shadow-[0_10px_40px_rgba(57,255,20,0.2)] hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {t.cta} <ArrowRight size={24} />
            </button>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-5">
              <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[40px] space-y-10 relative group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Euro size={80} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                    <TrendingUp size={14} className="text-brand" /> {t.estimatedSavings}
                  </div>
                  <div className="flex items-baseline gap-3">
                    <motion.span 
                      key={savings.total}
                      initial={{ scale: 1.1, color: '#39FF14' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      className="text-7xl md:text-8xl font-display font-black text-white italic tracking-tighter"
                    >
                      €{savings.total.toFixed(0)}
                    </motion.span>
                    <span className="text-2xl text-white/20 font-black italic">/ mo</span>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-white/5">
                   {[
                     { label: t.deductions, val: savings.deductions, icon: Zap, color: 'text-blue-400' },
                     { label: t.vatReturn, val: savings.vat, icon: Euro, color: 'text-emerald-400' },
                     { label: t.yelSafety, val: savings.yel, icon: ShieldCheck, color: 'text-brand' }
                   ].map((item, i) => (
                     <div key={i} className="flex justify-between items-center group/item">
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center transition-all group-hover/item:bg-white/10`}>
                             <item.icon size={14} className={item.color} />
                           </div>
                           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{item.label}</span>
                        </div>
                        <span className="text-lg font-display font-black text-white italic">+€{item.val.toFixed(0)}</span>
                     </div>
                   ))}
                </div>

                <AnimatePresence>
                  {isProMode && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-6 rounded-2xl border flex items-center justify-between gap-4 ${
                        savings.yelStatus === 'safe' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                        savings.yelStatus === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                        'bg-red-500/10 border-red-500/20 text-red-500'
                      }`}
                    >
                       <div className="flex items-center gap-3">
                          <Info size={18} />
                          <div className="space-y-1">
                             <div className="text-[10px] font-black uppercase tracking-widest">{t.yelThreshold}</div>
                             <div className="text-xs font-black uppercase leading-none italic">
                               {savings.yelStatus === 'safe' ? t.yelSafe : (savings.yelStatus === 'warning' ? t.yelWarning : t.yelDanger)}
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-center italic leading-relaxed pt-4">
                  {t.disclaimer}
                </p>

                <button 
                  onClick={onAction}
                  className="lg:hidden w-full h-16 bg-brand text-bg rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest transition-all"
                >
                  {t.cta} <ArrowRight size={18} />
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsCalculator;

