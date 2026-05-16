/**
 * lib/maintenance-engine.ts
 * Predictive maintenance calculations for Finnish couriers.
 * Pure functions — no side effects, no Firebase calls.
 */

import { Shift, UserProfile } from '@/types';

// ── Types ───────────────────────────────────────────────────────────────────

export interface MaintenancePrediction {
  /** Average km driven per week over last 4 weeks */
  weeklyKmRate: number;
  /** Predicted date of next service (ISO string) */
  predictedServiceDate: string | null;
  /** Days remaining until predicted service date */
  daysToService: number | null;
  /** km remaining to next service */
  kmRemaining: number;
  /** Urgency level */
  urgency: 'ok' | 'approaching' | 'due' | 'overdue';
  /** Tire wear prediction: km until front tire reaches 1.6mm (legal minimum) */
  tireFrontKmLeft: number | null;
  /** Tire wear prediction: km until rear tire reaches 1.6mm (legal minimum) */
  tireRearKmLeft: number | null;
  /** Cost per km based on maintenance history */
  maintenanceCostPerKm: number;
  /** Total maintenance spend (lifetime) */
  totalMaintenanceCost: number;
  /** Projected annual maintenance cost based on current rate */
  projectedAnnualCost: number;
  /** Monthly km average (last 30 days) */
  monthlyKmRate: number;
  /** Next 3 upcoming events sorted by proximity */
  upcomingEvents: MaintenanceEvent[];
}

