'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, ChevronRight } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Already installed as PWA?
    const mql = window.matchMedia('(display-mode: standalone)');
    const listener = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mql.addEventListener('change', listener);
    
    // Detection
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    
    // Initial checks (async to avoid lint error)
    Promise.resolve().then(() => {
      if (mql.matches) setIsInstalled(true);
      if (ios) setIsIOS(true);
    });

    // Dismissed before? Don't re-show for 7 days
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) return () => {
      mql.removeEventListener('change', listener);
    };

    if (ios) {
      // Only show iOS guide if not already in standalone mode
      if (!(navigator as Navigator & { standalone?: boolean }).standalone) {
        setTimeout(() => setShowBanner(true), 3000);
      }
      return () => {
        mql.removeEventListener('change', listener);
      };
    }

    // Android / Chrome: listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => {
      mql.removeEventListener('change', listener);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      setIsInstalled(true);
    } else {
      setInstalling(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', String(Date.now()));
  };

  if (isInstalled || !showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed bottom-6 left-4 right-4 z-[9999] max-w-sm mx-auto"
      >
        <div className="bg-[#0a0a0a] border border-brand/30 rounded-[28px] p-4 shadow-[0_0_40px_rgba(57,255,20,0.15)] backdrop-blur-2xl">
          {/* Top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent rounded-t-[28px]" />

          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Smartphone className="text-brand" size={22} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand mb-0.5">
                INSTALL APP
              </p>
              {isIOS ? (
                <>
                  <p className="text-white font-bold text-sm leading-snug">Add VeroFlow to your Home Screen</p>
                  <p className="text-white/40 text-[10px] font-medium mt-1 leading-relaxed">
                    Tap <span className="text-brand font-black">Share</span> → <span className="text-brand font-black">&quot;Add to Home Screen&quot;</span> in Safari
                  </p>
                </>
              ) : (
                <>
                  <p className="text-white font-bold text-sm leading-snug">Install VeroFlow on your phone</p>
                  <p className="text-white/40 text-[10px] font-medium mt-1">Works offline · Native feel · No App Store needed</p>
                </>
              )}

              {/* Install button (Android) */}
              {!isIOS && (
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-brand text-[#050505] rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
                >
                  <Download size={12} />
                  {installing ? 'INSTALLING...' : 'INSTALL NOW'}
                  {!installing && <ChevronRight size={10} />}
                </button>
              )}
            </div>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white transition-colors flex-shrink-0 rounded-full hover:bg-white/5"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
