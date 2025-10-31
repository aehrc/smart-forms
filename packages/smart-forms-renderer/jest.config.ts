import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['src'],
  setupFilesAfterEnv: ['./src/setup-jest.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testPathIgnorePatterns: ['node_modules'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: './tsconfig.test.json'
    }]
  },
  testMatch: ['**/*.test.(ts|tsx)'],
  verbose: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '**/*.{ts,tsx}',                 // all TypeScript files
    '!**/*.config.{ts,tsx,js,jsx}',  // exclude config files
    '!**/*.d.ts',                    // exclude declaration files
    '!**/index.{ts,tsx}',            // exclude barrel files (e.g., index.ts)
    '!**/tests/**',                  // exclude tests folder
    '!**/test/**',                   // exclude test folder
    '!**/stories/**',                // exclude test folder
    '!**/theme/**',                  // exclude theme folder
    '!**/components/**',             // exclude components folder (for now)
    '!**/interfaces/**',             // exclude interfaces folder
  ],
  coverageThreshold: {
    "global": {
      "statements": 75,
      "branches": 70,
      "functions": 75,
      "lines": 75,
    }
  },
};

export default config;
