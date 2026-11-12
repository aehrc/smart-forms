import { defineConfig } from 'vitest/config';

export default defineConfig({
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
