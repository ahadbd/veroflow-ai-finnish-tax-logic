'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useVero } from './VeroProvider';

export default function NotificationAnchor() {
  const { notification, setNotification } = useVero();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] w-full max-w-xs pointer-events-none">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-center justify-between gap-4 ${
              notification.type === 'success' ? 'bg-brand/10 border-brand/20 text-brand' :
              notification.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              'bg-blue-400/10 border-blue-400/20 text-blue-400'
            } backdrop-blur-xl`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' && <CheckCircle2 size={20} />}
              {notification.type === 'error' && <AlertCircle size={20} />}
              {notification.type === 'info' && <Info size={20} />}
              <p className="text-[10px] font-black uppercase tracking-widest">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="opacity-50 hover:opacity-100 transition-opacity"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
