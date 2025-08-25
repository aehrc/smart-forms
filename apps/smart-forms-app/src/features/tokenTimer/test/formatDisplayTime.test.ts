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

import { formatDisplayTime } from '../utils/formatDisplayTime';

describe('formatDisplayTime', () => {
  it('should format zero seconds correctly', () => {
    const result = formatDisplayTime(0);
    expect(result).toBe('0:00');
  });

  it('should format single digit seconds with leading zero', () => {
    const result = formatDisplayTime(5);
    expect(result).toBe('0:05');
  });

  it('should format double digit seconds without leading zero', () => {
    const result = formatDisplayTime(15);
    expect(result).toBe('0:15');
  });

  it('should format exactly one minute correctly', () => {
    const result = formatDisplayTime(60);
    expect(result).toBe('1:00');
  });

  it('should format minutes and seconds correctly', () => {
    const result = formatDisplayTime(75);
    expect(result).toBe('1:15');
  });

  it('should format minutes with single digit seconds', () => {
    const result = formatDisplayTime(125);
    expect(result).toBe('2:05');
  });

  it('should format exactly 59 seconds correctly', () => {
    const result = formatDisplayTime(59);
    expect(result).toBe('0:59');
  });

  it('should format 1 minute 59 seconds correctly', () => {
    const result = formatDisplayTime(119);
    expect(result).toBe('1:59');
  });

  it('should format large numbers of minutes correctly', () => {
    const result = formatDisplayTime(3661); // 61 minutes and 1 second
    expect(result).toBe('61:01');
  });

  it('should format very large time values', () => {
    const result = formatDisplayTime(7200); // 2 hours = 120 minutes
    expect(result).toBe('120:00');
  });

  it('should handle edge case of 10 seconds (boundary between single/double digit)', () => {
    const result = formatDisplayTime(10);
    expect(result).toBe('0:10');
  });

  it('should handle 9 seconds (single digit with padding)', () => {
    const result = formatDisplayTime(9);
    expect(result).toBe('0:09');
  });

  it('should format 10 minutes exactly', () => {
    const result = formatDisplayTime(600);
    expect(result).toBe('10:00');
  });

  it('should format large minutes with single digit seconds', () => {
    const result = formatDisplayTime(3607); // 60 minutes and 7 seconds
    expect(result).toBe('60:07');
  });

  it('should format large minutes with double digit seconds', () => {
    const result = formatDisplayTime(3655); // 60 minutes and 55 seconds
    expect(result).toBe('60:55');
  });

  it('should handle very small positive numbers', () => {
    const result = formatDisplayTime(1);
    expect(result).toBe('0:01');
  });

  it('should handle decimal input correctly', () => {
    const result = formatDisplayTime(65.5);
    expect(result).toBe('1:05.5');
  });

  it('should handle various common timer scenarios', () => {
    // 30 seconds
    expect(formatDisplayTime(30)).toBe('0:30');

    // 2 minutes 30 seconds
    expect(formatDisplayTime(150)).toBe('2:30');

    // 5 minutes
    expect(formatDisplayTime(300)).toBe('5:00');

    // 15 minutes
    expect(formatDisplayTime(900)).toBe('15:00');

    // 30 minutes
    expect(formatDisplayTime(1800)).toBe('30:00');
  });
});
