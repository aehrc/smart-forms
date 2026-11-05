import { defineConfig } from 'vitest/config';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export default defineConfig({
  resolve: { alias: [{ find: /^fhirclient$/, replacement: require.resolve('fhirclient/lib/entry/browser.js') }] },
  test: {
    environment: 'jsdom',
    include: ['src/test/**/*.test.tsx'],
    setupFiles: ['./src/test/setup.ts'],
    fileParallelism: false,
    testTimeout: 10000,
    server: {
      deps: {
        inline: [/@aehrc\//, /@fontsource/]
      }
    }
  }
});
