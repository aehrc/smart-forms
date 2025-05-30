import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Extend Vitest's expect with custom matchers if needed
// For now, we'll use standard Vitest assertions 