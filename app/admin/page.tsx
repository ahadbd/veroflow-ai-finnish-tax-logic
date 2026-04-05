'use client';

import AdminDashboard from '@/components/AdminDashboard';
import { useVero } from '@/components/VeroProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
    const { isAdmin, loading } = useVero();
    const router = useRouter();

    if (loading) {
        return (
            <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
                <RefreshCw size={32} className="text-brand animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Authenticating Terminal...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-8 text-center space-y-8">
                <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-[32px] flex items-center justify-center">
                    <ShieldAlert size={48} className="text-red-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-display font-black uppercase italic tracking-tighter">Access Denied</h1>
                    <p className="text-gray-500 max-w-xs text-xs font-bold uppercase tracking-widest leading-loose">
                        Insufficient Security Clearance. This terminal is strictly for VeroFlow AI Administrators.
                    </p>
                </div>
                <Link 
                    href="/"
                    className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                    <Home size={14} /> RETURN TO DASHBOARD
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-bg p-8 lg:pl-32 lg:pr-12 lg:py-12">
            <AdminDashboard />
            
            {/* Minimal Back Navigation */}
            <div className="fixed bottom-8 right-8 z-[100]">
                <Link 
                    href="/"
                    className="p-5 bg-brand text-bg rounded-3xl shadow-[0_0_30px_rgba(57,255,20,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-brand/20 group"
                >
                    <Home size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest pr-2">EXIT VEROFLOW COMMAND CENTER</span>
                </Link>
            </div>
        </main>
    );
}
