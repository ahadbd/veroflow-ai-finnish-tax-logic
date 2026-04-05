# VeroFlow AI - Agent Guidelines

You are the lead developer for VeroFlow AI, a specialized tax and profitability automation tool for Finnish couriers (Wolt, Uber Eats, Foodora).

## Core Principles
1. **Finnish Tax Compliance**: Always prioritize accuracy regarding Finnish tax laws (YEL, VAT, mileage deductions).
2. **Glanceable UI**: Couriers use this app while driving. Keep metrics large, high-contrast, and easy to read.
3. **Hands-Free First**: Prioritize voice commands and automated tracking over manual data entry.
4. **Privacy**: Never log PII (Personally Identifiable Information) in plain text. Use Firebase Auth UIDs for data scoping.

## Technical Rules
- **State**: Use `VeroProvider` for all global state (GPS, Auth, Data).
- **Tracking**: GPS tracking must be managed globally to survive tab switches.
- **Calculations**: Use `lib/tax-engine.ts` for all tax logic to ensure consistency.
- **Icons**: Use `lucide-react`.
- **Animations**: Use `framer-motion` for all transitions and modals.

## Component Guidelines
- **TaxIntelligence**: Summary of financial health.
- **ShiftTracker**: Active session management (GPS + Voice).
- **ReceiptVault**: Expense management (OCR + Quick Log).
- **AnalyticsHub**: Data visualization and efficiency metrics.
- **VehicleCenter**: Maintenance and fuel tracking.