export interface MaintenanceEvent {
  id: string;
  label: string;
  icon: string;          // emoji
  kmRemaining: number | null;
  daysRemaining: number | null;
  urgency: 'ok' | 'approaching' | 'due' | 'overdue';
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function kmPerWeekRate(shifts: Shift[]): number {
  if (shifts.length === 0) return 0;
  // Use last 28 days only for recency
  const cutoff = Date.now() - 28 * 86400000;
  const recent = shifts.filter(s => new Date(s.date).getTime() >= cutoff);
  const recentKm = recent.reduce((a, s) => a + s.distanceKm, 0);
  // Clamp to 4 weeks
  return recentKm / 4;
}

function kmPerMonth(shifts: Shift[]): number {
  const cutoff = Date.now() - 30 * 86400000;
  const recent = shifts.filter(s => new Date(s.date).getTime() >= cutoff);
  return recent.reduce((a, s) => a + s.distanceKm, 0);
}

/**
 * Predict when a known km threshold will be reached given current km and weekly rate.
 * Returns days from now, or null if rate is 0.
 */
function daysUntilKm(currentKm: number, targetKm: number, weeklyRate: number): number | null {
  if (weeklyRate <= 0) return null;
  const remaining = targetKm - currentKm;
  if (remaining <= 0) return 0;
  return Math.round((remaining / weeklyRate) * 7);
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/**
 * Tire wear model: assume new tires at 8mm, legal minimum 1.6mm.
 * Estimate km-per-mm wear based on ETSC averages (~0.1mm / 5,000 km for courier use).
 * Adjustable to courier-level km.
 */
const COURIER_KM_PER_MM = 5000; // conservative

function tireKmRemaining(treadMm: number): number | null {
  if (treadMm == null) return null;
  const safeRemaining = treadMm - 1.6;
  if (safeRemaining <= 0) return 0;
  return Math.round(safeRemaining * COURIER_KM_PER_MM);
}

function urgencyFromKm(kmRemaining: number, interval: number): 'ok' | 'approaching' | 'due' | 'overdue' {
  if (kmRemaining <= 0) return 'overdue';
  if (kmRemaining < 0) return 'due';
  if (kmRemaining < interval * 0.1) return 'approaching'; // within 10% of interval
  return 'ok';
}

function urgencyFromDays(days: number | null): 'ok' | 'approaching' | 'due' | 'overdue' {
  if (days === null) return 'ok';
  if (days <= 0) return 'overdue';
  if (days <= 7) return 'due';
  if (days <= 30) return 'approaching';
  return 'ok';
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function predictMaintenance(
  profile: UserProfile,
  shifts: Shift[],
  totalKm: number
): MaintenancePrediction {
  const maintenance = profile.maintenance;
  const history = profile.maintenanceHistory ?? [];

  const weeklyRate = kmPerWeekRate(shifts);
  const monthlyRate = kmPerMonth(shifts);

  // ── Service interval ──────────────────────────────────────────────────────
  const interval = maintenance?.interval ?? 15000;
  const lastKm   = maintenance?.lastKm ?? 0;
  const nextServiceKm = lastKm + interval;
  const kmRemaining   = nextServiceKm - totalKm;
  const serviceUrgency = urgencyFromKm(kmRemaining, interval);

  const daysToService = daysUntilKm(totalKm, nextServiceKm, weeklyRate);
  const predictedServiceDate = daysToService != null ? addDays(daysToService) : null;

  // ── Tire predictions ───────────────────────────────────────────────────────
  const tires = maintenance?.tires;
  const tireFrontKmLeft = tires ? tireKmRemaining(tires.front) : null;
  const tireRearKmLeft  = tires ? tireKmRemaining(tires.rear)  : null;

  // ── Cost analysis ──────────────────────────────────────────────────────────
  const totalMaintenanceCost = history.reduce((a, h) => a + h.cost, 0);
  const maintenanceCostPerKm = totalKm > 0 ? totalMaintenanceCost / totalKm : 0;
  const projectedAnnualCost  = maintenanceCostPerKm * weeklyRate * 52;

  // ── Upcoming events ────────────────────────────────────────────────────────
  const events: MaintenanceEvent[] = [];

  // Oil/service
  events.push({
    id: 'service',
    label: 'Next Oil Service',
    icon: '🔧',
    kmRemaining,
    daysRemaining: daysToService,
    urgency: serviceUrgency,
  });

  // Front tire
  if (tireFrontKmLeft !== null) {
    const daysFront = daysUntilKm(0, tireFrontKmLeft, weeklyRate);
    events.push({
      id: 'tire_front',
      label: 'Front Tire (legal min)',
      icon: '🛞',
      kmRemaining: tireFrontKmLeft,
      daysRemaining: daysFront,
      urgency: tireFrontKmLeft < 5000 ? (tireFrontKmLeft < 1000 ? 'due' : 'approaching') : 'ok',
    });
  }

  // Rear tire
  if (tireRearKmLeft !== null) {
    const daysRear = daysUntilKm(0, tireRearKmLeft, weeklyRate);
    events.push({
      id: 'tire_rear',
      label: 'Rear Tire (legal min)',
      icon: '🛞',
      kmRemaining: tireRearKmLeft,
      daysRemaining: daysRear,
      urgency: tireRearKmLeft < 5000 ? (tireRearKmLeft < 1000 ? 'due' : 'approaching') : 'ok',
    });
  }

  // Annual inspection (katsastus) — every 365 days is a rough proxy
  // We don't track this, but show as a reminder if no history record mentions it
  const lastInspection = history.find(h => h.description.toLowerCase().includes('katsast'));
  if (!lastInspection) {
    events.push({
      id: 'katsastus',
      label: 'Katsastus Reminder',
      icon: '📋',
      kmRemaining: null,
      daysRemaining: null,
      urgency: 'approaching',
    });
  }

  // Sort by urgency severity, then by days remaining
  const urgencyOrder = { overdue: 0, due: 1, approaching: 2, ok: 3 };
  events.sort((a, b) => {
    const uDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    if (uDiff !== 0) return uDiff;
    const aDays = a.daysRemaining ?? 999;
    const bDays = b.daysRemaining ?? 999;
    return aDays - bDays;
  });

  return {
    weeklyKmRate: weeklyRate,
    monthlyKmRate: monthlyRate,
    predictedServiceDate,
    daysToService,
    kmRemaining,
    urgency: serviceUrgency,
    tireFrontKmLeft,
    tireRearKmLeft,
    maintenanceCostPerKm,
    totalMaintenanceCost,
    projectedAnnualCost,
    upcomingEvents: events.slice(0, 4),
  };
}
