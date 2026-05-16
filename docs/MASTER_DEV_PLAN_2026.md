# VeroFlow AI — Master Development Plan 2026 🚀

> **Generated**: 2026-05-16 | **Version**: 1.0  
> **Synthesized from**: All 7 docs + live codebase audit (`types/index.ts`, `lib/tax-engine.ts`, `lib/stripe.ts`, `next.config.ts`, `.github/workflows/ci.yml`, `package.json`)

---

## ✅ Already Complete — Do Not Re-Implement

| Area | Status | Notes |
| :--- | :--- | :--- |
| Landing page (CRO all 4 phases) | ✅ Done | `VeroLanding.tsx` |
| Tax engine (`tax-engine.ts`) | ✅ Done | YEL, VAT 25.5%, mileage €0.55/km |
| Shift tracker (GPS + Voice + OCR) | ✅ Done | `ShiftTracker.tsx` |
| Receipt Vault (OCR + Quick Log) | ✅ Done | `ReceiptVault.tsx` |
| Firebase Auth + Firestore scoping | ✅ Done | All data scoped by UID |
| Admin Dashboard structure (UI) | ✅ Done | Mock data — needs wiring |
| Framer Motion + lucide-react | ✅ Done | Full animation system |
| `next/image` migration (CI fix) | ✅ Done | All `<img>` → `<Image />` |
| `isDrivingMode` state in context | ✅ Done | Scaffolded, not wired to UI |
| `Shift.purpose` + `Shift.isLocked` type | ✅ Done | In `types/index.ts` — **UI not built yet** |
| `Shift.odometerStart/End` type | ✅ Done | In `types/index.ts` — **UI not built yet** |
| `startTracking(purpose, odometer)` signature | ✅ Done | In `VeroContextType` — **not yet called from UI** |
| Stripe SDK installed | ✅ Done | `lib/stripe.ts` — **placeholder key, not live** |
| Vitest unit tests (`tax-engine.test.ts`) | ✅ Done | Passing in CI |
| Offline storage (`lib/offline-storage.ts`) | ✅ Done | IndexedDB fallback |

---

## ⚠️ Gaps Found in Codebase Audit

> These are items the docs say are done but code inspection reveals are incomplete:

| Gap | Finding | Risk |
| :--- | :--- | :--- |
| **Mileage log UI** | `purpose`, `odometerStart/End` exist in TypeScript types but have **no UI inputs** in `ShiftTracker.tsx` | 🔴 Legal — Vero will reject |
| **Record locking UI** | `isLocked` field exists in `Shift` type but no "Close Month" button or locked-record guard | 🔴 Legal — KPL 2:7§ |
| **Adaptive Dashboard** | `isDrivingMode` is in context state but is **not connected** to any UI mode switch | 🟡 UX |
| **Stripe live key** | `lib/stripe.ts` falls back to `'sk_test_placeholder'` — subscriptions are **not processing real payments** | 🔴 Revenue |
| **Admin data wiring** | All financial KPIs (MRR, churn, OCR usage) are hardcoded static values | 🟡 Business |
| **User search** | Search input exists in Admin UI but `.filter()` logic is **not implemented** | 🟡 Operations |
| **`fix_img.mjs`** | Temp script left in repo root — should be deleted | 🟢 Cleanup |
| **`tmp_list_models.js`** | Stale script in repo root — should be deleted | 🟢 Cleanup |
| **CI coverage artifact** | `npm run test:coverage` is not called in CI (only `npm run test`) — coverage upload step always finds empty `/coverage` dir | 🟢 CI warning |
| **Firebase Storage versioning** | No confirmation that Object Versioning is enabled for 10-year receipt retention | 🟡 Legal — KPL 2:10§ |

---

## 🔴 PHASE 0 — Immediate Actions (Legal Compliance)
**Goal: Achieve a clean Finnish tax audit opinion.**  
*These are legal blockers — the app is 90% compliant but these 3 tasks close the gap.*

---

### Task 1 · Enhanced Mileage Log UI ⚖️ `CRITICAL`
**Legal basis**: *Verohallinnon päätös 1131/2021*  
**Status**: Types exist (`Shift.purpose`, `Shift.odometerStart/End`). **UI does not.**

- [ ] Add mandatory **"Trip Purpose"** text input to `ShiftTracker.tsx` (e.g. "Food Delivery – Helsinki Loop")
- [ ] Add optional **Odometer Start** and **Odometer End** number inputs
- [ ] Wire these fields to `startTracking(purpose, odometer)` which is already defined in `VeroContextType`
- [ ] Update `stopTracking()` to accept and save `odometerEnd`
- [ ] Ensure both fields are saved to Firestore on shift completion
- [ ] Include `purpose` and `odometer` in the PDF/CSV export from `AnalyticsHub`

