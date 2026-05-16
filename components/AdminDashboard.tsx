'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Zap, ShieldCheck, Search, Filter, BarChart4, ArrowUpRight, ArrowDownRight,
  UserCheck, UserX, CreditCard, Cpu, RefreshCcw, LayoutGrid, List, MapPin, 
  TerminalSquare, Settings, PlaySquare, AlertCircle, Globe, Activity, Edit3, Plus, Save,
  TrendingUp, PieChart as PieChartIcon, Radio
} from 'lucide-react';
import { useVero } from './VeroProvider';
import { collection, query, limit, getDocs, doc, setDoc, orderBy, onSnapshot, getDoc, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase';
import { UserProfile } from '@/types';
import { ApiServiceStatus, checkFirebaseHealth, checkGeminiHealth, getAppEnvironmentStatus } from '@/lib/api-health';
import { updateEnvVariables } from '@/app/actions/env';
import {
  BroadcastRecord,
  fetchBroadcastHistory,
  fetchGrowthTrend,
  fetchMrrTrend,
  writeMrrSnapshot,
  writeGrowthSnapshot,
} from '@/lib/admin-stats';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, CartesianGrid } from 'recharts';

// System Log Interface
interface SystemLog {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: string;
}

interface SystemConfig {
  VAT_RATE_2026: number;
  MILEAGE_RATE_2026: number;
  GEMINI_MODEL: string;
  ALLOW_NEW_SIGNUPS: boolean;
  SPAM_LIMIT_HOURS: number;
}

