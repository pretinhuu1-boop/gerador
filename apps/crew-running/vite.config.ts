/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const rawPort = env.VITE_DEV_PORT ? Number(env.VITE_DEV_PORT) : Number.NaN;
  const devPort = Number.isFinite(rawPort) ? rawPort : 3100;
  const exposeLan = (env.VITE_DEV_HOST ?? '').toLowerCase() === 'lan';

  return {
    server: {
      port: devPort,
      host: exposeLan ? '0.0.0.0' : '127.0.0.1',
      strictPort: false,
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'brand/logo.png',
          'brand/splash.png',
          'icons/apple-touch-icon.png',
        ],
        manifest: {
          name: 'The Crew Running',
          short_name: 'Crew Run',
          description: 'Corra com a crew. Rastreie corridas e conquiste badges.',
          theme_color: '#0a0a0a',
          background_color: '#0a0a0a',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          lang: 'pt-BR',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,woff2}', 'icons/*.png', 'brand/logo.png'],
          globIgnores: [
            'crews/**',
            'wardrobe/**',
            'backgrounds/**',
            'textures/**',
            'audio/**',
            'intro/**',
            'ui/**/*.{png,jpg,jpeg,webp}',
            'styles/**/*.{png,jpg,jpeg,webp}',
          ],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          navigateFallback: '/index.html',
          runtimeCaching: [
            {
              urlPattern: ({ url }) =>
                url.host.endsWith('tile.openstreetmap.org') ||
                url.host.endsWith('basemaps.cartocdn.com') ||
                url.host.endsWith('tiles.openfreemap.org'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'map-tiles',
                expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 14 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: ({ url }) =>
                url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com',
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'google-fonts' },
            },
            {
              urlPattern: ({ request, sameOrigin }) =>
                sameOrigin && request.destination === 'audio',
              handler: 'CacheFirst',
              options: {
                cacheName: 'app-audio',
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
                rangeRequests: true,
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: ({ request, sameOrigin }) =>
                sameOrigin && request.destination === 'image',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'app-images',
                expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    test: {
      environment: 'happy-dom',
      setupFiles: ['./test/setup.ts'],
      // tests/e2e/** are Playwright Test specs, not vitest — they import
      // @playwright/test which throws if executed in vitest's runner.
      exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
      environmentMatchGlobs: [
        ['**/data/**', 'node'],
        ['**/services/**', 'node'],
      ],
    },
  };
});
