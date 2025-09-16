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

import { isNonEmptyBundle } from '../typePredicates/isNonEmptyBundle';

describe('isNonEmptyBundle', () => {
  it('returns true for a valid Bundle object with non-empty entry', () => {
    const json = {
      resourceType: 'Bundle',
      entry: [{ id: 1 }]
    };
    expect(isNonEmptyBundle(json)).toBe(true);
  });

  it('returns false if resourceType is not Bundle', () => {
    const json = {
      resourceType: 'Patient',
      entry: [{ id: 1 }]
    };
    expect(isNonEmptyBundle(json)).toBe(false);
  });

  it('returns false if entry is missing', () => {
    const json = {
      resourceType: 'Bundle'
    };
    expect(isNonEmptyBundle(json)).toBe(false);
  });

  it('returns false if entry is empty', () => {
    const json = {
      resourceType: 'Bundle',
      entry: []
    };
    expect(isNonEmptyBundle(json)).toBe(false);
  });

  it('returns false when passing null or undefined', () => {
    expect(isNonEmptyBundle(null)).toBe(false);
    expect(isNonEmptyBundle(undefined)).toBe(false);
  });
});
