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

import { readDecimalValue, readIntegerValue, readStringValue } from '../utils/readValues';
import type { QuestionnaireResponseItem } from 'fhir/r4';

describe('readDecimalValue', () => {
  it('returns default values when no answers', () => {
    const result = readDecimalValue(null, 2);
    expect(result).toEqual({ valueDecimal: 0.0, initialInput: '' });
  });

  it('reads valueDecimal correctly', () => {
    const qrItem: QuestionnaireResponseItem = {
      linkId: '1',
      answer: [{ valueDecimal: 12.34 }]
    };
    const result = readDecimalValue(qrItem, null);
    expect(result.valueDecimal).toBe(12.34);
    expect(result.initialInput).toBe('12.34');
  });

  it('reads valueInteger when present', () => {
    const qrItem: QuestionnaireResponseItem = {
      linkId: '1',
      answer: [{ valueInteger: 42 }]
    };
    const result = readDecimalValue(qrItem, null);
    expect(result.valueDecimal).toBe(42);
    expect(result.initialInput).toBe('42');
  });

  it('applies precision formatting', () => {
    const qrItem: QuestionnaireResponseItem = {
      linkId: '1',
      answer: [{ valueDecimal: 1.23456 }]
    };
    const result = readDecimalValue(qrItem, 2);
    expect(result.valueDecimal).toBe(1.23456);
    expect(result.initialInput).toBe('1.23');
  });
});

describe('readIntegerValue', () => {
  it('returns default values when no answers', () => {
    const result = readIntegerValue(null);
    expect(result).toEqual({ valueInteger: 0, initialInput: '' });
  });

  it('reads valueInteger correctly', () => {
    const qrItem: QuestionnaireResponseItem = {
      linkId: '1',
      answer: [{ valueInteger: 123 }]
    };
    const result = readIntegerValue(qrItem);
    expect(result.valueInteger).toBe(123);
    expect(result.initialInput).toBe('123');
  });

  it('rounds valueDecimal to integer', () => {
    const qrItem: QuestionnaireResponseItem = {
      linkId: '1',
      answer: [{ valueDecimal: 45.67 }]
    };
    const result = readIntegerValue(qrItem);
    expect(result.valueInteger).toBe(46);
    expect(result.initialInput).toBe('46');
  });
});

describe('readStringValue', () => {
  it('returns default values when no answers', () => {
    const result = readStringValue(null);
    expect(result).toEqual({ valueString: '', initialInput: '' });
  });

  it('reads valueString correctly', () => {
    const qrItem: QuestionnaireResponseItem = {
      linkId: '1',
      answer: [{ valueString: 'Hello world' }]
    };
    const result = readStringValue(qrItem);
    expect(result.valueString).toBe('Hello world');
    expect(result.initialInput).toBe('Hello world');
  });
});
