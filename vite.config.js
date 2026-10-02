import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Production builds are served from https://<user>.github.io/restaurant-react/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/restaurant-react/' : '/',
  plugins: [react()],
  server: { port: 5173 },
}));
