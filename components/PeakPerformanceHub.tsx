'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Calendar, BarChart3, TrendingUp, Info, Euro } from 'lucide-react';
import { useVero } from './VeroProvider';

export default function PeakPerformanceHub() {
  const { peakPerformance, shifts } = useVero();

  if (!peakPerformance || shifts.length < 5) {
    return (
      <div className="bg-card p-8 rounded-3xl border border-border text-center space-y-4">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
          <Zap className="w-8 h-8 text-gray-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">Intelligence Loading</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
            We need at least 5 shifts to calculate your peak performance windows. Keep tracking to unlock insights.
          </p>
        </div>
        <div className="pt-4">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden max-w-[200px] mx-auto">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(shifts.length / 5) * 100}%` }}
              className="h-full bg-brand"
            />
          </div>
          <p className="text-[10px] text-brand font-black uppercase tracking-widest mt-2">{shifts.length} / 5 SHIFTS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand/10 rounded-xl">
          <Zap className="w-5 h-5 text-brand" />
        </div>
        <h2 className="text-2xl font-display font-black text-white tracking-tight uppercase">Peak Intelligence</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Day */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-6 rounded-3xl border border-border space-y-4"
        >
          <div className="flex justify-between items-center">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Golden Day</p>
            <Calendar className="w-4 h-4 text-brand" />
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-display font-black text-white tracking-tighter uppercase">{peakPerformance.bestDay}</h3>
            <p className="text-[10px] text-brand font-black uppercase tracking-widest">Highest Hourly Rate</p>
          </div>
        </motion.div>

        {/* Best Time */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-6 rounded-3xl border border-border space-y-4"
        >
          <div className="flex justify-between items-center">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Peak Hour</p>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-display font-black text-white tracking-tighter uppercase">{peakPerformance.bestTime}</h3>
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Maximum Efficiency</p>
          </div>
        </motion.div>

        {/* Avg Hourly Rate */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-3xl border border-border space-y-4"
        >
          <div className="flex justify-between items-center">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Peak Rate</p>
            <Euro className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-display font-black text-white tracking-tighter uppercase">€{peakPerformance.hourlyRate.toFixed(2)}<span className="text-sm text-gray-500">/H</span></h3>
            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Top Performance</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Platform Efficiency */}
        <div className="bg-card p-6 rounded-3xl border border-border space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Platform Efficiency</h3>
            <BarChart3 className="w-4 h-4 text-gray-600" />
          </div>
          <div className="space-y-4">
            {peakPerformance.platformEfficiency.map((p, i) => (
              <div key={p.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-sm font-bold text-white">{p.name}</p>
                  <p className="text-xs font-black text-brand">€{p.rate.toFixed(2)}/h</p>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.rate / peakPerformance.hourlyRate) * 100}%` }}
                    className={`h-full ${i === 0 ? 'bg-brand' : i === 1 ? 'bg-blue-400' : 'bg-indigo-400'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Advice */}
        <div className="bg-card p-6 rounded-3xl border border-border space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Smart Strategy</h3>
            <Info className="w-4 h-4 text-gray-600" />
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 p-4 bg-brand/5 rounded-2xl border border-brand/10">
              <div className="p-2 bg-brand/10 rounded-xl h-fit">
                <TrendingUp className="w-4 h-4 text-brand" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white uppercase tracking-tight">Focus on {peakPerformance.bestDay}s</p>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                  Your earnings are {((peakPerformance.hourlyRate / (shifts.reduce((acc, s) => acc + s.grossPay, 0) / (shifts.reduce((acc, s) => acc + (s.durationMin || 0), 0) / 60)) - 1) * 100).toFixed(0)}% higher on {peakPerformance.bestDay}s. Prioritize these shifts.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-blue-400/5 rounded-2xl border border-blue-400/10">
              <div className="p-2 bg-blue-400/10 rounded-xl h-fit">
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white uppercase tracking-tight">The {peakPerformance.bestTime} Window</p>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                  Data shows a significant spike in order density around {peakPerformance.bestTime}. Start your shift 15 mins early to catch the wave.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
