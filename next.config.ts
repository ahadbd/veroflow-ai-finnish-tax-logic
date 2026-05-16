import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

/**
 * Dual-build configuration:
 *   - Web / Vercel:    NEXT_MOBILE unset → output: 'standalone' (API routes work, PWA enabled)
 *   - Native / Cap:   NEXT_MOBILE=true  → output: 'export'     (static HTML for Capacitor, PWA disabled)
 *
 * Build commands:
 *   npm run build          → Vercel / server deployment (PWA service worker included)
 *   npm run build:mobile   → Capacitor static export → out/
 */
const isMobileBuild = process.env.NEXT_MOBILE === 'true';

const baseConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // Static export requires unoptimized images (no Image Optimization server)
    unoptimized: isMobileBuild,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Dual output: standalone for Vercel, export for Capacitor native builds
  output: isMobileBuild ? 'export' : 'standalone',
  // Mobile build: static export target dir (referenced in capacitor.config.ts)
  ...(isMobileBuild ? { distDir: 'out' } : {}),
  transpilePackages: ['motion'],
  webpack: (config, { dev }) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

// Only wrap with PWA for web builds (Capacitor export handles its own caching)
const nextConfig = isMobileBuild
  ? baseConfig
  : withPWA({
      dest: 'public',
      register: true,
      skipWaiting: true,
      disable: process.env.NODE_ENV === 'development', // avoid SW noise in dev
      buildExcludes: [/middleware-manifest\.json$/],
      publicExcludes: ['!icons/**/*', '!robots.txt'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
          },
        },
        {
          urlPattern: /^https:\/\/.*\.firebaseio\.com\/.*/i,
          handler: 'NetworkFirst',
          options: { cacheName: 'firebase-cache', networkTimeoutSeconds: 10 },
        },
      ],
    })(baseConfig);

export default nextConfig;
