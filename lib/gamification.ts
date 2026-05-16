/**
 * lib/gamification.ts
 * Pure functions for VeroFlow gamification: streaks, XP, achievements.
 * All computations are derived from existing Shift[] and Receipt[] data —
 * no additional Firestore reads required.
 */

import { Shift, Receipt } from '@/types';

// ── Types ───────────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: string;          // emoji
  xpReward: number;
  unlocked: boolean;
  progress?: number;     // 0-1 for partial badges
  progressLabel?: string;
}

export interface GamificationStats {
  streak: number;          // current consecutive-day streak
  longestStreak: number;
  totalXP: number;
  level: number;           // 1-10
  xpToNextLevel: number;
  xpCurrentLevelStart: number;
  achievements: Achievement[];
  weeklyShifts: number;    // shifts this calendar week
}

// ── XP thresholds per level ─────────────────────────────────────────────────
// Level 1 = 0 XP, Level 2 = 100, etc.
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1500, 2400, 3800, 6000, 10000, Infinity];
const LEVEL_NAMES      = ['Rookie', 'Beginner', 'Regular', 'Steady', 'Pro', 'Expert', 'Elite', 'Master', 'Legend', 'GOAT'];

export function getLevel(xp: number): { level: number; name: string; xpToNext: number; xpLevelStart: number } {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  level = Math.min(level, 10);
  return {
    level,
    name: LEVEL_NAMES[level - 1],
    xpToNext: LEVEL_THRESHOLDS[level] - xp,
    xpLevelStart: LEVEL_THRESHOLDS[level - 1],
  };
}

// ── Streak calculation ──────────────────────────────────────────────────────
/** Returns current consecutive calendar-day streak (today counts if shift logged today). */
export function calculateStreak(shifts: Shift[]): { current: number; longest: number } {
  if (shifts.length === 0) return { current: 0, longest: 0 };

  // Collect unique dates as YYYY-MM-DD strings
  const daySet = new Set(
    shifts.map(s => new Date(s.date).toISOString().split('T')[0])
  );
  const days = Array.from(daySet).sort().reverse(); // newest first

  const today    = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Streak must include today or yesterday (gap-tolerance of 1 day)
  if (days[0] !== today && days[0] !== yesterday) {
    return { current: 0, longest: computeLongest(days) };
  }

  let current = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diffDays === 1) current++;
    else break;
  }
  return { current, longest: Math.max(current, computeLongest(days)) };
}

