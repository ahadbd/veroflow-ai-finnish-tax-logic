'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Zap, Lock } from 'lucide-react';
import { useVero } from './VeroProvider';
import { computeGamification, getLevel, LEVEL_THRESHOLDS } from '@/lib/gamification';

// ── Level badge colours ──────────────────────────────────────────────────────
const LEVEL_COLORS: Record<number, { ring: string; glow: string; badge: string }> = {
  1:  { ring: '#6b7280', glow: 'rgba(107,114,128,0.4)',  badge: 'bg-gray-700 text-gray-300' },
  2:  { ring: '#9ca3af', glow: 'rgba(156,163,175,0.4)',  badge: 'bg-gray-600 text-gray-200' },
  3:  { ring: '#60a5fa', glow: 'rgba(96,165,250,0.4)',   badge: 'bg-blue-900 text-blue-300' },
  4:  { ring: '#34d399', glow: 'rgba(52,211,153,0.4)',   badge: 'bg-emerald-900 text-emerald-300' },
  5:  { ring: '#a78bfa', glow: 'rgba(167,139,250,0.4)',  badge: 'bg-violet-900 text-violet-300' },
  6:  { ring: '#f59e0b', glow: 'rgba(245,158,11,0.4)',   badge: 'bg-amber-900 text-amber-300' },
  7:  { ring: '#f97316', glow: 'rgba(249,115,22,0.4)',   badge: 'bg-orange-900 text-orange-300' },
  8:  { ring: '#ef4444', glow: 'rgba(239,68,68,0.4)',    badge: 'bg-red-900 text-red-300' },
  9:  { ring: '#ec4899', glow: 'rgba(236,72,153,0.4)',   badge: 'bg-pink-900 text-pink-300' },
  10: { ring: '#39FF14', glow: 'rgba(57,255,20,0.5)',    badge: 'bg-brand/20 text-brand' },
};

// Need to export from gamification.ts — pull LEVEL_THRESHOLDS here
const LEVEL_NAMES = ['Rookie','Beginner','Regular','Steady','Pro','Expert','Elite','Master','Legend','GOAT'];

export default function GamificationPanel() {
  const { shifts, receipts } = useVero();

  const stats = useMemo(() => computeGamification(shifts, receipts), [shifts, receipts]);
  const { level, xpToNextLevel, xpCurrentLevelStart, streak, longestStreak, totalXP, achievements } = stats;

  const levelInfo = LEVEL_COLORS[level] ?? LEVEL_COLORS[10];
  const levelName = LEVEL_NAMES[level - 1];

  // XP ring progress within current level
  const nextThreshold = typeof LEVEL_THRESHOLDS !== 'undefined'
    ? (LEVEL_THRESHOLDS as number[])[level] ?? totalXP
    : totalXP;
  const xpInLevel = totalXP - xpCurrentLevelStart;
  const xpNeeded  = nextThreshold - xpCurrentLevelStart;
  const xpPct     = level >= 10 ? 1 : Math.min(xpInLevel / xpNeeded, 1);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const R = 38; // SVG ring radius

  return (
    <div className="bg-card rounded-3xl border border-border p-5 sm:p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Trophy size={16} className="text-brand" />
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Progress</h2>
        </div>
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
          {unlockedCount}/{achievements.length} unlocked
        </span>
      </div>

      {/* ── Level + XP ring ── */}
      <div className="flex items-center gap-5">
        {/* Ring */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width="100" height="100" className="-rotate-90">
            <circle cx="50" cy="50" r={R} fill="none" stroke="#1c1c1c" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r={R}
              fill="none"
              stroke={levelInfo.ring}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * R}`}
              initial={{ strokeDashoffset: 2 * Math.PI * R }}
              animate={{ strokeDashoffset: 2 * Math.PI * R * (1 - xpPct) }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
              style={{ filter: `drop-shadow(0 0 6px ${levelInfo.ring})` }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-black text-white leading-none">{level}</span>
            <span className="text-[8px] font-black text-gray-500 uppercase">LVL</span>
          </div>
        </div>

        {/* Level info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${levelInfo.badge}`}>
              {levelName}
            </span>
            <span className="text-[10px] text-gray-500 font-bold">{totalXP.toLocaleString()} XP</span>
          </div>
          {/* XP bar */}
          <div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: levelInfo.ring, boxShadow: `0 0 8px ${levelInfo.glow}` }}
                initial={{ width: 0 }}
                animate={{ width: `${xpPct * 100}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
            <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1">
              {level < 10 ? `${xpToNextLevel.toLocaleString()} XP to ${LEVEL_NAMES[level]}` : 'MAX LEVEL'}
            </p>
          </div>

          {/* Streak pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <motion.div
                animate={streak > 0 ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.8 }}
              >
                <Flame size={14} className={streak >= 3 ? 'text-orange-400' : 'text-gray-600'} />
              </motion.div>
              <span className={`text-sm font-black ${streak >= 3 ? 'text-orange-400' : 'text-gray-500'}`}>
                {streak}d
              </span>
              <span className="text-[9px] text-gray-600 font-black uppercase">streak</span>
            </div>
            {longestStreak > 0 && (
              <span className="text-[9px] text-gray-600 font-black">
                Best: {longestStreak}d
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Achievements grid ── */}
      <div>
        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3">Achievements</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {achievements.map((ach, i) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <div
                className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border text-center transition-all
                  ${ach.unlocked
                    ? 'bg-brand/5 border-brand/20 shadow-[0_0_12px_rgba(57,255,20,0.08)]'
                    : 'bg-white/[0.02] border-white/5 opacity-50'
                  }`}
              >
                {/* Emoji icon */}
                <span className="text-2xl leading-none select-none">{ach.icon}</span>

                {/* Lock overlay */}
                {!ach.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
                    <Lock size={12} className="text-gray-600" />
                  </div>
                )}

                <p className="text-[8px] font-black text-gray-400 leading-tight line-clamp-2">{ach.label}</p>

                {/* Progress bar (partial) */}
                {!ach.unlocked && ach.progress !== undefined && ach.progress > 0 && (
                  <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand/40 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${ach.progress * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.04 }}
                    />
                  </div>
                )}

                {/* Unlocked XP badge */}
                {ach.unlocked && (
                  <span className="text-[7px] font-black text-brand">+{ach.xpReward} XP</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Weekly pulse ── */}
      <div className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-2xl border border-white/5">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-brand" />
          <span className="text-xs font-black text-white">This Week</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[...Array(7)].map((_, d) => (
            <div
              key={d}
              className={`w-3 h-3 rounded-sm transition-all ${
                d < stats.weeklyShifts
                  ? 'bg-brand shadow-[0_0_6px_rgba(57,255,20,0.4)]'
                  : 'bg-white/5'
              }`}
            />
          ))}
          <span className="text-[9px] text-gray-500 font-black ml-1">{stats.weeklyShifts}/7</span>
        </div>
      </div>
    </div>
  );
}
