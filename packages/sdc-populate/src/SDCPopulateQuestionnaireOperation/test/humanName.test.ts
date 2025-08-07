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
import type { HumanName } from 'fhir/r4';
import { getDisplayName } from '../utils/humanName';

describe('constructName', () => {
  it('returns text field if present', () => {
    const name: HumanName[] = [{ text: 'Dr. John Smith' }];
    expect(getDisplayName(name)).toBe('Dr. John Smith');
  });

  it('constructs name from prefix, given, and family', () => {
    const name: HumanName[] = [
      {
        prefix: ['Dr.'],
        given: ['John'],
        family: 'Smith'
      }
    ];
    expect(getDisplayName(name)).toBe('Dr. John Smith');
  });

  it('handles missing prefix and given name', () => {
    const name: HumanName[] = [
      {
        family: 'Smith'
      }
    ];
    expect(getDisplayName(name)).toBe('Smith');
  });

  it('returns "null" for empty input', () => {
    expect(getDisplayName(undefined)).toBe('null');
    expect(getDisplayName([])).toBe('null');
    expect(
      getDisplayName([
        {
          prefix: [],
          given: [],
          family: ''
        }
      ])
    ).toBe('null');
  });
});
