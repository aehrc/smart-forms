import { defineConfig } from 'vitest/config';

export default defineConfig({
  optimizeDeps: {
    include: ['react/jsx-dev-runtime']
  },
  test: {
    globals: true,
    testTimeout: 40000,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/*.test.tsx'],
    exclude: ['**/node_modules/**'],
    browser: {
      enabled: !!process.env.VITEST_HEADED,
      provider: 'playwright',
      headless: !process.env.VITEST_HEADED,
      ui: false,
      viewport: { width: 1280, height: 800 }, // Force desktop view
      instances: [
        {
          browser: 'chromium'
        }
      ]
    }
  }
});
