# VeroFlow AI — Mobile App Distribution Plan

## Current Status

| Thing | Status |
|---|---|
| `manifest.json` | ✅ Exists — but minimal (SVG icon only, no PNG sizes) |
| Capacitor installed | ✅ `@capacitor/android`, `@capacitor/ios`, scripts in `package.json` |
| Service Worker | ❌ Missing — required for "Add to Home Screen" prompt |
| `capacitor.config.ts` | ❓ Needs verification |
| App icons (PNG) | ❌ Missing — stores need 512×512 PNG minimum |

---

## Track 1: PWA — Users Can Install TODAY (Browser → Home Screen)

This is the fastest path. Zero app store needed. Android users already get a native install prompt if all criteria are met.

### Step 1 — Generate PNG Icon Set
Need these exact sizes in `/public/icons/`:
- `icon-192.png` (Android install prompt)
- `icon-512.png` (splash screen + store)
- `icon-apple-180.png` (iOS Safari "Add to Home Screen")
- `icon-maskable-512.png` (Android adaptive icon)

### Step 2 — Fix `manifest.json`
```json
{
  "name": "VeroFlow AI",
  "short_name": "VeroFlow",
  "description": "Finnish courier tax & profit automation.",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#050505",
  "theme_color": "#39FF14",
  "categories": ["finance", "business", "productivity"],
  "lang": "fi",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    { "src": "/dashboard_snapshot_real.png", "sizes": "1280x800", "type": "image/png", "form_factor": "wide" }
  ]
}
```

### Step 3 — Add Apple-specific meta tags to `layout.tsx`
```tsx
<link rel="apple-touch-icon" href="/icons/icon-apple-180.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="VeroFlow" />
```

### Step 4 — Add Service Worker via `next-pwa`
Install: `npm install next-pwa`
Wraps Next.js config — gives offline caching, background sync, install prompt trigger.

### Step 5 — Add "Install App" Banner to Landing Page
A dismissible banner on `VeroLanding.tsx`:
> 📲 **Install VeroFlow** — Add to your home screen for the full app experience.
> [INSTALL NOW] [×]

Uses the `beforeinstallprompt` browser event.

---

## Track 2: Native App Stores (Google Play + Apple App Store)

Capacitor is already installed — this is viable **now** with some work.

### How Capacitor Works
```
Next.js (web build) → Capacitor → Android Studio → Google Play
                               → Xcode (Mac required) → App Store
```
Your web app is wrapped in a native WebView shell. It looks and feels native.

### Prerequisites

| Requirement | Google Play | Apple App Store |
|---|---|---|
| Developer Account | $25 one-time | $99/year |
| Mac computer | ❌ Not needed | ✅ **Required** (Xcode only runs on macOS) |
| Android Studio | ✅ Install on Windows | N/A |
| App icons | 512×512 PNG | 1024×1024 PNG |
| Privacy Policy URL | Required | Required |
| Screenshots | Min 2 phone screenshots | Min 3 screenshots |

### Build Steps — Android (Google Play)

```bash
# 1. Build the web app
npm run build:mobile

# 2. Sync to Android
npx cap sync android

# 3. Open in Android Studio
npx cap open android
```
Then in Android Studio: Build → Generate Signed Bundle → upload `.aab` to Google Play Console.

### Build Steps — iOS (Apple App Store)
**Requires a Mac.** On Windows, options are:
- Use a Mac remotely (MacStadium, GitHub Codespaces Mac runner)
- Use [EAS Build](https://expo.dev/eas) — cloud build service (but requires Expo, not straightforward with Capacitor)
- Use **Codemagic CI/CD** — builds iOS Capacitor apps in the cloud ✅ Recommended

### App Store Listing Requirements

**Google Play:**
- App name: "VeroFlow AI — Kuriiri Vero"
- Short description (80 chars): "Finnish courier tax & earnings automation. Wolt & Uber Eats."
- Full description (4000 chars)
- Feature graphic: 1024×500px
- Screenshots: phone + 7-inch tablet

**Apple App Store:**
- App category: Finance
- Age rating: 4+
- Support URL: `https://veroflow-ai.vercel.app/contact`
- Privacy Policy URL: `https://veroflow-ai.vercel.app/privacy`

---

## Immediate Actions (Priority Order)

### Do Now — Zero Cost, Immediate Value
- [ ] Generate PNG icon set from existing SVG logo
- [ ] Fix `manifest.json` with proper PNG icons
- [ ] Add Apple meta tags to `layout.tsx`
- [ ] Install `next-pwa` and configure service worker
- [ ] Add install banner to `VeroLanding.tsx`

### Do Next — Android (Google Play)
- [ ] Create Google Play Developer account ($25)
- [ ] Verify `capacitor.config.ts` is correct
- [ ] Run `npm run cap:android` → Android Studio build
- [ ] Upload to Google Play Internal Testing track first
- [ ] Graduate to Production after 20 testers

### Do Later — iOS (App Store)
- [ ] Sign up for Apple Developer Program ($99/yr)
- [ ] Set up Codemagic for cloud iOS builds
- [ ] Submit for TestFlight beta
- [ ] App Store review (typically 1–3 days)

---

## PWA vs Native Comparison for VeroFlow

| Feature | PWA (now) | Capacitor Native |
|---|---|---|
| GPS tracking | ✅ Works | ✅ Better battery |
| Voice commands | ✅ Works | ✅ Works |
| Push notifications | ✅ Web push | ✅ Native push |
| Camera/OCR | ✅ Works | ✅ Works |
| WakeLock (HUD) | ✅ Works | ✅ Works |
| Offline | ⚠️ Needs service worker | ✅ Native cache |
| Discoverability | ❌ No app store listing | ✅ App store search |
| Install friction | Low (one tap) | Medium (store install) |
| Update speed | Instant | Store review delay |

**Recommendation**: Ship PWA improvements this week (users can install today), then submit to Google Play next. iOS can wait until you have a Mac or set up Codemagic.