**Files**: `components/ShiftTracker.tsx`, `components/VeroProvider.tsx`

---

### Task 2 · Immutable Record Locking 🔒 `HIGH`
**Legal basis**: *Kirjanpitolaki (Accounting Act) 2:7§*  
**Status**: `Shift.isLocked` type exists. **No UI or enforcement logic built.**

- [ ] Add **"Close Month"** button to `AnalyticsHub.tsx`
- [ ] On click: batch-update all shifts for the selected calendar month → set `isLocked: true` in Firestore
- [ ] In `ShiftTracker.tsx` and anywhere shifts are editable: check `isLocked === true` and **block edit/delete**
- [ ] Show a "Corrective Entry" modal instead of direct edit for locked records (append-only correction)
- [ ] Update Firestore security rules to reject writes to locked documents from the client

**Files**: `components/AnalyticsHub.tsx`, `components/ShiftTracker.tsx`, `firestore.rules`

---

### Task 3 · Firebase Storage Versioning 🗄️ `HIGH`
**Legal basis**: *KPL 2:10§ — 10-year document retention*

- [ ] Enable **Object Versioning** in Firebase Storage console for the default bucket
- [ ] Confirm storage bucket region is `europe-north1` (Helsinki — GDPR + DORA compliance)
- [ ] Add a storage lifecycle rule: retain all objects indefinitely (no auto-delete)
- [ ] Document the verification in `firestore.rules` comments

**Files**: Firebase Console only (no code change)

---

### Task 4 · Repo Cleanup 🧹 `LOW` *(5 minutes)*

- [ ] Delete `fix_img.mjs` from repo root
- [ ] Delete `tmp_list_models.js` from repo root
- [ ] Fix CI: change `npm run test` → `npm run test:coverage` in `ci.yml` so coverage artifacts are actually generated

**Files**: `fix_img.mjs`, `tmp_list_models.js`, `.github/workflows/ci.yml`

---

## 🟡 PHASE 1 — Next Sprint (Native Mobile Platform)
**Goal: Reliable background GPS + Voice AI that survives app switching.**  
*The biggest platform risk: browser GPS dies the moment a courier opens the Wolt app.*

---

### Task 5 · Capacitor Initialization 📱 `HIGH DIFFICULTY`

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "VeroFlow AI" "fi.veroflow.app"
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

- [ ] Update `next.config.ts`: add `output: 'export'` support (currently `'standalone'` — incompatible with Capacitor)
- [ ] Replace all relative API calls with absolute URLs (`https://veroflow-ai.vercel.app/api/...`)
- [ ] Add `capacitor.config.ts` with correct `appId: 'fi.veroflow.app'`
- [ ] Run `npm run build && npx cap sync` to verify first native build

**Files**: `next.config.ts`, `capacitor.config.ts` (new), all `fetch()` calls in components

---

### Task 6 · Native Background Geolocation 🛰️

```bash
npm install @capacitor/geolocation
```

- [ ] Replace `navigator.geolocation.watchPosition()` in `VeroProvider.tsx` with `@capacitor/geolocation`
- [ ] Configure Android: add `ACCESS_BACKGROUND_LOCATION` to `AndroidManifest.xml`
- [ ] Configure iOS: add `NSLocationAlwaysAndWhenInUseUsageDescription` to `Info.plist`
- [ ] Request "Always On" permission when user taps "Start Shift"

**Files**: `components/VeroProvider.tsx`, `android/AndroidManifest.xml`, `ios/App/App/Info.plist`

---

### Task 7 · Native Speech Recognition 🎙️

```bash
npm install @capacitor-community/speech-recognition
```

- [ ] Remove `window.SpeechRecognition` and `webkitSpeechRecognition` from `VeroProvider.tsx`
- [ ] Replace with native `SpeechRecognition.start()` from the Capacitor plugin
- [ ] This bypasses browser audio suspension — critical for accuracy while driving

**Files**: `components/VeroProvider.tsx`

---

### Task 8 · Haptic Feedback ✋

```bash
npm install @capacitor/haptics
```

- [ ] Import `Haptics, ImpactStyle` from `@capacitor/haptics`
- [ ] Trigger `Haptics.impact({ style: ImpactStyle.Heavy })` immediately after a voice command is successfully parsed
- [ ] **Why**: Couriers feel the confirmation without needing to glance at the screen — safety critical

