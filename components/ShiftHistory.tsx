'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, TrendingUp, TrendingDown, ArrowRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useVero } from './VeroProvider';

export default function ShiftHistory() {
  const { shifts } = useVero();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedShifts = [...shifts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalPages = Math.ceil(sortedShifts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShifts = sortedShifts.slice(startIndex, startIndex + itemsPerPage);

  if (sortedShifts.length === 0) {
    return (
      <div className="bg-card p-8 rounded-3xl border border-border text-center">
        <Clock className="w-8 h-8 text-gray-700 mx-auto mb-3" />
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">No shift history found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Shift History</h3>
        <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{shifts.length} Total Shifts</span>
      </div>

      <div className="space-y-3 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {paginatedShifts.map((shift, i) => {
              const globalIndex = startIndex + i;
              const prevShift = sortedShifts[globalIndex + 1];
              const trend = prevShift ? (shift.netProfit > prevShift.netProfit ? 'up' : shift.netProfit < prevShift.netProfit ? 'down' : 'neutral') : 'neutral';

              return (
                <div 
                  key={shift.id || globalIndex}
                  className="bg-card p-4 rounded-2xl border border-border hover:border-white/10 transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand/10 rounded-xl">
                        <Calendar className="w-4 h-4 text-brand" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-tight">
                          {new Date(shift.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">
                          {shift.app} • {shift.distanceKm.toFixed(1)} KM
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {trend === 'up' && <TrendingUp size={12} className="text-brand" />}
                        {trend === 'down' && <TrendingDown size={12} className="text-red-500" />}
                        <p className="text-sm font-display font-black text-white tracking-tight">
                          €{shift.netProfit.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">
                        Net Profit
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[8px] text-gray-600 font-black uppercase tracking-widest overflow-hidden">
                    <MapPin size={8} className="flex-shrink-0" />
                    <span className="truncate max-w-[120px]">{shift.startAddress || 'Unknown'}</span>
                    <ArrowRight size={8} className="flex-shrink-0" />
                    <span className="truncate max-w-[120px]">{shift.endAddress || 'Unknown'}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[7px] text-gray-600 uppercase font-black tracking-widest">Gross</p>
                      <p className="text-[10px] font-bold text-gray-400">€{shift.grossPay.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[7px] text-gray-600 uppercase font-black tracking-widest">Tax Debt</p>
                      <p className="text-[10px] font-bold text-red-400/80">€{shift.taxDebt.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[7px] text-gray-600 uppercase font-black tracking-widest">Deduction</p>
                      <p className="text-[10px] font-bold text-blue-400/80">€{shift.deduction.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-4">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="p-3 bg-white/10 rounded-xl border border-border text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed hover:text-white transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Page</span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{currentPage}</span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">of</span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{totalPages}</span>
          </div>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="p-3 bg-white/10 rounded-xl border border-border text-gray-200 disabled:opacity-20 disabled:cursor-not-allowed hover:text-white transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
