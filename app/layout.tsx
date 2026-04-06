import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import FetchMitigation from '@/components/FetchMitigation';
import { VeroProvider } from '@/components/VeroProvider';
import CookieConsent from '@/components/CookieConsent';
import BackToTop from '@/components/BackToTop';
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
  title: 'VeroFlow AI',
  description: '2026 Finnish Courier Tax & Profitability Automation',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VeroFlow',
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
        </VeroProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
