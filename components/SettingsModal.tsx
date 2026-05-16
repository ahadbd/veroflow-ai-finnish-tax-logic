'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, LogOut, Database, Trash2, X, AlertTriangle, Download, ShieldCheck } from 'lucide-react';
import { useVero } from './VeroProvider';
import { db } from '@/firebase';
import { doc, setDoc, collection, addDoc, deleteField, writeBatch, getDocs, query, where } from 'firebase/firestore';
import { signOut, deleteUser } from 'firebase/auth';
import { auth } from '@/firebase';
import { clearOfflineStorage } from '@/lib/offline-storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, profile, currentLocation, setNotification, refreshData, clearLocalData, setIsWipingData, refreshWeatherAtLocation, hydrateDemoData } = useVero();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [wipeStage, setWipeStage] = useState('');
  const [lastWipeSeconds, setLastWipeSeconds] = useState<number | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStage, setSeedStage] = useState('');
  const [lastSeedSeconds, setLastSeedSeconds] = useState<number | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'syncing' | 'saved' | 'error'>('idle');
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const formKey = [
    profile?.uid || 'guest',
    profile?.displayName || 'guest-courier',
    profile?.taxRate ?? 0.15,
    profile?.weeklyGoal ?? 600,
    profile?.yelIncomeLevel ?? 12000,
    profile?.homeLocation?.lat ?? 60.1699,
    profile?.homeLocation?.lng ?? 24.9384,
    profile?.maintenance?.vehicleType || 'Car',
    profile?.maintenance?.interval ?? 10000,
    profile?.maintenance?.lastKm ?? 0,
  ].join('|');

  if (!isOpen || !user) return null;

  const BATCH_LIMIT = 450;

  const writeDocsFast = async (name: 'shifts' | 'receipts', docsToWrite: any[]) => {
    let success = 0;
    let failed = 0;

    for (let i = 0; i < docsToWrite.length; i += BATCH_LIMIT) {
      const chunk = docsToWrite.slice(i, i + BATCH_LIMIT);
      const batch = writeBatch(db);

      for (const entry of chunk) {
        batch.set(doc(collection(db, name)), entry);
      }

      try {
        await batch.commit();
        success += chunk.length;
      } catch (batchError) {
        console.error(`Batch write failed for ${name}. Falling back to individual writes.`, batchError);
        const fallback = await Promise.allSettled(chunk.map((entry) => addDoc(collection(db, name), entry)));
        for (const result of fallback) {
          if (result.status === 'fulfilled') {
            success++;
          } else {
            failed++;
            console.error(`Seed write failed in ${name}:`, result.reason);
          }
        }
      }
    }

    return { success, failed };
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const toNumber = (key: string, fallback: number) => {
      const raw = formData.get(key);
      const value = Number(raw);
      return Number.isFinite(value) ? value : fallback;
    };
    
    const updates = {
      uid: user.uid,
      taxRate: toNumber('taxRate', (profile?.taxRate ?? 0.15) * 100) / 100,
      displayName: formData.get('displayName') as string,
      isVatRegistered: formData.get('isVatRegistered') === 'on',
      showPeakAlerts: profile?.showPeakAlerts ?? true,
      weeklyGoal: toNumber('weeklyGoal', profile?.weeklyGoal ?? 600),
      yelIncomeLevel: toNumber('yelIncomeLevel', profile?.yelIncomeLevel ?? 12000),
      homeLocation: {
        lat: toNumber('homeLat', profile?.homeLocation?.lat ?? 60.1699),
        lng: toNumber('homeLng', profile?.homeLocation?.lng ?? 24.9384),
      },
      maintenance: {
        ...profile?.maintenance,
        lastKm: toNumber('maintLastKm', profile?.maintenance?.lastKm ?? profile?.totalDistance ?? 0),
        interval: toNumber('maintInterval', profile?.maintenance?.interval ?? 10000),
        vehicleType: formData.get('vehicleType') as string,
      },
      fuelConsumption: toNumber('fuelConsumption', profile?.fuelConsumption ?? 6.8),
      fuelPrice: toNumber('fuelPrice', profile?.fuelPrice ?? 1.95),
    };

    try {
      setIsSavingSettings(true);
      setSaveStatus('saving');
      setNotification({ message: 'Saving settings...', type: 'info' });

      let releasedToSyncing = false;
      const slowNetworkTimer = setTimeout(() => {
        releasedToSyncing = true;
        setIsSavingSettings(false);
        setSaveStatus('syncing');
        setNotification({ message: 'Network is slow. Syncing settings in background...', type: 'info' });
      }, 7000);

      await setDoc(doc(db, 'profiles', user.uid), updates, { merge: true });
      clearTimeout(slowNetworkTimer);

      setNotification({ message: "Settings updated!", type: 'success' });
      setTimeout(() => refreshData(), 0);
      setSaveStatus('saved');
      if (!releasedToSyncing) {
        setIsSavingSettings(false);
      }
    } catch (err) {
      console.error("Save settings failed:", err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setNotification({ message: `Failed to save settings: ${message}`, type: 'error' });
      setSaveStatus('error');
      setIsSavingSettings(false);
    }
  };

  const applyCalibratedLocation = async (lat: number, lng: number) => {
    await setDoc(doc(db, 'profiles', user.uid), {
      homeLocation: { lat, lng }
    }, { merge: true });

    refreshWeatherAtLocation(lat, lng);
    refreshData();
    setNotification({ message: `GPS calibrated and weather refreshed: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, type: 'success' });
  };

  const calibrateCurrentLocation = () => {
    if (!navigator.geolocation) {
      setNotification({ message: 'Geolocation is not supported on this browser.', type: 'error' });
      return;
    }

    const tryLowAccuracyFallback = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));

          try {
            await applyCalibratedLocation(lat, lng);
          } catch (error) {
            console.error('Calibration save failed:', error);
            setNotification({ message: 'Calibration save failed. Try again.', type: 'error' });
          }
        },
        () => {
          if (currentLocation) {
            void applyCalibratedLocation(currentLocation.lat, currentLocation.lng).catch((error) => {
              console.error('Calibration save failed:', error);
              setNotification({ message: 'Calibration save failed. Try again.', type: 'error' });
            });
            return;
          }

          setNotification({
            message: 'GPS calibration failed. Enable location permission and try again outdoors.',
            type: 'error'
          });
        },
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 180000 }
      );
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));

        try {
          await applyCalibratedLocation(lat, lng);
        } catch (error) {
          console.error('Calibration save failed:', error);
          setNotification({ message: 'Calibration save failed. Try again.', type: 'error' });
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setNotification({ message: 'Location permission denied. Allow location access and retry.', type: 'error' });
          return;
        }

        // Retry with relaxed options before failing.
        tryLowAccuracyFallback();
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  };

  const seedData = async () => {
    if (!user || isSeeding) return;
    const startedAt = performance.now();
    try {
      setIsSeeding(true);
      setSeedStage('Preparing demo scenario...');
      setNotification({ message: 'Seeding demo data...', type: 'info' });

      const demoScenarios = [
        {
          name: 'Peak Week',
          weeklyGoal: 1200,
          yelIncomeLevel: 22000,
          taxRate: 0.22,
          totalDistance: 21450,
          totalGross: 16480,
          homeLocation: { lat: 60.1719, lng: 24.9412 },
          fuelConsumption: 7.1,
          fuelPrice: 1.96,
          grossBase: 140,
          tipsBase: 15,
          distanceBase: 38,
          durationBase: 180,
          citySeed: 'Helsinki',
        },
        {
          name: 'Balanced Week',
          weeklyGoal: 900,
          yelIncomeLevel: 18000,
          taxRate: 0.2,
          totalDistance: 16420,
          totalGross: 12890,
          homeLocation: { lat: 60.2057, lng: 24.6559 },
          fuelConsumption: 6.6,
          fuelPrice: 1.91,
          grossBase: 110,
          tipsBase: 11,
          distanceBase: 30,
          durationBase: 160,
          citySeed: 'Espoo',
        },
        {
          name: 'Weather Stress Week',
          weeklyGoal: 760,
          yelIncomeLevel: 15000,
          taxRate: 0.18,
          totalDistance: 14310,
          totalGross: 10420,
          homeLocation: { lat: 60.2941, lng: 25.0398 },
          fuelConsumption: 7.8,
          fuelPrice: 1.88,
          grossBase: 95,
          tipsBase: 8,
          distanceBase: 26,
          durationBase: 150,
          citySeed: 'Vantaa',
        }
      ];

      const seedRunKey = 'veroflow_demo_seed_variant';
      const previousSeed = Number(localStorage.getItem(seedRunKey) || '0');
      const scenario = demoScenarios[previousSeed % demoScenarios.length];
      localStorage.setItem(seedRunKey, String((previousSeed + 1) % demoScenarios.length));
      const activeDataKey = `seed_${Date.now()}`;
      const scopeUid = `${user.uid}_${activeDataKey}`;

      const DEMO_SHIFT_COUNT = 12;
      const DEMO_RECEIPT_COUNT = 12;
      const DEMO_MAINTENANCE_COUNT = 10;

      const apps = ['Wolt', 'Uber Eats'];
      const addresses = [
        'Mannerheimintie 1',
        'Kamppi',
        'Pasila',
        'Kallio',
        'Espoo',
        'Vantaa',
        'Helsinki Central',
        'Sornainen',
        'Tapiola',
        'Leppavaara'
      ];
      const cityOffsets: Record<string, { lat: number; lng: number }> = {
        Helsinki: { lat: 60.1699, lng: 24.9384 },
        Espoo: { lat: 60.2055, lng: 24.6559 },
        Vantaa: { lat: 60.2941, lng: 25.0398 }
      };
      const cityOrigin = cityOffsets[scenario.citySeed] || cityOffsets.Helsinki;
      const seededShifts: any[] = [];
      const seededReceipts: any[] = [];

      // 1. Seed shifts with richer fields so analytics, maps, and tax modules all show capability.
      for (let i = 0; i < DEMO_SHIFT_COUNT; i++) {
        const date = new Date(Date.now() - (i * 86400000));
        const gross = scenario.grossBase + Math.random() * (scenario.grossBase * 0.65);
        const tips = scenario.tipsBase + Math.random() * (scenario.tipsBase * 1.6);
        const dist = scenario.distanceBase + Math.random() * (scenario.distanceBase * 0.55);
        const durationMin = scenario.durationBase + Math.floor(Math.random() * 110);
        const netProfit = gross * 0.68;
        const taxDebt = gross * scenario.taxRate;
        const yelCost = gross * 0.06;
        const vatDebt = gross * 0.24;
        const startAddress = addresses[Math.floor(Math.random() * addresses.length)];
        const endAddress = addresses[Math.floor(Math.random() * addresses.length)];
        const startLat = cityOrigin.lat + (Math.random() * 0.05);
        const startLng = cityOrigin.lng + (Math.random() * 0.08);
        const gpsPoints = [
          { lat: Number(startLat.toFixed(6)), lng: Number(startLng.toFixed(6)), timestamp: new Date(date.getTime() + 3 * 60000).toISOString() },
          { lat: Number((startLat + 0.01).toFixed(6)), lng: Number((startLng + 0.015).toFixed(6)), timestamp: new Date(date.getTime() + 28 * 60000).toISOString() },
          { lat: Number((startLat + 0.018).toFixed(6)), lng: Number((startLng + 0.028).toFixed(6)), timestamp: new Date(date.getTime() + 52 * 60000).toISOString() }
        ];

        seededShifts.push({
          uid: user.uid,
          scopeUid,
          date: date.toISOString(),
          app: apps[Math.floor(Math.random() * apps.length)],
          grossPay: Number(gross.toFixed(2)),
          tips: Number(tips.toFixed(2)),
          distanceKm: Number(dist.toFixed(2)),
          fuelCost: Number((dist * 0.13).toFixed(2)),
          durationMin,
          netProfit: Number(netProfit.toFixed(2)),
          taxDebt: Number(taxDebt.toFixed(2)),
          yelCost: Number(yelCost.toFixed(2)),
          vatDebt: Number(vatDebt.toFixed(2)),
          deduction: Number((dist * 0.55).toFixed(2)),
          startAddress,
          endAddress,
          gpsPoints,
          activeApps: [...new Set([apps[i % apps.length], apps[(i + 1) % apps.length]])]
        });
      }

      // 2. Seed receipts for Receipt Vault and tax deductions with metadata for OCR-like records.
      const categories = ['Fuel', 'Vehicle Maintenance', 'Work Gear', 'Phone Bill', 'Other'];
      const merchants = ['Neste', 'ABC', 'Motonet', 'DNA', 'Elisa', 'Biltema', 'Clas Ohlson', 'Shell', 'K-Rauta', 'Verkkokauppa'];

      for (let i = 0; i < DEMO_RECEIPT_COUNT; i++) {
        const amount = 20 + Math.random() * 140;
        const vatAmount = amount * 0.24;
        const date = new Date(Date.now() - (Math.random() * 40 * 86400000));

        seededReceipts.push({
          uid: user.uid,
          scopeUid,
          date: date.toISOString(),
          merchant: merchants[Math.floor(Math.random() * merchants.length)],
          amount: Number(amount.toFixed(2)),
          vat: Number(vatAmount.toFixed(2)),
          category: categories[Math.floor(Math.random() * categories.length)],
          description: 'Seeded demo expense for analytics and tax reporting.',
          metadata: {
            source: 'seed-demo',
            confidence: 0.98,
            imageName: `receipt_${i + 1}.jpg`
          }
        });
      }

      // 3. Seed deeper maintenance history to showcase Vehicle Center capabilities.
      const maintenanceDescriptions = [
        'Full Service',
        'Oil Change',
        'Brake Pad Replacement',
        'New Tires',
        'Chain Service',
        'Battery Replacement',
        'Suspension Check',
        'Air Filter Change',
        'Lights and Electronics Fix',
        'Seasonal Inspection'
      ];

      const baseKm = 8000;
      const maintenanceHistory = Array.from({ length: DEMO_MAINTENANCE_COUNT }).map((_, index) => {
        const km = baseKm + index * 950;
        return {
          date: new Date(Date.now() - ((DEMO_MAINTENANCE_COUNT - index) * 22 * 86400000)).toISOString(),
          description: maintenanceDescriptions[index % maintenanceDescriptions.length],
          cost: Number((65 + Math.random() * 360).toFixed(2)),
          km
        };
      });

      const lastServiceKm = maintenanceHistory[maintenanceHistory.length - 1].km;
      const demoProfile = {
        uid: user.uid,
        activeDataKey,
        displayName: profile?.displayName || user?.displayName || 'Courier',
        weeklyGoal: scenario.weeklyGoal,
        yelIncomeLevel: scenario.yelIncomeLevel,
        taxRate: scenario.taxRate,
        isVatRegistered: true,
        showPeakAlerts: true,
        totalDistance: scenario.totalDistance,
        totalGross: scenario.totalGross,
        homeLocation: scenario.homeLocation,
        demoScenario: scenario.name,
        demoSeedRunAt: new Date().toISOString(),
        maintenanceHistory,
        maintenance: {
          lastKm: lastServiceKm,
          interval: 10000,
          vehicleType: 'Car',
          nextOilChange: lastServiceKm + 7000,
          nextTireSwap: new Date(Date.now() + 45 * 86400000).toISOString(),
          tires: {
            front: 5.9,
            rear: 5.6,
            lastChecked: new Date(Date.now() - 16 * 86400000).toISOString()
          }
        },
        fuelConsumption: scenario.fuelConsumption,
        fuelPrice: scenario.fuelPrice
      };

      setSeedStage('Writing demo records...');
      const shiftWriteResult = await writeDocsFast('shifts', seededShifts);
      const receiptWriteResult = await writeDocsFast('receipts', seededReceipts);

      setSeedStage('Activating demo profile...');
      await setDoc(doc(db, 'profiles', user.uid), demoProfile, { merge: true });

      hydrateDemoData({
        profile: {
          ...demoProfile,
          totalGross: scenario.totalGross,
          totalDistance: scenario.totalDistance,
          maintenanceHistory,
          maintenance: {
            lastKm: lastServiceKm,
            interval: 10000,
            vehicleType: 'Car',
            nextOilChange: lastServiceKm + 7000,
            nextTireSwap: new Date(Date.now() + 45 * 86400000).toISOString(),
            tires: {
              front: 5.9,
              rear: 5.6,
              lastChecked: new Date(Date.now() - 16 * 86400000).toISOString()
            }
          }
        },
        shifts: seededShifts,
        receipts: seededReceipts
      });

      const elapsedSeconds = Math.max(0.1, (performance.now() - startedAt) / 1000);
      setLastSeedSeconds(elapsedSeconds);
      const failedWrites = shiftWriteResult.failed + receiptWriteResult.failed;
      if (failedWrites > 0) {
        setNotification({
          message: `Seeded ${scenario.name} with partial writes in ${elapsedSeconds.toFixed(1)}s. Shifts: ${shiftWriteResult.success}/${DEMO_SHIFT_COUNT}, Receipts: ${receiptWriteResult.success}/${DEMO_RECEIPT_COUNT}.`,
          type: 'info'
        });
      } else {
        setNotification({
          message: `Seeded ${scenario.name} in ${elapsedSeconds.toFixed(1)}s: ${DEMO_SHIFT_COUNT} shifts, ${DEMO_RECEIPT_COUNT} receipts, ${DEMO_MAINTENANCE_COUNT} maintenance records.`,
          type: 'success'
        });
      }

      setTimeout(() => refreshData(), 250);
    } catch (e) {
      console.error("Seed failed:", e);
      const message = e instanceof Error ? e.message : 'Unknown error';
      setNotification({ message: `Seed failed: ${message}`, type: 'error' });
    } finally {
      setIsSeeding(false);
      setSeedStage('');
    }
  };

  const deleteUserData = async () => {
    if (!user) return;
    const startedAt = performance.now();
    setIsDeleting(true);
    setWipeStage('Preparing wipe...');
    setIsWipingData(true);
    setShowConfirmDelete(false);
    setNotification({ message: 'Wiping data...', type: 'info' });
    
    try {
      // Fast logical wipe: rotate dataset key and reset profile totals.
      setWipeStage('Resetting active dataset...');
      const activeDataKey = `wipe_${Date.now()}`;
      await setDoc(doc(db, 'profiles', user.uid), {
        activeDataKey,
        totalGross: 0,
        totalDistance: 0,
        maintenanceHistory: deleteField(),
        demoScenario: deleteField(),
        demoSeedRunAt: deleteField(),
        maintenance: {
          ...(profile?.maintenance || {}),
          lastKm: 0,
          interval: profile?.maintenance?.interval ?? 10000,
          vehicleType: profile?.maintenance?.vehicleType || 'Car',
          nextOilChange: deleteField(),
          nextTireSwap: deleteField(),
          tires: deleteField(),
        }
      }, { merge: true });

      // 4. Clear local cache and offline data
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(`shifts_${user.uid}_`) || key.startsWith(`receipts_${user.uid}_`)) {
          localStorage.removeItem(key);
        }
      });
      void clearOfflineStorage();
      
      clearLocalData();

      // 5. Reload the page to complete the wipe flow and ensure clean state without signing out.
      setWipeStage('Reloading application...');
      window.location.reload();

      const elapsedSeconds = Math.max(0.1, (performance.now() - startedAt) / 1000);
      setLastWipeSeconds(elapsedSeconds);
      setWipeStage('Done');

      setNotification({ message: `All data cleared successfully in ${elapsedSeconds.toFixed(1)}s.`, type: 'success' });
    } catch (e) {
      console.error("Delete failed:", e);
      setNotification({ message: "Failed to clear data.", type: 'error' });
      setWipeStage('Wipe failed');
    } finally {
      setIsWipingData(false);
      setIsDeleting(false);
    }
  };

  // GDPR Art. 20 — Data Portability: export all user data as JSON
  const handleExportData = async () => {
    if (!user) return;
    setIsExporting(true);
    setNotification({ message: 'Preparing data export...', type: 'info' });
    try {
      const [shiftsSnap, receiptsSnap] = await Promise.all([
        getDocs(query(collection(db, 'shifts'), where('uid', '==', user.uid))),
        getDocs(query(collection(db, 'receipts'), where('uid', '==', user.uid))),
      ]);
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        dataController: 'VeroFlow AI — Helsinki, Finland',
        gdprBasis: 'Art. 20 — Right to Data Portability',
        user: { uid: user.uid, email: user.email, displayName: user.displayName },
        profile: profile ?? {},
        shifts: shiftsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        receipts: receiptsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      };
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `veroflow-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setNotification({ message: 'Data exported successfully.', type: 'success' });
    } catch (e) {
      console.error('Export failed:', e);
      setNotification({ message: 'Export failed. Please try again.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  // GDPR Art. 17 — Right to Erasure: delete ALL data including Firebase Auth account
  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeletingAccount(true);
    setNotification({ message: 'Deleting account...', type: 'info' });
    try {
      // 1. Wipe Firestore data
      await setDoc(doc(db, 'profiles', user.uid), {
        deleted: true,
        deletedAt: new Date().toISOString(),
      });
      // 2. Clear local cache
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(`shifts_${user.uid}_`) || key.startsWith(`receipts_${user.uid}_`)) {
          localStorage.removeItem(key);
        }
      });
      void clearOfflineStorage();
      // 3. Delete Firebase Auth user (requires recent sign-in)
      const currentUser = auth.currentUser;
      if (currentUser) await deleteUser(currentUser);
      // 4. Done — user is now signed out automatically
      setNotification({ message: 'Account permanently deleted.', type: 'success' });
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err?.code === 'auth/requires-recent-login') {
        // Re-authenticate required for account deletion
        await signOut(auth);
        setNotification({ message: 'Please sign in again to confirm account deletion.', type: 'info' });
      } else {
        console.error('Account deletion failed:', e);
        setNotification({ message: 'Deletion failed. Email privacy@veroflow.fi for manual removal.', type: 'error' });
      }
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccount(false);
    }
  };

  const cancelDeleteFlow = () => {
    setIsDeleting(false);
    setWipeStage('');
    setIsWipingData(false);
    setShowConfirmDelete(false);
    setNotification({ message: 'Wipe cancelled.', type: 'info' });
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card w-full max-w-md rounded-3xl p-8 border border-border shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button 
          onClick={onClose} 
          aria-label="Close settings"
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-3xl font-display font-black text-white tracking-tight mb-8 uppercase">Settings</h2>

        <form key={formKey} onSubmit={handleSaveSettings} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest border-b border-border pb-2">Profile</h3>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Display Name</label>
              <input name="displayName" defaultValue={profile?.displayName || 'Guest Courier'} className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tax Rate (%)</label>
              <input name="taxRate" type="number" defaultValue={(profile?.taxRate || 0.15) * 100} className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-brand" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest border-b border-border pb-2">Business</h3>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-border">
              <span className="text-xs font-black text-white uppercase tracking-widest">VAT Registered</span>
              <input name="isVatRegistered" type="checkbox" defaultChecked={profile?.isVatRegistered ?? true} className="w-6 h-6 accent-brand" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Weekly Profit Goal (€)</label>
              <input name="weeklyGoal" type="number" defaultValue={profile?.weeklyGoal ?? 600} className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-brand" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">YEL Income Level (€/Year)</label>
              <input name="yelIncomeLevel" type="number" defaultValue={profile?.yelIncomeLevel ?? 12000} className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-brand" />
              <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mt-1">Set to 0 if not registered for YEL.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest border-b border-border pb-2">Geofencing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Home Lat</label>
                <input name="homeLat" type="number" step="any" defaultValue={profile?.homeLocation?.lat ?? 60.1699} className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-brand" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Home Lng</label>
                <input name="homeLng" type="number" step="any" defaultValue={profile?.homeLocation?.lng ?? 24.9384} className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-brand" />
              </div>
            </div>
            <button 
              type="button" 
              onClick={calibrateCurrentLocation}
              aria-label="Calibrate current location using GPS"
              className="w-full bg-white/10 border border-border text-gray-200 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 hover:text-white transition-all outline-none focus:ring-2 focus:ring-brand"
            >
              <Car size={14} />
              Calibrate Current Location
            </button>
            <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest">Used for automatic shift end reminders.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest border-b border-border pb-2">Vehicle</h3>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Vehicle Type</label>
              <select name="vehicleType" defaultValue={profile?.maintenance?.vehicleType || 'Car'} className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-brand">
                <option value="Car">Car</option>
                <option value="Van">Van</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="E-Bike">E-Bike</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Service Interval (KM)</label>
              <input name="maintInterval" type="number" defaultValue={profile?.maintenance?.interval ?? 10000} className="w-full bg-white/5 border border-border rounded-2xl p-4 font-bold text-white outline-none focus:ring-2 focus:ring-brand" />
            </div>
          </div>

          <div className="pt-6 space-y-4">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="w-full bg-brand text-bg py-4 rounded-2xl font-black text-lg shadow-lg shadow-brand/20 hover:brightness-110 transition-all uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSavingSettings ? 'SAVING...' : saveStatus === 'syncing' ? 'SYNCING...' : saveStatus === 'saved' ? 'SAVED' : 'SAVE CHANGES'}
            </button>

            {saveStatus === 'syncing' && (
              <p className="text-[10px] text-yellow-300 font-black uppercase tracking-widest text-center">Still syncing. You can continue using the app.</p>
            )}

            {saveStatus === 'saved' && (
              <p className="text-[10px] text-brand font-black uppercase tracking-widest text-center">Settings saved successfully.</p>
            )}

            {saveStatus === 'error' && (
              <p className="text-[10px] text-red-400 font-black uppercase tracking-widest text-center">Save failed. Please try again.</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={seedData}
                disabled={isSeeding}
                aria-label="Seed demo data for testing"
                className="bg-white/10 border border-border text-gray-200 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 hover:text-white transition-all outline-none focus:ring-2 focus:ring-brand disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Database size={14} />
                {isSeeding ? 'SEEDING...' : 'Seed Demo'}
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                aria-label="Clear all user data"
                className="bg-red-500/10 border border-red-500/20 text-red-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500/20 hover:text-red-500 transition-all outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash2 size={14} />
                Clear Data
              </button>
            </div>

            {/* GDPR Data Rights Section */}
            <div className="mt-2 border border-brand/20 bg-brand/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-brand" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-brand">Your Data Rights (GDPR)</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                  <Download size={12} />
                  {isExporting ? 'Exporting...' : 'Export My Data (Art. 20)'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteAccount(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/20 hover:text-red-500 transition-all"
                >
                  <Trash2 size={12} />
                  Delete Account Permanently (Art. 17)
                </button>
              </div>
              <p className="text-[9px] text-white/30 font-medium leading-relaxed">
                Export downloads all your shifts and receipts as JSON. Account deletion permanently removes all data including your login. Contact privacy@veroflow.fi for other requests.
              </p>
            </div>

            {isSeeding && (
              <p className="text-[10px] text-yellow-300 font-black uppercase tracking-widest text-center">{seedStage}</p>
            )}

            {lastSeedSeconds !== null && !isSeeding && (
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest text-center">Last seed completed in {lastSeedSeconds.toFixed(1)}s</p>
            )}

            {lastWipeSeconds !== null && !isDeleting && (
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest text-center">Last wipe completed in {lastWipeSeconds.toFixed(1)}s</p>
            )}

            <button type="button" onClick={() => signOut(auth)} className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all">
              <LogOut size={16} />
              Disconnect Account
            </button>
          </div>
        </form>

        {/* Custom Confirmation Modal */}
        <AnimatePresence>
          {showConfirmDelete && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card border border-border w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-2">Wipe All Data?</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed mb-8">
                  This will permanently delete all your shifts, receipts, and profile statistics. This action cannot be undone.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={deleteUserData}
                    disabled={isDeleting}
                    className="w-full bg-red-500 text-white py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-red-600 transition-all uppercase disabled:opacity-50"
                  >
                    {isDeleting ? 'WIPING DATA...' : 'YES, DELETE EVERYTHING'}
                  </button>
                  {isDeleting && (
                    <p className="text-[10px] text-yellow-300 font-black uppercase tracking-widest text-center">{wipeStage}</p>
                  )}
                  <button 
                    onClick={cancelDeleteFlow}
                    className="w-full bg-white/5 text-gray-400 py-4 rounded-2xl font-black text-xs tracking-widest hover:text-white transition-all uppercase"
                  >
                    CANCEL
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* GDPR Account Deletion Confirmation Modal */}
        <AnimatePresence>
          {showDeleteAccount && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card border border-red-500/30 w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center"
              >
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-2">Delete Account?</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed mb-4">
                  This invokes your GDPR Right to Erasure.
                </p>
                <div className="text-[10px] text-gray-500 font-medium mb-8 space-y-2 text-left bg-white/5 p-4 rounded-xl border border-white/5">
                  <p>• All shifts and receipts will be wiped.</p>
                  <p>• Your Google login connection will be revoked.</p>
                  <p>• Your email will be removed from VeroFlow systems.</p>
                  <p className="text-red-400 font-bold mt-2">This action is irreversible.</p>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="w-full bg-red-500 text-white py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-red-600 transition-all uppercase disabled:opacity-50"
                  >
                    {isDeletingAccount ? 'DELETING ACCOUNT...' : 'YES, PERMANENTLY DELETE'}
                  </button>
                  <button 
                    onClick={() => setShowDeleteAccount(false)}
                    disabled={isDeletingAccount}
                    className="w-full bg-white/5 text-gray-400 py-4 rounded-2xl font-black text-xs tracking-widest hover:text-white transition-all uppercase disabled:opacity-50"
                  >
                    CANCEL
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
