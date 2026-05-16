declare module 'next-pwa' {
  import type { NextConfig } from 'next';
  interface PWAOptions {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: RegExp[];
    publicExcludes?: string[];
    runtimeCaching?: {
      urlPattern: RegExp | string;
      handler: string;
      options?: Record<string, unknown>;
    }[];
  }
  function withPWA(options: PWAOptions): (config: NextConfig) => NextConfig;
  export default withPWA;
}
