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

import { describe, expect, it } from '@jest/globals';
import { calculateRemainingTime, getTokenExpirationTime } from '../utils/tokenTimer';

describe('getTokenExpirationTime', () => {
  it('returns null when client is null', () => {
    expect(getTokenExpirationTime(null)).toBeNull();
  });

  it('returns null when tokenResponse or expires_in is missing', () => {
    const client = { state: {} } as any;
    expect(getTokenExpirationTime(client)).toBeNull();

    const clientMissingExpiresIn = { state: { tokenResponse: {} } } as any;
    expect(getTokenExpirationTime(clientMissingExpiresIn)).toBeNull();
  });

  it('returns expires_in when present', () => {
    const client = {
      state: {
        tokenResponse: {
          expires_in: 3600
        }
      }
    } as any;
    expect(getTokenExpirationTime(client)).toBe(3600);
  });
});

describe('calculateRemainingTime', () => {
  it('returns null if either argument is null', () => {
    expect(calculateRemainingTime(null, 3600)).toBeNull();
    expect(calculateRemainingTime(Date.now(), null)).toBeNull();
  });

  it('calculates remaining time correctly', () => {
    const now = Date.now();
    const received = now - 10_000; // 10 seconds ago
    const expiresIn = 60; // 60 seconds
    expect(calculateRemainingTime(received, expiresIn)).toBeGreaterThanOrEqual(50);
    expect(calculateRemainingTime(received, expiresIn)).toBeLessThanOrEqual(60);
  });

  it('returns 0 or negative if token has expired', () => {
    const now = Date.now();
    const received = now - 70_000; // 70 seconds ago
    const expiresIn = 60;
    expect(calculateRemainingTime(received, expiresIn)).toBeLessThanOrEqual(0);
  });
});
