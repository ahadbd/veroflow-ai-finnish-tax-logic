'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Check } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const accept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const decline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 z-[200] max-w-4xl mx-auto"
                >
                    <div className="bg-black/40 backdrop-blur-3xl border border-white/10 p-6 md:p-8 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-6 text-left">
                            <div className="w-14 h-14 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center shrink-0">
                                <ShieldCheck size={28} className="text-brand" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-black uppercase tracking-widest text-white">Trust & Transparency</h4>
                                <p className="text-xs text-white/50 font-medium italic leading-relaxed max-w-lg">
                                    We use cookies to improve your VeroFlow experience, track profitability data accurately, and keep your financial info secure. By continuing, you agree to our use of cookies.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto shrink-0">
                            <button 
                                onClick={decline}
                                className="flex-1 md:flex-none px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white/50 hover:text-white"
                            >
                                Settings
                            </button>
                            <button 
                                onClick={accept}
                                className="flex-1 md:flex-none px-10 py-3 bg-brand text-[#050505] rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                            >
                                ACCEPT ALL
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
