# VeroFlow AI — Master Development Plan 2026 🚀

> **Generated**: 2026-05-16 | **Version**: 1.2  
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
| **Mileage log UI** | ✅ Done (v1.2) | `purpose` + `odometerStart` inputs in `ShiftTracker.tsx` |
| **Immutable record locking** | ✅ Done (v1.2) | "Close Month" in `AnalyticsHub.tsx` + Firestore rules enforced |
| **Firestore security hardening** | ✅ Done (v1.2) | `isNotLocked()` guard — KPL 2:7§ compliant, deployed to prod |
| **Firebase Storage rules** | ✅ Done (v1.2) | `storage.rules` — user-scoped, 10MB limit, image/PDF only |
| **GCS 10-year retention script** | ✅ Done (v1.2) | `scripts/setup-gcs-retention.sh` — run after Storage activation |
| **CI build validation** | ✅ Done (v1.2) | `npm run build` step in CI with env secrets |
| **Capacitor infrastructure** | ✅ Done (v1.2) | `capacitor.config.ts`, dual-build, `lib/native.ts` abstraction |
| **Native GPS abstraction** | ✅ Done (v1.2) | `lib/native.ts` — Capacitor on device, browser fallback on web |
| **Haptic feedback** | ✅ Done (v1.2) | `vibrateSuccess/Warning()` on shift start/stop |
| **Native notifications** | ✅ Done (v1.2) | `scheduleLocalNotification()` fires on shift start |
| **App lifecycle resume** | ✅ Done (v1.2) | GPS resume notification after phone call/backgrounding |

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

## ✅ PHASE 0 — Legal Compliance `COMPLETE`

> All Phase 0 tasks are deployed to production. Phase 0 is **closed**.

| Task | Status | Commit |
| :--- | :--- | :--- |
| Task 1 · Enhanced Mileage Log UI | ✅ **Done** | Previous session |
| Task 2 · Immutable Record Locking | ✅ **Done** | `feat(compliance): KPL 2:7§` |
| Task 3 · Firebase Storage + Retention | ✅ **Done** | `feat(compliance): Task 3 — KPL 2:10§` |
| Task 4 · Repo Cleanup + CI | ✅ **Done** | Previous session |

---

## ✅ PHASE 1 — Native Mobile Platform `COMPLETE`

> Capacitor infrastructure is wired. `npx cap add ios` / `npx cap add android` requires macOS or Android Studio.

| Task | Status | Details |
| :--- | :--- | :--- |
| Task 5 · Capacitor Init | ✅ **Done** | `capacitor.config.ts` + dual-build (`NEXT_MOBILE=true`) |
| Task 6 · Native Geolocation | ✅ **Done** | `lib/native.ts` — `watchPosition()` wraps Capacitor on device |
| Task 7 · Native Speech Recognition | ✅ **Done** | `VoiceCommandCenter.tsx` pure derived state, no setState-in-effect |
| Task 8 · Haptic Feedback | ✅ **Done** | `vibrateSuccess/Warning()` on shift start/stop |

**To complete native builds** (when macOS available):
```bash
npx cap add ios      # requires macOS + Xcode
npx cap add android  # requires Android Studio
npm run cap:sync     # builds static export + syncs to native projects
```


## ✅ PHASE 2 — Q3 2026 (Admin + AI Intelligence) `COMPLETE`
**Goal: Replace all mock data with real metrics. Deepen AI accuracy.**

> All Phase 2 tasks are deployed to production. Task 10 (Stripe Live) deferred — keys not yet available.

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

## ✅ PHASE 3 — Q4 2026 (Proactive UX + Compliance Export) `COMPLETE`

> Tasks 13–16 are deployed to production. Phase 3 is **closed**.

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

## 🔵 PHASE 4 — Q1/Q2 2027 (Courier ERP + Community)
**Goal: From "Tax Tracker" → Indispensable Finnish Courier ERP. Open B2B channel.**

---

### Task 17 · Tax Bucket Engine 💰 `P0`
> *"The #1 pain point in Finland is the Tax Surprise."*

- [ ] After every shift save: compute `taxBucket = (grossPay × taxRate) + (tips × 0.255) + YEL`
- [ ] Show banner: "Move €28.40 to savings after this shift" + push notification
- [ ] Running annual total: "You owe ~€1,240 to Vero — €340 saved so far"
- [ ] New Firestore field: `UserProfile.taxSavings`
- [ ] Persistent sidebar card on dashboard

**Files**: `lib/tax-bucket.ts` (new), `components/TaxBucketCard.tsx` (new), `components/VeroProvider.tsx`, `types/index.ts`  
**Effort**: ~4h | **Risk**: Low

---

### Task 18 · GL Account Mapper (Tilikartta) 📒 `P0`
> Required for B2B accounting firm partnerships

- [ ] Map all receipt categories to Finnish chart-of-accounts codes (7300 Fuel, 3000 Gross, 5600 YEL, 4520 Mileage…)
- [ ] Add "Procountor CSV" and "Netvisor CSV" export buttons to `VeroExport`
- [ ] Settings tab: user can override default GL codes per category

