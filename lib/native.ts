/**
 * VeroFlow AI — Native Platform Abstraction Layer
 * lib/native.ts
 *
 * This module provides a unified interface for native device capabilities.
 * All components and hooks must use these functions instead of calling
 * browser APIs directly. This ensures:
 *   - Correct behaviour on both web (browser APIs) and native (Capacitor plugins)
 *   - Graceful degradation when running in the browser
 *   - Single place to swap implementations during Capacitor migration
 *
 * Usage:
 *   import { isNativePlatform, getNativeGPS, vibrateSuccess } from '@/lib/native';
 */

// ── Platform Detection ────────────────────────────────────────────────────────

/**
 * Returns true when running inside a Capacitor native shell (iOS or Android).
 * Returns false in browser (Vercel web app).
 */
export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

export function getPlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web';
  const cap = (window as any).Capacitor;
  if (!cap?.isNativePlatform?.()) return 'web';
  return cap.getPlatform() as 'ios' | 'android';
}

// ── Geolocation ──────────────────────────────────────────────────────────────

export interface GpsPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
}

/**
 * Get a single GPS fix. Uses Capacitor Geolocation on native, falls back
 * to browser navigator.geolocation on web.
 */
export async function getCurrentPosition(): Promise<GpsPosition | null> {
  if (isNativePlatform()) {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });
      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: new Date(pos.timestamp).toISOString(),
      };
    } catch (err) {
      console.error('[Native GPS] getCurrentPosition failed:', err);
      return null;
    }
  }

  // Browser fallback
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: new Date(pos.timestamp).toISOString(),
      }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

/**
 * Watch GPS position continuously.
 * Returns a cleanup function that stops the watcher.
 */
export async function watchPosition(
  onPosition: (pos: GpsPosition) => void,
  onError?: (err: unknown) => void
): Promise<() => void> {
  if (isNativePlatform()) {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');

      // Request permissions first on native
      const perm = await Geolocation.requestPermissions();
      if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
        onError?.('GPS permission denied');
        return () => {};
      }

      const watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true },
        (pos, err) => {
          if (err) { onError?.(err); return; }
          if (pos) {
            onPosition({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              timestamp: new Date(pos.timestamp).toISOString(),
            });
          }
        }
      );

      return () => { Geolocation.clearWatch({ id: watchId }); };
    } catch (err) {
      console.error('[Native GPS] watchPosition failed:', err);
      onError?.(err);
      return () => {};
    }
  }

  // Browser fallback
  if (!navigator.geolocation) { onError?.('no-geolocation'); return () => {}; }
  const id = navigator.geolocation.watchPosition(
    (pos) => onPosition({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: new Date(pos.timestamp).toISOString(),
    }),
    (err) => onError?.(err),
    { enableHighAccuracy: true }
  );
  return () => navigator.geolocation.clearWatch(id);
}

// ── Haptics ───────────────────────────────────────────────────────────────────

/**
 * Light vibration feedback. Used on shift start/stop for eyes-free confirmation.
 * Silent on web (no browser haptics API parity).
 */
export async function vibrateSuccess(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch { /* non-critical */ }
}

export async function vibrateWarning(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch { /* non-critical */ }
}

export async function vibrateTick(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch { /* non-critical */ }
}

// ── Local Notifications ───────────────────────────────────────────────────────

export interface VeroNotification {
  id: number;
  title: string;
  body: string;
  scheduleAt?: Date;
}

/**
 * Schedule or fire a local notification.
 * On web, falls back to the in-app notification toast (setNotification).
 */
export async function scheduleLocalNotification(n: VeroNotification): Promise<void> {
  if (!isNativePlatform()) return; // Web uses in-app toasts

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');

    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return;

    await LocalNotifications.schedule({
      notifications: [{
        id: n.id,
        title: n.title,
        body: n.body,
        ...(n.scheduleAt ? { schedule: { at: n.scheduleAt } } : {}),
        smallIcon: 'ic_stat_icon_config_sample',
        iconColor: '#39FF14',
        sound: undefined, // System default
        actionTypeId: '',
        extra: null,
      }],
    });
  } catch (err) {
    console.warn('[Native Notifications] schedule failed:', err);
  }
}

// ── Status Bar ────────────────────────────────────────────────────────────────

export async function setStatusBarDark(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1A1A1A' });
  } catch { /* non-critical */ }
}

export async function hideStatusBar(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const { StatusBar } = await import('@capacitor/status-bar');
    await StatusBar.hide();
  } catch { /* non-critical */ }
}

// ── App Lifecycle ─────────────────────────────────────────────────────────────

/**
 * Register a listener for the native "app resumed from background" event.
 * Used to resume GPS tracking after the courier receives a call.
 * Returns cleanup function.
 */
export async function onAppResume(cb: () => void): Promise<() => void> {
  if (!isNativePlatform()) return () => {};
  try {
    const { App } = await import('@capacitor/app');
    const handle = await App.addListener('resume', cb);
    return () => handle.remove();
  } catch {
    return () => {};
  }
}
