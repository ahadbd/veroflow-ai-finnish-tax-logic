# VeroFlow AI — Phase 3 Plan 🔵
> **Version**: 1.0 | **Created**: 2026-05-16  
> **Prerequisite**: Phase 0–2 ✅ Complete | Task 10 (Stripe Live) deferred  
> **Theme**: *From "Tax Tracker" → "Finnish Courier ERP"*

---

## 🎯 Phase 3 Vision

Phase 2 made VeroFlow AI **complete**. Phase 3 makes it **indispensable**.

The shift: couriers currently use the app *after* a shift to log data. Phase 3 makes VeroFlow the primary financial intelligence layer — predicting earnings, preventing tax debt, and connecting couriers to a real-time local community — so they cannot imagine working without it.

**Outcome target by end of Phase 3:**
- Churn rate < 5% (from retention features)
- Average session duration > 4 min (from community/intelligence features)
- B2B pipeline opened (accounting firms)
- App Store rating maintained ≥ 4.7 ⭐

---

## 📊 Phase 3 Task Table

| # | Task | Pillar | Difficulty | Priority | Driver |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 17 | Tax Bucket Engine | 💰 Peace of Mind | 🟡 Medium | 🔴 P0 | Churn reduction |
| 18 | GL Account Mapper | 📒 B2B Scale | 🟡 Medium | 🔴 P0 | B2B onboarding |
| 19 | Heat-Map Intelligence | 📍 Opportunity | 🔴 High | 🟠 P1 | Stickiness |
| 20 | Weather-Impact Revenue AI | 🌦️ Opportunity | 🟡 Medium | 🟠 P1 | Engagement |
| 21 | Finnish Waze Feed v2 | 🛣️ Community | 🔴 High | 🟠 P1 | Network effect |
| 22 | Anonymous Leaderboard | 🏆 Retention | 🟢 Low | 🟡 P2 | Gamification ext. |
| 23 | GDPR Right-to-Erasure | 🔒 Compliance | 🟢 Low | 🟡 P2 | Legal obligation |
| 24 | B2B Accounting Portal | 🏢 Scale | 🔴 High | 🟡 P2 | Revenue expansion |

---

## 🔴 P0 — Must Ship First

---

### Task 17 · Tax Bucket Engine 💰
> *"The #1 pain point in Finland is the Tax Surprise."*

**What it does:**
After every shift save, automatically calculate exactly how much to transfer to a "tax savings" bucket. Displayed as a persistent glanceable card on the dashboard.

**Logic:**
- `taxBucket = (grossPay × effectiveTaxRate) + (tips × 0.255 VAT) + YEL contribution`
- Show: "Move €28.40 to savings after this shift" as a push notification + in-app card
- Running total: "You owe ~€1,240 to Vero this year — €340 saved so far"
- Saved to Firestore: `UserProfile.taxSavings: number`

**Finnish GL codes to map:**

| Category | Account | Code |
|---|---|---|
| Fuel | Polttoaineet | 7300 |
| Vehicle Maintenance | Ajoneuvon huolto | 7320 |
| Phone/Data | Tietoliikenne | 7600 |
| Gross Earnings | Myyntituotot | 3000 |
| YEL | YEL-vakuutus | 5600 |
| Mileage Deduction | Kilometrikorvaus | 4520 |

**Files to create/modify:**
- `lib/tax-bucket.ts` — pure calculation engine
- `components/TaxBucketCard.tsx` — new sidebar widget
- `components/VeroProvider.tsx` — expose `taxBucketTotal`, `taxSavings`
- `types/index.ts` — add `taxSavings?: number` to `UserProfile`

**Effort**: ~4 hours | **Risk**: Low (pure math, no new APIs)

---

### Task 18 · GL Account Mapper (Tilikartta) 📒
> Required for B2B accounting firm partnerships (Ukko.fi, Free.fi, OP)

**What it does:**
Maps every receipt category and shift type to standard Finnish chart-of-accounts (Tilikartta) codes. Enables 1-click export to Procountor/Netvisor CSV format.

