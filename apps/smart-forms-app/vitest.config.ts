import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 40000,
    environment: 'jsdom',
    include: ['src/test/questionnaireRenderer.test.tsx'], // Only include this specific test file
    exclude: ['**/e2e/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/e2e/**', '**/node_modules/**'],
    },
    browser: {
      enabled: !!process.env.VITEST_HEADED,
      provider: 'playwright',
      headless: !process.env.VITEST_HEADED,
      ui: false,
      viewport: { width: 1280, height: 800 }, // Force desktop view
      instances: [
        {
          browser: 'chromium',
        },
      ],
    },
  },
});
