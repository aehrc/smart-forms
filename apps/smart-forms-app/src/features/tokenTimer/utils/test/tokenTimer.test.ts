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

import type Client from 'fhirclient/lib/Client';
import { getTokenExpirationTime, calculateRemainingTime } from '../tokenTimer';

describe('tokenTimer', () => {
  describe('getTokenExpirationTime', () => {
    it('should return expires_in from token response', () => {
      const mockClient = {
        state: {
          tokenResponse: {
            expires_in: 3600
          }
        }
      } as Client;

      const result = getTokenExpirationTime(mockClient);
      expect(result).toBe(3600);
    });

    it('should return null when client is null', () => {
      const result = getTokenExpirationTime(null);
      expect(result).toBeNull();
    });

    it('should return null when tokenResponse is undefined', () => {
      const mockClient = {
        state: {}
      } as Client;

      const result = getTokenExpirationTime(mockClient);
      expect(result).toBeNull();
    });

    it('should return null when expires_in is undefined', () => {
      const mockClient = {
        state: {
          tokenResponse: {}
        }
      } as Client;

      const result = getTokenExpirationTime(mockClient);
      expect(result).toBeNull();
    });

    it('should handle zero expires_in', () => {
      const mockClient = {
        state: {
          tokenResponse: {
            expires_in: 0
          }
        }
      } as Client;

      const result = getTokenExpirationTime(mockClient);
      expect(result).toBe(0);
    });

    it('should handle negative expires_in', () => {
      const mockClient = {
        state: {
          tokenResponse: {
            expires_in: -100
          }
        }
      } as Client;

      const result = getTokenExpirationTime(mockClient);
      expect(result).toBe(-100);
    });
  });

  describe('calculateRemainingTime', () => {
    beforeEach(() => {
      // Mock Date.now() to return consistent timestamp
      jest.spyOn(Date, 'now').mockReturnValue(1000000); // 1000 seconds since epoch
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should calculate remaining time correctly', () => {
      const tokenReceivedTimestamp = 950000; // 50 seconds ago
      const tokenExpirationTimeInSeconds = 3600; // 1 hour

      const result = calculateRemainingTime(tokenReceivedTimestamp, tokenExpirationTimeInSeconds);
      expect(result).toBe(3550); // 3600 - 50 = 3550 seconds remaining
    });

    it('should return null when tokenReceivedTimestamp is null', () => {
      const result = calculateRemainingTime(null, 3600);
      expect(result).toBeNull();
    });

    it('should return null when tokenExpirationTimeInSeconds is null', () => {
      const result = calculateRemainingTime(950000, null);
      expect(result).toBeNull();
    });

    it('should return null when both parameters are null', () => {
      const result = calculateRemainingTime(null, null);
      expect(result).toBeNull();
    });

    it('should handle zero expiration time', () => {
      const tokenReceivedTimestamp = 999000; // 1 second ago
      const tokenExpirationTimeInSeconds = 0;

      const result = calculateRemainingTime(tokenReceivedTimestamp, tokenExpirationTimeInSeconds);
      expect(result).toBeNull(); // Returns null because expiration time is falsy
    });

    it('should handle negative remaining time (expired token)', () => {
      const tokenReceivedTimestamp = 500000; // 500 seconds ago
      const tokenExpirationTimeInSeconds = 300; // 5 minutes

      const result = calculateRemainingTime(tokenReceivedTimestamp, tokenExpirationTimeInSeconds);
      expect(result).toBe(-200); // Token expired 200 seconds ago
    });

    it('should handle exact expiration time', () => {
      const tokenReceivedTimestamp = 997000; // 3 seconds ago
      const tokenExpirationTimeInSeconds = 3;

      const result = calculateRemainingTime(tokenReceivedTimestamp, tokenExpirationTimeInSeconds);
      expect(result).toBe(0); // Exactly expired
    });

    it('should floor elapsed time calculation', () => {
      // Test that elapsed time is floored, not rounded
      const tokenReceivedTimestamp = 999100; // 0.9 seconds ago
      const tokenExpirationTimeInSeconds = 10;

      const result = calculateRemainingTime(tokenReceivedTimestamp, tokenExpirationTimeInSeconds);
      expect(result).toBe(10); // 10 - 0 = 10 (elapsed time floored to 0)
    });

    it('should handle large time differences', () => {
      const tokenReceivedTimestamp = 1; // Very long ago but not 0 (which is falsy)
      const tokenExpirationTimeInSeconds = 2; // 2 seconds expiration

      const result = calculateRemainingTime(tokenReceivedTimestamp, tokenExpirationTimeInSeconds);
      expect(result).toBe(-997); // 2 - 999 = -997 (expired 997 seconds ago)
    });

    it('should handle recent token (just received)', () => {
      const tokenReceivedTimestamp = 1000000; // Just now
      const tokenExpirationTimeInSeconds = 3600;

      const result = calculateRemainingTime(tokenReceivedTimestamp, tokenExpirationTimeInSeconds);
      expect(result).toBe(3600); // Full expiration time remaining
    });

    it('should handle future timestamp (clock skew)', () => {
      const tokenReceivedTimestamp = 1100000; // 100 seconds in the future
      const tokenExpirationTimeInSeconds = 3600;

      const result = calculateRemainingTime(tokenReceivedTimestamp, tokenExpirationTimeInSeconds);
      expect(result).toBe(3700); // 3600 - (-100) = 3700
    });

    it('should return integer values only', () => {
      const tokenReceivedTimestamp = 999500; // 0.5 seconds ago
      const tokenExpirationTimeInSeconds = 1000;

      const result = calculateRemainingTime(tokenReceivedTimestamp, tokenExpirationTimeInSeconds);
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBe(1000); // Elapsed time is floored to 0
    });
  });
});
