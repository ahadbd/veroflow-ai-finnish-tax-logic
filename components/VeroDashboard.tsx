'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  TrendingUp,
  LogIn, 
  Home, 
  FileText, 
  BarChart3, 
  Wrench, 
  Settings, 
  Moon, 
  Sun, 
  Thermometer, 
  Cloud,
  CheckCircle,
  AlertCircle,
  Mic,
  X,
  MicOff,
  Gauge,
  Timer,
  Route,
  Euro,
  ChevronDown
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useVero } from './VeroProvider';
import VeroLanding from './VeroLanding';
import Link from 'next/link';
import AIErrorBoundary from './AIErrorBoundary';
import OnboardingModal from './OnboardingModal';

// Lazy load heavy components
const TaxIntelligence = dynamic(() => import('./TaxIntelligence'), { ssr: false });
const ShiftTracker = dynamic(() => import('./ShiftTracker'), { ssr: false });
const ShiftHistory = dynamic(() => import('./ShiftHistory'), { ssr: false });
const ReceiptVault = dynamic(() => import('./ReceiptVault'), { ssr: false });
const AnalyticsHub = dynamic(() => import('./AnalyticsHub'), { ssr: false });
const VehicleCenter = dynamic(() => import('./VehicleCenter'), { ssr: false });
const VeroExport = dynamic(() => import('./VeroExport'), { ssr: false });
const SettingsModal = dynamic(() => import('./SettingsModal'), { ssr: false });
const SmartAlerts = dynamic(() => import('./SmartAlerts'), { ssr: false });
const CourierFeed = dynamic(() => import('./CourierFeed'), { ssr: false });
const GamificationPanel = dynamic(() => import('./GamificationPanel'), { ssr: false });
import { Globe } from 'lucide-react';

