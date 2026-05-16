/**
 * admin-stats.ts
 * Helpers for tracking Gemini API usage and writing/reading
 * admin analytics snapshots in Firestore.
 *
 * Firestore schema:
 *   system_stats/usage_YYYY-MM-DD  { gemini_ocr_shift, gemini_ocr_receipt, gemini_voice, activeUsers }
 *   system_stats/mrr_YYYY-MM       { mrr, paidUsers, totalUsers }
 *   system_stats/growth_YYYY-MM-DD { totalUsers }
 */

import { db } from '@/firebase';
import {
  doc,
  getDoc,
  setDoc,
  increment,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

// ─── Gemini Call Tracking ─────────────────────────────────────────────────────

export type GeminiCallType = 'gemini_ocr_shift' | 'gemini_ocr_receipt' | 'gemini_voice';

/**
 * Call this every time a Gemini API call is made (OCR or voice parse).
 * Atomically increments the day's usage counter in Firestore.
 */
export async function trackGeminiCall(type: GeminiCallType): Promise<void> {
  try {
    const date = new Date().toISOString().split('T')[0];
    const ref = doc(db, 'system_stats', `usage_${date}`);
    await setDoc(ref, { [type]: increment(1) }, { merge: true });
  } catch {
    // Non-critical — don't block caller
  }
}

// ─── Growth Snapshot (daily user count) ──────────────────────────────────────

/**
 * Write today's total user count snapshot.
 * Call once per admin dashboard load so the graph accumulates real data.
 */
export async function writeGrowthSnapshot(totalUsers: number): Promise<void> {
  try {
    const date = new Date().toISOString().split('T')[0];
    const ref = doc(db, 'system_stats', `growth_${date}`);
    const snap = await getDoc(ref);
    // Only write if this day doesn't have a record yet (or update if higher)
    if (!snap.exists() || (snap.data()?.totalUsers ?? 0) < totalUsers) {
      await setDoc(ref, { date, totalUsers }, { merge: true });
    }
  } catch {
    // Non-critical
  }
}

/**
 * Read the last N days of growth snapshots for the user-growth chart.
 */
export async function fetchGrowthTrend(
  days = 7
): Promise<{ day: string; users: number }[]> {
  const results: { day: string; users: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    const ref = doc(db, 'system_stats', `growth_${date}`);
    const snap = await getDoc(ref);
    const dayLabel = new Date(Date.now() - i * 86400000).toLocaleDateString('en-GB', {
      weekday: 'short',
    });
    results.push({ day: dayLabel, users: snap.exists() ? (snap.data()?.totalUsers ?? 0) : 0 });
  }
  return results;
}

// ─── MRR Snapshot (monthly) ───────────────────────────────────────────────────

/**
 * Write this month's MRR snapshot.
 * Call from admin dashboard after user list loads.
 */
export async function writeMrrSnapshot(
  mrr: number,
  paidUsers: number,
  totalUsers: number
): Promise<void> {
  try {
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    const ref = doc(db, 'system_stats', `mrr_${month}`);
    await setDoc(ref, { month, mrr, paidUsers, totalUsers, updatedAt: Date.now() }, { merge: true });
  } catch {
    // Non-critical
  }
}

/**
 * Fetch the last 6 months of MRR snapshots for the MRR trend chart.
 */
export async function fetchMrrTrend(
  months = 6
): Promise<{ month: string; mrr: number }[]> {
  const results: { month: string; mrr: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('en-GB', { month: 'short' });
    const ref = doc(db, 'system_stats', `mrr_${monthKey}`);
    const snap = await getDoc(ref);
    results.push({ month: label, mrr: snap.exists() ? (snap.data()?.mrr ?? 0) : 0 });
  }
  return results;
}

// ─── Broadcast History ────────────────────────────────────────────────────────

export interface BroadcastRecord {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
  timestamp: number;
  adminName: string;
}

/**
 * Fetch the last N broadcasts from global_notifications, newest first.
 */
export async function fetchBroadcastHistory(count = 10): Promise<BroadcastRecord[]> {
  try {
    const q = query(
      collection(db, 'global_notifications'),
      orderBy('timestamp', 'desc'),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BroadcastRecord));
  } catch {
    return [];
  }
}
