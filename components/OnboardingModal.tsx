'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Euro, Percent, ChevronRight, CheckCircle, X } from 'lucide-react';
import { useVero } from './VeroProvider';

const ONBOARDING_KEY = 'veroflow_onboarding_complete';

const VEHICLE_OPTIONS = [
  { value: 'bicycle', label: '🚲 Bicycle', description: 'No fuel costs, max mileage deduction' },
  { value: 'scooter', label: '🛵 Scooter / Moped', description: 'Low fuel, standard deduction' },
  { value: 'car', label: '🚗 Car', description: 'Full fuel + mileage deductions' },
  { value: 'cargo_bike', label: '📦 Cargo Bike', description: 'Same as bicycle' },
];

const TAX_RATE_OPTIONS = [
  { value: 0.10, label: '10%', description: 'Very low income (<€15k/yr)' },
  { value: 0.15, label: '15%', description: 'Low-medium income (€15–25k/yr)' },
  { value: 0.20, label: '20%', description: 'Medium income (€25–40k/yr)' },
  { value: 0.25, label: '25%', description: 'Higher income (€40k+/yr)' },
];

export default function OnboardingModal() {
  const { profile, updateProfile } = useVero() as any;
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [vehicle, setVehicle] = useState('car');
  const [monthlyIncome, setMonthlyIncome] = useState('2000');
  const [taxRate, setTaxRate] = useState(0.15);

  // Show only for brand-new users who haven't completed onboarding
  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done && profile !== undefined && !profile?.vehicle) {
      // Delay slightly so the dashboard renders first
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, [profile]);

  const handleComplete = async () => {
    const weekly = (parseFloat(monthlyIncome) || 2000) * 12 / 52;
    try {
      if (updateProfile) {
        await updateProfile({
          vehicle,
          taxRate,
          weeklyGoal: Math.round(weekly),
        });
      }
    } catch (_) {
      // Non-blocking — profile update failing shouldn't block onboarding
    }
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setVisible(false);
  };

  const steps = [
    {
      icon: <Car size={28} className="text-brand" />,
      title: 'What do you deliver with?',
      subtitle: 'We use this to calculate your correct mileage deduction rate.',
      content: (
        <div className="grid grid-cols-1 gap-3">
          {VEHICLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setVehicle(opt.value)}
              className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                vehicle === opt.value
                  ? 'border-brand bg-brand/10 text-white'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
              }`}
            >
              <span className="text-2xl">{opt.label.split(' ')[0]}</span>
              <div>
                <p className="text-sm font-black uppercase tracking-wide">
                  {opt.label.split(' ').slice(1).join(' ')}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
              </div>
              {vehicle === opt.value && (
                <CheckCircle size={16} className="text-brand ml-auto shrink-0" />
              )}
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: <Euro size={28} className="text-brand" />,
      title: 'Expected monthly income?',
      subtitle: 'Used to set your daily goal and forecast your annual tax.',
      content: (
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand font-black text-lg">€</span>
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              min={0}
              placeholder="2000"
              className="w-full bg-white/5 border border-white/10 focus:border-brand/60 rounded-2xl pl-10 pr-4 py-4 text-white text-xl font-black outline-none transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-black uppercase tracking-widest">/mo</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['1500', '2000', '3000'].map((preset) => (
              <button
                key={preset}
                onClick={() => setMonthlyIncome(preset)}
                className={`py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                  monthlyIncome === preset
                    ? 'bg-brand/10 border-brand/40 text-brand'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                €{preset}
              </button>
            ))}
          </div>
          {monthlyIncome && (
            <p className="text-xs text-gray-500 text-center">
              ≈ <span className="text-brand font-bold">€{Math.round(parseFloat(monthlyIncome) * 12 / 52)}</span> weekly goal
            </p>
          )}
        </div>
      ),
    },
    {
      icon: <Percent size={28} className="text-brand" />,
      title: 'Your estimated tax rate?',
      subtitle: 'Check your MyTax (OmaVero) prepayment decision, or pick an estimate.',
      content: (
        <div className="grid grid-cols-1 gap-3">
          {TAX_RATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTaxRate(opt.value)}
              className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                taxRate === opt.value
                  ? 'border-brand bg-brand/10 text-white'
                  : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
              }`}
            >
              <span className="text-2xl font-display font-black text-brand w-12 shrink-0">{opt.label}</span>
              <p className="text-xs text-gray-400">{opt.description}</p>
              {taxRate === opt.value && (
                <CheckCircle size={16} className="text-brand ml-auto shrink-0" />
              )}
            </button>
          ))}
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex items-end sm:items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            {/* Skip */}
            <button
              onClick={() => { localStorage.setItem(ONBOARDING_KEY, 'true'); setVisible(false); }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
              aria-label="Skip onboarding"
            >
              <X size={14} />
            </button>

            {/* Progress dots */}
            <div className="flex gap-2 justify-center pt-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? 'w-8 bg-brand' : i < step ? 'w-4 bg-brand/40' : 'w-4 bg-white/10'
                  }`}
                />
              ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
                    {currentStep.icon}
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white uppercase tracking-tight leading-snug">
                      {currentStep.title}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">{currentStep.subtitle}</p>
                  </div>
                </div>

                {currentStep.content}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 rounded-2xl border border-white/10 bg-white/5 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Back
                </button>
              )}
              <button
                onClick={isLast ? handleComplete : () => setStep(step + 1)}
                className="flex-1 py-3 rounded-2xl bg-brand text-bg text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                {isLast ? (
                  <>
                    <CheckCircle size={14} />
                    Let&apos;s Go
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight size={14} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
