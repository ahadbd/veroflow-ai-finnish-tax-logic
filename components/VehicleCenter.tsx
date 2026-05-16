'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Plus, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useVero } from './VeroProvider';
import { db } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import PredictiveMaintenanceWidget from './PredictiveMaintenanceWidget';

export default function VehicleCenter() {
  const { profile, user, totalDistance, setNotification, refreshData } = useVero();
  const [showLogModal, setShowLogModal] = useState(false);
  const [logDesc, setLogDesc] = useState('');
  const [logCost, setLogCost] = useState('');
  const [logKm, setLogKm] = useState('');

  const [showTireModal, setShowTireModal] = useState(false);
  const [tireFront, setTireFront] = useState('');
  const [tireRear, setTireRear] = useState('');

  const handleLogService = async () => {
    if (!user || !logDesc || !logCost || !logKm) return;
    try {
      const newRecord = {
        date: new Date().toISOString(),
        description: logDesc,
        cost: Number(logCost),
        km: Number(logKm)
      };
      await updateDoc(doc(db, 'profiles', user.uid), {
        maintenanceHistory: arrayUnion(newRecord),
        'maintenance.lastKm': Number(logKm)
      });
      setNotification({ message: "Service record added!", type: 'success' });
      setShowLogModal(false);
      setLogDesc('');
      setLogCost('');
      setLogKm('');
      refreshData();
    } catch (e) {
      console.error("Log service failed:", e);
    }
  };

  const handleLogTires = async () => {
    if (!user || !tireFront || !tireRear) return;
    try {
      await updateDoc(doc(db, 'profiles', user.uid), {
        'maintenance.tires': {
          front: Number(tireFront),
          rear: Number(tireRear),
          lastChecked: new Date().toISOString()
        }
      });
      setNotification({ message: "Tire condition updated!", type: 'success' });
      setShowTireModal(false);
      setTireFront('');
      setTireRear('');
      refreshData();
    } catch (e) {
      console.error("Log tires failed:", e);
    }
  };

  const maintenance = profile?.maintenance;
  const tires = maintenance?.tires;
  
  const nextServiceKm = maintenance ? (maintenance.lastKm + maintenance.interval) : 0;
  const kmRemaining = nextServiceKm - totalDistance;
  const isServiceDue = kmRemaining <= 0;
  const isServiceApproaching = !isServiceDue && kmRemaining < 500;

  const getTireStatus = () => {
    if (!tires) return { label: 'NOT CHECKED', color: 'text-gray-500', icon: <AlertTriangle className="w-5 h-5 text-gray-500" /> };
    const min = Math.min(tires.front, tires.rear);
    if (min < 1.6) return { label: 'DANGEROUS', color: 'text-red-500', icon: <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" /> };
    if (min < 3) return { label: 'REPLACE SOON', color: 'text-orange-500', icon: <AlertTriangle className="w-5 h-5 text-orange-500" /> };
    return { label: 'GOOD', color: 'text-brand', icon: <CheckCircle2 className="w-5 h-5 text-brand" /> };
  };

  const tireStatus = getTireStatus();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-black text-white tracking-tight uppercase">Vehicle Health</h2>

      {/* ── Predictive AI Section ── */}
      <PredictiveMaintenanceWidget />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Next Service Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-6 rounded-3xl border border-border space-y-4"
        >
          <div className="flex justify-between items-center">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Next Service In</p>
            {isServiceDue ? (
              <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
            ) : isServiceApproaching ? (
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-brand" />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className={`text-4xl font-display font-black tracking-tighter ${isServiceDue ? 'text-red-500' : isServiceApproaching ? 'text-orange-500' : 'text-white'}`}>
              {maintenance ? Math.max(0, kmRemaining).toFixed(0) : '---'} <span className="text-sm font-medium text-gray-500">KM</span>
            </h3>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
              {maintenance?.vehicleType || 'Vehicle'} • {maintenance?.interval || 0} km interval
            </p>
          </div>

          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${nextServiceKm > 0 ? Math.min(100, (totalDistance / nextServiceKm) * 100) : 0}%` }}
              className={`h-full ${isServiceDue ? 'bg-red-500' : isServiceApproaching ? 'bg-orange-500' : 'bg-brand'}`}
            />
          </div>
        </motion.div>

        {/* Tire Condition Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setShowTireModal(true)}
          role="button"
          aria-label="Log tire condition check"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setShowTireModal(true)}
          className="bg-card p-6 rounded-3xl border border-border space-y-4 cursor-pointer hover:border-white/10 transition-all focus:ring-2 focus:ring-brand outline-none"
        >
          <div className="flex justify-between items-center">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Tire Condition</p>
            {tireStatus.icon}
          </div>
          <div className="space-y-1">
            <h3 className={`text-4xl font-display font-black tracking-tighter uppercase ${tireStatus.color}`}>{tireStatus.label}</h3>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
              {tires ? `Checked ${new Date(tires.lastChecked).toLocaleDateString('en-GB')}` : 'Click to log check'}
            </p>
          </div>
          {tires && (
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-brand/10 text-brand text-[8px] font-black rounded uppercase tracking-widest">Front: {tires.front}mm</span>
              <span className="px-2 py-1 bg-brand/10 text-brand text-[8px] font-black rounded uppercase tracking-widest">Rear: {tires.rear}mm</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Maintenance History */}
      <div className="bg-card p-6 rounded-3xl border border-border space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Maintenance History</h3>
          <Wrench className="w-4 h-4 text-gray-600" />
        </div>
        
        <div className="space-y-3">
          {profile?.maintenanceHistory?.map((h, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-border hover:border-white/10 transition-all">
              <div>
                <p className="text-sm font-bold text-white">{h.description}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(h.date).toLocaleDateString('en-GB')} • {h.km} km</p>
              </div>
              <p className="font-display font-black text-red-400">€{h.cost.toFixed(2)}</p>
            </div>
          ))}
          {!profile?.maintenanceHistory?.length && (
            <div className="text-center py-8 bg-black/20 rounded-2xl border border-dashed border-border">
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">No service history logged yet</p>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => setShowLogModal(true)}
          aria-label="Add new service record"
          className="w-full py-5 bg-white/10 border border-dashed border-border rounded-2xl text-[10px] font-black text-gray-200 uppercase tracking-widest hover:bg-white/20 hover:text-white transition-all"
        >
          + LOG SERVICE RECORD
        </button>
      </div>

      {/* Log Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-border overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-black text-white tracking-tight uppercase">Log Service</h3>
                <button onClick={() => setShowLogModal(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Description</label>
                  <input 
                    value={logDesc}
                    onChange={(e) => setLogDesc(e.target.value)}
                    placeholder="Oil Change, Tire Swap, etc."
                    className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Cost (€)</label>
                    <input 
                      type="number"
                      value={logCost}
                      onChange={(e) => setLogCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current KM</label>
                    <input 
                      type="number"
                      value={logKm}
                      onChange={(e) => setLogKm(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleLogService}
                  className="w-full bg-brand text-bg py-5 rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-brand/20 hover:brightness-110 transition-all mt-4 uppercase"
                >
                  SAVE RECORD
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tire Modal */}
      <AnimatePresence>
        {showTireModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-border overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-black text-white tracking-tight uppercase">Log Tire Check</h3>
                <button onClick={() => setShowTireModal(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Front Tread (mm)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={tireFront}
                      onChange={(e) => setTireFront(e.target.value)}
                      placeholder="e.g. 6.0"
                      className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Rear Tread (mm)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={tireRear}
                      onChange={(e) => setTireRear(e.target.value)}
                      placeholder="e.g. 5.5"
                      className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleLogTires}
                  className="w-full bg-brand text-bg py-5 rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-brand/20 hover:brightness-110 transition-all mt-4 uppercase"
                >
                  SAVE TIRE CHECK
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fuel Efficiency Widget */}
      <div className="bg-card p-6 rounded-3xl border border-border space-y-4">
        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Fuel Efficiency</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-display font-black text-white">{profile?.fuelConsumption || '---'}</span>
          <span className="text-sm font-bold text-gray-500 uppercase">L / 100KM</span>
        </div>
        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Based on your last 5 fuel logs. Average price: €{profile?.fuelPrice || '---'}/L</p>
      </div>
    </div>
  );
}
