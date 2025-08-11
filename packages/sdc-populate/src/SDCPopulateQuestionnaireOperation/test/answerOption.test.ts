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
});
