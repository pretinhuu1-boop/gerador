import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const devPort = Number(env.VITE_DEV_PORT) || 3100;
  const exposeLan = env.VITE_DEV_HOST === 'lan';

  return {
    server: {
      port: devPort,
      host: exposeLan ? '0.0.0.0' : '127.0.0.1',
      strictPort: false,
    },
    plugins: [react()],
  };
});
