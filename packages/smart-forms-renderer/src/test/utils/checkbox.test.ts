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

import { ariaCheckedMap } from '../../utils/checkbox';
import type { AriaCheckedAttributes } from '../../utils/checkbox';

describe('checkbox', () => {
  describe('AriaCheckedAttributes type', () => {
    it('should accept valid aria-checked values', () => {
      const trueValue: AriaCheckedAttributes = 'true';
      const falseValue: AriaCheckedAttributes = 'false';
      const mixedValue: AriaCheckedAttributes = 'mixed';
      
      expect(trueValue).toBe('true');
      expect(falseValue).toBe('false');
      expect(mixedValue).toBe('mixed');
    });
  });

  describe('ariaCheckedMap', () => {
    it('should be a Map instance', () => {
      expect(ariaCheckedMap).toBeInstanceOf(Map);
    });

    it('should map "true" to "true"', () => {
      expect(ariaCheckedMap.get('true')).toBe('true');
    });

    it('should map "false" to "false"', () => {
      expect(ariaCheckedMap.get('false')).toBe('false');
    });

    it('should map "intermediate" to "mixed"', () => {
      expect(ariaCheckedMap.get('intermediate')).toBe('mixed');
    });

    it('should have exactly 3 entries', () => {
      expect(ariaCheckedMap.size).toBe(3);
    });

    it('should return undefined for unmapped keys', () => {
      expect(ariaCheckedMap.get('unknown')).toBeUndefined();
      expect(ariaCheckedMap.get('')).toBeUndefined();
      expect(ariaCheckedMap.get('partial')).toBeUndefined();
    });

    it('should contain all expected key-value pairs', () => {
      const expectedEntries = [
        ['true', 'true'],
        ['false', 'false'],
        ['intermediate', 'mixed']
      ];

      expectedEntries.forEach(([key, value]) => {
        expect(ariaCheckedMap.has(key)).toBe(true);
        expect(ariaCheckedMap.get(key)).toBe(value);
      });
    });
  });
});
