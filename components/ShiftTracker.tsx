'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Plus, Camera, Mic, MicOff, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useVero } from './VeroProvider';
import { calculateDistance, reverseGeocode } from '@/lib/utils';
import { performOCR, parseVoiceCommand } from '@/lib/ocr-service';
import { db, auth, OperationType, handleFirestoreError } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { calculate2026Tax, MILEAGE_RATE_2026 } from '@/lib/tax-engine';
import { saveShiftOffline } from '@/lib/offline-storage';
import confetti from 'canvas-confetti';

export default function ShiftTracker({ compact = false }: { compact?: boolean }) {
  const { 
    user, 
    profile, 
    setNotification, 
    refreshData,
    isTracking,
    trackedDistance,
    setTrackedDistance,
    isNightMode,
    startTracking,
    stopTracking,
    currentGpsPoints,
    startAddress,
    endAddress,
    isListening,
    toggleVoiceCommand,
    isElite
  } = useVero();
  
  const [showAddShift, setShowAddShift] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  // Form state for manual/tracked shift
  const [shiftApp, setShiftApp] = useState('Wolt');
  const [shiftGross, setShiftGross] = useState('');
  const [shiftTips, setShiftTips] = useState('');
  const [shiftDistance, setShiftDistance] = useState('');
  const [shiftDriver, setShiftDriver] = useState('');

  const handleSaveShift = async () => {
    if (!user || !profile) return;
    
    const gross = parseFloat(shiftGross) || 0;
    const tips = parseFloat(shiftTips) || 0;
    const dist = parseFloat(shiftDistance) || 0;
    
    if (dist <= 0) {
      setNotification({ message: "Distance must be greater than 0 KM", type: 'error' });
      return;
    }
    
    const breakdown = calculate2026Tax({
      grossPay: gross,
      tips: tips,
      distanceKm: dist,
      taxRate: profile.taxRate,
      annualGrossSoFar: profile.totalGross,
      isVatRegistered: profile.isVatRegistered,
      yelIncomeLevel: profile.yelIncomeLevel
    });

    const shiftData = {
      uid: user.uid,
      scopeUid: `${user.uid}_${profile.activeDataKey || 'primary'}`,
      app: shiftApp,
      grossPay: gross,
      tips: tips,
      distanceKm: dist,
      date: new Date().toISOString(),
      netProfit: breakdown.netProfit,
      taxDebt: breakdown.taxDebt,
      yelCost: breakdown.yelCost,
       vatDebt: breakdown.vatDebt,
      deduction: breakdown.mileageDeduction,
      startAddress,
      endAddress,
      gpsPoints: currentGpsPoints,
      driverName: shiftDriver || profile.displayName || 'Primary',
    };

    try {
      if (navigator.onLine) {
        await addDoc(collection(db, 'shifts'), shiftData);
        setNotification({ message: "Shift logged successfully!", type: 'success' });
      } else {
        await saveShiftOffline(shiftData as any);
        setNotification({ message: "Shift saved offline. Will sync when online.", type: 'info' });
      }
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#39FF14', '#ffffff', '#1A1A1A']
      });
      setShowAddShift(false);
      setShiftGross('');
      setShiftTips('');
      setShiftDistance('');
      setTrackedDistance(0); // Reset global tracked distance
      refreshData();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'shifts');
    }
  };

  // The tracking logic is now in VeroProvider

  // The tracking logic is now in VeroProvider
  // The handleVoiceCommand is now toggleVoiceCommand from VeroProvider

  const handleOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await performOCR(base64);
        setShiftDistance((result.distanceKm || 0).toString());
        setShiftGross((result.grossPay || 0).toString());
        setShiftTips((result.tips || 0).toString());
        setShiftApp(result.appName || 'Wolt');
        setShowAddShift(true);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("OCR Failed:", err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className={`${compact ? 'bg-transparent border-none p-0' : 'bg-card p-6 rounded-3xl shadow-sm border border-border'} mb-6 transition-colors duration-500`}>
      {!compact && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-display font-black text-white tracking-tight uppercase">Shift Tracker</h2>
          <div className="flex gap-2">
            <button 
              onClick={toggleVoiceCommand}
              aria-label={isListening ? "Stop voice command" : "Start voice command"}
              className={`p-4 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-gray-200'} rounded-2xl transition-all shadow-lg`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <label 
              aria-label="Upload receipt or screenshot"
              className="cursor-pointer p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors"
            >
              <Camera className="w-6 h-6 text-gray-200" />
              <input type="file" className="hidden" aria-hidden="true" accept="image/*" onChange={handleOCR} disabled={isScanning} />
            </label>
            <button 
              onClick={() => setShowAddShift(true)}
              aria-label="Add shift manually"
              className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors"
            >
              <Plus className="w-6 h-6 text-gray-200" />
            </button>
          </div>
        </div>
      )}

      <div className={`flex ${compact ? 'flex-col' : 'flex-col md:flex-row'} gap-4 items-center`}>
        {!compact && (
          <div className="flex-1 w-full">
            <div className="bg-white/5 border border-border p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Distance</p>
                <p className="text-2xl font-display font-black text-white">{trackedDistance.toFixed(2)} <span className="text-sm font-medium text-gray-500">KM</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Est. Deduction</p>
                <p className="text-lg font-display font-bold text-brand">€{(trackedDistance * MILEAGE_RATE_2026).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            if (isTracking) {
              stopTracking();
              setShiftDistance(trackedDistance.toFixed(2));
              setShowAddShift(true);
            } else {
              startTracking();
            }
          }}
          aria-label={isTracking ? "Stop shift tracking" : "Start shift tracking"}
          className={`w-full ${compact ? 'py-10 text-xl' : 'md:w-auto px-10 py-5 text-xs'} rounded-3xl font-black tracking-widest flex items-center justify-center gap-3 transition-all ${
            isTracking 
              ? 'bg-red-500 text-white shadow-xl shadow-red-500/30 hover:bg-red-600' 
              : 'bg-[#39FF14] text-[#1A1A1A] shadow-xl shadow-[#39FF14]/30 hover:brightness-110'
          }`}
        >
          <Car className={`${compact ? 'w-8 h-8' : 'w-5 h-5'} ${isTracking ? 'animate-pulse' : ''}`} />
          {isTracking ? 'STOP TRACKING' : 'START SHIFT'}
        </button>

        {compact && (
          <button 
            onClick={toggleVoiceCommand}
            aria-label={isListening ? "Stop listening" : "Start voice command"}
            className={`w-full py-8 rounded-3xl flex items-center justify-center gap-3 transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-gray-200 border border-white/20'}`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            <span className="text-xs font-black uppercase tracking-widest">{isListening ? 'LISTENING...' : 'VOICE COMMAND'}</span>
          </button>
        )}
      </div>

      {/* Add Shift Modal */}
      <AnimatePresence>
        {showAddShift && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-black text-white tracking-tight uppercase">Log Shift</h3>
                <button onClick={() => setShowAddShift(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">App</label>
                  <select 
                    value={shiftApp}
                    onChange={(e) => setShiftApp(e.target.value)}
                    className="w-full bg-white/5 text-white border border-border rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand outline-none"
                  >
                    <option>Wolt</option>
                    <option>Uber Eats</option>
                    <option>Foodora</option>
                    <option>Multi-App</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Gross Pay (€)</label>
                    <input 
                      type="number"
                      value={shiftGross}
                      onChange={(e) => setShiftGross(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full bg-white/5 text-white border border-border rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Tips (€)</label>
                    <input 
                      type="number"
                      value={shiftTips}
                      onChange={(e) => setShiftTips(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full bg-white/5 text-white border border-border rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Distance (KM)</label>
                  <input 
                    type="number"
                    value={shiftDistance}
                    onChange={(e) => setShiftDistance(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="w-full bg-white/5 text-white border border-border rounded-2xl p-4 font-bold focus:ring-2 focus:ring-brand outline-none"
                  />
                </div>

                {isElite && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active Driver (Elite)</label>
                    <div className="flex gap-2 flex-wrap">
                      {['Primary', ...(profile?.teamMembers || [])].map((member) => (
                        <button 
                          key={member}
                          onClick={() => setShiftDriver(member)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${shiftDriver === member || (!shiftDriver && member === 'Primary') ? 'bg-brand text-bg' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}
                        >
                          {member}
                        </button>
                      ))}
                      <button 
                        onClick={() => {
                          const name = prompt("Enter new team member name:");
                          if (name) setShiftDriver(name);
                        }}
                        className="px-4 py-2 bg-white/5 text-white/50 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white"
                      >
                        + ADD
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleSaveShift}
                  className="w-full bg-brand text-bg py-5 rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-brand/20 hover:brightness-110 transition-all mt-4 uppercase"
                >
                  SAVE LOG
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
