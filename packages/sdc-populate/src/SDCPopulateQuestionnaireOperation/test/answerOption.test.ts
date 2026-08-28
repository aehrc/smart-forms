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
import { findInAnswerOptions } from '../utils/answerOption';

describe('findInAnswerOptions', () => {
  const codingOption = {
    valueCoding: { system: 'http://loinc.org', code: '1234-5', display: 'Test Code' }
  };
  const codingDisplayOption = {
    valueCoding: { system: 'http://loinc.org', display: 'Test Display' }
  };
  const stringOption = {
    valueString: 'hello'
  };
  const intOption = {
    valueInteger: 42
  };
  const options = [codingOption, codingDisplayOption, stringOption, intOption];

  it('finds option by valueCoding.code', () => {
    const result = findInAnswerOptions(options, 'Test Code');
    expect(result).toEqual({
      valueCoding: { ...codingOption.valueCoding }
    });
  });

  it('finds option by valueCoding.display if code does not match', () => {
    const result = findInAnswerOptions(options, 'Test Display');
    expect(result).toEqual({
      valueCoding: { ...codingDisplayOption.valueCoding }
    });
  });

  it('finds option by valueString', () => {
    const result = findInAnswerOptions(options, 'hello');
    expect(result).toEqual({ valueString: 'hello' });
  });

  it('finds option by valueInteger', () => {
    const result = findInAnswerOptions(options, '42');
    expect(result).toEqual({ valueInteger: 42 });
  });

  it('returns undefined if no match', () => {
    const result = findInAnswerOptions(options, 'nope');
    expect(result).toBeUndefined();
  });

  it('returns undefined for empty options', () => {
    const result = findInAnswerOptions([], 'anything');
    expect(result).toBeUndefined();
  });

  it('finds option by Coding value matching system and code', () => {
    const result = findInAnswerOptions(options, { system: 'http://loinc.org', code: '1234-5' });
    expect(result).toEqual({
      valueCoding: { ...codingOption.valueCoding }
    });
  });

  it('finds option by Coding value without a system when codes match', () => {
    const result = findInAnswerOptions(options, { code: '1234-5' });
    expect(result).toEqual({
      valueCoding: { ...codingOption.valueCoding }
    });
  });

  it('returns undefined for Coding value with a different system', () => {
    const result = findInAnswerOptions(options, {
      system: 'http://snomed.info/sct',
      code: '1234-5'
    });
    expect(result).toBeUndefined();
  });

  it('returns undefined for Coding value with a non-matching code', () => {
    const result = findInAnswerOptions(options, { system: 'http://loinc.org', code: '9999-9' });
    expect(result).toBeUndefined();
  });

  it('does not match a Quantity-like object against coding options', () => {
    const quantity = { value: 10, unit: '1234-5', system: 'http://loinc.org', code: '1234-5' };
    const result = findInAnswerOptions(options, quantity as never);
    expect(result).toBeUndefined();
  });
});

describe('findInAnswerOptions zero-valued integer options', () => {
  it('matches answerOption valueInteger 0 for a populated string "0"', () => {
    const options = [{ valueInteger: 0 }, { valueInteger: 5 }];

    expect(findInAnswerOptions(options, '0')).toEqual({ valueInteger: 0 });
    expect(findInAnswerOptions(options, '5')).toEqual({ valueInteger: 5 });
  });
});

describe('findInAnswerOptions rejects non-Coding code-bearing objects', () => {
  it('does not match a value-less Quantity against a coding option by code', () => {
    const options = [{ valueCoding: { code: 'mg', display: 'milligram' } }];
    const quantityLike = {
      system: 'http://unitsofmeasure.org',
      code: 'mg',
      comparator: '<'
    };

    expect(findInAnswerOptions(options, quantityLike as never)).toBeUndefined();
  });

  it('still matches a genuine systemless coding by code', () => {
    const options = [{ valueCoding: { system: 'sys', code: 'mg', display: 'milligram' } }];

    expect(findInAnswerOptions(options, { code: 'mg' })).toEqual({
      valueCoding: { system: 'sys', code: 'mg', display: 'milligram' }
    });
  });
});
