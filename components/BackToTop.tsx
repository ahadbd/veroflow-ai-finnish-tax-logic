'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useVero } from './VeroProvider';

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();
    const { user } = useVero();

    // Client area is the root dashboard ('/') where the user is logged in
    const isClientArea = pathname === '/' && user !== null;

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && !isClientArea && (
                <motion.button
                    initial={{ y: 20, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.8 }}
                    onClick={scrollToTop}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    className="fixed bottom-6 right-6 z-[150] w-14 h-14 bg-brand text-[#050505] rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(57,255,20,0.4)] border border-brand/50 group transition-all"
                    aria-label="Back to Top"
                >
                    <ArrowUp size={24} className="group-hover:translate-y-[-2px] transition-transform duration-300" strokeWidth={3} />
                    
                    {/* Visual Pulse effect */}
                    <span className="absolute inset-0 rounded-2xl bg-brand animate-ping opacity-20 pointer-events-none" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default BackToTop;