export default function VeroDashboard() {
  const { 
    user, 
    profile, 
    loading, 
    weather, 
    notification, 
    setNotification,
    isNightMode,
    setIsNightMode,
    isDrivingMode,
    setIsDrivingMode,
    activeTab,
    setActiveTab,
    trackedDistance,
    shifts,
    receipts,
    annualGross,
    totalDistance,
    isOnline,
    login,
    guestLogin,
    logout,
    isListening,
    toggleVoiceCommand,
    isAdmin,
    currentSpeed,
    startTime,
  } = useVero();

  const [showSettings, setShowSettings] = useState(false);

  const todayStart = React.useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }, []);

  const todayNetProfit = React.useMemo(() => {
    const shiftsToday = shifts.filter((shift) => new Date(shift.date).getTime() >= todayStart);
    const receiptsToday = receipts.filter((receipt) => new Date(receipt.date).getTime() >= todayStart);
    const netFromShifts = shiftsToday.reduce((sum, shift) => sum + shift.netProfit, 0);
    const expenseToday = receiptsToday.reduce((sum, receipt) => sum + receipt.amount, 0);
    return netFromShifts - expenseToday;
  }, [receipts, shifts, todayStart]);

  const dailyGoalAmount = React.useMemo(() => {
    const weeklyGoal = profile?.weeklyGoal ?? 1400;
    return weeklyGoal / 7;
  }, [profile?.weeklyGoal]);

  const dailyGoalProgress = React.useMemo(() => {
    if (dailyGoalAmount <= 0) return 0;
    return Math.max(0, Math.min(100, (todayNetProfit / dailyGoalAmount) * 100));
  }, [dailyGoalAmount, todayNetProfit]);

  const maintenanceRemainingKm = React.useMemo(() => {
    if (!profile?.maintenance) return null;
    const lastKm = Number(profile.maintenance.lastKm);
    const intervalKm = Number(profile.maintenance.interval);

    if (!Number.isFinite(lastKm) || !Number.isFinite(intervalKm)) {
      return null;
    }

    const nextServiceKm = lastKm + intervalKm;
    return Math.max(0, nextServiceKm - totalDistance);
  }, [profile, totalDistance]);

  const estimatedNetPerKm = React.useMemo(() => {
    const completedDistance = shifts.reduce((sum, shift) => sum + shift.distanceKm, 0);
    if (completedDistance <= 0) {
      return 0;
    }
    const completedNet = shifts.reduce((sum, shift) => sum + shift.netProfit, 0);
    return completedNet / completedDistance;
  }, [shifts]);

  const liveEstimatedProfit = React.useMemo(() => {
    if (estimatedNetPerKm <= 0 || trackedDistance <= 0) {
      return 0;
    }
    return trackedDistance * estimatedNetPerKm;
  }, [estimatedNetPerKm, trackedDistance]);

  // ── Live elapsed time for driving mode ──────────────────────────────────
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [hudMinimized, setHudMinimized] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!isDrivingMode) { setElapsedSecs(0); setHudMinimized(false); return; }
    const start = startTime ? new Date(startTime).getTime() : Date.now();
    const tick = setInterval(() => setElapsedSecs(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(tick);
  }, [isDrivingMode, startTime]);

  // Keep screen on while driving
  useEffect(() => {
    if (isDrivingMode && 'wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen')
        .then((lock: WakeLockSentinel) => { wakeLockRef.current = lock; })
        .catch(() => {});
    } else {
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    }
  }, [isDrivingMode]);

  const fmtTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const liveMileageDeduction = trackedDistance * 0.57;
  const speedKmh = currentSpeed ?? 0;
  const speedPct = Math.min(speedKmh / 120, 1); // 120 km/h max ring
  const speedColor = speedKmh < 30 ? '#39FF14' : speedKmh < 60 ? '#facc15' : '#f87171';

  // Auto-clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full"
      />
    </div>
  );

  if (!user) {
    return <VeroLanding login={login} guestLogin={guestLogin} />;
  }

  return (
    <div className={`min-h-screen bg-bg text-white pb-20 sm:pb-24 lg:pb-0 lg:pl-24 transition-all duration-500 ${isNightMode ? 'brightness-50 contrast-125 saturate-50' : ''}`}>
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={`fixed top-0 left-1/2 -translate-x-1/2 z-[100] px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-2xl flex items-center gap-2 sm:gap-3 border max-w-[90vw] ${
              notification.type === 'success' ? 'bg-brand text-bg border-brand/20' : 
              notification.type === 'error' ? 'bg-red-500 text-white border-red-500/20' : 
              'bg-blue-500 text-white border-blue-500/20'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
            <span className="font-display font-black text-[9px] sm:text-[10px] uppercase tracking-widest truncate">
              {notification.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="px-3 py-2.5 sm:p-6 flex justify-between items-center border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-50 gap-2 sm:gap-4">
        <Link href="/landing" className="flex items-center gap-2 sm:gap-4 group min-w-0 flex-1">
          <div className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 bg-black/40 rounded-xl flex items-center justify-center border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-sm group-hover:border-brand/40 transition-colors">
            <Image src="/logo.svg" alt="VeroFlow" width={32} height={32} className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-display font-black text-lg sm:text-2xl tracking-tighter leading-none uppercase group-hover:text-brand transition-colors">VeroFlow</span>
              {user?.isAnonymous ? (
                <span className="hidden xs:inline-block px-1.5 py-0.5 sm:px-2 bg-white/10 text-white/50 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-md border border-white/5 whitespace-nowrap">Guest</span>
              ) : (
                <span className="hidden xs:inline-block px-1.5 py-0.5 sm:px-2 bg-brand/10 text-brand text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-md border border-brand/20 whitespace-nowrap">Sync</span>
              )}
            </div>
            {/* Name row */}
            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
              <span className="text-[8px] sm:text-[10px] text-white/50 font-display font-black uppercase tracking-widest truncate">{profile?.displayName || (user?.isAnonymous ? 'Guest' : 'Courier')}</span>
              {/* Weather inline on sm+ */}
              {weather && (
                <div className="hidden xxs:flex items-center gap-1.5">
                  <div className="w-0.5 h-3 bg-white/10 shrink-0" />
                  <div className="flex items-center gap-1 shrink-0">
                    <Thermometer size={9} className="text-blue-400" />
                    <span className="text-[9px] text-blue-400 font-bold">{weather.temp}°C</span>
                  </div>
                  <span className="text-[8px] text-gray-500 font-bold uppercase truncate max-w-[120px]">{weather.condition}</span>
                </div>
              )}
            </div>
            {/* Weather below name on mobile */}
            {weather && (
              <div className="flex xxs:hidden items-center gap-1 mt-0.5">
                <Thermometer size={8} className="text-blue-400" />
                <span className="text-[7px] text-blue-400 font-bold">{weather.temp}°C</span>
                <span className="text-[7px] text-gray-500 font-bold uppercase truncate">{weather.condition}</span>
              </div>
            )}
          </div>
        </Link>
        {/* Icons: 2x2 grid on < 380px, single row on 380px+ */}
        <div className="grid grid-cols-2 xxs:flex gap-1 sm:gap-2 shrink-0">
          <button 
            onClick={() => setIsNightMode(!isNightMode)} 
            className={`p-1.5 xxs:p-2 sm:p-3 rounded-lg xxs:rounded-xl transition-all ${isNightMode ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-white/10 text-gray-300 hover:text-white border border-white/10'}`}
          >
            {isNightMode ? <Moon size={14} className="sm:w-[15px] sm:h-[15px]" /> : <Sun size={14} className="sm:w-[15px] sm:h-[15px]" />}
          </button>
          <button 
            onClick={() => setIsDrivingMode(!isDrivingMode)} 
            className={`p-1.5 xxs:p-2 sm:p-3 rounded-lg xxs:rounded-xl transition-all ${isDrivingMode ? 'bg-brand text-bg shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'bg-white/10 text-gray-300 hover:text-white border border-white/10'}`}
          >
            <Car size={14} className="sm:w-[15px] sm:h-[15px]" />
          </button>
          <button 
            onClick={toggleVoiceCommand} 
            className={`p-1.5 xxs:p-2 sm:p-3 rounded-lg xxs:rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-white/10 text-gray-300 hover:text-white border border-white/10'}`}
          >
            {isListening ? <MicOff size={14} className="sm:w-[15px] sm:h-[15px]" /> : <Mic size={14} className="sm:w-[15px] sm:h-[15px]" />}
          </button>
          <button 
            onClick={() => setShowSettings(true)} 
            className="p-1.5 xxs:p-2 sm:p-3 bg-white/10 rounded-lg xxs:rounded-xl text-gray-300 hover:text-white border border-white/10"
          >
            <Settings size={14} className="sm:w-[15px] sm:h-[15px]" />
          </button>
        </div>
      </header>

      {/* Top Quick Stats Bar */}
      {activeTab === 'dashboard' && (
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-white/[0.02] border-b border-border">
          <div className="grid grid-cols-4 gap-2 sm:flex sm:items-center sm:gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest text-center sm:text-left">Gross</span>
              <span className="text-base sm:text-xl font-display font-black text-white">€{annualGross.toFixed(0)}</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest text-center sm:text-left">Tips</span>
              <span className="text-base sm:text-xl font-display font-black text-brand">€{shifts.reduce((acc, s) => acc + s.tips, 0).toFixed(0)}</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest text-center sm:text-left">Expenses</span>
              <span className="text-base sm:text-xl font-display font-black text-red-400">€{receipts.reduce((acc, r) => acc + r.amount, 0).toFixed(0)}</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[8px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest text-center sm:text-left">Distance</span>
              <span className="text-base sm:text-xl font-display font-black text-blue-400">{totalDistance.toFixed(0)} <span className="text-[10px] sm:text-xs">KM</span></span>
            </div>
          </div>
        </div>
      )}

      <main className="p-3 sm:p-6 space-y-5 sm:space-y-8 max-w-5xl mx-auto">
        <SmartAlerts />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
          <div className="lg:col-span-8 space-y-5 sm:space-y-8">
            {activeTab === 'dashboard' && (
              <>
                <TaxIntelligence />
                <AIErrorBoundary panelName="Shift Tracker">
                  <ShiftTracker />
                </AIErrorBoundary>
                <ShiftHistory />
                <GamificationPanel />
              </>
            )}

            {activeTab === 'feed' && (
              <CourierFeed />
            )}

            {activeTab === 'receipts' && (
              <AIErrorBoundary panelName="Receipt Vault" fallbackLabel="Manual Entry">
                <ReceiptVault />
              </AIErrorBoundary>
            )}

            {activeTab === 'reports' && (
              <>
                <AnalyticsHub />
                <VeroExport />
              </>
            )}

            {activeTab === 'vehicle' && (
              <VehicleCenter />
            )}
          </div>

          {/* Desktop Sidebar - Quick Stats */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6">
            <div className="sticky top-24">
              <div className="bg-card p-6 rounded-3xl border border-border space-y-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-border pb-4">Quick Insights</h3>
                <div className="flex items-center justify-end">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${isOnline ? 'text-brand border-brand/30 bg-brand/10' : 'text-orange-300 border-orange-500/30 bg-orange-500/10'}`}>
                    {isOnline ? 'Live Sync' : 'Offline Cache'}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Daily Goal</p>
                    <div className="flex justify-between items-end">
                      <p className="text-2xl font-display font-black text-white">{dailyGoalProgress.toFixed(0)}%</p>
                      <p className="text-xs text-brand font-bold">
                        €{todayNetProfit.toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {' / '}
                        €{dailyGoalAmount.toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-brand" style={{ width: `${dailyGoalProgress}%` }} />
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Next Maintenance</p>
                    <p className="text-lg font-bold text-white">
                      {maintenanceRemainingKm === null
                        ? 'NOT SET'
                        : `${maintenanceRemainingKm.toLocaleString('fi-FI', { maximumFractionDigits: 0 })} KM`}
                      <span className="text-xs text-gray-500"> {maintenanceRemainingKm === null ? '' : 'REMAINING'}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setIsDrivingMode(true)}
                    className="w-full bg-brand text-bg py-4 rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                  >
                    <Car size={16} />
                    LAUNCH DRIVING MODE
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-bg/90 backdrop-blur-xl border-t border-border px-1 py-2 sm:p-4 flex justify-around items-center z-[60] lg:left-0 lg:right-auto lg:top-0 lg:bottom-0 lg:w-24 lg:flex-col lg:border-t-0 lg:border-r lg:justify-center lg:gap-8 safe-area-bottom">
        {[
          { id: 'dashboard', icon: Home, label: 'Home' },
          { id: 'feed', icon: Globe, label: 'Feed' },
          { id: 'receipts', icon: FileText, label: 'Vault' },
          { id: 'reports', icon: BarChart3, label: 'Stats' },
          { id: 'vehicle', icon: Wrench, label: 'Auto' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-label={`Go to ${tab.label}`}
            className={`flex flex-col items-center gap-0.5 sm:gap-1 p-1.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all min-w-0 sm:min-w-[64px] min-h-0 sm:min-h-[64px] justify-center ${activeTab === tab.id ? 'text-brand' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <tab.icon size={20} className={`sm:w-6 sm:h-6 ${activeTab === tab.id ? 'drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]' : ''}`} />
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Driving Mode — Full HUD Overlay */}
      <AnimatePresence>
        {isDrivingMode && !hudMinimized && (
          <motion.div 
            key="driving-hud-full"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#0a0a0a] z-[200] flex flex-col overflow-hidden select-none"
          >
            {/* Top bar */}
            <div className="flex justify-between items-center px-5 pt-6 pb-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                  className="w-2.5 h-2.5 rounded-full bg-brand shadow-[0_0_10px_rgba(57,255,20,0.8)]"
                />
                <p className="text-[10px] text-brand font-black uppercase tracking-[0.25em]">Driving Mode — Active</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setHudMinimized(true)}
                  className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-gray-400 active:scale-95 transition-all"
                  aria-label="Minimize driving mode"
                >
                  <ChevronDown size={18} />
                </button>
                <button 
                  onClick={() => setIsDrivingMode(false)}
                  aria-label="Close driving mode"
                  className="p-2.5 bg-white/10 rounded-xl border border-white/20 text-white active:scale-95 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Speed Ring — centre focus */}
            <div className="flex flex-col items-center justify-center flex-1 gap-6 px-4">
              <div className="relative flex items-center justify-center">
                <svg width="220" height="220" className="-rotate-90">
                  {/* Track */}
                  <circle cx="110" cy="110" r="90" fill="none" stroke="#1c1c1c" strokeWidth="12" />
                  {/* Speed arc */}
                  <motion.circle
                    cx="110" cy="110" r="90"
                    fill="none"
                    stroke={speedColor}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 90}`}
                    animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - speedPct) }}
                    transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                    style={{ filter: `drop-shadow(0 0 8px ${speedColor})` }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <motion.p
                    key={Math.round(speedKmh)}
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    className="text-[64px] leading-none font-black tracking-tighter"
                    style={{ color: speedColor }}
                  >
                    {Math.round(speedKmh)}
                  </motion.p>
                  <p className="text-xs text-gray-500 font-black uppercase tracking-[0.2em]">km/h</p>
                </div>
              </div>

              {/* 3-metric strip */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                {/* Elapsed time */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <Timer size={14} className="mx-auto text-gray-500 mb-1" />
                  <p className="text-lg font-black text-white tracking-tight tabular-nums">{fmtTime(elapsedSecs)}</p>
                  <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-0.5">Duration</p>
                </div>
                {/* Distance + deduction */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <Route size={14} className="mx-auto text-gray-500 mb-1" />
                  <p className="text-lg font-black text-white tracking-tight">{trackedDistance.toFixed(1)}</p>
                  <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-0.5">km</p>
                </div>
                {/* Live earnings */}
                <div className="bg-brand/10 border border-brand/20 rounded-2xl p-4 text-center">
                  <Euro size={14} className="mx-auto text-brand mb-1" />
                  <p className="text-lg font-black text-brand tracking-tight">€{liveEstimatedProfit.toFixed(2)}</p>
                  <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-0.5">Est. Net</p>
                </div>
              </div>

              {/* Mileage deduction banner */}
              <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Mileage Deduction §57</p>
                  <p className="text-xl font-black text-white">€{liveMileageDeduction.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Rate</p>
                  <p className="text-sm font-black text-gray-300">€0.57/km</p>
                </div>
              </div>
            </div>

            <div className="text-center text-gray-700 text-[9px] font-black uppercase tracking-[0.25em] pb-8">
              VeroFlow AI • Hands-Free Enabled • Auto-activated at 15 km/h
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Driving Mode — Minimized floating HUD pill */}
      <AnimatePresence>
        {isDrivingMode && hudMinimized && (
          <motion.button
            key="driving-hud-pill"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={() => setHudMinimized(false)}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 bg-[#111] border border-brand/40 rounded-full shadow-[0_0_20px_rgba(57,255,20,0.2)] active:scale-95 transition-all"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="w-2 h-2 rounded-full bg-brand"
            />
            <Gauge size={14} style={{ color: speedColor }} />
            <span className="text-xs font-black tabular-nums" style={{ color: speedColor }}>{Math.round(speedKmh)} km/h</span>
            <span className="text-gray-600 text-xs">|</span>
            <span className="text-xs font-black text-white tabular-nums">{fmtTime(elapsedSecs)}</span>
            <span className="text-gray-600 text-xs">|</span>
            <span className="text-xs font-black text-brand">€{liveEstimatedProfit.toFixed(2)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <OnboardingModal />
    </div>
  );
}