**Files**: `components/VeroProvider.tsx` or wherever voice commands are parsed

---

## 🟠 PHASE 2 — Q3 2026 (Admin + AI Intelligence)
**Goal: Replace all mock data with real metrics. Deepen AI accuracy.**

---

### Task 9 · Admin Dashboard — Real Data Wiring 📊

- [ ] **Search**: Add `searchQuery` state + `.filter()` on `allUsers` array by name/email/UID
- [ ] **Financial KPIs**: Create Firebase Cloud Function `aggregateAdminStats` that writes to `admin_stats/current` document — reads from Stripe API (MRR, churn) + Firestore (user counts, OCR usage)
- [ ] **Grid view**: Build the missing grid card layout (toggle exists, rendering doesn't)
- [ ] **Export button**: Wire "EXPORT DATA" → CSV download of anonymized user metrics
- [ ] **Pagination**: Replace `limit(100)` Firestore query with cursor-based pagination (`startAfter`)
- [ ] **AI Telemetry**: Replace static Gemini stats with real token/latency data from Gemini API logs or Cloud Functions metrics

**Files**: `components/AdminDashboard.tsx`, new Cloud Function

---

### Task 10 · Stripe Live Integration 💳 `REVENUE CRITICAL`

- [ ] Set `STRIPE_SECRET_KEY` (live key) in Vercel environment variables
- [ ] Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live key) in Vercel environment variables
- [ ] Test full subscription flow: Free → Pro → Elite
- [ ] Wire Stripe webhook to update `UserProfile.subscription` in Firestore on payment events
- [ ] Add `STRIPE_WEBHOOK_SECRET` to Vercel + the webhook handler in `/app/api/`

**Files**: `lib/stripe.ts`, `/app/api/webhook/route.ts` (check if exists), Vercel dashboard

---

### Task 11 · OCR Resilience 2.0 📷 `P0 from State doc`

- [ ] Test Gemini 2.5 Flash against blurry, reflective, crumpled fuel receipts
- [ ] Test against grocery store, phone bill, parking ticket formats
- [ ] Add confidence scoring — if confidence < threshold, show manual entry fallback UI
- [ ] Log OCR failures to `lib/admin-logs.ts` for quality monitoring

**Files**: `lib/ocr-service.ts`, receipt scanning UI component

---

### Task 12 · "Finglish" NLP Voice Upgrade 🗣️

- [ ] Update Gemini system prompt in `lib/gemini-api.ts` to explicitly handle code-switching ("Starttaa shiftaus", "Olen täs Wolt-deliveryssä")
- [ ] Add Finnish (`fi`) + Swedish (`sv`) as supported voice command languages
- [ ] Implement interruptible voice dialogue: pause session if a notification arrives, resume after

**Files**: `lib/gemini-api.ts` (or equivalent prompt location)

---

## 🟢 PHASE 3 — Q4 2026 (Proactive UX + Compliance Export)

---

### Task 13 · Defense PDF Generator 📄 `P1`

- [ ] Extend the existing `jspdf` + `jspdf-autotable` setup (already installed in `package.json`)
- [ ] Generate a 1-click "Vero-Ready" PDF audit report including:
  - All shifts with: purpose, odometer start/end, GPS breadcrumbs, timestamps
  - All receipts with: merchant, amount, VAT, category, scanned image reference
  - Summary: Annual gross, total deductions, YEL status, VAT status
- [ ] Add SHA-256 hash of report contents for tamper detection
- [ ] Format columns to match Procountor / Netvisor GL account codes

**Files**: `components/AnalyticsHub.tsx`, new `lib/pdf-generator.ts`

---

### Task 14 · Adaptive Driving Mode 🚗

- [ ] `isDrivingMode` already exists in `VeroContextType` — **wire it to a real trigger**
- [ ] Use device GPS speed (`currentLocation` updates) to auto-detect driving (>15 km/h)
- [ ] **Driving Mode**: large font, 2 buttons max, voice-first, suppress all non-critical UI
- [ ] **Stationary Mode**: full analytics, receipt management, export buttons
- [ ] Use `framer-motion` for smooth mode transition animation

**Files**: `components/VeroProvider.tsx`, `components/VeroDashboard.tsx`

---

### Task 15 · Gamification & Streaks 🏆

- [ ] Implement daily tracking streak counter (days with at least 1 logged shift)
- [ ] Show `canvas-confetti` (already installed) on streak milestones (3, 7, 14, 30 days)
- [ ] Add anonymized efficiency leaderboard: "Top €/KM in your region this week"
- [ ] Streak data stored in `UserProfile` in Firestore

