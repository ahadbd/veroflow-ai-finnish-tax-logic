import type {NextConfig} from 'next';

/**
 * Dual-build configuration:
 *   - Web / Vercel:    NEXT_MOBILE unset → output: 'standalone' (API routes work)
 *   - Native / Cap:   NEXT_MOBILE=true  → output: 'export'     (static HTML for Capacitor)
 *
 * Build commands:
 *   npm run build          → Vercel / server deployment
 *   npm run build:mobile   → Capacitor static export → out/
 */
const isMobileBuild = process.env.NEXT_MOBILE === 'true';

const nextConfig: NextConfig = {
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
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
