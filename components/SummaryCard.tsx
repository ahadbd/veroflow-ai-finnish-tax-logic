'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface SummaryCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  color: 'brand' | 'blue' | 'orange' | 'indigo' | 'white';
  delay?: number;
}

export default function SummaryCard({ label, value, subValue, icon: Icon, color, delay = 0 }: SummaryCardProps) {
  const colorMap = {
    brand: 'text-brand bg-brand/10 border-brand/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    white: 'text-white bg-white/5 border-white/10'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card p-6 rounded-3xl border border-border space-y-4 hover:border-white/10 transition-colors group"
    >
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl border ${colorMap[color]}`}>
           <Icon size={22} strokeWidth={2.5} />
        </div>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{label}</p>
      </div>

      <div className="space-y-1">
        <h3 className="text-3xl font-display font-black text-white italic tracking-tighter">{value}</h3>
        {subValue && (
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-none">
            {subValue}
          </p>
        )}
      </div>

      {/* Modern Micro-animation Accent */}
      <div className="h-1 w-0 group-hover:w-full bg-brand/30 transition-all duration-500 rounded-full" />
    </motion.div>
  );
}
