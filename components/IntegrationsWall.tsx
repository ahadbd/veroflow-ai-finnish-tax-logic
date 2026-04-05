'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Wallet, 
  CreditCard, 
  Landmark, 
  ArrowRightLeft, 
  ShieldCheck 
} from 'lucide-react';

const IntegrationsWall = ({ lang }: { lang: 'en' | 'fi' }) => {
  const t = {
    en: {
      title: "Built for the Finnish ecosystem",
      sub: "VeroFlow exports seamlessly to your preferred business banking and accounting tools.",
      partners: [
        { name: "HOLVI", icon: Wallet, type: "Business Banking" },
        { name: "NORDEA", icon: Landmark, type: "Traditional Banking" },
        { name: "OP RYHMÄ", icon: Building2, type: "Financial Group" },
        { name: "KIRIMARKKU", icon: CreditCard, type: "Accounting" }
      ]
    },
    fi: {
      title: "Osa suomalaista ekosysteemiä",
      sub: "VeroFlow integroituu saumattomasti suosituimpiin yrityspankki- ja kirjanpitotyökaluihin.",
      partners: [
        { name: "HOLVI", icon: Wallet, type: "Yrityspankki" },
        { name: "NORDEA", icon: Landmark, type: "Perinteinen Pankki" },
        { name: "OP RYHMÄ", icon: Building2, type: "Finanssiryhmä" },
        { name: "KIRIMARKKU", icon: CreditCard, type: "Kirjanpito" }
      ]
    }
  }[lang];

  return (
    <section className="py-24 px-6 border-y border-white/5 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter italic leading-none">
            {t.title}
          </h2>
          <p className="text-gray-500 font-bold italic text-sm uppercase tracking-tight opacity-70">
            {t.sub}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {t.partners.map((partner, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              className="p-10 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-6 group transition-all"
            >
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform text-white/40 group-hover:text-brand">
                 <partner.icon size={32} />
              </div>
              <div className="text-center space-y-1">
                 <div className="font-display font-black italic text-xl tracking-tighter text-white/80 group-hover:text-white">{partner.name}</div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-brand/60">{partner.type}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 pt-8 opacity-20 grayscale">
           <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] italic"><ArrowRightLeft size={16} /> Bank Sync Beta</div>
           <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] italic"><ShieldCheck size={16} /> PSD2 Secure</div>
        </div>
      </div>
    </section>
  );
};

export default IntegrationsWall;