**UI components:**
- `GLMapperSettings.tsx` — settings screen section, user can override default GL codes
- Enhanced `VeroExport.tsx` — new "Procountor CSV" and "Netvisor CSV" export buttons

**Files to create/modify:**
- `lib/gl-mapper.ts` — new
- `components/GLMapperSettings.tsx` — new settings sub-section
- `components/VeroExport.tsx` — add GL-mapped CSV export
- `components/SettingsModal.tsx` — add GL Mapper tab

**Effort**: ~5 hours | **Risk**: Low (no new APIs, pure data mapping)

---

## 🟠 P1 — Ship in Parallel

---

### Task 19 · Heat-Map Intelligence 🗺️
> *"Show drivers where the 'Flow' is highest right now"*

**What it does:**
Anonymised aggregated €/km efficiency data from all users in a city creates a live earnings heat-map overlaid on a city map.

**Architecture:**
1. Firebase Cloud Function (every 15 min): reads last 24h shifts, groups by GPS 500m grid squares, computes average €/km per zone, writes to `heat_zones/{city}/{zoneId}`
2. Client: fetches `heat_zones/helsinki` on map open, renders with colour intensity
3. Privacy: GPS snapped to nearest 500m grid — individual routes never exposed

**UI:**
- `HeatMapView.tsx` — Leaflet.js interactive city map (no API key required)
- Colour legend: dark green (>€0.80/km) → yellow → red (<€0.30/km)
- Toggle: "Live Now" / "Last 7 Days" / "Peak Hours"

**Files to create/modify:**
- `components/HeatMapView.tsx` — new (lazy loaded)
- `lib/heatmap-client.ts` — Firestore zone fetcher + grid snapper
- `functions/aggregateHeatZones.ts` — Firebase Cloud Function
- `components/AnalyticsHub.tsx` — add "Zone Map" tab

**Effort**: ~8 hours | **Risk**: Medium (requires Cloud Functions deployment)

> Requires ~50 active users in a city for meaningful data. Ship with "Building data..." empty state.

---

### Task 20 · Weather-Impact Revenue AI 🌦️
> Gemini predicts likely earnings shift based on weather forecast

**What it does:**
Combines OpenWeatherMap 7-day forecast with the user's own historical €/shift by weather condition to predict: *"Tomorrow looks like a +18% tip day (Rain, 1°C)"*

**Logic:**
1. Fetch 7-day forecast via OpenWeatherMap free API
2. Bucket user's shift history by `weather.condition` (already stored in shifts)
3. Gemini analyses correlation: "On rainy days you average €X more than clear days"
4. Display as: 7-day forecast card with predicted earnings range overlay

**Files to create/modify:**
- `lib/weather-intelligence.ts` — forecast fetch + Gemini correlation
- `components/WeatherForecastCard.tsx` — new widget in AnalyticsHub
- `.env.local` — `NEXT_PUBLIC_OWM_API_KEY`

**Effort**: ~5 hours | **Risk**: Low (free API, Gemini already wired)

---

### Task 21 · Finnish Waze Feed v2 🛣️
> Real-time courier intelligence from the community — the biggest retention moat

**What it does:**
Couriers post and upvote real-time alerts in their city zone:
- 🔴 Ravintolaviive — restaurant delay
- 🟡 Tietyö — road work
- 🟢 Tip hotspot — high-tip area right now
- 🔵 Park & wait — safe waiting spots

**Architecture:**
- Firestore: `feed_posts/{city}/{postId}` with 2-hour TTL auto-expiry
- FCM topic push: `wolt-feed-{city}` for new urgent posts
- Anonymous author: shows zone only, never UID
- Vote system: upvote/downvote with Firestore `increment`

**Upgrading from existing `CourierFeed.tsx`:**
- Add: zone-aware filtering, expiry timer, FCM subscription, post composer modal

**Files to create/modify:**
- `components/CourierFeed.tsx` — major upgrade
- `lib/feed-service.ts` — Firestore CRUD + FCM subscription
- `components/FeedPostModal.tsx` — new post composer

**Effort**: ~8 hours | **Risk**: Medium (FCM topic subscription)

