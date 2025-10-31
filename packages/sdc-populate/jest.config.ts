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
  roots: ['<rootDir>'],
  setupFilesAfterEnv: ['./src/setup-jest.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json', // or the path to your test tsconfig
        diagnostics: {
          exclude: ['**/*.test.ts', '**/*.spec.ts'], // only ignore test file errors
        },
      },
    ],
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverage: true,
  clearMocks: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '**/*.{ts,tsx}',                 // all TypeScript files
    '!**/*.config.{ts,tsx,js,jsx}',  // exclude config files
    '!**/*.d.ts',                    // exclude declaration files
    '!**/index.{ts,tsx}',            // exclude barrel files (e.g., index.ts)
    '!**/tests/**',                  // exclude test folder
    '!**/test/**',                   // exclude test folder
    '!**/setup-jest.ts',             // exclude setup-jest file
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
