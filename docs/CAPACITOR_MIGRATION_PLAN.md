# VeroFlow AI: Capacitor Native Migration Plan

This document outlines the step-by-step strategy for converting the VeroFlow AI Next.js web application into native iOS and Android applications. This solves the browser restrictions related to background GPS tracking and Voice Commands when couriers are actively using the Wolt or Uber Eats app.

## 1. Architectural Strategy

We will maintain a single codebase. The backend API routes (like `/app/api/checkout`) will continue to run on Vercel. 
The client-side UI (`app/` pages) will be exported as static HTML/JS files, which **Capacitor** will bundle into `.apk` and `.ipa` files.

### Next.js Preparation
1. Update `next.config.mjs` to ensure the project is fully compatible with static exports.
2. Ensure all API calls use absolute URLs (e.g., `https://veroflow.fi/api/...`) instead of relative paths since the mobile apps won't share the same origin as the API.

## 2. Setting Up Capacitor

Run the following inside the root directory to initialize Capacitor:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "VeroFlow AI" "fi.veroflow.app"
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

## 3. Replacing Web APIs with Native Hardware Plugins

To achieve continuous background execution, we must swap basic browser APIs for Capacitor alternatives.

### A. Background GPS & Geolocation
* **Remove:** Basic `navigator.geolocation` hook in `VeroProvider.tsx`.
* **Install:** `@capacitor/geolocation` and configure iOS `Info.plist` and Android `AndroidManifest.xml` for `ACCESS_BACKGROUND_LOCATION` and `NSLocationAlwaysAndWhenInUseUsageDescription`.
* **Action:** Request "Always On" permission on shift start.

### B. Speech Recognition (Voice AI)
* **Remove:** Browser `window.SpeechRecognition` and `webkitSpeechRecognition`.
* **Install:** `@capacitor-community/speech-recognition`.
* **Action:** This forces the app to bypass browser audio suspension and use the native Google Assistant / Siri core engines for extreme accuracy while driving.

### C. Haptics (Physical Feedback)
* **Install:** `@capacitor/haptics`.
* **Action:** Trigger a device vibration (`Haptics.impact({ style: ImpactStyle.Heavy })`) when a voice command is successfully parsed, so couriers do not need to look away from the road to confirm the action succeeded.

## 4. Development Workflow

Once installed, testing native functionality requires opening the respective IDEs:
* **Android:** `npx cap open android` (Requires Android Studio)
* **iOS:** `npx cap open ios` (Requires Xcode and a Mac)

Each time changes are made to Next.js components, you must rebuild the web output and sync it to native:
```bash
npm run build
npx cap sync
```

## 5. Long-term Considerations
* **Push Notifications:** Firebase Cloud Messaging can be added via `@capacitor/push-notifications` to notify couriers of upcoming tax deadlines.
* **App Store Reviews:** Since you handle authentication via Firebase and offer SaaS subscriptions, you must be prepared for Apple's App Store rules regarding digital purchases if Stripe is the primary checkout engine inside the iOS shell.