---

## 🟡 P2 — Polish & Scale

---

### Task 22 · Anonymous Regional Leaderboard 🏆
> Extends GamificationPanel with competitive community layer

**What it does:**
- Weekly top-10 couriers ranked by: efficiency (€/km), streaks, or XP
- Completely anonymous: "Kuski #4 — Helsinki • €0.91/km this week"
- User sees percentile rank: "You're in the top 12% of Helsinki couriers"
- Opt-in only (default: off for privacy)

**Files to create/modify:**
- `components/GamificationPanel.tsx` — add leaderboard tab
- `lib/leaderboard-service.ts` — Firestore reader + rank calculator
- `functions/computeLeaderboard.ts` — Firebase Cloud Function

**Effort**: ~5 hours | **Risk**: Low

---

### Task 23 · GDPR Right-to-Erasure Tool 🔒
> Legal requirement under GDPR Article 17

**What it does:**
1. "Export My Data" — complete JSON/PDF archive of all user data
2. "Delete My Account" — wipes Auth record, Firestore docs, Storage files, Stripe customer
3. 7-day grace period with cancellation option

**Files to create/modify:**
- `components/GDPRModal.tsx` — two-step confirmation UI
- `/app/api/gdpr/export/route.ts` — server action
- `/app/api/gdpr/delete/route.ts` — cascading deletion
- `components/SettingsModal.tsx` — add "Privacy & Data" section

**Effort**: ~5 hours | **Risk**: Medium (cascading deletion must be atomic)

---

### Task 24 · B2B Accounting Portal 🏢
> Opens the B2B revenue channel — Finnish accounting firms

**What it does:**
An accounting firm employee (Ukko.fi, Free.fi) gets `role: 'accountant'` Firebase claim.
They access a read-only portal with all their client couriers' data, pre-formatted for Procountor/Netvisor import.

**Architecture:**
- Firestore: `accountant_access/{accountantUid}/clients/{courierUid}`
- Firebase custom claims: `role: 'accountant'`
- New route: `/app/accountant/page.tsx`
- Couriers grant access via settings toggle (Pro+ only)

**Files to create/modify:**
- `/app/accountant/page.tsx` — new
- `components/AccountantDashboard.tsx` — new
- `/app/api/accountant/clients/route.ts` — Auth-gated reader
- `lib/gl-mapper.ts` — reused from Task 18

**Effort**: ~10 hours | **Risk**: High (new auth flow + Firestore rules)

---

## 📅 Suggested 4-Week Shipping Sequence

```
Week 1:  Task 17 (Tax Bucket) + Task 18 (GL Mapper)
         ↳ Revenue & B2B foundations — no Cloud Functions needed

Week 2:  Task 10 (Stripe Live) ← INSERT HERE
         + Task 20 (Weather AI) + Task 22 (Leaderboard)
         ↳ Quick wins + Stripe live to monetise new features

Week 3:  Task 19 (Heat Map) + Task 21 (Waze Feed)
         ↳ Community layer — requires Cloud Functions

Week 4:  Task 23 (GDPR) + Task 24 (B2B Portal)
         ↳ Legal & scale — requires new auth roles
```

---

## 🏗️ New Infrastructure Required

| Dependency | Tasks | Notes |
|---|---|---|
| Firebase Cloud Functions | 19, 21, 22, 24 | Blaze plan already active |
| OpenWeatherMap API key | 20 | Free tier: 1,000 calls/day |
| Leaflet.js | 19 | MIT license, no API key |
| FCM Topic Push | 21 | Capacitor groundwork done (Task 8) |

---

## 🔗 Stripe (Task 10) Dependency Note

Tasks 17, 18, 22, 24 become **more valuable** once Stripe is live:
- Accountant access (T24) requires Pro+ subscription check
- Leaderboard (T22) can be Elite-only
- Tax Bucket notifications (T17) are the strongest Pro upsell

> Stripe should be activated between Week 1 and Week 2.

---

*Phase 3 Plan | VeroFlow AI v1.6 | 2026-05-16*
