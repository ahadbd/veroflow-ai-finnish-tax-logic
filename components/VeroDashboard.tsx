'use client';

import React, { useState, useEffect } from 'react';
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
  MicOff
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useVero } from './VeroProvider';
import VeroLanding from './VeroLanding';
import Link from 'next/link';

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
    isAdmin
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
            <img src="/logo.svg" alt="VeroFlow" className="w-6 h-6 sm:w-8 sm:h-8" />
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
                <ShiftTracker />
                <ShiftHistory />
              </>
            )}

            {activeTab === 'feed' && (
              <CourierFeed />
            )}

            {activeTab === 'receipts' && (
              <ReceiptVault />
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

      {/* Driving Mode Overlay */}
      <AnimatePresence>
        {isDrivingMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg z-[200] p-4 sm:p-8 flex flex-col overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6 sm:mb-12">
              <div className="space-y-1">
                <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-black">Driving Mode</p>
                <h2 className="text-3xl sm:text-4xl font-display font-black text-brand tracking-tighter">ACTIVE</h2>
              </div>
              <button 
                onClick={() => setIsDrivingMode(false)}
                aria-label="Close driving mode"
                className="p-4 sm:p-6 bg-white/10 rounded-2xl sm:rounded-3xl text-white border border-white/20 active:scale-95 transition-all"
              >
                <X size={24} className="sm:w-8 sm:h-8" />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center space-y-6 sm:space-y-12 pb-6 sm:pb-12">
              <div className="text-center space-y-1 sm:space-y-2">
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-[0.2em] sm:tracking-[0.3em]">Tracked Distance</p>
                <h3 className="text-4xl sm:text-7xl font-display font-black text-white tracking-tighter">
                  {trackedDistance.toFixed(1)} <span className="text-lg sm:text-2xl text-gray-600">KM</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-8 w-full">
                <div className="bg-white/5 p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 text-center overflow-hidden">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-black tracking-widest mb-1 sm:mb-2">Est. Profit</p>
                  <p className="text-xl sm:text-3xl font-display font-black text-brand truncate">€{liveEstimatedProfit.toFixed(2)}</p>
                  <p className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Net/km history</p>
                </div>
                <div className="bg-white/5 p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 text-center overflow-hidden">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-black tracking-widest mb-1 sm:mb-2">Weather</p>
                  <div className="flex flex-col items-center">
                    <p className="text-xl sm:text-3xl font-display font-black text-blue-400">{weather?.temp || '--'}°C</p>
                    <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded-full border mt-1 ${isOnline ? 'text-brand border-brand/30 bg-brand/10' : 'text-orange-300 border-orange-500/30 bg-orange-500/10'}`}>
                      {isOnline ? 'Live' : 'Cached'}
                    </span>
                    <p className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 text-center line-clamp-1 sm:line-clamp-2 max-w-[100px] sm:max-w-[140px]">
                      {weather?.locationName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <ShiftTracker compact />
              </div>
            </div>

            <div className="mt-auto text-center text-gray-600 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] pt-4 sm:pt-8">
              VeroFlow AI • Hands-Free Enabled
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
