'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Zap, 
  ShieldCheck, 
  Search, 
  Filter, 
  BarChart4, 
  ArrowUpRight, 
  ArrowDownRight,
  UserCheck,
  UserX,
  CreditCard,
  Cpu,
  RefreshCcw,
  LayoutGrid,
  List
} from 'lucide-react';
import { useVero } from './VeroProvider';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { UserProfile } from '@/types';

const AdminDashboard = () => {
    const { isAdmin } = useVero();
    const [view, setView] = useState<'grid' | 'table'>('table');
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const q = query(collection(db, 'profiles'), limit(100));
                const snap = await getDocs(q);
                const users = snap.docs.map(d => ({ ...d.data() } as UserProfile));
                setAllUsers(users);
            } catch (e) {
                console.error("Failed to fetch users", e);
            } finally {
                setLoadingUsers(false);
            }
        };

        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin]);

    if (!isAdmin) return null;

    return (
        <div className="space-y-12 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2 text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[10px] font-black uppercase tracking-widest text-brand">
                        <ShieldCheck size={14} /> SYSTEM ADMINISTRATOR
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter italic leading-none">
                        Command<br/><span className="text-white/20">Center</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <RefreshCcw size={16} /> REFRESH LIVE
                    </button>
                    <button className="p-4 bg-brand text-bg rounded-2xl text-bg font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(57,255,20,0.3)]">
                        EXPORT DATA
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: '€12,450', change: '+14%', up: true, icon: CreditCard, color: 'brand' },
                    { label: 'Active Users', value: allUsers.length.toString(), change: '+8%', up: true, icon: Users, color: 'blue-400' },
                    { label: 'OCR Usage', value: '84k', change: '-2%', up: false, icon: Cpu, color: 'orange-400' },
                    { label: 'Churn Rate', value: '1.2%', change: '-0.4%', up: true, icon: BarChart4, color: 'indigo-400' },
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label} 
                        className="bg-card border border-border p-6 rounded-[32px] space-y-4 relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                                <stat.icon className={`text-${stat.color}`} size={24} />
                            </div>
                            <div className={`flex items-center gap-1 font-black text-xs ${stat.up ? 'text-brand' : 'text-red-400'}`}>
                                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.change}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
                            <p className="text-3xl font-display font-black uppercase italic tracking-tighter">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Management Panel */}
            <div className="bg-card border border-border rounded-[40px] overflow-hidden">
                <div className="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/[0.02]">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">User Management</h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Managing {allUsers.length} active delivery entrepreneurs</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                            <input 
                                type="text"
                                placeholder="SEARCH COURIER..."
                                className="pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-brand/40 min-w-[300px]"
                            />
                        </div>
                        <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl">
                            <button 
                                onClick={() => setView('table')}
                                className={`p-3 rounded-xl transition-all ${view === 'table' ? 'bg-brand text-bg shadow-lg' : 'text-white/30 hover:text-white'}`}
                            >
                                <List size={18} />
                            </button>
                            <button 
                                onClick={() => setView('grid')}
                                className={`p-3 rounded-xl transition-all ${view === 'grid' ? 'bg-brand text-bg shadow-lg' : 'text-white/30 hover:text-white'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-8">
                    {loadingUsers ? (
                        <div className="py-24 flex flex-col items-center gap-4">
                            <RefreshCcw className="animate-spin text-brand" size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Decrypting User Data...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-y-4">
                                <thead>
                                    <tr className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                                        <th className="px-6 pb-2">User / Courier</th>
                                        <th className="px-6 pb-2">Subscription Tier</th>
                                        <th className="px-6 pb-2 text-center">Status</th>
                                        <th className="px-6 pb-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="space-y-4">
                                    {allUsers.map((u) => (
                                        <tr key={u.uid} className="bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                                            <td className="px-6 py-6 rounded-l-[24px]">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center shrink-0">
                                                        <Users className="text-white/30" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black italic uppercase tracking-tighter leading-none">{u.displayName}</p>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{u.uid.slice(0, 8)}...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                        u.subscription?.tier === 'pro' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                                                        u.subscription?.tier === 'elite' ? 'bg-brand/10 text-brand border-brand/30' :
                                                        'bg-white/5 text-white/40 border-white/10'
                                                    }`}>
                                                        {u.subscription?.tier || 'FREE TIER'}
                                                    </span>
                                                    {u.subscription?.status === 'active' && <Zap size={12} className="text-brand fill-brand" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex items-center justify-center">
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                                        <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
                                                        <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">ONLINE</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right rounded-r-[24px]">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button className="p-3 bg-white/5 hover:bg-brand hover:text-bg text-white/50 rounded-xl transition-all border border-white/10">
                                                        <UserCheck size={16} />
                                                    </button>
                                                    <button className="p-3 bg-white/5 hover:bg-red-500 hover:text-white text-white/50 rounded-xl transition-all border border-white/10">
                                                        <UserX size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Insights & Tokens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card border border-border p-8 rounded-[40px] space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="text-xl font-black italic uppercase tracking-tighter">AI Pulse</h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Gemini 2.0 Flash Throughput</p>
                        </div>
                        <Cpu className="text-brand" size={32} />
                    </div>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-gray-500">Monthly Token Quota</span>
                                <span className="text-white">64% USED</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-brand w-[64%]" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Avg. Latency</p>
                                <p className="text-xl font-display font-black italic">1.2s</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">OCR Success</p>
                                <p className="text-xl font-display font-black italic text-brand">99.8%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-brand text-[#050505] p-8 rounded-[40px] flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#050505]/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700" />
                    <div className="space-y-2 relative z-10">
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-tight">Total Profits<br/>This Quarter</h4>
                        <p className="text-5xl md:text-7xl font-display font-black uppercase italic tracking-tighter">€42,840</p>
                    </div>
                    <div className="pt-12 relative z-10 flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Projected MRR</p>
                            <p className="text-xl font-display font-black uppercase tracking-tighter italic">€2,150 / MO</p>
                        </div>
                        <ArrowUpRight size={48} className="opacity-20" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
