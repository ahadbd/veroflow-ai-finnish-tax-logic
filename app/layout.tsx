import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import FetchMitigation from '@/components/FetchMitigation';
import { VeroProvider } from '@/components/VeroProvider';
import CookieConsent from '@/components/CookieConsent';
import BackToTop from '@/components/BackToTop';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const viewport: Viewport = {
  themeColor: '#39FF14',
};

export const metadata: Metadata = {
  title: 'VeroFlow AI — Finnish Courier Tax & Profit Automation',
  description: 'Stop leaking profit. VeroFlow AI automates Finnish tax returns, mileage deductions, YEL monitoring, predictive vehicle maintenance and real-time earnings for Wolt & Uber Eats couriers.',
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/icon-apple-180.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VeroFlow',
  },
  keywords: ['Finnish courier', 'vero', 'tax automation', 'Wolt', 'Uber Eats', 'YEL', 'mileage deduction', 'ALV', 'yrittäjä'],
  openGraph: {
    title: 'VeroFlow AI — Finnish Courier ERP v1.7',
    description: 'Automate your Finnish tax returns. Protect every euro.',
    locale: 'fi_FI',
    type: 'website',
  },
};


export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html suppressHydrationWarning lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head />
      <body suppressHydrationWarning>
        <FetchMitigation />
        <VeroProvider>
          {children}
          <CookieConsent />
          <BackToTop />
          <PWAInstallBanner />
        </VeroProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
