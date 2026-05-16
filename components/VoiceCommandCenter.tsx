'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X } from 'lucide-react';
import { useVero } from './VeroProvider';

/**
 * VoiceCommandCenter
 *
 * Fully derived from VeroProvider state — no local state, no effects, no refs.
 * `isListening || isProcessing` drives visibility directly.
 * AnimatePresence handles the fade-out exit animation so no timer is needed
 * to keep the UI visible during the "processing" phase.
 */
export default function VoiceCommandCenter() {
  const { toggleVoiceCommand, isListening, transcript, isProcessing } = useVero();

  // Derived visibility: panel is shown while listening OR while Gemini processes
  const showVoiceUI = isListening || isProcessing;

  return (
    <>
      {/* ── FAB trigger button ── */}
      <div className="fixed bottom-24 right-4 z-[150]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleVoiceCommand}
          aria-label={isListening ? 'Stop voice command' : 'Start voice command'}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-brand'
          }`}
        >
          <Mic size={24} className={isListening ? 'text-white' : 'text-bg'} />
        </motion.button>
      </div>

      {/* ── Voice UI panel ── */}
      <AnimatePresence>
        {showVoiceUI && (
          <motion.div
            key="voice-panel"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-lg z-[160] flex items-center justify-center p-6"
          >
            <div className="bg-card w-full max-w-sm rounded-[2.5rem] border border-border p-8 space-y-8 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <button
                onClick={() => { if (isListening) toggleVoiceCommand(); }}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                aria-label="Close voice panel"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-6">
                {/* Mic icon with pulse ring */}
                <div className="relative">
                  <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto border border-brand/20">
                    <Mic size={32} className={isListening ? 'text-red-500' : 'text-brand'} />
                  </div>
                  {isListening && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-brand rounded-full -z-10"
                    />
                  )}
                </div>

                {/* Status text */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">
                    Voice Assistant
                  </h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                    {isListening ? 'Listening for command...' : 'Processing...'}
                  </p>
                </div>

                {/* Live transcript */}
                <div className="min-h-[80px] flex items-center justify-center">
                  <p className="text-gray-300 font-medium italic text-center text-sm leading-relaxed">
                    &quot;{transcript || '...'}&quot;
                  </p>
                </div>

                {/* Command hints */}
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-brand font-black uppercase tracking-widest mb-1">Start</p>
                    <p className="text-[9px] text-gray-300 font-bold">&apos;Aloita wolt&apos;</p>
                    <p className="text-[8px] text-gray-600">&apos;Start shift&apos;</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-red-400 font-black uppercase tracking-widest mb-1">Stop</p>
                    <p className="text-[9px] text-gray-300 font-bold">&apos;Lopeta&apos;</p>
                    <p className="text-[8px] text-gray-600">&apos;Päätä vuoro&apos;</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-yellow-400 font-black uppercase tracking-widest mb-1">Fuel</p>
                    <p className="text-[9px] text-gray-300 font-bold">&apos;Tankkaan 40€&apos;</p>
                    <p className="text-[8px] text-gray-600">&apos;Log fuel 35&apos;</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-blue-400 font-black uppercase tracking-widest mb-1">Tip</p>
                    <p className="text-[9px] text-gray-300 font-bold">&apos;Tippi viisi&apos;</p>
                    <p className="text-[8px] text-gray-600">&apos;Tip 3 euros&apos;</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