**Files**: `lib/gl-mapper.ts` (new), `components/GLMapperSettings.tsx` (new), `components/VeroExport.tsx`, `components/SettingsModal.tsx`  
**Effort**: ~5h | **Risk**: Low

---

### Task 19 · Heat-Map Intelligence 🗺️ `P1`
> Anonymised €/km hotspots on a Leaflet.js city map

- [ ] Firebase Cloud Function: every 15 min, group last 24h shifts by 500m GPS grid, write avg €/km to `heat_zones/{city}/{zoneId}`
- [ ] Client: Leaflet.js map (no API key) with colour intensity overlay (green → red)
- [ ] Privacy: coordinates snapped to 500m grid — individual routes never stored
- [ ] Toggle: "Live Now" / "Last 7 Days" / "Peak Hours"
- [ ] Empty state: "Building data..." for cities below 50 active users

**Files**: `components/HeatMapView.tsx` (new), `lib/heatmap-client.ts` (new), `functions/aggregateHeatZones.ts` (Cloud Function), `components/AnalyticsHub.tsx`  
**Effort**: ~8h | **Risk**: Medium (Cloud Functions)

---

### Task 20 · Weather-Impact Revenue AI 🌦️ `P1`
> Gemini × personal history = earnings forecast

- [ ] Fetch OpenWeatherMap 7-day forecast (free API) for user's city
- [ ] Bucket user's historical shifts by `weather.condition`
- [ ] Gemini analyses correlation: "On rainy days you average €X more"
- [ ] Display: 7-day forecast strip with predicted €/shift range per day

**Files**: `lib/weather-intelligence.ts` (new), `components/WeatherForecastCard.tsx` (new), `components/AnalyticsHub.tsx`  
**Effort**: ~5h | **Risk**: Low

---

### Task 21 · Finnish Waze Feed v2 🛣️ `P1`
> Upgrade existing `CourierFeed` into a real-time community intelligence layer

- [ ] Firestore `feed_posts/{city}/{postId}` with 2-hour TTL auto-expiry
- [ ] FCM topic push: `wolt-feed-{city}` for new urgent posts
- [ ] Post categories: 🔴 Restaurant Delay / 🟡 Roadwork / 🟢 Tip Hotspot / 🔵 Park & Wait
- [ ] Anonymous authors (zone only, never UID)
- [ ] Upvote/downvote via Firestore `increment`
- [ ] Post composer modal with category picker + map pin

**Files**: `components/CourierFeed.tsx` (major upgrade), `lib/feed-service.ts` (new), `components/FeedPostModal.tsx` (new)  
**Effort**: ~8h | **Risk**: Medium

---

### Task 22 · Anonymous Regional Leaderboard 🏆 `P2`
> Extends GamificationPanel with competitive community layer

- [ ] Weekly top-10 per city: ranked by €/km, streak, or XP
- [ ] Format: "Kuski #4 — Helsinki • €0.91/km this week"
- [ ] User sees own percentile: "Top 12% of Helsinki couriers"
- [ ] Opt-in only (default: off). Elite plan exclusive.
- [ ] Cloud Function: `computeLeaderboard` writes to `leaderboard/{city}/week_{ISO}`

**Files**: `components/GamificationPanel.tsx`, `lib/leaderboard-service.ts` (new), `functions/computeLeaderboard.ts`  
**Effort**: ~5h | **Risk**: Low

---

### Task 23 · GDPR Right-to-Erasure Tool 🔒 `P2`
> Legal obligation under GDPR Article 17

- [ ] "Export My Data" → complete JSON + PDF archive of all user data
- [ ] "Delete My Account" → cascading wipe: Auth, Firestore, Storage, Stripe customer
- [ ] 7-day grace period with cancellation option
- [ ] Settings: new "Privacy & Data" section

**Files**: `components/GDPRModal.tsx` (new), `/app/api/gdpr/export/route.ts` (new), `/app/api/gdpr/delete/route.ts` (new), `components/SettingsModal.tsx`  
**Effort**: ~5h | **Risk**: Medium (cascading deletion must be atomic)

---

### Task 24 · B2B Accounting Portal 🏢 `P2`
> Opens B2B revenue channel — Finnish accounting firms (Ukko.fi, Free.fi, OP)

- [ ] Firebase custom claim: `role: 'accountant'`
- [ ] New route `/accountant` — read-only portal for all granted client couriers
- [ ] 1-click GL-mapped CSV export per client per month (reuses Task 18)
- [ ] Couriers grant access via Settings toggle (Pro+ only)
- [ ] Firestore: `accountant_access/{accountantUid}/clients/{courierUid}`

**Files**: `/app/accountant/page.tsx` (new), `components/AccountantDashboard.tsx` (new), `/app/api/accountant/clients/route.ts` (new)  
**Effort**: ~10h | **Risk**: High (new auth role + Firestore security rules)

---

