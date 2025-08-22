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
import { responseIsOperationOutcome } from '../utils/operationOutcome.ts';

describe('responseIsOperationOutcome', () => {
  it('returns true if response.resourceType is OperationOutcome', () => {
    const response = { resourceType: 'OperationOutcome' };
    expect(responseIsOperationOutcome(response)).toBe(true);
  });

  it('returns false if response.resourceType is not OperationOutcome', () => {
    const response = { resourceType: 'Questionnaire' };
    expect(responseIsOperationOutcome(response)).toBe(false);
  });

  it('returns false if resourceType is missing', () => {
    const response = {};
    expect(responseIsOperationOutcome(response)).toBe(false);
  });

  it('returns false if response is null or undefined', () => {
    expect(responseIsOperationOutcome(null)).toBe(false);
    expect(responseIsOperationOutcome(undefined)).toBe(false);
  });
});
