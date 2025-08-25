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

import dayjs from 'dayjs';
import '../dayjsExtend'; // Import to ensure dayjs is extended

describe('dayjsExtend', () => {
  describe('localizedFormat plugin', () => {
    it('should support localized format LT', () => {
      const date = dayjs('2023-01-01 12:00:00');
      const formatted = date.format('LT');

      expect(formatted).toBeTruthy();
      expect(formatted).toMatch(/\d{1,2}:\d{2}/); // Should contain time format
    });

    it('should support localized format L', () => {
      const date = dayjs('2023-01-01');
      const formatted = date.format('L');

      expect(formatted).toBeTruthy();
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Should contain date format
    });

    it('should support localized format LL', () => {
      const date = dayjs('2023-01-01');
      const formatted = date.format('LL');

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should support localized format LLL', () => {
      const date = dayjs('2023-01-01 12:00:00');
      const formatted = date.format('LLL');

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('customParseFormat plugin', () => {
    it('should parse custom format YYYY-MM-DD', () => {
      const parsed = dayjs('2023-12-25', 'YYYY-MM-DD');

      expect(parsed.isValid()).toBe(true);
      expect(parsed.year()).toBe(2023);
      expect(parsed.month()).toBe(11); // Month is 0-indexed
      expect(parsed.date()).toBe(25);
    });

    it('should parse custom format DD/MM/YYYY', () => {
      const parsed = dayjs('25/12/2023', 'DD/MM/YYYY');

      expect(parsed.isValid()).toBe(true);
      expect(parsed.year()).toBe(2023);
      expect(parsed.month()).toBe(11); // Month is 0-indexed
      expect(parsed.date()).toBe(25);
    });

    it('should parse custom format MM-DD-YYYY HH:mm', () => {
      const parsed = dayjs('12-25-2023 14:30', 'MM-DD-YYYY HH:mm');

      expect(parsed.isValid()).toBe(true);
      expect(parsed.year()).toBe(2023);
      expect(parsed.month()).toBe(11); // Month is 0-indexed
      expect(parsed.date()).toBe(25);
      expect(parsed.hour()).toBe(14);
      expect(parsed.minute()).toBe(30);
    });

    it('should return invalid for incorrect format', () => {
      const parsed = dayjs('not-a-date', 'YYYY-MM-DD');

      expect(parsed.isValid()).toBe(false);
    });

    it('should handle edge cases with strict parsing', () => {
      const parsed = dayjs('2023-02-30', 'YYYY-MM-DD', true); // Invalid date

      expect(parsed.isValid()).toBe(false);
    });
  });

  describe('plugin integration', () => {
    it('should work with both plugins together', () => {
      const parsed = dayjs('25/12/2023 14:30', 'DD/MM/YYYY HH:mm');
      const formatted = parsed.format('LLL');

      expect(parsed.isValid()).toBe(true);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should maintain default dayjs functionality', () => {
      const date = dayjs('2023-01-01');

      expect(date.isValid()).toBe(true);
      expect(date.format('YYYY-MM-DD')).toBe('2023-01-01');
    });

    it('should handle timezone operations', () => {
      const date = dayjs('2023-01-01T12:00:00Z');

      expect(date.isValid()).toBe(true);
      expect(date.toISOString()).toBe('2023-01-01T12:00:00.000Z');
    });
  });
});
