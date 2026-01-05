/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  roots: ['src'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    'src/test/questionnaireRenderer.test.tsx' // Exclude this specific test file (it uses Vitest)
  ],
  setupFilesAfterEnv: ['./src/setup-jest.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      isolatedModules: true,
    }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@aehrc|@fontsource)/)'
  ],
  moduleNameMapper: {
    '^@fontsource/(.*)$': '<rootDir>/__mocks__/emptyModule.js'
  },
  // Exclude "spec" folder
  testRegex: '(/__tests__/.*|(\\.|/)(test))\\.(ts|tsx)?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/api/*.{ts,tsx}',
    '**/hooks/*.{ts,tsx}',
    '**/utils/*.{ts,tsx}',
    '**/contexts/*.{ts,tsx}',
    '!**/*.config.{ts,tsx,js,jsx}',  // exclude config files
    '!**/*.test.{ts,tsx}',           // exclude test files
    '!**/*.spec.{ts,tsx}',           // exclude spec files
    '!**/*.styles.{ts,tsx}',         // exclude style files
    '!**/*.interface.{ts,tsx}',      // exclude interface files
    '!**/*.d.ts',                    // exclude declaration files
    '!**/e2e/**',                    // exclude e2e files
    '!src/test/data-shared/**',      // explicitly exclude src/test/data-shared
    '!src/features/standalone/**',    // explicitly exclude src/features/standalone
    '!src/theme/**',                 // explicitly exclude src/theme
    '!src/globals.ts',               // explicitly exclude src/globals.ts
    '!src/utils/dayjsExtend.ts',     // explicitly exclude src/utils/dayjsExtend.ts
    '!src/stores/selector.ts',       // explicitly exclude src/stores/selector.ts
  ],
  coverageThreshold: {
    "global": {
      "statements": 75,
      "branches": 70,
      "functions": 75,
      "lines": 75,
    }
  },
  clearMocks: true,
  coverageDirectory: 'coverage'
};

export default config;
