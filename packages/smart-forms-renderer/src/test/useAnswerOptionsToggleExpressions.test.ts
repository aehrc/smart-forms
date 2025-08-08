/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

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

import type { Coding, QuestionnaireItemAnswerOption } from 'fhir/r4';
import {
  generateCodingKey,
  generateOptionKey,
  hasMapChanged
} from '../hooks/useAnswerOptionsToggleExpressions';
import {
  evaluateInitialAnswerOptionsToggleExpressions,
  evaluateAnswerOptionsToggleExpressions
} from '../utils/answerOptionsToggleExpressions';

describe('hasMapChanged', () => {
  it('returns false when maps are equal', () => {
    const map1 = new Map([
      ['a', true],
      ['b', false]
    ]);
    const map2 = new Map([
      ['a', true],
      ['b', false]
    ]);

    expect(hasMapChanged(map1, map2)).toBe(false);
  });

  it('returns true when maps have different sizes', () => {
    const map1 = new Map([['a', true]]);
    const map2 = new Map([
      ['a', true],
      ['b', false]
    ]);

    expect(hasMapChanged(map1, map2)).toBe(true);
  });

  it('returns true when values differ for the same key', () => {
    const map1 = new Map([['a', true]]);
    const map2 = new Map([['a', false]]);

    expect(hasMapChanged(map1, map2)).toBe(true);
  });

  it('returns true when keys differ', () => {
    const map1 = new Map([['a', true]]);
    const map2 = new Map([['b', true]]);

    expect(hasMapChanged(map1, map2)).toBe(true);
  });

  it('returns false for two empty maps', () => {
    expect(hasMapChanged(new Map(), new Map())).toBe(false);
  });
});

describe('generateOptionKey', () => {
  it('generates key for valueCoding', () => {
    const option: QuestionnaireItemAnswerOption = {
      valueCoding: {
        system: 'http://loinc.org',
        code: '1234-5',
        display: 'Example'
      }
    };

    expect(generateOptionKey(option)).toBe('coding:http://loinc.org-1234-5-Example');
  });

  it('uses placeholders when valueCoding fields are missing', () => {
    const option: QuestionnaireItemAnswerOption = {
      valueCoding: {}
    };

    expect(generateOptionKey(option)).toBe('coding: - - ');
  });

  it('generates key for valueString', () => {
    const option: QuestionnaireItemAnswerOption = {
      valueString: 'Option A'
    };

    expect(generateOptionKey(option)).toBe('string:Option A');
  });

  it('generates key for valueInteger', () => {
    const option: QuestionnaireItemAnswerOption = {
      valueInteger: 42
    };

    expect(generateOptionKey(option)).toBe('integer:42');
  });

  it('returns empty string for unknown value types', () => {
    const option: QuestionnaireItemAnswerOption = {};

    expect(generateOptionKey(option)).toBe('');
  });
});

describe('generateCodingKey', () => {
  it('generates key from full Coding', () => {
    const coding: Coding = {
      system: 'http://loinc.org',
      code: '1234-5',
      display: 'Example display'
    };

    expect(generateCodingKey(coding)).toBe('coding:http://loinc.org-1234-5-Example display');
  });

  it('uses space placeholder when fields are missing', () => {
    const coding: Coding = {};
    expect(generateCodingKey(coding)).toBe('coding: - - ');
  });

  it('handles partially missing fields', () => {
    const coding: Coding = {
      system: 'http://snomed.info/sct'
    };
    expect(generateCodingKey(coding)).toBe('coding:http://snomed.info/sct- - ');
  });
});
