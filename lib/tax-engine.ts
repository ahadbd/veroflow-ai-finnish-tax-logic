/**
 * VeroFlow AI 2026 Tax Engine
 * High-precision math for Finnish Platform Economy couriers.
 */

export interface TaxInputs {
  grossPay: number;
  tips: number;
  distanceKm: number;
  taxRate: number; // e.g., 0.15 for 15%
  annualGrossSoFar: number;
  otherExpenses?: number;
  fuelCost?: number;
  isVatRegistered?: boolean;
  yelIncomeLevel?: number;
}

export interface TaxBreakdown {
  grossTotal: number;
  mileageDeduction: number;
  yelCost: number;
  vatDebt: number;
  taxableIncome: number;
  taxDebt: number;
  netProfit: number;
  isOverYelThreshold: boolean;
}

export const YEL_THRESHOLD_2026 = 9423.09;
export const YEL_RATE_2026 = 0.244;
export const MILEAGE_RATE_2026 = 0.55;
export const VAT_RATE_FINLAND = 0.255;
export const VAT_THRESHOLD_2026 = 15000;

export function calculate2026Tax(inputs: TaxInputs): TaxBreakdown {
  const { 
    grossPay, 
    tips, 
    distanceKm, 
    taxRate, 
    annualGrossSoFar, 
    otherExpenses = 0, 
    fuelCost = 0,
    isVatRegistered = false,
    yelIncomeLevel = YEL_THRESHOLD_2026
  } = inputs;
  
  const grossTotal = grossPay + tips;
  
  // 1. VAT Logic
  const vatCollected = isVatRegistered ? (grossPay - (grossPay / (1 + VAT_RATE_FINLAND))) : 0;
  const vatDeductible = isVatRegistered ? ((fuelCost + otherExpenses) - ((fuelCost + otherExpenses) / (1 + VAT_RATE_FINLAND))) : 0;
  const vatDebt = Math.max(0, vatCollected - vatDeductible);

  // 2. Mileage Deduction (2026 Rate: €0.55/km)
  const mileageDeduction = distanceKm * MILEAGE_RATE_2026;
  
  // 3. YEL Logic
  const incomeForYel = isVatRegistered ? (grossPay / (1 + VAT_RATE_FINLAND)) : grossPay;
  const isOverYelThreshold = (annualGrossSoFar + incomeForYel) > YEL_THRESHOLD_2026;
  
  // If over threshold, calculate YEL based on the selected income level
  // We pro-rate the YEL cost based on this shift's contribution to the annual income
  // Assuming an average annual income of €30,000 for pro-rating if not provided
  const estimatedAnnualIncome = Math.max(30000, annualGrossSoFar + incomeForYel);
  const annualYelCost = yelIncomeLevel * YEL_RATE_2026;
  const yelCost = isOverYelThreshold ? (incomeForYel / estimatedAnnualIncome) * annualYelCost : 0;
  
  // 4. Taxable Income
  const netIncome = isVatRegistered ? (grossPay / (1 + VAT_RATE_FINLAND)) + tips : grossTotal;
  const netExpenses = isVatRegistered ? (fuelCost + otherExpenses) / (1 + VAT_RATE_FINLAND) : (fuelCost + otherExpenses);
  
  const taxableIncome = Math.max(0, netIncome - mileageDeduction - yelCost - netExpenses);
  
  // 5. Tax Debt (Ennakkovero)
  const taxDebt = taxableIncome * taxRate;
  
  // 6. Net Profit ("Pocket Cash")
  const netProfit = grossTotal - yelCost - taxDebt - vatDebt - fuelCost - otherExpenses;
  
  return {
    grossTotal,
    mileageDeduction,
    yelCost,
    vatDebt,
    taxableIncome,
    taxDebt,
    netProfit,
    isOverYelThreshold
  };
}
