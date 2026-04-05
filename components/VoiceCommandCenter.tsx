'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Zap, Loader2, Sparkles, X, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';
import { useVero } from './VeroProvider';

export default function VoiceCommandCenter() {
  const { setNotification, activeShift, setActiveShift, refreshData } = useVero();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVoiceUI, setShowVoiceUI] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US'; // Or fi-FI for Finnish

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + ' ' + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setNotification({ message: `Voice error: ${event.error}`, type: 'error' });
      };

      recognitionRef.current.onend = () => {
        if (isListening) recognitionRef.current.start();
      };
    }
  }, [isListening, setNotification]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setNotification({ message: "Speech recognition not supported in this browser.", type: 'error' });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript.trim()) processVoiceCommand(transcript);
    } else {
      setTranscript('');
      setIsListening(true);
      setShowVoiceUI(true);
      recognitionRef.current.start();
    }
  };

  const processVoiceCommand = async (text: string) => {
    setIsProcessing(true);
    setNotification({ message: "Analyzing command...", type: 'info' });
    
    try {
      // In prod, this calls Gemini API to parse intent
      // Here we simulate intent parsing
      const lower = text.toLowerCase();
      
      if (lower.includes('start') || lower.includes('begin')) {
        setNotification({ message: "Starting shift via voice...", type: 'success' });
        // Trigger start shift logic
      } else if (lower.includes('stop') || lower.includes('end')) {
        setNotification({ message: "Stopping shift via voice...", type: 'success' });
        // Trigger stop shift logic
      } else if (lower.includes('gas') || lower.includes('fuel')) {
        setNotification({ message: "Fuel log triggered via voice.", type: 'info' });
      } else {
        setNotification({ message: "Command not recognized. Try 'Start shift'.", type: 'error' });
      }
    } catch (err) {
      setNotification({ message: "Failed to process voice.", type: 'error' });
    } finally {
      setIsProcessing(false);
      setTranscript('');
      setShowVoiceUI(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-24 right-4 z-[150]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleListening}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors ${isListening ? 'bg-red-500 animate-pulse' : 'bg-brand'}`}
        >
          {isListening ? <Mic size={24} className="text-white" /> : <Mic size={24} className="text-bg" />}
        </motion.button>
      </div>

      <AnimatePresence>
        {showVoiceUI && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-lg z-[160] flex items-center justify-center p-6"
          >
            <div className="bg-card w-full max-w-sm rounded-[2.5rem] border border-border p-8 space-y-8 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
               <button onClick={() => { setIsListening(false); setShowVoiceUI(false); recognitionRef.current?.stop(); }} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
               
               <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto border border-brand/20">
                      <Mic size={32} className={`${isListening ? 'text-red-500' : 'text-brand'}`} />
                    </div>
                    {isListening && <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-brand rounded-full -z-10" />}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">Voice Assistant</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{isListening ? 'Listening for command...' : 'Processing...'}</p>
                  </div>

                  <div className="min-h-[80px] flex items-center justify-center">
                    <p className="text-gray-300 font-medium italic text-center text-sm leading-relaxed">
                      "{transcript || '...'}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-2">
                       <Zap size={12} className="text-brand" />
                       <span className="text-[8px] text-gray-400 font-black uppercase">'Start Shift'</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-2">
                       <MessageSquare size={12} className="text-blue-400" />
                       <span className="text-[8px] text-gray-400 font-black uppercase">'Log Fuel'</span>
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
