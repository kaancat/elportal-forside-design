import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable source maps for better debugging
    sourcemap: mode === 'development',
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    
    // Advanced chunking strategy for better caching
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          'chart-vendor': ['recharts', 'd3-scale', 'd3-scale-chromatic'],
          'sanity-vendor': ['@sanity/client', '@sanity/image-url', '@portabletext/react'],
          'utils': ['date-fns', 'clsx', 'tailwind-merge', 'zod'],
        },
        // Optimize asset file names for better caching
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) {
            return `assets/[name].[hash][extname]`;
          }
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name].[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name].[hash][extname]`;
          }
          return `assets/[name].[hash][extname]`;
        },
        chunkFileNames: 'js/[name].[hash].js',
        entryFileNames: 'js/[name].[hash].js',
      },
    },
    
    // Optimize CSS
    cssCodeSplit: true,
    
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: mode === 'production',
        pure_funcs: [], // Don't remove any console functions
      },
    },
    
    // Preload important chunks
    modulePreload: {
      polyfill: true,
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
    ],
    exclude: ['@sanity/client'], // Exclude heavy deps that are loaded on-demand
  },
}));