function computeLongest(sortedDaysDesc: string[]): number {
  if (sortedDaysDesc.length === 0) return 0;
  let best = 1, run = 1;
  for (let i = 1; i < sortedDaysDesc.length; i++) {
    const prev = new Date(sortedDaysDesc[i - 1]);
    const curr = new Date(sortedDaysDesc[i]);
    if (Math.round((prev.getTime() - curr.getTime()) / 86400000) === 1) {
      run++; best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

// ── XP calculation ──────────────────────────────────────────────────────────
export function calculateXP(shifts: Shift[], receipts: Receipt[], streak: number): number {
  const shiftXP   = shifts.length * 10;
  const kmXP      = Math.floor(shifts.reduce((a, s) => a + s.distanceKm, 0));
  const tipXP     = shifts.filter(s => s.tips > 0).length * 5;
  const receiptXP = receipts.length * 5;
  const streakXP  = streak * 3;
  return shiftXP + kmXP + tipXP + receiptXP + streakXP;
}

// ── Weekly shifts ───────────────────────────────────────────────────────────
export function weeklyShiftCount(shifts: Shift[]): number {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // ISO week Mon
  monday.setHours(0, 0, 0, 0);
  return shifts.filter(s => new Date(s.date) >= monday).length;
}

// ── Achievements ────────────────────────────────────────────────────────────
export function computeAchievements(shifts: Shift[], receipts: Receipt[], streak: number): Achievement[] {
  const totalKm    = shifts.reduce((a, s) => a + s.distanceKm, 0);
  const totalGross = shifts.reduce((a, s) => a + s.grossPay, 0);
  const tipsCount  = shifts.filter(s => s.tips > 0).length;
  const weekShifts = weeklyShiftCount(shifts);

  return [
    {
      id: 'first_shift',
      label: 'First Delivery',
      description: 'Complete your first shift',
      icon: '🚀',
      xpReward: 10,
      unlocked: shifts.length >= 1,
    },
    {
      id: 'shifts_10',
      label: 'Getting Started',
      description: 'Complete 10 shifts',
      icon: '📦',
      xpReward: 50,
      unlocked: shifts.length >= 10,
      progress: Math.min(shifts.length / 10, 1),
      progressLabel: `${shifts.length}/10`,
    },
    {
      id: 'shifts_50',
      label: 'Road Warrior',
      description: 'Complete 50 shifts',
      icon: '🛣️',
      xpReward: 200,
      unlocked: shifts.length >= 50,
      progress: Math.min(shifts.length / 50, 1),
      progressLabel: `${shifts.length}/50`,
    },
    {
      id: 'km_100',
      label: '100 KM Club',
      description: 'Drive 100 km total',
      icon: '💯',
      xpReward: 100,
      unlocked: totalKm >= 100,
      progress: Math.min(totalKm / 100, 1),
      progressLabel: `${totalKm.toFixed(0)}/100 km`,
    },
    {
      id: 'km_500',
      label: '500 KM Legend',
      description: 'Drive 500 km total',
      icon: '⚡',
      xpReward: 500,
      unlocked: totalKm >= 500,
      progress: Math.min(totalKm / 500, 1),
      progressLabel: `${totalKm.toFixed(0)}/500 km`,
    },
    {
      id: 'streak_3',
      label: 'On a Roll',
      description: '3-day delivery streak',
      icon: '🔥',
      xpReward: 30,
      unlocked: streak >= 3,
      progress: Math.min(streak / 3, 1),
      progressLabel: `${streak}/3 days`,
    },
    {
      id: 'streak_7',
      label: 'Week Warrior',
      description: '7-day streak — entire week!',
      icon: '🏆',
      xpReward: 150,
      unlocked: streak >= 7,
      progress: Math.min(streak / 7, 1),
      progressLabel: `${streak}/7 days`,
    },
    {
      id: 'tip_master',
      label: 'Tip Magnet',
      description: 'Receive tips in 10 shifts',
      icon: '💰',
      xpReward: 75,
      unlocked: tipsCount >= 10,
      progress: Math.min(tipsCount / 10, 1),
      progressLabel: `${tipsCount}/10`,
    },
    {
      id: 'receipt_10',
      label: 'Expense Pro',
      description: 'Log 10 business expenses',
      icon: '🧾',
      xpReward: 50,
      unlocked: receipts.length >= 10,
      progress: Math.min(receipts.length / 10, 1),
      progressLabel: `${receipts.length}/10`,
    },
    {
      id: 'gross_1000',
      label: '€1K Earner',
      description: 'Earn €1,000 gross total',
      icon: '💎',
      xpReward: 300,
      unlocked: totalGross >= 1000,
      progress: Math.min(totalGross / 1000, 1),
      progressLabel: `€${totalGross.toFixed(0)}/€1000`,
    },
    {
      id: 'week_7',
      label: 'Full Week',
      description: '7 shifts in a single week',
      icon: '📅',
      xpReward: 100,
      unlocked: weekShifts >= 7,
      progress: Math.min(weekShifts / 7, 1),
      progressLabel: `${weekShifts}/7 this week`,
    },
    {
      id: 'gross_10000',
      label: 'High Roller',
      description: 'Earn €10,000 gross lifetime',
      icon: '🌟',
      xpReward: 1000,
      unlocked: totalGross >= 10000,
      progress: Math.min(totalGross / 10000, 1),
      progressLabel: `€${totalGross.toFixed(0)}/€10k`,
    },
  ];
}

// ── Main entry ──────────────────────────────────────────────────────────────
export function computeGamification(shifts: Shift[], receipts: Receipt[]): GamificationStats {
  const { current, longest } = calculateStreak(shifts);
  const totalXP = calculateXP(shifts, receipts, current);
  const { level, xpToNext, xpLevelStart } = getLevel(totalXP);
  const achievements = computeAchievements(shifts, receipts, current);
  const weekShifts = weeklyShiftCount(shifts);

  return {
    streak: current,
    longestStreak: longest,
    totalXP,
    level,
    xpToNextLevel: xpToNext,
    xpCurrentLevelStart: xpLevelStart,
    achievements,
    weeklyShifts: weekShifts,
  };
}
