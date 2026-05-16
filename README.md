<div align="center">
  <img src="./public/banner.png" width="1200" alt="VeroFlow AI Banner" />
  <br />
  <strong>v1.7.0 — Phase 3 Complete | Predictive Maintenance + Gamification</strong>
</div>

# 🇫🇮 VeroFlow AI — Finnish Courier Tax Perfection

**Automated 2026 Profitability & Tax Compliance for Wolt, Uber Eats, and Foodora Couriers.**

VeroFlow AI is a high-performance courier ERP designed specifically for Finnish light entrepreneurs (*kevytyrittäjät*). It bridges the gap between chaotic shift reports and professional tax auditing — ensuring every kilometer is deductible, every euro is accounted for, and every service interval is tracked before it becomes a breakdown.

[![Deploy Status](https://img.shields.io/badge/Vercel-Deployed-brightgreen)](https://veroflow-ai.vercel.app/)
[![Version](https://img.shields.io/badge/version-1.7.0-blue)](https://github.com/ahadbd/veroflow-ai-finnish-tax-logic/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## 🔥 Feature Overview

### ⚖️ Finnish Tax Engine (`lib/tax-engine.ts`)
- **YEL Threshold Tracking** — Live monitoring of the **€9,423.09 (2026)** YEL pension threshold with proactive breach alerts
- **ALV (VAT) Sync** — Automated **25.5%** output VAT calculation and deductible input VAT for fuel/equipment
- **Mileage Deduction** — Precise **€0.55/km (2026)** tax engine powered by real-time GPS
- **Net Profit Calculator** — Real-time net profit after tax, YEL, VAT, and deductions

### 🚗 Adaptive Driving Mode (`components/VeroDashboard.tsx`)
- **Auto-Detection** — Switches to driving mode when GPS speed exceeds 15 km/h
- **Glanceable HUD** — Large metrics, 2 buttons max, voice-first interface for safe phone-mount use
- **Smooth Transitions** — `framer-motion` crossfade between driving and full-analytics modes
- **Background GPS Persistence** — Tracking survives tab switches and phone locks via `VeroProvider`

### 🧠 Gemini OCR Intelligence (`gemini-2.5-flash`)
- **Shift Scanning** — Extract App, Gross Pay, Tips, Distance from Wolt/Uber Eats screenshots
- **Receipt Vault** — Instant extraction of Merchant, Date, Amount, VAT, and Category from Finnish receipts
- **Finglish Voice Commands** — Finnish/Swedish code-switching support ("Starttaa shiftaus", "Olen täs Wolt-deliveryssä")
- **Confidence Scoring** — Low-confidence OCR results trigger manual entry fallback UI

### 📊 Analytics & Intelligence Hub
- **Peak Performance** — Net profit/hour by day-of-week and time slot
- **Platform Comparison** — Real-time efficiency comparison: Wolt vs. Uber Eats vs. Foodora
- **Shift Duration Tracking** — Automatic computation from GPS start/end timestamps
- **Defense PDF Generator** — 1-click "Vero-Ready" audit report with SHA-256 tamper-detection hash

### 🏆 Gamification & Streaks (`lib/gamification.ts`)
- **12 Achievements** — Unlockable badges from "First Shift" to "Elite Courier"
- **XP + Level System** — 10 levels with animated SVG progress rings
- **Streak Counter** — Daily streak tracking with `canvas-confetti` milestone celebrations (3, 7, 14, 30 days)
- **Animated Dashboard** — GamificationPanel with real-time XP updates

### 🔧 Predictive Maintenance (`lib/maintenance-engine.ts`)
- **Days-to-Service Engine** — Forecasts exact service date from 28-day rolling km average
- **Tire Wear Model** — ETSC courier model (5,000 km/mm) with legal minimum 1.6mm flag
- **Urgency Alerts** — `ok → approaching → due → overdue` with SmartAlerts integration
- **Cost Intelligence** — Cost-per-km trend + projected annual maintenance spend
- **Katsastus Reminder** — Auto-injected when no inspection found in history

### 🔒 Security & Offline
- **Per-User Data Isolation** — Firestore rules restrict all reads/writes to authenticated `uid`
- **Immutable Records** — "Close Month" locking enforces KPL 2:7§ compliance; locked shifts are read-only
- **10-Year Retention** — Firebase Storage with Object Versioning (KPL 2:10§)
- **Offline-First** — IndexedDB persistence with automatic sync queue
- **Compound Indexes** — Optimized Firestore indexes on `(scopeUid, date)`

### 📱 Native Mobile (Capacitor)
- **Capacitor Infrastructure** — `capacitor.config.ts` + dual-build (`NEXT_MOBILE=true`)
- **Native GPS** — `lib/native.ts` wraps Capacitor `watchPosition()` with browser fallback
- **Haptic Feedback** — `vibrateSuccess/Warning()` on shift start/stop
- **Local Notifications** — Push notification fires on shift start; resume alert on app backgrounding

### 🏢 Admin Dashboard
- **User Management** — View all registered users, subscription tiers, gross earnings
- **System Health** — Real-time API health checks for Firebase, Gemini, and Stripe
- **Fleet Analytics** — Fleet-wide shift and revenue statistics with interactive charts
- **CSV Export** — Anonymised user metrics export

---

## 🛠 Technical Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) + React 19 |
| **Styling** | Tailwind CSS v4 (Premium Dark Theme) |
| **State** | `VeroProvider` Context Hub |
| **Database** | Firebase Firestore (eur3 — Europe) |
| **Auth** | Firebase Auth (Google + Anonymous) |
| **AI/OCR** | Google Gemini 2.5 Flash (Structured JSON) |
| **Payments** | Stripe (Checkout + Webhooks) |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Offline** | IndexedDB via `idb` |
| **Export** | jsPDF + AutoTable (PDF/CSV) |
| **Native** | Capacitor 7 (iOS + Android) |
| **Testing** | Vitest (tax-engine unit tests) |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- Firebase Project (Blaze plan)
- Google Gemini API Key

### 2. Environment Setup
Create a `.env.local` file:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Installation
```powershell
npm install
npm run dev
```

### 4. Deploy Firestore Rules & Indexes
```powershell
npx firebase deploy --only firestore:rules,firestore:indexes --project your_project_id
```

### 5. Seed Demo Data
Once logged in, use **Settings → Seed Demo Data** to populate your workspace with compliant 2026 delivery data for testing.

---

## 🏗️ Architecture

```
app/
  page.tsx                  → Dashboard (VeroDashboard)
  layout.tsx                → Root layout + VeroProvider
  admin/                    → Admin dashboard (/admin)
  accountant/               → B2B accountant portal (Phase 4)
  api/checkout/             → Stripe checkout session
  api/webhooks/             → Stripe subscription webhooks
  api/gdpr/                 → GDPR export + deletion (Phase 4)
  landing/                  → Public marketing page
  privacy/, terms/          → Legal pages

components/                 → 25+ React components
  VeroDashboard.tsx         → Core layout + driving mode
  ShiftTracker.tsx          → GPS + Voice + OCR shift logging
  ReceiptVault.tsx          → OCR + Quick Log expenses
  AnalyticsHub.tsx          → Data visualization + PDF export
  VehicleCenter.tsx         → Maintenance tracking + predictions
  GamificationPanel.tsx     → XP, levels, streaks, achievements
  PredictiveMaintenanceWidget.tsx → AI service date forecasting
  SmartAlerts.tsx           → Proactive urgency notifications
  CourierFeed.tsx           → Community real-time feed

lib/
  tax-engine.ts             → 2026 Finnish tax core (YEL, VAT, Mileage)
  maintenance-engine.ts     → Predictive service date engine
  gamification.ts           → XP, levels, achievements, streaks
  ocr-service.ts            → Gemini OCR + Voice parsing
  offline-storage.ts        → IndexedDB offline queue
  native.ts                 → Capacitor / browser GPS abstraction
  stripe.ts                 → Stripe server config
  utils.ts                  → Haversine + reverse geocode

types/index.ts              → Full TypeScript definitions
docs/
  MASTER_DEV_PLAN_2026.md   → Live roadmap (Tasks 1–24)
  PHASE3_PLAN_2026.md       → Detailed Phase 4 implementation specs
```

---

## 📋 Changelog

### v1.7.0 — Phase 3 Complete (2026-05-16)
- **🔧 NEW**: `lib/maintenance-engine.ts` — pure predictive engine: days-to-service, tire wear, cost-per-km, annual projection
- **🔧 NEW**: `components/PredictiveMaintenanceWidget.tsx` — visual service timeline, urgency bars, cost intelligence
- **🔧 UPGRADED**: `SmartAlerts.tsx` — now proactively alerts "approaching" (< 500km) and "overdue" maintenance using prediction engine
- **📋 NEW**: `docs/PHASE3_PLAN_2026.md` — full specification for Tasks 17–24 (Tax Bucket, GL Mapper, Heat Map, Waze Feed, Leaderboard, GDPR, B2B Portal)
- **📋 UPDATED**: `MASTER_DEV_PLAN_2026.md` → v1.7, Phase 4 (Tasks 17-24) fully specced, Phase 5 defined

### v1.6.0 — Gamification System (2026-05-16)
- **🏆 NEW**: `lib/gamification.ts` — 10 levels, XP, streaks, 12 achievements
- **🏆 NEW**: `components/GamificationPanel.tsx` — animated SVG rings, streak heatmap, achievement grid
- **📋 UPDATED**: `MASTER_DEV_PLAN_2026.md` → v1.6 with Tasks 15 & 16 complete

### v1.5.0 — Adaptive Driving Mode (2026-05-16)
- **🚗 NEW**: Auto-detection driving mode via GPS speed threshold (> 15 km/h)
- **🚗 NEW**: Glanceable HUD — 2-button layout, large metrics, voice-first
- **🚗 NEW**: `framer-motion` crossfade between driving and analytics modes
- **🔒 FIX**: `VeroDashboard` lint-clean — state resets moved to effect cleanup

### v1.4.0 — Defense PDF Generator (2026-05-15)
- **📄 NEW**: 1-click "Vero-Ready" PDF audit report via `jspdf` + `jspdf-autotable`
- **📄 NEW**: SHA-256 tamper-detection hash on every generated report
- **📄 NEW**: GPS breadcrumbs + odometer fields included per shift

### v1.3.0 — Finglish NLP + OCR Resilience (2026-05-15)
- **🗣️ UPGRADED**: Gemini voice prompts handle Finnish/Swedish code-switching
- **📷 UPGRADED**: Gemini 2.5 Flash OCR confidence scoring + manual fallback UI
- **📊 UPGRADED**: Admin Dashboard wired to live Firestore data

### v1.2.1 — Build Fixes (2026-05-15)
- **🛠️ FIX**: Removed invalid `minVersion` from `capacitor.config.ts` (Vercel build error)
- **🛠️ FIX**: All `<img>` tags migrated to `next/image` for CI compliance

### v1.2.0 — Native Mobile Platform (2026-04-07)
- **📱 NEW**: Capacitor 7 infrastructure — `capacitor.config.ts`, dual-build
- **📱 NEW**: `lib/native.ts` — GPS abstraction layer (Capacitor on device, browser fallback)
- **📱 NEW**: Haptic feedback + local push notifications on shift events
- **🔒 SECURED**: Hardened Firestore `list` rules blocking unauthorized global read
- **🧠 UPGRADED**: OCR bumped to `gemini-2.5-flash`

### v1.1.0 — Audit & Compliance (2026-04-05)
- **🔒 SECURED**: Firestore `scopeUid` rules — per-user isolation enforced
- **⚖️ NEW**: Mileage log `purpose` + `odometerStart/End` fields (Vero 1131/2021)
- **⚖️ NEW**: Immutable "Close Month" record locking (KPL 2:7§)
- **⚖️ NEW**: Firebase Storage with 10-year Object Versioning (KPL 2:10§)
- **📊 NEW**: Compound Firestore indexes on `(scopeUid, date)`

### v1.0.0 — Initial Release
- Core tax engine with 2026 Finnish compliance
- GPS shift tracking with voice commands
- Gemini OCR for shift screenshots and receipts
- Offline-first architecture with IndexedDB
- Admin dashboard with user management
- Stripe subscription integration

---

## 🗺️ Roadmap — Phase 4 (Next)

| # | Task | Priority | Description |
|---|---|---|---|
| 17 | Tax Bucket Engine | 🔴 P0 | Per-shift savings calculator: "Move €28 to savings now" |
| 18 | GL Account Mapper | 🔴 P0 | Finnish Tilikartta codes → Procountor/Netvisor CSV export |
| 19 | Heat-Map Intelligence | 🟠 P1 | Leaflet.js €/km hotspot map (anonymised, 500m grid) |
| 20 | Weather-Impact AI | 🟠 P1 | Gemini × OpenWeatherMap 7-day earnings forecast |
| 21 | Finnish Waze Feed v2 | 🟠 P1 | Community real-time alerts (delays, hotspots, roadwork) |
| 22 | Anonymous Leaderboard | 🟡 P2 | Weekly city rankings by €/km (opt-in, Elite plan) |
| 23 | GDPR Erasure Tool | 🟡 P2 | 1-click data export + cascading account deletion |
| 24 | B2B Accounting Portal | 🟡 P2 | Accountant role access for Ukko.fi / Free.fi firms |

See [`docs/PHASE3_PLAN_2026.md`](./docs/PHASE3_PLAN_2026.md) for full implementation specs.

---

## 📎 Compliance Disclaimer

VeroFlow AI calculations are based on 2026 Finnish Tax Administration (Vero) guidelines for light entrepreneurs. Tax rules referenced: *Verohallinnon päätös 1131/2021* (mileage), *Kirjanpitolaki 2:7§* (record locking), *KPL 2:10§* (10-year retention). Always consult a licensed accountant (*Kirjanpitäjä*) for final filing.

<div align="center">
  <p>Built for the Finnish Courier Community with ❤️ and ☕</p>
  <sub>© 2026 VeroFlow AI · <a href="https://veroflow-ai.vercel.app/">veroflow-ai.vercel.app</a></sub>
</div>
