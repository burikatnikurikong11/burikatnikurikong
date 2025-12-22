import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'
// import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false
    }),
    // Brotli compression
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false
    }),
    // PWA temporarily disabled due to compatibility issues with Vite 7
    // Will re-enable once stable version is available
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   injectRegister: 'auto',
    //   includeAssets: ['favicon.ico', 'robots.txt'],
    //   manifest: false,
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/api\.maptiler\.com\/.*/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'maptiler-cache',
    //           expiration: {
    //             maxEntries: 100,
    //             maxAgeSeconds: 60 * 60 * 24 * 7
    //           },
    //           cacheableResponse: {
    //             statuses: [0, 200]
    //           }
    //         }
    //       },
    //       {
    //         urlPattern: /^https:\/\/.*\.(glb|gltf)$/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: '3d-models-cache',
    //           expiration: {
    //             maxEntries: 50,
    //             maxAgeSeconds: 60 * 60 * 24 * 30
    //           }
    //         }
    //       },
    //       {
    //         urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif)$/,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'image-cache',
    //           expiration: {
    //             maxEntries: 200,
    //             maxAgeSeconds: 60 * 60 * 24 * 30
    //           }
    //         }
    //       }
    //     ]
    //   },
    //   devOptions: {
    //     enabled: false
    //   }
    // })
  ],
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Map libraries
          'map-vendor': ['maplibre-gl'],
          // 3D libraries  
          'three-vendor': ['three'],
          // UI libraries
          'ui-vendor': ['lucide-react', 'react-hot-toast'],
          // State and HTTP
          'state-vendor': ['zustand', 'axios'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Critical CSS inline, others split
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash].css';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    cssMinify: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'maplibre-gl', 'three', 'zustand'],
    exclude: ['web-vitals'],
    esbuildOptions: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    }
  },
  cacheDir: 'node_modules/.vite',
}))
