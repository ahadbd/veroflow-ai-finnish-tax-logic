'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, 
  ShieldCheck, 
  ChevronRight, 
  Globe, 
  UserCircle2, 
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useVero } from '@/components/VeroProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { user, login, guestLogin, loading } = useVero();
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'fi'>('en');

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const t = {
    en: {
      welcome: "WELCOME BACK",
      sub: "Sign in to manage your Finnish delivery business with intelligence.",
      google: "CONTINUE WITH GOOGLE",
      guest: "CONTINUE AS GUEST",
      guestSub: "No data sync across devices",
      secure: "SECURE & ENCRYPTED",
      back: "BACK TO HOME",
      footer: "By continuing, you agree to our Terms and Privacy Policy."
    },
    fi: {
      welcome: "TERVETULOA TAKAISIN",
      sub: "Kirjaudu sisään hallitaksesi lähettiyritystäsi älykkäästi.",
      google: "JATKA GOOGLELLA",
      guest: "JATKA VIERAANA",
      guestSub: "Tiedot eivät synkronoidu laitteiden välillä",
      secure: "TURVALLINEN & SALATTU",
      back: "TAKAISIN ETUSIVULLE",
      footer: "Jatkamalla hyväksyt käyttöehdot ja tietosuojaselosteen."
    }
  }[lang];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col relative selection:bg-brand/30 selection:text-brand">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand/5 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[150px] rounded-full" />
      </div>

      <header className="p-6 flex justify-between items-center relative z-10">
        <Link href="/landing" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-white/10 shadow-2xl">
            <img src="/logo.svg" alt="VeroFlow" className="w-7 h-7" />
          </div>
          <span className="font-display font-black text-2xl tracking-tighter uppercase italic">VeroFlow</span>
        </Link>

        <button 
          onClick={() => setLang(lang === 'en' ? 'fi' : 'en')}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all"
        >
          <Globe size={14} /> {lang === 'en' ? 'FI' : 'EN'}
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[48px] p-8 md:p-12 shadow-2xl space-y-10 relative overflow-hidden group">
            {/* Subtle highlight effect */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
            
            <div className="space-y-4 text-center">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="inline-flex p-3 bg-brand/10 border border-brand/20 rounded-2xl text-brand mb-4 shadow-[0_0_20px_rgba(57,255,20,0.1)]"
              >
                <LogIn size={24} />
              </motion.div>
              <h1 className="text-4xl font-display font-black tracking-tighter uppercase italic leading-[0.9]">
                {t.welcome}
              </h1>
              <p className="text-gray-500 font-medium italic text-sm">
                {t.sub}
              </p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={login}
                className="w-full h-18 bg-white text-[#050505] rounded-[24px] font-display font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] group"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </div>
                {t.google}
                <ChevronRight size={14} className="group-hover:translate-x-1 duration-300" />
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className="relative flex justify-center"><span className="px-3 bg-[#050505] text-[10px] font-black uppercase tracking-[0.3em] text-white/20">OR</span></div>
              </div>

              <button 
                onClick={guestLogin}
                className="w-full h-18 bg-white/5 border border-white/10 rounded-[24px] font-display font-black text-xs uppercase tracking-widest flex items-center justify-between px-8 hover:bg-white/[0.08] transition-all group"
              >
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-white/5 rounded-xl text-white/40 group-hover:text-white transition-colors">
                      <UserCircle2 size={18} />
                   </div>
                   <div className="text-left">
                      <p className="leading-none">{t.guest}</p>
                      <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-1">{t.guestSub}</p>
                   </div>
                </div>
                <ArrowRight size={14} className="text-white/20 group-hover:text-white group-hover:translate-x-1 duration-300" />
              </button>
            </div>

            <div className="pt-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                <ShieldCheck size={12} className="text-brand" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{t.secure}</span>
              </div>
              <p className="text-[9px] text-white/20 font-medium italic text-center max-w-[200px]">
                {t.footer}
              </p>
            </div>
          </div>

          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5 }}
             className="mt-12 text-center"
          >
            <Link 
              href="/landing" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-brand transition-colors group"
            >
              <ArrowLeft size={12} className="group-hover:-translate-x-1 duration-300" />
              {t.back}
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <footer className="p-8 text-center text-[10px] text-white/10 font-black uppercase tracking-[0.4em] relative z-10 mt-auto">
        VeroFlow AI • HELSINKI • 2026
      </footer>
    </div>
  );
}
