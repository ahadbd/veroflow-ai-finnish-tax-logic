import { describe, it, expect } from 'vitest';
import {
  calculate2026Tax,
  checkThresholds,
  YEL_THRESHOLD_2026,
  YEL_RATE_2026,
  MILEAGE_RATE_2026,
  VAT_RATE_FINLAND,
  VAT_THRESHOLD_2026,
} from '../lib/tax-engine';

// ─── calculate2026Tax ────────────────────────────────────────────────────────

describe('calculate2026Tax', () => {
  const base = {
    grossPay: 1000,
    tips: 100,
    distanceKm: 200,
    taxRate: 0.15,
    annualGrossSoFar: 0,
  };

  it('calculates grossTotal as grossPay + tips', () => {
    const { grossTotal } = calculate2026Tax(base);
    expect(grossTotal).toBe(1100);
  });

  it('applies the 2026 mileage rate (€0.55/km)', () => {
    const { mileageDeduction } = calculate2026Tax(base);
    expect(mileageDeduction).toBeCloseTo(200 * MILEAGE_RATE_2026, 5);
    expect(mileageDeduction).toBeCloseTo(110, 5);
  });

  it('has zero YEL cost when annualGrossSoFar is below threshold', () => {
    const { yelCost, isOverYelThreshold } = calculate2026Tax({
      ...base,
      annualGrossSoFar: 0,
      grossPay: 500,
    });
    expect(isOverYelThreshold).toBe(false);
    expect(yelCost).toBe(0);
  });

  it('has non-zero YEL cost when annual income exceeds threshold', () => {
    const { yelCost, isOverYelThreshold } = calculate2026Tax({
      ...base,
      annualGrossSoFar: YEL_THRESHOLD_2026 + 1,
    });
    expect(isOverYelThreshold).toBe(true);
    expect(yelCost).toBeGreaterThan(0);
  });

  it('calculates zero VAT debt when not VAT registered', () => {
    const { vatDebt } = calculate2026Tax({ ...base, isVatRegistered: false });
    expect(vatDebt).toBe(0);
  });

  it('calculates non-zero VAT debt when VAT registered', () => {
    const { vatDebt } = calculate2026Tax({
      ...base,
      isVatRegistered: true,
      fuelCost: 50,
    });
    expect(vatDebt).toBeGreaterThan(0);
  });

  it('taxDebt equals taxableIncome * taxRate', () => {
    const result = calculate2026Tax(base);
    expect(result.taxDebt).toBeCloseTo(result.taxableIncome * base.taxRate, 5);
  });

  it('netProfit is never impossibly large', () => {
    const { netProfit, grossTotal } = calculate2026Tax(base);
    expect(netProfit).toBeLessThanOrEqual(grossTotal);
  });

  it('taxableIncome is never negative', () => {
    // Very high mileage should floor taxableIncome at 0
    const { taxableIncome } = calculate2026Tax({
      ...base,
      distanceKm: 100000,
    });
    expect(taxableIncome).toBeGreaterThanOrEqual(0);
  });

  it('handles zero grossPay without throwing', () => {
    expect(() =>
      calculate2026Tax({ ...base, grossPay: 0, tips: 0 })
    ).not.toThrow();
  });

  it('uses custom yelIncomeLevel for YEL cost calculation', () => {
    const low = calculate2026Tax({
      ...base,
      annualGrossSoFar: YEL_THRESHOLD_2026 + 1,
      yelIncomeLevel: YEL_THRESHOLD_2026,
    });
    const high = calculate2026Tax({
      ...base,
      annualGrossSoFar: YEL_THRESHOLD_2026 + 1,
      yelIncomeLevel: 50000,
    });
    // Higher YEL income level → higher annual YEL cost
    expect(high.yelCost).toBeGreaterThan(low.yelCost);
  });
});

// ─── checkThresholds ─────────────────────────────────────────────────────────

describe('checkThresholds', () => {
  it('returns NONE when well below both thresholds', () => {
    const result = checkThresholds(5000, false);
    expect(result.type).toBe('NONE');
    expect(result.isRisk).toBe(false);
  });

  it('returns YEL risk when within €1000 of YEL threshold', () => {
    const nearYel = YEL_THRESHOLD_2026 - 500;
    const result = checkThresholds(nearYel, false);
    expect(result.type).toBe('YEL');
    expect(result.isRisk).toBe(true);
  });

  it('does not flag YEL risk when already over the threshold', () => {
    const result = checkThresholds(YEL_THRESHOLD_2026 + 1, false);
    // Over threshold is not a risk flag — it is expected
    expect(result.type).not.toBe('YEL');
  });

  it('returns VAT risk when within €2000 of VAT threshold for non-registered couriers', () => {
    const nearVat = VAT_THRESHOLD_2026 - 1000;
    const result = checkThresholds(nearVat, false);
    expect(result.type).toBe('VAT');
    expect(result.isRisk).toBe(true);
  });

  it('does not flag VAT risk for already-registered couriers', () => {
    const nearVat = VAT_THRESHOLD_2026 - 1000;
    const result = checkThresholds(nearVat, true);
    expect(result.type).not.toBe('VAT');
  });

  it('includes remaining amount in the result', () => {
    const nearYel = YEL_THRESHOLD_2026 - 200;
    const result = checkThresholds(nearYel, false);
    expect(result.remaining).toBeCloseTo(200, 0);
  });
});
