import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base = nome del repository GitHub: l'app sara' servita su
// https://igorbonfanti.github.io/magazzino-cartongesso/
// In dev (npm run dev) serve da '/' per non complicare gli URL locali.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/magazzino-cartongesso/' : '/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
}));