const AdminDashboard = () => {
    const { isAdmin, setNotification, profile } = useVero();
    const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'broadcast' | 'config' | 'logs' | 'integrations'>('analytics');
    
    // User State
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'pro' | 'elite'>('all');

    const [sysConfig, setSysConfig] = useState<SystemConfig>({
        VAT_RATE_2026: 0.255,
        MILEAGE_RATE_2026: 0.57,
        GEMINI_MODEL: 'gemini-1.5-flash',
        ALLOW_NEW_SIGNUPS: true,
        SPAM_LIMIT_HOURS: 1
    });
    const [savingConfig, setSavingConfig] = useState(false);

    // Logs State
    const [logs, setLogs] = useState<SystemLog[]>([]);

    // API Integrations Status
    const [apiStatus, setApiStatus] = useState<ApiServiceStatus[]>([]);
    const [loadingApiStatus, setLoadingApiStatus] = useState(false);
    const [envForm, setEnvForm] = useState({ NEXT_PUBLIC_GEMINI_API_KEY: '', APP_URL: '' });
    const [updatingEnv, setUpdatingEnv] = useState(false);
    
    // Inline Card / Custom API State
    const [editingCard, setEditingCard] = useState<string | null>(null);
    const [editingCardValue, setEditingCardValue] = useState('');
    const [customEnv, setCustomEnv] = useState({ key: '', value: '' });
    const [usageStats, setUsageStats] = useState<any[]>([]);
    const [loadingUsage, setLoadingUsage] = useState(true);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [broadcastType, setBroadcastType] = useState<'info' | 'success' | 'error'>('info');
    const [sendingBroadcast, setSendingBroadcast] = useState(false);
    // Real chart data state
    const [realGrowthTrend, setRealGrowthTrend] = useState<{ day: string; users: number }[]>([]);
    const [realMrrTrend, setRealMrrTrend] = useState<{ month: string; mrr: number }[]>([]);
    const [broadcastHistory, setBroadcastHistory] = useState<BroadcastRecord[]>([]);

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

        const fetchConfig = async () => {
            try {
                const confRef = doc(db, 'system', 'config');
                const confSnap = await getDoc(confRef);
                if (confSnap.exists()) {
                    setSysConfig(confSnap.data() as SystemConfig);
                }
            } catch (e) {
                console.warn("No system config found, using defaults");
            }
        };

        const fetchUsage = async () => {
            try {
                // Fetch last 7 days of usage aggregates
                const usageData = [];
                for (let i = 0; i < 7; i++) {
                    const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
                    const docRef = doc(db, 'system_stats', `usage_${date}`);
                    const snap = await getDoc(docRef);
                    if (snap.exists()) {
                        usageData.push({ date, ...snap.data() });
                    } else {
                        usageData.push({ date, gemini_ocr_shift: 0, gemini_ocr_receipt: 0, gemini_voice: 0 });
                    }
                }
                setUsageStats(usageData.reverse());
            } catch (e) {
                console.error("Failed to fetch usage stats", e);
            } finally {
                setLoadingUsage(false);
            }
        };

        if (isAdmin) {
            fetchUsers();
            fetchConfig();
            fetchUsage();

            // Fetch real chart data
            fetchGrowthTrend(7).then(setRealGrowthTrend);
            fetchMrrTrend(6).then(setRealMrrTrend);
            fetchBroadcastHistory(10).then(setBroadcastHistory);

            // Subscribe to live logs
            const logsQ = query(collection(db, 'admin_audit_logs'), orderBy('timestamp', 'desc'), limit(50));
            const unsubLogs = onSnapshot(logsQ, (snap) => {
                const l = snap.docs.map(d => ({ id: d.id, ...d.data() } as SystemLog));
                setLogs(l);
            });

            return () => unsubLogs();
        }
    }, [isAdmin]);

    useEffect(() => {
        const checkApis = async () => {
            if (activeTab === 'integrations') {
                setLoadingApiStatus(true);
                setApiStatus([]); // clear old
                try {
                    const [fb, gemini, env] = await Promise.all([
                        checkFirebaseHealth(),
                        checkGeminiHealth(),
                        Promise.resolve(getAppEnvironmentStatus())
                    ]);
                    setApiStatus([fb, gemini, env]);
                } catch (e) {
                    console.error("Failed to check APIs", e);
                } finally {
                    setLoadingApiStatus(false);
                }
            }
        };
        checkApis();
    }, [activeTab]);

    // Write daily growth + MRR snapshots whenever user count changes.
    // Must be here — BEFORE any early returns — to satisfy Rules of Hooks.
    useEffect(() => {
        if (!isAdmin || allUsers.length === 0) return;
        const pro   = allUsers.filter(u => u.subscription?.tier === 'pro').length;
        const elite = allUsers.filter(u => u.subscription?.tier === 'elite').length;
        const mrr   = pro * 8.99 + elite * 19.99;
        const paid  = pro + elite;
        writeGrowthSnapshot(allUsers.length);
        writeMrrSnapshot(mrr, paid, allUsers.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allUsers.length, isAdmin]);

    // Handlers
    const handleUpdateTier = async (uid: string, newTier: 'free' | 'pro' | 'elite') => {
        try {
            const userRef = doc(db, 'profiles', uid);
            await setDoc(userRef, { subscription: { tier: newTier } }, { merge: true });
            
            // Optimistic Update
            setAllUsers(prev => prev.map(u => 
                u.uid === uid ? { ...u, subscription: { ...u.subscription, tier: newTier, status: 'active' } } : u
            ));
            
            logAdminAction(`Updated user ${uid.slice(0, 8)}... to tier ${newTier.toUpperCase()}`);
            setNotification({ message: `Tier updated to ${newTier.toUpperCase()}`, type: 'success' });
        } catch (e) {
            setNotification({ message: "Failed to update tier", type: 'error' });
        }
    };

    const handleImpersonate = (uid: string) => {
        // Implement read-only router push or state override here
        logAdminAction(`Began impersonation session for ${uid.slice(0, 8)}...`);
        setNotification({ message: `Impersonating User: ${uid.slice(0, 8)}...`, type: 'info' });
    };

    const handleSaveConfig = async () => {
        setSavingConfig(true);
        try {
            await setDoc(doc(db, 'system', 'config'), sysConfig);
            logAdminAction(`Updated global tax/system config`);
            setNotification({ message: "Configuration saved globally", type: 'success' });
        } catch (e) {
            setNotification({ message: "Error saving config", type: 'error' });
        } finally {
            setSavingConfig(false);
        }
    };

    const handleSendBroadcast = async () => {
        if (!broadcastMsg) return;
        setSendingBroadcast(true);
        try {
            await addDoc(collection(db, 'global_notifications'), {
                message: broadcastMsg,
                type: broadcastType,
                timestamp: Date.now(),
                adminId: profile?.uid,
                adminName: profile?.displayName || 'Admin'
            });
            logAdminAction(`SENT BROADCAST: "${broadcastMsg.slice(0, 30)}..."`);
            setNotification({ message: 'Broadcast published to all users', type: 'success' });
            setBroadcastMsg('');
        } catch (e) {
            setNotification({ message: 'Failed to send broadcast', type: 'error' });
        } finally {
            setSendingBroadcast(false);
        }
    };

    const logAdminAction = async (message: string) => {
        try {
            const newLog = doc(collection(db, 'admin_audit_logs'));
            await setDoc(newLog, {
                timestamp: Date.now(),
                level: 'info',
                message: `[${profile?.displayName || 'Admin'}] ${message}`,
                context: 'admin_dashboard'
            });
        } catch (e) {
            console.error("Audit log failed to save", e);
        }
    };

    const handleEnvUpdate = async () => {
        const payload: Record<string, string> = {};
        if (envForm.NEXT_PUBLIC_GEMINI_API_KEY) payload.NEXT_PUBLIC_GEMINI_API_KEY = envForm.NEXT_PUBLIC_GEMINI_API_KEY;
        if (envForm.APP_URL) payload.APP_URL = envForm.APP_URL;

        if (Object.keys(payload).length === 0) {
            setNotification({ message: 'No env changes provided', type: 'error' });
            return;
        }

        await processEnvInjection(payload, () => setEnvForm({ NEXT_PUBLIC_GEMINI_API_KEY: '', APP_URL: '' }));
    };

    const handleCardInlineSave = async (envKey: string) => {
        if (!editingCardValue) { setEditingCard(null); return; }
        await processEnvInjection({ [envKey]: editingCardValue }, () => setEditingCard(null));
    };

    const handleCustomEnvSave = async () => {
        if (!customEnv.key || !customEnv.value) return;
        await processEnvInjection({ [customEnv.key]: customEnv.value }, () => setCustomEnv({ key: '', value: '' }));
    };

    const processEnvInjection = async (payload: Record<string, string>, cleanup: () => void) => {
        setUpdatingEnv(true);
        try {
            const res = await updateEnvVariables(payload);
            if (res.success) {
                setNotification({ message: 'Env Updated. Rebooting Server...', type: 'success' });
                logAdminAction(`Updated local environment (.env) variables: ${Object.keys(payload).join(', ')}`);
                cleanup();
            } else {
                setNotification({ message: res.message || 'Failed to update env', type: 'error' });
            }
        } catch (e: any) {
            setNotification({ message: e.message || 'Server action error', type: 'error' });
        } finally {
            setUpdatingEnv(false);
        }
    };

    if (!isAdmin) return null;

    const filteredUsers = allUsers.filter(u => {
        const dName = u.displayName || 'Unknown Courier';
        const uid = u.uid || '';
        const matchesSearch = dName.toLowerCase().includes(searchQuery.toLowerCase()) || uid.toLowerCase().includes(searchQuery.toLowerCase());
        const uTier = u.subscription?.tier || 'free';
        const matchesTier = tierFilter === 'all' || uTier === tierFilter;
        return matchesSearch && matchesTier;
    });

    // Derived Analytics Statistics
    const tierDistribution = [
        { name: 'Free', value: allUsers.filter(u => !u.subscription?.tier || u.subscription.tier === 'free').length, color: '#314158' },
        { name: 'Pro', value: allUsers.filter(u => u.subscription?.tier === 'pro').length, color: '#3b82f6' },
        { name: 'Elite', value: allUsers.filter(u => u.subscription?.tier === 'elite').length, color: '#39FF14' },
    ];
    
    const topEarners = [...allUsers]
        .sort((a,b) => (b.totalGross || 0) - (a.totalGross || 0))
        .slice(0, 5)
        .map(u => ({ name: u.displayName ? u.displayName.split(' ')[0] : 'Unknown', gross: u.totalGross || 0 }));

    const estMRR = (tierDistribution.find(t => t.name === 'Pro')?.value || 0) * 8.99 +
                   (tierDistribution.find(t => t.name === 'Elite')?.value || 0) * 19.99;

    const arpu = allUsers.length > 0 ? (estMRR / allUsers.length) : 0;
    const paidUsers = (tierDistribution.find(t => t.name === 'Pro')?.value || 0) + (tierDistribution.find(t => t.name === 'Elite')?.value || 0);
    const conversionRate = allUsers.length > 0 ? (paidUsers / allUsers.length) * 100 : 0;
    const churnedUsers = allUsers.filter(u => u.subscription?.status === 'canceled').length;
    const churnRate = allUsers.length > 0 ? (churnedUsers / allUsers.length) * 100 : 0;

    // Use real trend data from Firestore; fall back to zeros while loading
    const growthTrend = realGrowthTrend.length > 0
        ? realGrowthTrend
        : Array.from({ length: 7 }).map((_, i) => ({
            day: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-GB', { weekday: 'short' }),
            users: 0
          }));

    const mrrTrend = realMrrTrend.length > 0
        ? realMrrTrend
        : Array.from({ length: 6 }).map((_, i) => ({
            month: new Date(new Date().setMonth(new Date().getMonth() - (5 - i))).toLocaleDateString('en-GB', { month: 'short' }),
            mrr: 0
          }));

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2 text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[10px] font-black uppercase tracking-widest text-brand">
                        <ShieldCheck size={14} /> SYSTEM ADMINISTRATOR
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter italic leading-none">
                        Veroflow<br/><span className="text-white/20">Command Center</span>
                    </h1>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Active Couriers', value: `${allUsers.length}${allUsers.length >= 100 ? '+' : ''}`, icon: Users, color: 'blue-400' },
                    { label: 'VAT Default', value: `${(sysConfig.VAT_RATE_2026 * 100).toFixed(1)}%`, icon: CreditCard, color: 'brand' },
                    { label: 'Cloud Vision / Gemini', value: '1.5-FLASH', icon: Cpu, color: 'orange-400' },
                    { label: 'Status', value: 'ONLINE', icon: ShieldCheck, color: 'indigo-400' },
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={stat.label} 
                        className="bg-card border border-border p-6 rounded-[32px] space-y-4 relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                                <stat.icon className={`text-${stat.color}`} size={24} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
                            <p className="text-2xl font-display font-black uppercase italic tracking-tighter">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
                {[
                    { id: 'analytics', label: 'Analytics Hub', icon: BarChart4 },
                    { id: 'users', label: 'User Operations', icon: Users },
                    { id: 'broadcast', label: 'Broadcast Control', icon: Zap },
                    { id: 'config', label: 'Tax & Constants', icon: Settings },
                    { id: 'integrations', label: 'API Integrations', icon: Globe },
                    { id: 'logs', label: 'Live Pulse & Logs', icon: TerminalSquare }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                            activeTab === t.id ? 'bg-brand text-bg shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10'
                        }`}
                    >
                        <t.icon size={16} /> {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Contents */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-card border border-border rounded-[40px] overflow-hidden min-h-[400px]"
                >
                    {/* TAB: USERS */}
                    {activeTab === 'users' && (
                        <div className="flex flex-col h-full">
                            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Fleet Management</h3>
                                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                                    <div className="relative w-full md:w-auto">
                                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                        <select 
                                            value={tierFilter} 
                                            onChange={(e) => setTierFilter(e.target.value as any)}
                                            className="w-full md:w-[150px] pl-12 pr-6 py-4 bg-[#0a0a0a] border border-white/10 rounded-2xl text-[10px] font-black tracking-widest uppercase appearance-none focus:outline-none focus:border-brand/40 text-brand"
                                        >
                                            <option value="all">ALL TIERS</option>
                                            <option value="free">FREE</option>
                                            <option value="pro">PRO</option>
                                            <option value="elite">ELITE</option>
                                        </select>
                                    </div>
                                    <div className="relative w-full md:w-auto">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                        <input 
                                            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="SEARCH COURIER OR UID..."
                                            className="w-full md:w-[300px] pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-brand/40"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {loadingUsers ? (
                                <div className="flex-1 flex justify-center items-center py-24">
                                    <RefreshCcw className="animate-spin text-brand" size={32} />
                                </div>
                            ) : (
                                <div className="p-4 md:p-8 overflow-x-auto">
                                    <table className="w-full text-left border-separate border-spacing-y-4">
                                        <thead>
                                            <tr className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                                                <th className="px-6 pb-2">User / Courier</th>
                                                <th className="px-6 pb-2">Gross YTD</th>
                                                <th className="px-6 pb-2">Distance</th>
                                                <th className="px-6 pb-2">Tier Override</th>
                                                <th className="px-6 pb-2 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="space-y-4">
                                            {filteredUsers.map((u) => (
                                                <tr key={u.uid} className="bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                                                    <td className="px-6 py-4 rounded-l-[24px]">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center shrink-0">
                                                                <Users className="text-white/30" size={16} />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-black italic uppercase tracking-tighter leading-none">{u.displayName || 'Unknown Courier'}</p>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{(u.uid || 'N/A').slice(0, 8)}...</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-black italic text-brand">€{(u.totalGross || 0).toLocaleString()}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs font-bold text-white/70">{(u.totalDistance || 0).toLocaleString()} km</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {(['free', 'pro', 'elite'] as const).map(tier => (
                                                                <button
                                                                    key={tier}
                                                                    onClick={() => handleUpdateTier(u.uid, tier)}
                                                                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                                        u.subscription?.tier === tier 
                                                                            ? tier === 'elite' ? 'bg-brand/20 text-brand border-brand/50' 
                                                                            : tier === 'pro' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                                                                            : 'bg-white/10 text-white border-white/20'
                                                                        : 'bg-transparent text-white/30 border-transparent hover:border-white/10'
                                                                    }`}
                                                                >
                                                                    {tier}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right rounded-r-[24px]">
                                                        <button 
                                                            onClick={() => setSelectedUser(u)}
                                                            className="px-4 py-2 bg-white/5 hover:bg-brand hover:text-bg text-brand rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-brand/20 inline-block"
                                                        >
                                                            <span className="flex items-center gap-2 text-inherit">
                                                                <Edit3 size={14} /> Full Profile
                                                            </span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-12 text-white/30 font-black uppercase tracking-widest text-[10px]">
                                                        No couriers found matching query.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: BROADCAST */}
                    {activeTab === 'broadcast' && (
                        <div className="flex flex-col h-full bg-bg space-y-12 p-8 md:p-12 overflow-y-auto">
                            <div className="max-w-4xl space-y-8">
                                <div className="space-y-1">
                                    <h3 className="text-4xl font-black italic uppercase tracking-tighter text-brand">Broadcast Control Room</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                        Send real-time high-priority announcements to all active Finnish couriers.
                                    </p>
                                </div>

                                <div className="bg-card border border-white/5 rounded-[40px] p-8 md:p-12 space-y-8 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8">
                                        <Zap size={60} className="text-brand/5 -rotate-12" />
                                    </div>

                                    <div className="space-y-4 relative z-10">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 px-2 underline decoration-brand/30 underline-offset-4">Announcement Message</label>
                                        <textarea 
                                            value={broadcastMsg}
                                            onChange={(e) => setBroadcastMsg(e.target.value)}
                                            placeholder="e.g. System maintenance at 02:00 UTC. Shift tracking will be offline for 15 mins."
                                            className="w-full h-40 p-8 bg-white/5 border border-white/10 rounded-[30px] font-bold text-lg text-white placeholder:text-white/10 focus:border-brand/50 focus:outline-none transition-all resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 px-2">Notification Level</label>
                                            <div className="flex gap-2">
                                                {(['info', 'success', 'error'] as const).map(t => (
                                                    <button 
                                                        key={t}
                                                        onClick={() => setBroadcastType(t)}
                                                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                            broadcastType === t 
                                                            ? (t === 'error' ? 'bg-red-500 border-red-500 text-white' : t === 'success' ? 'bg-brand border-brand text-bg' : 'bg-blue-500 border-blue-500 text-white')
                                                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                                                        }`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-end">
                                            <button 
                                                onClick={handleSendBroadcast}
                                                disabled={sendingBroadcast || !broadcastMsg}
                                                className="w-full py-6 bg-brand text-bg disabled:opacity-30 disabled:cursor-not-allowed rounded-[30px] font-black italic text-sm uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(57,255,20,0.2)] flex items-center justify-center gap-3"
                                            >
                                                <Radio size={20} className={sendingBroadcast ? 'animate-pulse' : ''} />
                                                {sendingBroadcast ? 'TRANSMITTING...' : 'INITIATE BROADCAST'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 px-2 italic">Broadcast Transmission History</h4>
                                    <div className="bg-white/[0.01] border border-white/5 rounded-[40px] divide-y divide-white/5 overflow-hidden">
                                        {broadcastHistory.length === 0 ? (
                                            <div className="p-8 flex items-center justify-center text-white/10 italic text-[10px] uppercase font-black tracking-widest py-16">
                                                No broadcasts sent yet.
                                            </div>
                                        ) : (
                                            broadcastHistory.map(b => (
                                                <div key={b.id} className="p-6 flex items-start gap-4">
                                                    <span className={`shrink-0 mt-0.5 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                                        b.type === 'error' ? 'bg-red-500/10 text-red-400' :
                                                        b.type === 'success' ? 'bg-brand/10 text-brand' :
                                                        'bg-blue-500/10 text-blue-400'
                                                    }`}>{b.type}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-white/80 truncate">{b.message}</p>
                                                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1">
                                                            {b.adminName} · {new Date(b.timestamp).toLocaleString('en-GB')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: TAX CONFIG */}
                    {activeTab === 'config' && (
                        <div className="flex flex-col h-full p-8 md:p-12 space-y-12 bg-white/[0.02]">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-brand">Global Operation Constants</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 max-w-md">
                                        Adjust Finnish tax values and model defaults globally. Changes bypass code deployments.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50">VAT Rate (e.g. 0.255)</label>
                                        <input 
                                            type="number" step="0.005"
                                            value={sysConfig.VAT_RATE_2026}
                                            onChange={(e) => setSysConfig(p => ({...p, VAT_RATE_2026: parseFloat(e.target.value)}))}
                                            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-black italic text-xl focus:border-brand/50 focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Standard Mileage Deduction (€/km)</label>
                                        <input 
                                            type="number" step="0.01"
                                            value={sysConfig.MILEAGE_RATE_2026}
                                            onChange={(e) => setSysConfig(p => ({...p, MILEAGE_RATE_2026: parseFloat(e.target.value)}))}
                                            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-black italic text-xl focus:border-brand/50 focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Production Gemini Model</label>
                                        <input 
                                            type="text"
                                            value={sysConfig.GEMINI_MODEL}
                                            onChange={(e) => setSysConfig(p => ({...p, GEMINI_MODEL: e.target.value}))}
                                            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-black italic text-xl focus:border-brand/50 focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Allow Open Signups</label>
                                        <div className="flex items-center gap-4 h-full">
                                            <button 
                                                onClick={() => setSysConfig(p => ({...p, ALLOW_NEW_SIGNUPS: !p.ALLOW_NEW_SIGNUPS}))}
                                                className={`px-6 py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all ${
                                                    sysConfig.ALLOW_NEW_SIGNUPS ? 'bg-brand text-bg shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'bg-red-500 text-white'
                                                }`}
                                            >
                                                {sysConfig.ALLOW_NEW_SIGNUPS ? 'ENABLED' : 'DISABLED'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Anti-Spam Feed Throttling (Hours)</label>
                                        <div className="flex gap-4">
                                            <input 
                                                type="number" step="0.5" min="0" placeholder="e.g. 1"
                                                value={sysConfig.SPAM_LIMIT_HOURS}
                                                onChange={(e) => setSysConfig(p => ({...p, SPAM_LIMIT_HOURS: parseFloat(e.target.value)}))}
                                                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-black italic text-xl focus:border-brand/50 focus:outline-none"
                                            />
                                            <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest flex items-center">
                                                Set to 0 to disable throttling
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-8 flex justify-end">
                                    <button 
                                        onClick={handleSaveConfig}
                                        disabled={savingConfig}
                                        className="px-8 py-4 bg-brand text-bg rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        <ShieldCheck size={18} /> {savingConfig ? 'DEPLOYING...' : 'DEPLOY TO PRODUCTION'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: API INTEGRATIONS */}
                    {activeTab === 'integrations' && (
                        <div className="flex flex-col h-full bg-bg">
                            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                                        <Globe className="text-brand" /> Env API Integrations
                                    </h3>
                                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-2 max-w-lg">
                                        Automatically audits your .env endpoints and performs a live latency ping test to Google GenAI, Firebase, and Edge hosts.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setActiveTab('users')}
                                    className="px-6 py-3 bg-white/5 hover:bg-brand hover:text-bg text-brand border border-brand/20 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all shadow-[0_0_15px_rgba(57,255,20,0.1)]"
                                >
                                    <Activity className="inline-block mr-2" size={14} /> Refetch Matrix
                                </button>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                {loadingApiStatus ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-white/50 space-y-4">
                                        <RefreshCcw className="animate-spin text-brand" size={40} />
                                        <p className="font-black uppercase tracking-widest text-xs animate-pulse">Running Diagnostic Pings...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {apiStatus.map(status => (
                                            <div key={status.service} className="p-6 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-3xl space-y-4 transition-all">
                                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                    <span className="text-sm font-black italic uppercase tracking-tighter flex items-center gap-2">
                                                        <Globe size={16} className="text-brand/50" /> {status.service}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {status.envKey && (
                                                            <button 
                                                                onClick={() => { setEditingCard(status.envKey!); setEditingCardValue(''); }} 
                                                                className="px-2 py-1 bg-white/5 hover:bg-brand hover:text-bg text-white/70 hover:text-bg rounded-md transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-white/10"
                                                                title="Edit Environment Key"
                                                            >
                                                                <Edit3 size={12} /> EDIT
                                                            </button>
                                                        )}
                                                        <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-[0.2em] ${
                                                            status.status === 'ONLINE' ? 'bg-brand/10 text-brand border border-brand/20' :
                                                            status.status === 'UNCONFIGURED' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                                            'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        }`}>
                                                            {status.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {editingCard === status.envKey ? (
                                                    <div className="flex flex-col gap-2 mt-4 animate-in fade-in slide-in-from-top-2 bg-black/20 p-4 rounded-2xl border border-brand/20">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-brand">Update {status.envKey}</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <input 
                                                                type="text" 
                                                                value={editingCardValue}
                                                                onChange={e => setEditingCardValue(e.target.value)}
                                                                placeholder={`New value...`}
                                                                className="flex-1 p-2 bg-black/50 border border-brand/50 rounded-lg text-xs font-mono focus:outline-none placeholder:text-white/20"
                                                                autoFocus
                                                            />
                                                            <button 
                                                                onClick={() => handleCardInlineSave(status.envKey!)}
                                                                disabled={updatingEnv}
                                                                className="px-4 py-2 bg-brand text-bg rounded-lg hover:scale-105 transition-transform text-[10px] font-black uppercase tracking-widest"
                                                            >
                                                                Save
                                                            </button>
                                                            <button 
                                                                onClick={() => setEditingCard(null)}
                                                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10 text-[10px] font-black uppercase tracking-widest"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3 pt-2">
                                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest border-b border-white/5 pb-2">
                                                            <span className="text-white/30">Env Key Configured:</span>
                                                            <span className={status.configured ? 'text-white' : 'text-red-400'}>{status.configured ? 'YES' : 'MISSING'}</span>
                                                        </div>
                                                    {status.latencyMs !== undefined && (
                                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest border-b border-white/5 pb-2">
                                                            <span className="text-white/30">Connectivity Time:</span>
                                                            <span className="text-white">{status.latencyMs} <span className="text-white/50">ms</span></span>
                                                        </div>
                                                    )}
                                                    {status.message && (
                                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest border-b border-white/5 pb-2 text-red-300">
                                                            <span className="text-white/30">Message:</span>
                                                            <span className="text-right truncate max-w-[150px]">{status.message}</span>
                                                        </div>
                                                    )}
                                                    {status.metadata && Object.entries(status.metadata).map(([k, v]) => (
                                                        <div key={k} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest border-b border-white/5 pb-2">
                                                            <span className="text-white/30">{k}:</span>
                                                            <span className="text-white truncate max-w-[150px] text-right">{v}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ADD NEW API CONFIGURATION */}
                                <div id="add-new-api-section" className="mt-8 p-8 bg-brand/5 border border-brand/20 rounded-3xl space-y-6">
                                    <h4 className="text-xl font-black italic uppercase tracking-tighter text-brand flex items-center gap-2">
                                        <Plus size={20} /> Add New API
                                    </h4>
                                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest max-w-2xl">
                                        Inject custom keys directly into your .env.local file. Useful for adding Webhook URLs, Stripe Keys, or standard config variables dynamically.
                                    </p>
                                    <div className="flex flex-col md:flex-row gap-4 w-full">
                                        <input 
                                            type="text" 
                                            value={customEnv.key} 
                                            onChange={e => setCustomEnv(p => ({...p, key: e.target.value.toUpperCase().replace(/\s+/g, '_')}))} 
                                            placeholder="KEY_NAME (e.g. STRIPE_SECRET_KEY)" 
                                            className="flex-[1] p-4 bg-black/50 border border-white/10 rounded-2xl font-mono text-sm focus:border-brand/40 focus:outline-none uppercase" 
                                        />
                                        <input 
                                            type="text" 
                                            value={customEnv.value} 
                                            onChange={e => setCustomEnv(p => ({...p, value: e.target.value}))} 
                                            placeholder="Value..." 
                                            className="flex-[2] p-4 bg-black/50 border border-white/10 rounded-2xl font-mono text-sm focus:border-brand/40 focus:outline-none" 
                                        />
                                        <button 
                                            onClick={handleCustomEnvSave}
                                            disabled={updatingEnv || !customEnv.key || !customEnv.value}
                                            className="px-8 py-4 bg-brand text-bg disabled:opacity-50 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                                        >
                                            <Save className="inline-block mr-2" size={16} /> 
                                            Inject & Reload
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: SYSTEM LOGS */}
                    {activeTab === 'logs' && (
                        <div className="flex flex-col h-full bg-[#050505]">
                            <div className="p-6 border-b border-white/5 flex gap-4 items-center bg-white/[0.02]">
                                <TerminalSquare className="text-brand" size={24} />
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">Real-Time Audit Firehose</h3>
                            </div>
                            <div className="p-6 space-y-2 font-mono text-[11px] h-[500px] overflow-y-auto">
                                {logs.length === 0 ? (
                                    <div className="text-white/30 flex gap-2">
                                        <span className="animate-pulse">_</span> Waiting for log stream... (actions are logged here)
                                    </div>
                                ) : (
                                    logs.map(log => (
                                        <div key={log.id} className="flex gap-4 border-b border-white/[0.02] pb-2 text-white/60 hover:text-white transition-colors">
                                            <span className="text-white/30 shrink-0 w-20">
                                                {new Date(log.timestamp).toLocaleTimeString('en-GB')}
                                            </span>
                                            <span className={`shrink-0 uppercase font-black tracking-widest w-16 ${
                                                log.level === 'warn' ? 'text-orange-400' :
                                                log.level === 'error' ? 'text-red-400' : 'text-brand'
                                            }`}>
                                                [{log.level}]
                                            </span>
                                            <span className="break-all">{log.message}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: ANALYTICS HUB */}
                    {activeTab === 'analytics' && (
                        <div className="flex flex-col h-full bg-bg p-6 md:p-8 space-y-8">
                            <div className="flex justify-between items-end border-b border-white/5 pb-6">
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                                        <BarChart4 className="text-brand" /> SaaS Metrics & Operations
                                    </h3>
                                    <p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">Platform-wide financial insights</p>
                                </div>
                            </div>
                            
                            {/* KPI Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <p className="text-[10px] text-white/50 font-black tracking-widest uppercase mb-1">Monthly Recurring Rev</p>
                                    <p className="text-3xl text-brand font-black italic tracking-tighter">€{estMRR.toFixed(2)}</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <p className="text-[10px] text-white/50 font-black tracking-widest uppercase mb-1">Avg Rev Per User (ARPU)</p>
                                    <p className="text-3xl text-white font-black italic tracking-tighter">€{arpu.toFixed(2)}</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <p className="text-[10px] text-white/50 font-black tracking-widest uppercase mb-1">Paid Conversion Rate</p>
                                    <p className="text-3xl text-white font-black italic tracking-tighter">{conversionRate.toFixed(1)}%</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <p className="text-[10px] text-white/50 font-black tracking-widest uppercase mb-1">Churn Rate (Monthly)</p>
                                    <p className="text-3xl text-red-500 font-black italic tracking-tighter">{churnRate.toFixed(1)}%</p>
                                </div>
                            </div>
                            
                            {/* Charts Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Chart 0: MRR Trend */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 lg:p-8 space-y-6 lg:col-span-2">
                                    <div className="flex items-center gap-2 text-white/70">
                                        <TrendingUp size={20} />
                                        <h4 className="text-sm font-black uppercase tracking-widest">MRR Growth (6 Months)</h4>
                                    </div>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={mrrTrend}>
                                                <defs>
                                                    <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                                <XAxis dataKey="month" stroke="#333" tick={{fill: '#666', fontSize: 10, fontWeight: 900}} />
                                                <YAxis stroke="#333" tick={{fill: '#666', fontSize: 10}} tickFormatter={(val) => `€${val}`} />
                                                <RechartsTooltip 
                                                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '16px' }}
                                                    itemStyle={{ color: '#3b82f6', fontWeight: 900 }}
                                                    formatter={(value) => [`€${value}`, 'Est. MRR']}
                                                />
                                                <Area type="monotone" dataKey="mrr" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMRR)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                {/* Chart 1: Tier Distribution */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 lg:p-8 space-y-6">
                                    <div className="flex items-center gap-2 text-white/70">
                                        <PieChartIcon size={20} />
                                        <h4 className="text-sm font-black uppercase tracking-widest">Subscription Tiers</h4>
                                    </div>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={tierDistribution}
                                                    cx="50%" cy="50%"
                                                    innerRadius={60} outerRadius={90}
                                                    paddingAngle={5}
                                                    dataKey="value" stroke="none"
                                                >
                                                    {tierDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip 
                                                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '16px' }}
                                                    itemStyle={{ color: '#fff', fontWeight: 900, textTransform: 'uppercase' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex justify-center gap-6">
                                        {tierDistribution.map(t => (
                                            <div key={t.name} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }}></div>
                                                {t.name} ({t.value})
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Chart 2: Fleet Growth Trend */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 lg:p-8 space-y-6">
                                    <div className="flex items-center gap-2 text-white/70">
                                        <TrendingUp size={20} />
                                        <h4 className="text-sm font-black uppercase tracking-widest">Courier Growth (7d)</h4>
                                    </div>
                                    <div className="h-[280px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={growthTrend}>
                                                <defs>
                                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#39FF14" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="day" stroke="#333" tick={{fill: '#666', fontSize: 10, fontWeight: 900}} />
                                                <RechartsTooltip 
                                                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '16px' }}
                                                    itemStyle={{ color: '#39FF14', fontWeight: 900 }}
                                                />
                                                <Area type="monotone" dataKey="users" stroke="#39FF14" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Chart: AI API Usage */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 lg:p-8 space-y-6 col-span-full">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-white/70">
                                            <Zap size={20} className="text-brand" />
                                            <h4 className="text-sm font-black uppercase tracking-widest">AI API Usage (Last 7 Days)</h4>
                                        </div>
                                        <div className="text-[10px] font-black tracking-widest uppercase text-white/30">
                                            Aggregated from system_stats
                                        </div>
                                    </div>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={usageStats}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                                <XAxis dataKey="date" stroke="#333" tick={{fill: '#666', fontSize: 10, fontWeight: 900}} />
                                                <YAxis stroke="#333" tick={{fill: '#666', fontSize: 10}} />
                                                <RechartsTooltip 
                                                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '16px' }}
                                                    itemStyle={{ fontWeight: 900 }}
                                                />
                                                <Bar dataKey="gemini_ocr_shift" name="Shift OCR" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="gemini_ocr_receipt" name="Receipt OCR" fill="#39FF14" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="gemini_voice" name="Voice Parse" fill="#a855f7" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Chart 3: Top Earners (Gross YTD) */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 lg:p-8 space-y-6 lg:col-span-2">
                                    <div className="flex items-center gap-2 text-white/70">
                                        <Activity size={20} />
                                        <h4 className="text-sm font-black uppercase tracking-widest">Top Earners (Gross YTD)</h4>
                                    </div>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={topEarners} layout="vertical" margin={{ left: 20 }}>
                                                <XAxis type="number" stroke="#333" tick={{fill: '#666', fontSize: 10}} />
                                                <YAxis dataKey="name" type="category" stroke="#333" tick={{fill: '#aaa', fontSize: 10, fontWeight: 900}} width={100} />
                                                <RechartsTooltip 
                                                    cursor={{fill: '#111'}}
                                                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '16px' }}
                                                    itemStyle={{ color: '#39FF14', fontWeight: 900 }}
                                                    formatter={(value) => [`€${value}`, 'Gross YTD']}
                                                />
                                                <Bar dataKey="gross" fill="#39FF14" radius={[0, 8, 8, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* USER DEEP DIVE MODAL */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedUser(null)}
                            className="absolute inset-0 bg-bg/90 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-card border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-brand/10 border border-brand/30 rounded-2xl flex items-center justify-center">
                                        <Users className="text-brand" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Courier Profile</h2>
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{selectedUser.uid}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedUser(null)}
                                    className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white/50 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white/5 p-6 rounded-3xl space-y-2">
                                        <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Display Name</p>
                                        <p className="text-lg font-black italic uppercase tracking-tighter">{selectedUser.displayName || 'Unnamed'}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-3xl space-y-2">
                                        <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Subscription Tier</p>
                                        <p className="text-lg font-black italic uppercase tracking-tighter text-brand">{selectedUser.subscription?.tier?.toUpperCase() || 'FREE'}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-3xl space-y-2">
                                        <p className="text-[10px] font-black uppercase text-white/30 tracking-widest">Gross Lifetime</p>
                                        <p className="text-lg font-black italic uppercase tracking-tighter text-blue-400">€{(selectedUser.totalGross || 0).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/30 px-2">Administrative Controls</h4>
                                    <div className="flex flex-wrap gap-4">
                                        <button 
                                            onClick={() => handleImpersonate(selectedUser.uid)}
                                            className="px-6 py-4 bg-white/5 hover:bg-brand hover:text-bg text-brand border border-brand/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            <PlaySquare size={16} className="inline mr-2" /> Launch Impersonation
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateTier(selectedUser.uid, 'pro')}
                                            className="px-6 py-4 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Grant Pro Access
                                        </button>
                                        <button 
                                            onClick={() => {
                                                logAdminAction(`Manually reset cache for user ${selectedUser.uid}`);
                                                setNotification({ message: 'User cache invalidated', type: 'success' });
                                            }}
                                            className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white/70 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all"
                                        >
                                            <RefreshCcw size={16} className="inline mr-2" /> Invalidate Cache
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                if (!confirm('REALLY DISABLE THIS USER? They will be unable to log in.')) return;
                                                try {
                                                    const token = await getAuth().currentUser?.getIdToken();
                                                    const res = await fetch('/api/admin/disable-user', {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                                                        },
                                                        body: JSON.stringify({ uid: selectedUser.uid }),
                                                    });
                                                    if (res.ok) {
                                                        logAdminAction(`DISABLED user ${selectedUser.uid}`);
                                                        setNotification({ message: 'User account disabled in Firebase Auth', type: 'error' });
                                                        setSelectedUser(null);
                                                    } else {
                                                        setNotification({ message: 'Failed to disable user', type: 'error' });
                                                    }
                                                } catch {
                                                    setNotification({ message: 'Network error disabling user', type: 'error' });
                                                }
                                            }}
                                            className="px-6 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            <UserX size={16} className="inline mr-2" /> Deactivate Account
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/30">Technical Profile (JSON)</h4>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedUser, null, 2))}
                                            className="text-[10px] font-black uppercase text-brand hover:underline"
                                        >
                                            Copy JSON
                                        </button>
                                    </div>
                                    <div className="bg-black/40 border border-white/5 rounded-3xl p-6 overflow-x-auto">
                                        <pre className="text-[10px] font-mono text-white/50 leading-relaxed">
                                            {JSON.stringify(selectedUser, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end shrink-0">
                                <button 
                                    onClick={() => setSelectedUser(null)}
                                    className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Close Inspector
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
