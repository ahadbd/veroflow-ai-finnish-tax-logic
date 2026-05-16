'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Wrench, CloudRain, AlertTriangle, AlertCircle } from 'lucide-react';
import { useVero } from './VeroProvider';
import { calculateDistance } from '@/lib/utils';
import { predictMaintenance } from '@/lib/maintenance-engine';

export default function SmartAlerts() {
  const { 
    profile, 
    weather, 
    isTracking, 
    stopTracking, 
    setNotification, 
    currentLocation,
    isApproachingYel,
    isOverYel,
    isApproachingVat,
    isOverVat,
    isVatRegistered,
    shifts,
    totalDistance,
  } = useVero();

  const isYelRegistered = profile?.yelIncomeLevel && profile.yelIncomeLevel > 0;

  const geofenceAlert = isTracking && currentLocation && profile?.homeLocation ? calculateDistance(
    currentLocation.lat,
    currentLocation.lng,
    profile.homeLocation.lat,
    profile.homeLocation.lng
  ) < 0.2 : false;

  const maintenancePred = useMemo(() => {
    if (!profile) return null;
    return predictMaintenance(profile, shifts, totalDistance);
  }, [profile, shifts, totalDistance]);

  const isMaintenanceDue = maintenancePred?.urgency === 'overdue' || maintenancePred?.urgency === 'due';
  const isMaintenanceApproaching = maintenancePred?.urgency === 'approaching';
  const maintenance = profile?.maintenance;

  const isWeatherPeak = weather && (weather.temp < 0 || (weather.condition && (weather.condition.includes('Snow') || weather.condition.includes('Rain'))));

  const showYelAlert = (isOverYel || isApproachingYel) && !isYelRegistered;
  const showVatAlert = (isOverVat || isApproachingVat) && !isVatRegistered;

  return (
    <div className="space-y-3 mb-6">
      <AnimatePresence>
        {geofenceAlert && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-brand p-4 rounded-2xl flex items-center justify-between overflow-hidden shadow-[0_0_20px_rgba(57,255,20,0.3)]"
          >
            <div className="flex items-center gap-4">
              <div className="bg-bg p-2 rounded-xl text-brand">
                <Home size={20} />
              </div>
              <div>
                <p className="text-bg font-black text-[10px] uppercase tracking-widest">Home Detected</p>
                <p className="text-[10px] text-bg/70 font-black uppercase tracking-widest">Shift tracking is active. End shift?</p>
              </div>
            </div>
            <button 
              onClick={() => {
                stopTracking();
                setNotification({ message: "Shift tracking stopped at home.", type: 'info' });
              }}
              className="px-4 py-2 bg-bg text-brand text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform"
            >
              STOP
            </button>
          </motion.div>
        )}

        {isMaintenanceDue && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500 p-4 rounded-2xl flex items-center gap-4 overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            <div className="bg-bg p-2 rounded-xl text-white">
              <Wrench size={20} />
            </div>
            <div>
              <p className="text-white font-black text-[10px] uppercase tracking-widest">Service Overdue!</p>
              <p className="text-[10px] text-white/80 font-black uppercase tracking-widest">
                {maintenance?.vehicleType} — go to Vehicle tab now.
              </p>
            </div>
          </motion.div>
        )}

        {!isMaintenanceDue && isMaintenanceApproaching && maintenancePred && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-orange-500 p-4 rounded-2xl flex items-center gap-4 overflow-hidden shadow-[0_0_20px_rgba(249,115,22,0.3)]"
          >
            <div className="bg-bg p-2 rounded-xl text-white">
              <Wrench size={20} />
            </div>
            <div>
              <p className="text-white font-black text-[10px] uppercase tracking-widest">Service Approaching</p>
              <p className="text-[10px] text-white/80 font-black uppercase tracking-widest">
                {maintenancePred.kmRemaining.toFixed(0)} km left
                {maintenancePred.daysToService ? ` (~${maintenancePred.daysToService}d)` : ''}
              </p>
            </div>
          </motion.div>
        )}

        {isWeatherPeak && weather && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-blue-500 p-4 rounded-2xl flex items-center gap-4 overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            <div className="bg-bg p-2 rounded-xl text-white">
              <CloudRain size={20} />
            </div>
            <div>
              <p className="text-white font-black text-[10px] uppercase tracking-widest">Peak Earning Alert</p>
              <p className="text-[10px] text-white/80 font-black uppercase tracking-widest">
                {weather.condition} detected. Tips expected +20%.
              </p>
            </div>
          </motion.div>
        )}
        
        {showYelAlert && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`${isOverYel ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]'} p-4 rounded-2xl flex items-center justify-between overflow-hidden transition-all`}
          >
            <div className="flex items-center gap-4">
              <div className="bg-bg p-2 rounded-xl text-white">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-white font-black text-[10px] uppercase tracking-widest">{isOverYel ? 'YEL Threshold Exceeded' : 'Approaching YEL'}</p>
                <p className="text-[10px] text-white/70 font-black uppercase tracking-widest">{isOverYel ? 'Register for YEL pension now!' : 'You are close to the €9,423 YEL limit.'}</p>
              </div>
            </div>
          </motion.div>
        )}

        {showVatAlert && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`${isOverVat ? 'bg-red-600 shadow-[0_0_25px_rgba(220,38,38,0.5)]' : 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]'} p-4 rounded-2xl flex items-center justify-between overflow-hidden transition-all`}
          >
            <div className="flex items-center gap-4">
              <div className="bg-bg p-2 rounded-xl text-white">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-white font-black text-[10px] uppercase tracking-widest">{isOverVat ? 'VAT Threshold Crossed' : 'Approaching VAT'}</p>
                <p className="text-[10px] text-white/70 font-black uppercase tracking-widest">{isOverVat ? 'Mandatory registration required!' : 'You are near the €15,000 Finnish limit.'}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
