'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { getConsent } from './CookieConsent';

/**
 * GDPRAnalytics — Unconditionally mounts tracking components so they catch
 * early Web Vitals (FCP, LCP), but uses `beforeSend` to aggressively block
 * any data transmission unless explicit GDPR consent exists.
 */
export default function GDPRAnalytics() {
  return (
    <>
      <Analytics 
        beforeSend={(event) => {
          // Synchronously check localStorage when an event is about to fire
          const consent = getConsent();
          if (consent?.analytics) {
            return event;
          }
          return null; // Returning null drops the event (no tracking)
        }} 
      />
      <SpeedInsights 
        beforeSend={(event) => {
          const consent = getConsent();
          if (consent?.analytics) {
            return event;
          }
          return null; // Returning null drops the web vitals payload
        }} 
      />
    </>
  );
}
