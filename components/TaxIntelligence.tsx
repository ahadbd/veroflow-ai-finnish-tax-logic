'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, CheckCircle2, AlertCircle, Euro, Clock, Calendar, BarChart } from 'lucide-react';
import { useVero } from './VeroProvider';
import { YEL_THRESHOLD_2026, VAT_THRESHOLD_2026, VAT_RATE_FINLAND } from '@/lib/tax-engine';

export default function TaxIntelligence() {
  const { 
    shifts, 
    receipts, 
    annualGross, 
    isOverYel, 
    isApproachingYel, 
    isOverVat, 
    isApproachingVat,
    isVatRegistered,
    profile
  } = useVero();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  // Current Week (Starting Monday)
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfWeek = new Date(startOfToday - diffToMonday * 86400000).getTime();
  
  // Current Month (Starting 1st)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const calculateProfit = (startTime: number) => {
    const periodShifts = shifts.filter(s => new Date(s.date).getTime() >= startTime);
    const periodReceipts = receipts.filter(r => new Date(r.date).getTime() >= startTime);
    
    const gross = periodShifts.reduce((acc, s) => acc + s.netProfit, 0);
    const expenses = periodReceipts.reduce((acc, r) => acc + r.amount, 0);
    
    return gross - expenses;
  };

  const dailyProfit = calculateProfit(startOfToday);
  const weeklyProfit = calculateProfit(startOfWeek);
  const monthlyProfit = calculateProfit(startOfMonth);

  const totalNetFromShifts = shifts.reduce((acc, s) => acc + s.netProfit, 0);
  const totalExpenses = receipts.reduce((acc, r) => acc + r.amount, 0);
  const realProfit = totalNetFromShifts - totalExpenses;

  const isYelRegistered = profile?.yelIncomeLevel && profile.yelIncomeLevel > 0;
  const yelProgress = (annualGross / YEL_THRESHOLD_2026) * 100;
  const vatProgress = (annualGross / VAT_THRESHOLD_2026) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mb-6 font-display">
      {/* Earnings Overview Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card p-6 rounded-3xl shadow-sm border border-border flex flex-col justify-between"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-brand/10 rounded-2xl">
            <Euro className="w-6 h-6 text-brand" />
          </div>
          <span className="text-xs font-black text-brand bg-brand/10 px-2 py-1 rounded-full uppercase tracking-widest">EARNINGS</span>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Gross Pay</p>
              <p className="text-2xl font-black text-white">€{annualGross.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Tips</p>
              <p className="text-2xl font-black text-brand">€{shifts.reduce((acc, s) => acc + s.tips, 0).toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Expenses</p>
              <p className="text-md font-black text-red-400">-€{totalExpenses.toLocaleString('en-GB', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${Math.min(100, (totalExpenses / (annualGross || 1)) * 100)}%` }}
                 className="absolute top-0 left-0 h-full bg-red-500 rounded-full"
               />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profit Breakdown Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card p-6 rounded-3xl shadow-sm border border-border flex flex-col justify-between"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-brand/10 rounded-2xl">
            <TrendingUp className="w-6 h-6 text-brand" />
          </div>
          <span className="text-xs font-black text-brand bg-brand/10 px-2 py-1 rounded-full uppercase tracking-widest">PROFIT PERIODS</span>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4 p-3 rounded-2xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 min-w-0">
                <Clock size={12} className="text-gray-500 flex-shrink-0" />
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Today</p>
              </div>
              <p className="text-lg font-black text-white whitespace-nowrap">€{dailyProfit.toFixed(0)}</p>
            </div>
            <div className="flex items-center justify-between gap-4 p-3 rounded-2xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 min-w-0">
                <Calendar size={12} className="text-gray-500 flex-shrink-0" />
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Week</p>
              </div>
              <p className="text-lg font-black text-blue-400 whitespace-nowrap">€{weeklyProfit.toFixed(0)}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-1">
            <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Net Profit (2026)</h3>
            <p className="text-3xl font-black text-white tracking-tighter leading-none">€{realProfit.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </motion.div>

      {/* YEL Progress Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card p-6 rounded-3xl shadow-sm border border-border"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black text-white uppercase tracking-widest">YEL Progress</h3>
          {isYelRegistered ? (
            <CheckCircle2 className="w-5 h-5 text-brand" />
          ) : isOverYel ? (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          ) : isApproachingYel ? (
            <AlertCircle className="w-5 h-5 text-orange-500" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-brand" />
          )}
        </div>
        
        <div className="space-y-4">
          <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, yelProgress)}%` }}
              className={`absolute top-0 left-0 h-full rounded-full ${isYelRegistered ? 'bg-brand' : isOverYel ? 'bg-red-500' : isApproachingYel ? 'bg-orange-500' : 'bg-blue-500'}`}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs font-black uppercase tracking-widest items-center">
            <span className="text-gray-500">€{annualGross.toFixed(0)}</span>
            <span className="text-gray-400 text-right">
              {isYelRegistered ? `Registered: €${profile.yelIncomeLevel?.toLocaleString('en-GB')}` : `Threshold: €${YEL_THRESHOLD_2026.toFixed(0)}`}
            </span>
          </div>

          {isOverYel && !isYelRegistered && (
            <div className="p-3 bg-red-950/40 rounded-2xl border border-red-900/50">
              <p className="text-xs leading-tight text-red-200 font-medium">
                <span className="font-bold uppercase block mb-1 text-red-400">Mandatory YEL Required</span>
                You have exceeded the €{YEL_THRESHOLD_2026.toFixed(0)} limit. Register now to avoid penalties.
              </p>
            </div>
          )}
          
          {isApproachingYel && !isYelRegistered && (
            <div className="p-3 bg-orange-950/40 rounded-2xl border border-orange-900/50">
              <p className="text-xs leading-tight text-orange-200 font-medium">
                <span className="font-bold uppercase block mb-1 text-orange-400">Approaching Threshold</span>
                You are at {yelProgress.toFixed(0)}% of the YEL limit. Plan for social security costs.
              </p>
            </div>
          )}

          {!isOverYel && !isApproachingYel && !isYelRegistered && (
            <div className="p-3 bg-blue-950/40 rounded-2xl border border-blue-900/50">
              <p className="text-xs leading-tight text-blue-200 font-medium">
                <span className="font-bold uppercase block mb-1 text-blue-400">YEL STATUS: EXEMPT</span>
                You are currently below the mandatory YEL threshold. No pension insurance is required for this income level.
              </p>
            </div>
          )}

          {isYelRegistered && (
            <div className="p-3 bg-indigo-950/40 rounded-2xl border border-indigo-900/50">
              <p className="text-xs leading-tight text-indigo-200 font-medium">
                <span className="font-bold uppercase block mb-1 text-indigo-400">YEL REGISTERED</span>
                You are currently tracking YEL at €{profile?.yelIncomeLevel?.toLocaleString('en-GB')} level. This covers your social security and pension.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* VAT Progress Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card p-6 rounded-3xl shadow-sm border border-border"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black text-white uppercase tracking-widest">VAT Progress ({(VAT_RATE_FINLAND * 100).toFixed(1)}%)</h3>
          {isOverVat ? (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          ) : isApproachingVat ? (
            <AlertCircle className="w-5 h-5 text-orange-500" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-brand" />
          )}
        </div>
        
        <div className="space-y-4">
          <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, vatProgress)}%` }}
              className={`absolute top-0 left-0 h-full rounded-full ${isOverVat ? 'bg-red-500' : isApproachingVat ? 'bg-orange-500' : 'bg-indigo-500'}`}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs font-black uppercase tracking-widest items-center">
            <span className="text-gray-500">€{annualGross.toFixed(0)}</span>
            <span className="text-gray-400 text-right">Threshold: €{VAT_THRESHOLD_2026.toFixed(0)}</span>
          </div>

          {isOverVat && !isVatRegistered && (
            <div className="p-3 bg-red-950/40 rounded-2xl border border-red-900/50">
              <p className="text-xs leading-tight text-red-200 font-medium">
                You&apos;ve crossed €{VAT_THRESHOLD_2026}. You must register for VAT and start collecting {(VAT_RATE_FINLAND * 100).toFixed(1)}% VAT on your gross earnings. Deduct expenses to optimize profit.
              </p>
            </div>
          )}

          {isApproachingVat && !isVatRegistered && (
            <div className="p-3 bg-orange-950/40 rounded-2xl border border-orange-900/50">
              <p className="text-xs leading-tight text-orange-200 font-medium">
                <span className="font-bold uppercase block mb-1 text-orange-400">VAT Warning</span>
                You are at {vatProgress.toFixed(0)}% of the VAT threshold. Consider voluntary registration.
              </p>
            </div>
          )}

          {isVatRegistered && (
            <div className="p-3 bg-indigo-950/40 rounded-2xl border border-indigo-900/50">
              <p className="text-xs leading-tight text-indigo-200 font-medium">
                <span className="font-bold uppercase block mb-1 text-indigo-400">VAT REGISTERED</span>
                You are currently tracking VAT. Remember to deduct VAT from your business expenses.
              </p>
            </div>
          )}

          {!isOverVat && !isApproachingVat && !isVatRegistered && (
            <div className="p-3 bg-blue-950/40 rounded-2xl border border-blue-900/50">
              <p className="text-xs leading-tight text-blue-200 font-medium">
                <span className="font-bold uppercase block mb-1 text-blue-400">VAT STATUS: BELOW THRESHOLD</span>
                You are under the mandatory VAT threshold. Track your annual gross and prepare to register once you approach the limit.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
