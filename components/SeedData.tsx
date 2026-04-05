'use client';

import React, { useState } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '@/firebase';
import { collection, addDoc, doc, setDoc, deleteDoc, getDocs, query, where, deleteField } from 'firebase/firestore';
import { calculate2026Tax, YEL_THRESHOLD_2026 } from '@/lib/tax-engine';
import { Database, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SeedData() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const generateDemoData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsSeeding(true);
    setStatus('idle');
    setShowConfirmClear(false);

    try {
      // 1. Create/Update User Profile
      console.log("Seeding: Creating profile...");
      const profileRef = doc(db, 'profiles', user.uid);
      const profileData = {
        uid: user.uid,
        displayName: user.displayName || 'Demo Courier',
        email: user.email,
        taxRate: 0.18,
        isVatRegistered: true,
        yelThreshold: YEL_THRESHOLD_2026,
        yelIncomeLevel: 12000,
        weeklyGoal: 600,
        totalGross: 8450.50,
        totalDeductions: 1250.20,
        totalDistance: 1520.5,
        homeLocation: { lat: 60.1699, lng: 24.9384 }, // Helsinki
        maintenance: {
          lastKm: 4200,
          interval: 5000,
          vehicleType: 'Car',
          nextOilChange: 9200,
          nextTireSwap: '2026-10-15'
        },
        updatedAt: new Date().toISOString()
      };
      await setDoc(profileRef, profileData);

      // 2. Clear existing demo shifts (optional, but good for clean demo)
      // We'll skip clearing for now to be safe, or just add new ones.

      // 3. Generate Shifts
      console.log("Seeding: Generating shifts...");
      const apps = ['Wolt', 'Uber Eats', 'Multi-App'];
      const shiftsCollection = collection(db, 'shifts');
      
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const grossPay = 80 + Math.random() * 120;
        const tips = 5 + Math.random() * 25;
        const distanceKm = 15 + Math.random() * 40;
        const app = apps[Math.floor(Math.random() * apps.length)];

        const taxBreakdown = calculate2026Tax({
          grossPay,
          tips,
          distanceKm,
          taxRate: 0.18,
          annualGrossSoFar: 8000,
          isVatRegistered: true,
          yelIncomeLevel: 12000
        });

        // Generate dummy GPS points for heatmap
        const gpsPoints = [];
        const baseLat = 60.1699;
        const baseLng = 24.9384;
        for (let j = 0; j < 5; j++) {
          gpsPoints.push({
            lat: baseLat + (Math.random() - 0.5) * 0.05,
            lng: baseLng + (Math.random() - 0.5) * 0.05,
            timestamp: new Date().toISOString()
          });
        }

        await addDoc(shiftsCollection, {
          uid: user.uid,
          date: date.toISOString(),
          app,
          grossPay,
          tips,
          distanceKm,
          fuelCost: distanceKm * 0.12,
          durationMin: 180 + Math.random() * 120,
          netProfit: taxBreakdown.netProfit,
          taxDebt: taxBreakdown.taxDebt,
          yelCost: taxBreakdown.yelCost,
          vatDebt: taxBreakdown.vatDebt,
          deduction: taxBreakdown.mileageDeduction,
          startAddress: "Mannerheimintie 1, Helsinki",
          endAddress: "Itäväylä 10, Helsinki",
          gpsPoints
        });
      }

      // 4. Generate Receipts
      console.log("Seeding: Generating receipts...");
      const categories = ['Work Gear', 'Vehicle Maintenance', 'Fuel', 'Phone Bill', 'Other'];
      const merchants = ['Neste', 'K-Citymarket', 'Motonet', 'Elisa', 'Verkkokauppa.com'];
      const receiptsCollection = collection(db, 'receipts');

      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 3));
        
        const amount = 20 + Math.random() * 80;
        const category = categories[Math.floor(Math.random() * categories.length)];
        const merchant = merchants[Math.floor(Math.random() * merchants.length)];

        await addDoc(receiptsCollection, {
          uid: user.uid,
          date: date.toISOString(),
          merchant,
          amount,
          vat: amount * 0.24,
          category,
          metadata: { ocr_confidence: 0.98, items: ["Fuel", "Coffee"] }
        });
      }

      setStatus('success');
    } catch (error) {
      console.error("Seeding failed:", error);
      setStatus('error');
      handleFirestoreError(error, OperationType.WRITE, 'multiple');
    } finally {
      setIsSeeding(false);
    }
  };

  const clearAllData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsSeeding(true);
    try {
      const shiftsSnap = await getDocs(query(collection(db, 'shifts'), where('uid', '==', user.uid)));
      const receiptsSnap = await getDocs(query(collection(db, 'receipts'), where('uid', '==', user.uid)));
      
      const deletePromises = [
        ...shiftsSnap.docs.map(d => deleteDoc(doc(db, 'shifts', d.id))),
        ...receiptsSnap.docs.map(d => deleteDoc(doc(db, 'receipts', d.id)))
      ];
      
      // Reset profile stats
      const profileRef = doc(db, 'profiles', user.uid);
      deletePromises.push(setDoc(profileRef, {
        totalGross: 0,
        totalDeductions: 0,
        totalDistance: 0,
        maintenance: deleteField(),
        maintenanceHistory: deleteField(),
        updatedAt: new Date().toISOString()
      }, { merge: true }));

      await Promise.all(deletePromises);
      setStatus('idle');
      setShowConfirmClear(false);
      // Force a reload or state update if needed, but Firestore listeners should handle it
    } catch (error) {
      console.error("Clearing failed:", error);
      handleFirestoreError(error, OperationType.DELETE, 'multiple');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="p-4 bg-card border border-border rounded-2xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand/20 rounded-lg flex items-center justify-center">
          <Database size={20} className="text-brand" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm uppercase tracking-widest">Demo Data Generator</h3>
          <p className="text-[10px] text-gray-400 font-sans">Populate your dashboard with realistic 2026 tax data.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={generateDemoData}
          disabled={isSeeding}
          className={`py-3 rounded-xl font-display font-bold text-xs tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
            status === 'success' 
              ? 'bg-green-500 text-white' 
              : status === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-brand text-bg hover:brightness-110'
          }`}
        >
          {isSeeding ? (
            <Loader2 size={18} className="animate-spin" />
          ) : status === 'success' ? (
            <CheckCircle2 size={18} />
          ) : (
            <Database size={18} />
          )}
          {isSeeding ? '...' : 'GENERATE'}
        </button>

        {!showConfirmClear ? (
          <button
            onClick={() => setShowConfirmClear(true)}
            disabled={isSeeding}
            className="py-3 rounded-xl font-display font-bold text-xs tracking-widest flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all active:scale-95"
          >
            CLEAR
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={clearAllData}
              disabled={isSeeding}
              className="flex-1 py-3 rounded-xl font-display font-bold bg-red-500 text-white text-[10px] tracking-widest animate-pulse"
            >
              SURE?
            </button>
            <button
              onClick={() => setShowConfirmClear(false)}
              disabled={isSeeding}
              className="flex-1 py-3 rounded-xl font-display font-bold bg-white/10 text-gray-400 text-[10px] tracking-widest"
            >
              NO
            </button>
          </div>
        )}
      </div>

      {status === 'success' && (
        <p className="text-[10px] text-green-400 text-center font-display font-bold tracking-widest animate-pulse">
          Dashboard updated with 10 shifts and 5 receipts.
        </p>
      )}
    </div>
  );
}
