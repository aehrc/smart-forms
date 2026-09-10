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
import type { AnswerOptionsToggleExpression } from '../interfaces/answerOptionsToggleExpression.interface';

// Mock the store
jest.mock('../stores', () => ({
  useQuestionnaireStore: {
    use: {
      answerOptionsToggleExpressions: () => mockAnswerOptionsToggleExpressions
    }
  }
}));

let mockAnswerOptionsToggleExpressions: Record<string, AnswerOptionsToggleExpression[]> = {};

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
  it('generates key for valueCoding by system+code, ignoring display', () => {
    const option: QuestionnaireItemAnswerOption = {
      valueCoding: {
        system: 'http://loinc.org',
        code: '1234-5',
        display: 'Example'
      }
    };

    expect(generateOptionKey(option)).toBe('coding:http://loinc.org-code:1234-5');
  });

  it('a code match is unaffected by a differing display (rename/re-resolution)', () => {
    const originalDisplay: QuestionnaireItemAnswerOption = {
      valueCoding: { system: 'http://loinc.org', code: '1234-5', display: 'Old Display' }
    };
    const renamedDisplay: QuestionnaireItemAnswerOption = {
      valueCoding: { system: 'http://loinc.org', code: '1234-5', display: 'New Display' }
    };

    expect(generateOptionKey(originalDisplay)).toBe(generateOptionKey(renamedDisplay));
  });

  it('falls back to display when code is missing', () => {
    const option: QuestionnaireItemAnswerOption = {
      valueCoding: { system: 'http://loinc.org', display: 'Example' }
    };

    expect(generateOptionKey(option)).toBe('coding:http://loinc.org-display:Example');
  });

  it('a coding with no code and display "X" never collides with a different coding whose code is "X"', () => {
    const noCodeOption: QuestionnaireItemAnswerOption = {
      valueCoding: { system: 'http://loinc.org', display: 'X' }
    };
    const codedOption: QuestionnaireItemAnswerOption = {
      valueCoding: { system: 'http://loinc.org', code: 'X', display: 'Something else' }
    };

    expect(generateOptionKey(noCodeOption)).not.toBe(generateOptionKey(codedOption));
  });

  it('uses placeholders when valueCoding fields are missing', () => {
    const option: QuestionnaireItemAnswerOption = {
      valueCoding: {}
    };

    expect(generateOptionKey(option)).toBe('coding: -display: ');
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
  it('generates key from full Coding by system+code, ignoring display', () => {
    const coding: Coding = {
      system: 'http://loinc.org',
      code: '1234-5',
      display: 'Example display'
    };

    expect(generateCodingKey(coding)).toBe('coding:http://loinc.org-code:1234-5');
  });

  it('uses space placeholder when fields are missing', () => {
    const coding: Coding = {};
    expect(generateCodingKey(coding)).toBe('coding: -display: ');
  });

  it('handles partially missing fields', () => {
    const coding: Coding = {
      system: 'http://snomed.info/sct'
    };
    expect(generateCodingKey(coding)).toBe('coding:http://snomed.info/sct-display: ');
  });

  it('a coding with no code and display "X" never collides with a different coding whose code is "X"', () => {
    const noCodeCoding: Coding = { system: 'http://loinc.org', display: 'X' };
    const codedCoding: Coding = {
      system: 'http://loinc.org',
      code: 'X',
      display: 'Something else'
    };

    expect(generateCodingKey(noCodeCoding)).not.toBe(generateCodingKey(codedCoding));
  });
});
