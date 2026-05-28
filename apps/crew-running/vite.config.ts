/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

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
    plugins: [react()],
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
