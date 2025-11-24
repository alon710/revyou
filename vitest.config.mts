import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: [
      { find: '@/lib', replacement: path.resolve(__dirname, 'lib') },
      { find: '@/emails', replacement: path.resolve(__dirname, 'lib/emails') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
});