**Files**: `components/AnalyticsHub.tsx`, `components/VeroProvider.tsx`

---

### Task 16 · Predictive Maintenance Alerts 🔧

- [ ] Calculate "KM until next oil change" from `UserProfile.maintenance.nextOilChange` minus `totalDistance`
- [ ] Trigger push notification (FCM) when within 200km of maintenance interval
- [ ] Auto-detect geofenced paid parking zones via GPS → prompt to log as expense

**Files**: `components/VehicleCenter.tsx`, new FCM integration

---

## 🔵 PHASE 4 — 2027+ (Community + B2B Scale)

| Feature | Description | Depends On |
| :--- | :--- | :--- |
| **Tax Bucketing** | Real-time: "Move €32.50 to tax savings after this shift" | Tax engine |
| **Finnish Waze Feed** | Live road alerts, Wolt app status, high-tip zone alerts for HEL/ESP/VAN | Capacitor + FCM |
| **Heat-Map Intelligence** | Anonymized historical profit hotspots on a city map | Analytics data volume |
| **GL Account Mapper** | Map expenses to Finnish chart of accounts (Tilikartta) for Procountor/Netvisor | Receipt Vault |
| **GDPR Right to Erasure** | 1-click data export + permanent deletion tool | Admin + Firebase |
| **RBAC for Staff** | Support vs. SuperAdmin permission levels | Admin Dashboard |
| **Feature Flags / Kill Switches** | Remotely disable OCR if Gemini costs spike | Admin Dashboard |
| **VeroTalk Messaging** | Encrypted voice-to-text courier-to-courier DMs | Capacitor + FCM |
| **B2B Accounting Portals** | Bulk seat management for Finnish accounting firms (Ukko.fi, Free.fi, OP) | RBAC + Stripe |
| **Multi-Driver Profit Splitter** | Automate payout calculations for shared Wolt/Foodora accounts | Shift model |
| **Weather-Impact AI** | Gemini predicts earnings based on weather forecast | Gemini + Weather API |

---

## 📊 Master Priority Table

| # | Task | Phase | Difficulty | Driver |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Enhanced Mileage Log UI | 0 | 🟢 Low | ⚖️ Vero 1131/2021 — **CRITICAL** |
| 2 | Immutable Record Locking | 0 | 🟢 Low | ⚖️ KPL 2:7§ — HIGH |
| 3 | Firebase Storage Versioning | 0 | ⚫ None | ⚖️ KPL 2:10§ — HIGH |
| 4 | Repo Cleanup | 0 | ⚫ None | 🧹 Hygiene |
| 5 | Capacitor Init | 1 | 🔴 High | 🛰️ Background GPS |
| 6 | Native Geolocation | 1 | 🟡 Medium | 🛰️ Platform reliability |
| 7 | Native Speech Recognition | 1 | 🟡 Medium | 🎙️ Voice AI reliability |
| 8 | Haptic Feedback | 1 | 🟢 Low | 🦺 Safety |
| 9 | Admin Dashboard Wiring | 2 | 🟢 Low | 📊 Business visibility |
| 10 | Stripe Live Integration | 2 | 🟡 Medium | 💳 **Revenue** |
| 11 | OCR Resilience 2.0 | 2 | 🟡 Medium | 📷 Product quality |
| 12 | Finglish NLP | 2 | 🟡 Medium | 🗣️ Core differentiator |
| 13 | Defense PDF Generator | 3 | 🟡 Medium | 📄 Compliance export |
| 14 | Adaptive Driving Mode | 3 | 🟡 Medium | 🚗 Safety UX |
| 15 | Gamification / Streaks | 3 | 🟢 Low | 🏆 Retention |
| 16 | Predictive Maintenance | 3 | 🔴 High | 🔧 Automation |

---

## 🚀 Recommended Starting Point

**Start with Task 1 (Enhanced Mileage Log UI)** because:
- ✅ Types already exist — zero schema migration needed
- ✅ `VeroContextType.startTracking(purpose, odometer)` signature is already defined
- ✅ Estimated effort: ~2 hours to add 2 inputs to `ShiftTracker.tsx`
- ✅ Moves audit status from ⚠️ *Qualified Opinion* → ✅ *Clean Opinion*
- ✅ Zero dependency on Capacitor, Stripe, or any external service

---

*Last updated: 2026-05-16 | Next review: when Phase 0 is complete*
