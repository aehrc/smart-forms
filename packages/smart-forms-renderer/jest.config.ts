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
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json'
    }
  }
};

export default config;
