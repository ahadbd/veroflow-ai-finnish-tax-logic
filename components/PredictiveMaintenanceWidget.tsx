'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, CheckCircle2, Calendar, Gauge } from 'lucide-react';
import { useVero } from './VeroProvider';
import { predictMaintenance } from '@/lib/maintenance-engine';

const URGENCY_STYLES = {
  ok:         { bar: 'bg-brand',    text: 'text-brand',    border: 'border-brand/20',    bg: 'bg-brand/5'    },
  approaching:{ bar: 'bg-amber-500',text: 'text-amber-400',border: 'border-amber-500/20',bg: 'bg-amber-500/5' },
  due:        { bar: 'bg-orange-500',text: 'text-orange-400',border:'border-orange-500/20',bg:'bg-orange-500/5'},
  overdue:    { bar: 'bg-red-500',  text: 'text-red-400',  border: 'border-red-500/20',  bg: 'bg-red-500/5'  },
};

function UrgencyBadge({ urgency }: { urgency: 'ok' | 'approaching' | 'due' | 'overdue' }) {
  const labels = { ok: 'ON TRACK', approaching: 'SOON', due: 'DUE', overdue: 'OVERDUE' };
  const s = URGENCY_STYLES[urgency];
  return (
    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${s.text} ${s.border} ${s.bg}`}>
      {labels[urgency]}
    </span>
  );
}

export default function PredictiveMaintenanceWidget() {
  const { profile, shifts, totalDistance } = useVero();

  const pred = useMemo(() => {
    if (!profile) return null;
    return predictMaintenance(profile, shifts, totalDistance);
  }, [profile, shifts, totalDistance]);

  if (!pred || !profile?.maintenance) {
    return (
      <div className="bg-card rounded-3xl border border-dashed border-border p-6 text-center space-y-2">
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Predictive Maintenance</p>
        <p className="text-xs text-gray-600">Set up your vehicle in Settings to enable AI predictions.</p>
      </div>
    );
  }

  const { urgency } = pred;
  const urgencyStyles = URGENCY_STYLES[urgency];

  const fmtDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fi-FI', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const fmtKm = (km: number | null) => {
    if (km === null) return '—';
    if (km <= 0) return 'OVERDUE';
    return `${km.toLocaleString('fi-FI', { maximumFractionDigits: 0 })} km`;
  };

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className={`rounded-3xl border p-5 sm:p-6 space-y-5 ${urgencyStyles.bg} ${urgencyStyles.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TrendingUp size={15} className={urgencyStyles.text} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Predictive Maintenance</p>
          </div>
          <UrgencyBadge urgency={urgency} />
        </div>

        {/* Predicted service date — hero metric */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Est. Next Service</p>
            <p className={`text-3xl sm:text-4xl font-black tracking-tighter ${urgencyStyles.text}`}>
              {pred.daysToService !== null
                ? pred.daysToService <= 0 ? 'NOW' : `${pred.daysToService}d`
                : '—'}
            </p>
            <p className="text-[9px] text-gray-600 font-bold mt-1">{fmtDate(pred.predictedServiceDate)}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Remaining</p>
            <p className="text-lg font-black text-white">{fmtKm(pred.kmRemaining)}</p>
            <p className="text-[9px] text-gray-600 font-bold">
              {pred.weeklyKmRate > 0
                ? `~${pred.weeklyKmRate.toFixed(0)} km/week`
                : 'Start logging shifts'}
            </p>
          </div>
        </div>

        {/* KM burn progress bar */}
        {profile.maintenance && (() => {
          const interval = profile.maintenance!.interval;
          const lastKm = profile.maintenance!.lastKm;
          const nextKm = lastKm + interval;
          const pct = nextKm > 0 ? Math.min((totalDistance / nextKm) * 100, 100) : 0;
          return (
            <div>
              <div className="flex justify-between text-[8px] text-gray-600 font-black mb-1.5">
                <span>{lastKm.toLocaleString()} km</span>
                <span>{nextKm.toLocaleString()} km</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${urgencyStyles.bar}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                />
              </div>
              <p className="text-[8px] text-gray-600 font-black mt-1 text-right">{pct.toFixed(0)}% of interval used</p>
            </div>
          );
        })()}
      </div>

      {/* Upcoming events timeline */}
      {pred.upcomingEvents.length > 0 && (
        <div className="bg-card rounded-3xl border border-border p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-500" />
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Upcoming Events</p>
          </div>
          <div className="space-y-2.5">
            {pred.upcomingEvents.map((ev, i) => {
              const s = URGENCY_STYLES[ev.urgency];
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border ${s.bg} ${s.border}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl leading-none">{ev.icon}</span>
                    <div>
                      <p className="text-xs font-black text-white">{ev.label}</p>
                      <p className="text-[9px] text-gray-500 font-bold">
                        {ev.kmRemaining !== null ? fmtKm(ev.kmRemaining) : 'No data'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    {ev.daysRemaining !== null ? (
                      <span className={`text-sm font-black ${s.text}`}>
                        {ev.daysRemaining <= 0 ? 'NOW' : `${ev.daysRemaining}d`}
                      </span>
                    ) : (
                      <span className="text-sm font-black text-gray-600">—</span>
                    )}
                    <UrgencyBadge urgency={ev.urgency} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cost intelligence row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <Gauge size={13} className="mx-auto text-gray-500 mb-1.5" />
          <p className="text-base font-black text-white">
            {pred.maintenanceCostPerKm > 0 ? `€${pred.maintenanceCostPerKm.toFixed(3)}` : '—'}
          </p>
          <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-0.5">/km cost</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <AlertTriangle size={13} className="mx-auto text-gray-500 mb-1.5" />
          <p className="text-base font-black text-white">
            €{pred.totalMaintenanceCost.toFixed(0)}
          </p>
          <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-0.5">Total spent</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <CheckCircle2 size={13} className="mx-auto text-gray-500 mb-1.5" />
          <p className="text-base font-black text-white">
            {pred.projectedAnnualCost > 0 ? `€${pred.projectedAnnualCost.toFixed(0)}` : '—'}
          </p>
          <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-0.5">Proj. /year</p>
        </div>
      </div>
    </div>
  );
}
