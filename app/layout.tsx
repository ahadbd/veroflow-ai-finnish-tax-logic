import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css'; // Global styles
import FetchMitigation from '@/components/FetchMitigation';
import { VeroProvider } from '@/components/VeroProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'VeroFlow AI',
  description: '2026 Finnish Courier Tax & Profitability Automation',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  themeColor: '#39FF14',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VeroFlow',
  },
};

import CookieConsent from '@/components/CookieConsent';
import BackToTop from '@/components/BackToTop';

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
      </body>
    </html>
  );
}
