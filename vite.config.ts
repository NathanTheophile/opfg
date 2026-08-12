import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
  alias: {
    '@': path.resolve(import.meta.dirname, './src'),
  },
  },
  test: {
    environment: 'node',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'tools/event-authoring/tests/**',
      'tests/save.test.ts',
      'tests/contentReadiness.test.ts',
      'tests/childhoodOpeningSpine.test.ts',
      'tests/childhoodOpeningVariety.test.ts',
      'tests/lifetimeThread.test.ts',
      'tests/originsCareer.test.ts',
      'tests/simulation.test.ts',
      'tests/worldReadiness.test.ts',
      'tests/contentValidation.test.ts',
    ],
  },
});
