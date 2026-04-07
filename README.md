<div align="center">
  <img src="./public/banner.png" width="1200" alt="VeroFlow AI Banner" />
  <br />
  <strong>v1.2.0 — Beta Test Release</strong>
</div>

# 🇫🇮 VeroFlow AI — Finnish Courier Tax Perfection

**Automated 2026 Profitability & Tax Compliance for Wolt, Uber Eats, and Foodora Couriers.**

VeroFlow AI is a high-performance workspace designed specifically for freelancers (Light Entrepreneurs) operating in Finland. It bridges the gap between chaotic shift reports and professional tax auditing, ensuring every kilometer is deductible and every Euro is accounted for.

---

## 🔥 Key 2026 Features

### ⚖️ Finnish Tax Engine (`lib/tax-engine.ts`)
*   **YEL Threshold Tracking**: Live monitoring of the **€9,423.09 (2026)** YEL pension threshold. Proactive alerts when a breach is imminent.
*   **ALV (VAT) Sync**: Automated calculation of **25.5%** standard output VAT and deductible input VAT for fuel/equipment (Threshold: **€20,000** for 2026).
*   **Mileage Deduction**: Precise **€0.55/km (2026)** tax deduction engine based on real-time GPS tracking.
*   **Net Profit Calculator**: Real-time net profit after tax, YEL, VAT, and mileage deductions.

### 🚗 Hands-Free Driving Mode
*   **Voice Assistant**: Start/Stop shifts and log fuel costs via voice commands while driving.
*   **Glanceable UI**: High-contrast, large-metric dashboard designed for phone mounts and driver visibility.
*   **Background GPS Persistence**: Tracking survives tab switches and phone locks via the `VeroProvider` (Longterm native conversion to **Capacitor** is supported via `CAPACITOR_MIGRATION_PLAN.md`).

### 🧠 Gemini OCR Intelligence (`gemini-2.5-flash`)
*   **Shift Scanning**: Extract App name (Wolt/Uber), Gross Pay, Tips, and Distance automatically from delivery app screenshots.
*   **Receipt Vault**: Instant extraction of Merchant, Date, Amount, VAT, and Category from Finnish fuel and maintenance receipts.
*   **Voice Commands**: Natural language shift logging and expense capture for hands-free operation.

### 📊 Peak Performance Engine
*   **Shift Duration Tracking**: Automatic computation of shift duration from GPS start/end times for accurate hourly rate analysis.
*   **Efficiency Heatmaps**: Identify your best earning hours (Net Profit/Hour) by day of week and time slot.
*   **Platform Comparison**: Real-time net efficiency comparison between Wolt, Uber Eats, and Foodora.

### 🔒 Security & Offline
*   **Per-User Data Isolation**: Firestore security rules restrict bulk reading and writing exclusively to authenticated `uid`s, rendering unauthenticated enumeration impossible.
*   **Offline-First**: IndexedDB persistence with automatic sync queue — works fully offline with background upload when connection is restored.
*   **Compound Indexes**: Optimized Firestore indexes on `(scopeUid, date)` for fast sorted queries.

### 🏢 Admin Dashboard
*   **User Management**: View all registered users, subscription tiers, and gross earnings.
*   **System Health**: Real-time API health checks for Firebase, Gemini, and Stripe integrations.
*   **Analytics**: Fleet-wide shift and revenue statistics with interactive charts.

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

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js 18+
*   Firebase Project (Blaze plan for Firestore)
*   Google Gemini API Key

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

### 5. Seed 2026 Data
Once logged in, use **Settings → Seed Demo Data** or the **DATA DEBUGGER** button to populate your workspace with compliant 2026 delivery data for testing.

---

## 🏢 Architecture

```
app/
  page.tsx              → Dashboard (VeroDashboard)
  layout.tsx            → Root layout + VeroProvider
  admin/                → Admin dashboard (/admin)
  api/checkout/         → Stripe checkout session
  api/webhooks/         → Stripe subscription webhooks
  landing/              → Public marketing page
  privacy/, terms/      → Legal pages
components/             → 21 React components
lib/
  tax-engine.ts         → 2026 Finnish tax core
  ocr-service.ts        → Gemini OCR + Voice parsing
  offline-storage.ts    → IndexedDB offline queue
  stripe.ts             → Stripe server config
  utils.ts              → Haversine + reverse geocode
types/index.ts          → TypeScript definitions
```

---

## 📋 Changelog

### v1.2.0 — Beta Release (2026-04-07)
*   **🔒 SECURED**: Hardened Firestore `list` rules blocking unauthorized global read access.
*   **🧠 UPGRADED**: Bumped OCR to Google's ultra-fast `gemini-2.5-flash` model.
*   **📂 ORGANIZED**: Cleaned up documentation into `/docs` directory.
*   **📱 PLANNED**: Added `CAPACITOR_MIGRATION_PLAN.md` for seamless React Native/Capacitor native app conversion.

### v1.1.0 — Audit & Compliance Release (2026-04-05)
*   **🔴 FIXED**: Firestore security rules — `scopeUid` queries now work correctly with per-user isolation
*   **🟡 FIXED**: Shift `durationMin` now computed from start/end times — enables Peak Performance analytics
*   **🟡 FIXED**: `profile.totalGross` now auto-increments after each shift — accurate YEL threshold detection
*   **🟡 ADDED**: Compound Firestore indexes on `(scopeUid, date)` for optimized queries
*   **✅ VERIFIED**: All 2026 Finnish tax rates (VAT 25.5%, YEL €9,423.09, Mileage €0.55/km)
*   **✅ VERIFIED**: Gemini OCR using stable `gemini-1.5-flash` with structured JSON output
*   **✅ DEPLOYED**: Production Firestore rules and indexes to `veroflow-ai` project

### v1.0.0 — Initial Release
*   Core tax engine with 2026 Finnish compliance
*   GPS shift tracking with voice commands
*   Gemini OCR for shift screenshots and receipts
*   Offline-first architecture with IndexedDB
*   Admin dashboard with user management
*   Stripe subscription integration

---

## 📎 Compliance Disclaimer
VeroFlow AI calculations are based on general 2024-2026 Finnish Tax Administration (Vero) guidelines for freelancers. Always consult with a professional accountant (Kirjanpitäjä) for final filing.

<div align="center">
  <p>Built for the Finnish Courier Community with ❤️ and ☕</p>
  <sub>© 2026 VeroFlow AI</sub>
</div>
