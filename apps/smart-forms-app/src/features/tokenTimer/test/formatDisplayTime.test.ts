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
import { formatDisplayTime } from '../utils/formatDisplayTime';

describe('formatDisplayTime', () => {
  it('formats seconds less than 10 as 0X', () => {
    expect(formatDisplayTime(5)).toBe('0:05');
  });

  it('formats seconds between 10 and 59 correctly', () => {
    expect(formatDisplayTime(42)).toBe('0:42');
  });

  it('formats full minutes correctly', () => {
    expect(formatDisplayTime(60)).toBe('1:00');
    expect(formatDisplayTime(125)).toBe('2:05');
    expect(formatDisplayTime(3599)).toBe('59:59');
  });

  it('handles 0 seconds as 0:00', () => {
    expect(formatDisplayTime(0)).toBe('0:00');
  });
});
