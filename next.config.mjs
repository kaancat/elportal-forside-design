/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  // Using standard build (not static export) for SPA with client-side routing
  // output: 'export', // Removed for client component compatibility
  
  // Use default Next.js dist directory
  // distDir: '.next',
  
  // Phase 2: Use only App Router
  // Removed pageExtensions restriction to allow robots.ts and sitemap.ts
  // pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js', 'api.ts', 'api.js'],
  
  // Transpile problematic packages
  transpilePackages: ['react-denmark-map'],
  
  // Image configuration for Sanity and Unsplash (Phase 8 optimization)
  images: {
    // Enable modern image formats for optimal performance (Codex-recommended)
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Image sizes for srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 60 days
    minimumCacheTTL: 5184000,
    // Configure remote patterns for Sanity and Unsplash
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.iconify.design',
        pathname: '/**',
      },
    ],
  },
  
  // Fix legacy slug: redirect /sammenlign -> /leverandoer-sammenligning (permanent)
  async redirects() {
    return [
      {
        source: '/sammenlign',
        destination: '/leverandoer-sammenligning',
        permanent: true,
      },
      // Enforce canonical host: redirect www -> apex
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'www.dinelportal.dk' }
        ],
        destination: 'https://dinelportal.dk/:path*',
        permanent: true,
      },
    ]
  },
  
  // Trailing slash handling (matching current behavior)
  trailingSlash: false,
  
  // Enable strict mode for better development experience
  reactStrictMode: true,
  
  // TypeScript and ESLint
  typescript: {
    // During migration, allow builds to succeed with TypeScript errors
    ignoreBuildErrors: false,
  },
  eslint: {
    // During migration, allow builds to succeed with ESLint errors
    ignoreDuringBuilds: true,
  },
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Preserve path alias from Vite config
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    
    // Handle react-denmark-map ES module issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    // Let Next.js handle optimizations for Phase 1
    // Custom optimizations can be added in Phase 2 if needed
    
    return config;
  },
  
  // Experimental features for gradual adoption
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'recharts',
      '@sanity/client',
      '@portabletext/react',
    ],
  },
  
  
  // Environment variable validation
  env: {
    // Single source of truth for absolute URLs
    SITE_URL: process.env.SITE_URL || 'https://dinelportal.dk',
    NEXTJS_URL: process.env.SITE_URL || 'https://dinelportal.dk',
  },
};

export default nextConfig;
