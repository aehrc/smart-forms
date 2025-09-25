import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout:40000,
    environment: 'jsdom',
    include: ['**/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}', '**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['**/e2e/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/e2e/**', '**/node_modules/**'],
    },
  },
});
