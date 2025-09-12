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

import { extractedResourceIsBatchBundle } from '../api/extract';
import type { Bundle } from 'fhir/r4';

describe('extractedResourceIsBatchBundle', () => {
  it('returns true for valid transaction bundle', () => {
    const transactionBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: []
    };

    expect(extractedResourceIsBatchBundle(transactionBundle)).toBe(true);
  });

  it('returns true for valid batch bundle', () => {
    const batchBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'batch',
      entry: []
    };

    expect(extractedResourceIsBatchBundle(batchBundle)).toBe(true);
  });

  it('returns false for collection bundle', () => {
    const collectionBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: []
    };

    expect(extractedResourceIsBatchBundle(collectionBundle)).toBe(false);
  });

  it('returns false for searchset bundle', () => {
    const searchsetBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      entry: []
    };

    expect(extractedResourceIsBatchBundle(searchsetBundle)).toBe(false);
  });

  it('returns false for non-Bundle resource', () => {
    const patient = {
      resourceType: 'Patient',
      id: 'test-patient'
    };

    expect(extractedResourceIsBatchBundle(patient)).toBe(false);
  });

  it('returns false for null or undefined', () => {
    expect(extractedResourceIsBatchBundle(null)).toBe(false);
    expect(extractedResourceIsBatchBundle(undefined)).toBe(false);
  });

  it('returns false for object without resourceType', () => {
    const invalidObject = {
      type: 'transaction',
      entry: []
    };

    expect(extractedResourceIsBatchBundle(invalidObject)).toBe(false);
  });

  it('returns false for Bundle without type', () => {
    const bundleWithoutType = {
      resourceType: 'Bundle',
      entry: []
    };

    expect(extractedResourceIsBatchBundle(bundleWithoutType)).toBe(false);
  });

  it('returns false for empty object', () => {
    expect(extractedResourceIsBatchBundle({})).toBe(false);
  });
});
