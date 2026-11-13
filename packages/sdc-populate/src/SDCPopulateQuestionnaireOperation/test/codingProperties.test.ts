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
import type { Coding } from 'fhir/r4';
import { getRelevantCodingProperties } from '../utils/codingProperties';

describe('getRelevantCodingProperties', () => {
  const coding: Coding = {
    system: 'http://snomed.info/sct',
    code: '1234',
    display: 'Example display',
    version: '1.0',
    userSelected: true,
    extension: [{ url: 'http://example.com/some-extension', valueString: 'foo' }]
  };

  it('keeps extension by default', () => {
    expect(getRelevantCodingProperties(coding)).toEqual({
      system: 'http://snomed.info/sct',
      code: '1234',
      display: 'Example display',
      extension: [{ url: 'http://example.com/some-extension', valueString: 'foo' }]
    });
  });

  it('keeps extension when includeExtension is explicitly true', () => {
    expect(getRelevantCodingProperties(coding, { includeExtension: true })).toEqual({
      system: 'http://snomed.info/sct',
      code: '1234',
      display: 'Example display',
      extension: [{ url: 'http://example.com/some-extension', valueString: 'foo' }]
    });
  });

  it('strips extension when includeExtension is false, e.g. for a Coding read live off a source resource', () => {
    expect(getRelevantCodingProperties(coding, { includeExtension: false })).toEqual({
      system: 'http://snomed.info/sct',
      code: '1234',
      display: 'Example display'
    });
  });

  it('never adds an extension property when the Coding has none', () => {
    const codingWithoutExtension: Coding = {
      system: 'http://snomed.info/sct',
      code: '1234',
      display: 'Example display'
    };

    expect(getRelevantCodingProperties(codingWithoutExtension)).toEqual({
      system: 'http://snomed.info/sct',
      code: '1234',
      display: 'Example display'
    });
    expect(
      getRelevantCodingProperties(codingWithoutExtension, { includeExtension: true })
    ).not.toHaveProperty('extension');
  });
});