## 🌐 PHASE 5 — 2027+ (Community + Scale)

| Feature | Description | Depends On |
| :--- | :--- | :--- |
| **RBAC for Staff** | Support vs. SuperAdmin permission levels | Admin Dashboard |
| **Feature Flags / Kill Switches** | Remotely disable OCR if Gemini costs spike | Admin Dashboard |
| **VeroTalk Messaging** | Encrypted voice-to-text courier DMs | Capacitor + FCM |
| **Multi-Driver Profit Splitter** | Payout calculations for shared Wolt/Foodora accounts | Shift model |
| **Direct Vero API Integration** | Future: submit ajopäiväkirja directly to tax authority | Government API |
| **Insurance Optimizer** | Liikennevakuutus alerts based on KM usage | Maintenance engine |
| **Apple Watch / WearOS HUD** | Speed + earnings on wrist during shift | Capacitor |

---

## 📊 Master Priority Table

| # | Task | Phase | Difficulty | Status | Driver |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Enhanced Mileage Log UI | 0 | 🟢 Low | ✅ Done | ⚖️ Vero 1131/2021 |
| 2 | Immutable Record Locking | 0 | 🟢 Low | ✅ Done | ⚖️ KPL 2:7§ |
| 3 | Firebase Storage Versioning | 0 | ⚫ None | ✅ Done | ⚖️ KPL 2:10§ |
| 4 | Repo Cleanup | 0 | ⚫ None | ✅ Done | 🧹 Hygiene |
| 5 | Capacitor Init | 1 | 🔴 High | ✅ Done | 🛰️ Background GPS |
| 6 | Native Geolocation | 1 | 🟡 Medium | ✅ Done | 🛰️ Platform reliability |
| 7 | Native Speech Recognition | 1 | 🟡 Medium | ✅ Done | 🎙️ Voice AI reliability |
| 8 | Haptic Feedback | 1 | 🟢 Low | ✅ Done | 🦺 Safety |
| 9 | Admin Dashboard Wiring | 2 | 🟢 Low | ✅ Done | 📊 Business visibility |
| 10 | Stripe Live Integration | 2 | 🟡 Medium | 🔲 Deferred | 💳 **Revenue** |
| 11 | OCR Resilience 2.0 | 2 | 🟡 Medium | ✅ Done | 📷 Product quality |
| 12 | Finglish NLP | 2 | 🟡 Medium | ✅ Done | 🗣️ Core differentiator |
| 13 | Defense PDF Generator | 3 | 🟡 Medium | ✅ Done | 📄 Compliance export |
| 14 | Adaptive Driving Mode | 3 | 🟡 Medium | ✅ Done | 🚗 Safety UX |
| 15 | Gamification / Streaks | 3 | 🟢 Low | ✅ Done | 🏆 Retention |
| 16 | Predictive Maintenance | 3 | 🔴 High | ✅ Done | 🔧 Automation |
| 17 | Tax Bucket Engine | 4 | 🟡 Medium | 🔲 Next | 💰 Churn reduction |
| 18 | GL Account Mapper | 4 | 🟡 Medium | 🔲 Next | 📒 B2B onboarding |
| 19 | Heat-Map Intelligence | 4 | 🔴 High | 🔲 Pending | 📍 Stickiness |
| 20 | Weather-Impact Revenue AI | 4 | 🟡 Medium | 🔲 Pending | 🌦️ Engagement |
| 21 | Finnish Waze Feed v2 | 4 | 🔴 High | 🔲 Pending | 🛣️ Network effect |
| 22 | Anonymous Leaderboard | 4 | 🟢 Low | 🔲 Pending | 🏆 Retention |
| 23 | GDPR Right-to-Erasure | 4 | 🟢 Low | 🔲 Pending | 🔒 Legal |
| 24 | B2B Accounting Portal | 4 | 🔴 High | 🔲 Pending | 🏢 Revenue expansion |

---

## 🚀 Current Focus — Phase 4: Courier ERP + Community

**Start with Task 17 (Tax Bucket Engine)** because:
- ✅ Pure calculation — no new external APIs or Cloud Functions needed
- ✅ Directly solves Finland's #1 courier pain point (tax surprise)
- ✅ Estimated effort: ~4 hours
- ✅ Strongest upsell argument once Stripe is live

**Then Task 18 (GL Mapper)** — unlocks B2B accounting firm partnerships.

**Slot Task 10 (Stripe Live)** between Week 1 and Week 2 when keys are available.

**4-Week Sequence:**
```
Week 1: Task 17 + Task 18   (no Cloud Functions needed)
Week 2: Task 10 (Stripe) + Task 20 + Task 22
Week 3: Task 19 + Task 21   (Cloud Functions — Blaze plan required)
Week 4: Task 23 + Task 24   (Legal + B2B auth)
```

---

*Last updated: 2026-05-16 v1.7 | Phase 0–3 ✅ | Task 10 deferred | Phase 4: Tasks 17–24 🔲 | Next: Task 17 (Tax Bucket)*
