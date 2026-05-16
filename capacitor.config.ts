import { CapacitorConfig } from '@capacitor/cli';

/**
 * VeroFlow AI — Capacitor Configuration
 *
 * Build strategy:
 *   - Web / Vercel: uses `output: 'standalone'` in next.config.ts (server routes intact)
 *   - Native iOS/Android: `npm run build:mobile` produces `out/` (static export)
 *     then `npx cap sync` copies it into the native projects.
 *
 * To build and sync:
 *   npm run build:mobile   → next build with NEXT_MOBILE=true (static export)
 *   npx cap sync           → copy out/ to ios/android + update plugins
 *   npx cap open ios       → open Xcode
 *   npx cap open android   → open Android Studio
 */
const config: CapacitorConfig = {
  appId: 'fi.veroflow.app',
  appName: 'VeroFlow AI',
  webDir: 'out',           // Static export directory (mobile build only)
  bundledWebRuntime: false,

  server: {
    // Allow live-reload against the Next.js dev server during development.
    // Comment this out for production native builds.
    // url: 'http://192.168.1.X:3000',
    // cleartext: true,
  },

  plugins: {
    // ── Geolocation ─────────────────────────────────────────────────────────
    // Native GPS — bypasses browser permission dialogs on iOS/Android.
    // enableHighAccuracy must be true for accurate mileage logging.
    Geolocation: {
      // iOS: NSLocationWhenInUseUsageDescription set in Info.plist
      // iOS: NSLocationAlwaysUsageDescription set in Info.plist (for background)
    },

    // ── Local Notifications ─────────────────────────────────────────────────
    // Used to alert couriers of: YEL threshold crossings, shift reminders,
    // and compliance warnings (e.g. "Month not closed yet").
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#39FF14',
      sound: 'beep.wav',
    },

    // ── Status Bar ───────────────────────────────────────────────────────────
    // Keep status bar dark-content on light driving mode overlay.
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#1A1A1A',
    },

    // ── Haptics ──────────────────────────────────────────────────────────────
    // Light haptic feedback on shift start/stop for eyes-free confirmation.
    // No config needed — triggered programmatically via lib/native.ts.
  },

  ios: {
    // Scheme used by the WKWebView — must match Info.plist URL scheme
    scheme: 'veroflow',
    // Background modes: 'location' allows GPS tracking when app is backgrounded
    // This is set in Xcode capabilities, referenced here for documentation.
    contentInset: 'automatic',
    // allowsLinkPreview: false — prevent accidental link previews on courier swipes
    allowsLinkPreview: false,
    // Minimum iOS version: 15.0 (WKWebView fullscreen + background location)
    minVersion: '15.0',
  },

  android: {
    // Allow mixed content in WebView (Firebase calls)
    allowMixedContent: true,
    // Capture input for voice commands when screen is off
    captureInput: true,
    // WebView debugging enabled for dev builds (disable in release)
    webContentsDebuggingEnabled: false,
    // Minimum SDK: 26 (Android 8.0) — required for background location
    minWebViewVersion: 80,
    // BackgroundColor matches app dark theme
    backgroundColor: '#1A1A1A',
  },
};

export default config;
