import '@testing-library/jest-dom';

// Need to mock as nanoid is an ESM module
jest.mock('nanoid', () => ({
  nanoid: () => 'mocked-id-123'
}));
