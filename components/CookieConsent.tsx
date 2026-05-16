'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Check, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export type ConsentState = {
  necessary: true;       // always true — can't opt out of functional storage
  analytics: boolean;    // Vercel Analytics + SpeedInsights
};

const CONSENT_KEY = 'veroflow-gdpr-consent-v1';

export function getConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    return null;
  }
}

export function setConsent(state: ConsentState) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  // Dispatch event so layout can react immediately without page reload
  window.dispatchEvent(new CustomEvent('veroflow-consent-updated', { detail: state }));
}

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    const existing = getConsent();
    if (!existing) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    setConsent({ necessary: true, analytics: true });
    setIsVisible(false);
  };

  const rejectAll = () => {
    setConsent({ necessary: true, analytics: false });
    setIsVisible(false);
  };

  const savePreferences = () => {
    setConsent({ necessary: true, analytics: analyticsEnabled });
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-[300] max-w-2xl mx-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Cookie consent preferences"
        >
          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
            {/* Glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent rounded-t-[28px]" />

            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={18} className="text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black uppercase tracking-widest text-white mb-1">
                  Your Privacy & Data Rights
                </h4>
                <p className="text-[11px] text-white/50 font-medium leading-relaxed">
                  We use necessary cookies for app functionality (shift caching, auth). Analytics cookies are optional
                  and help us improve VeroFlow. You can change preferences at any time in Settings.{' '}
                  <Link href="/privacy" className="text-brand underline underline-offset-2 hover:text-brand/80">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>

            {/* Expandable preferences */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    {/* Necessary — always on */}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-white">Necessary</p>
                        <p className="text-[10px] text-white/40 font-medium mt-0.5">Auth session, shift cache (localStorage). Required for the app to work.</p>
                      </div>
                      <div className="w-8 h-4 bg-brand/30 rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-60">
                        <div className="w-3 h-3 bg-brand rounded-full" />
                      </div>
                    </div>

                    {/* Analytics — toggleable */}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-white">Analytics</p>
                        <p className="text-[10px] text-white/40 font-medium mt-0.5">Vercel Analytics & Speed Insights — anonymous page metrics.</p>
                      </div>
                      <button
                        onClick={() => setAnalyticsEnabled(p => !p)}
                        className={`w-8 h-4 rounded-full flex items-center transition-all px-0.5 ${analyticsEnabled ? 'bg-brand justify-end' : 'bg-white/10 justify-start'}`}
                        aria-checked={analyticsEnabled}
                        role="switch"
                        aria-label="Toggle analytics cookies"
                      >
                        <div className="w-3 h-3 bg-white rounded-full transition-all" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={acceptAll}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand text-[#050505] rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(57,255,20,0.25)]"
              >
                <Check size={11} /> ACCEPT ALL
              </button>

              <button
                onClick={rejectAll}
                className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full font-black text-[10px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                REJECT ALL
              </button>

              <button
                onClick={() => setShowDetails(p => !p)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
              >
                MANAGE
                <motion.div animate={{ rotate: showDetails ? 180 : 0 }}>
                  <ChevronDown size={10} />
                </motion.div>
              </button>

              {showDetails && (
                <button
                  onClick={savePreferences}
                  className="ml-auto px-5 py-2.5 bg-white/10 border border-white/20 rounded-full font-black text-[10px] uppercase tracking-widest text-white hover:bg-white/20 transition-all"
                >
                  SAVE PREFERENCES
                </button>
              )}

              <button onClick={rejectAll} className="ml-auto p-1.5 text-white/20 hover:text-white transition-colors" aria-label="Dismiss">
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
