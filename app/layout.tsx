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
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html suppressHydrationWarning lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head />
      <body suppressHydrationWarning>
        <FetchMitigation />
        <VeroProvider>
          {children}
        </VeroProvider>
      </body>
    </html>
  );
}
