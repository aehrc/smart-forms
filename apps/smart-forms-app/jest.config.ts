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
  setupFilesAfterEnv: ['./src/setup-jest.ts'],
  transform: {
    '^.+\\.(ts)$': ['ts-jest', {
      useESM: true,
      isolatedModules: true,
    }]
  },
  // Exclude "spec" folder
  testRegex: '(/__tests__/.*|(\\.|/)(test))\\.ts?$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',                 // all TypeScript files
    '!**/*.config.{ts,tsx,js,jsx}',  // exclude config files
    '!**/*.test.{ts,tsx}',           // exclude test files
    '!**/*.spec.{ts,tsx}',           // exclude test files
    '!**/*.d.ts',                    // exclude declaration files
    '!**/e2e/**',                    // exclude e2e
    '!src/theme/**',                 // explicitly exclude src/theme
    '!src/globals.ts',               // explicitly exclude src/globals.ts
    '!src/utils/dayjsExtend.ts',     // explicitly exclude src/utils/dayjsExtend.ts
    '!src/stores/selector.ts',       // explicitly exclude src/stores/selector.ts
    '!src/features/standalone/standaloneList.ts',       // explicitly exclude src/features/standalone/standaloneList.ts
  ],
  clearMocks: true,
  coverageDirectory: 'coverage'
};

export default config;
