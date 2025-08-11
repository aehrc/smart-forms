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

import type { QuestionnaireItem, QuestionnaireItemInitial } from 'fhir/r4';
import { parseItemInitialToAnswer, parseValueToAnswer } from '../utils/parse';
import { checkIsDateTime, checkIsTime, convertDateTimeToDate } from '../utils/constructResponse';

describe('parseItemInitialToAnswer', () => {
  it('should return valueBoolean answer', () => {
    const initial: QuestionnaireItemInitial = { valueBoolean: true };
    expect(parseItemInitialToAnswer(initial)).toEqual({ valueBoolean: true });
  });

  it('should return valueDecimal answer', () => {
    const initial: QuestionnaireItemInitial = { valueDecimal: 12.34 };
    expect(parseItemInitialToAnswer(initial)).toEqual({ valueDecimal: 12.34 });
  });

  it('should return valueInteger answer', () => {
    const initial: QuestionnaireItemInitial = { valueInteger: 42 };
    expect(parseItemInitialToAnswer(initial)).toEqual({ valueInteger: 42 });
  });

  it('should return valueDate answer', () => {
    const initial: QuestionnaireItemInitial = { valueDate: '2025-08-06' };
    expect(parseItemInitialToAnswer(initial)).toEqual({ valueDate: '2025-08-06' });
  });

  it('should return valueDateTime answer', () => {
    const initial: QuestionnaireItemInitial = { valueDateTime: '2025-08-06T10:00:00Z' };
    expect(parseItemInitialToAnswer(initial)).toEqual({ valueDateTime: '2025-08-06T10:00:00Z' });
  });

  it('should return valueTime answer', () => {
    const initial: QuestionnaireItemInitial = { valueTime: '10:00:00' };
    expect(parseItemInitialToAnswer(initial)).toEqual({ valueTime: '10:00:00' });
  });

  it('should return valueString answer', () => {
    const initial: QuestionnaireItemInitial = { valueString: 'example' };
    expect(parseItemInitialToAnswer(initial)).toEqual({ valueString: 'example' });
  });

  it('should return valueUri answer', () => {
    const initial: QuestionnaireItemInitial = { valueUri: 'http://example.com' };
    expect(parseItemInitialToAnswer(initial)).toEqual({ valueUri: 'http://example.com' });
  });

  it('should return valueAttachment answer', () => {
    const initial: QuestionnaireItemInitial = {
      valueAttachment: { contentType: 'text/plain', data: 'ZmlsZSBjb250ZW50' }
    };
    expect(parseItemInitialToAnswer(initial)).toEqual({
      valueAttachment: { contentType: 'text/plain', data: 'ZmlsZSBjb250ZW50' }
    });
  });

  it('should return valueCoding answer with filtered fields', () => {
    const initial: QuestionnaireItemInitial = {
      valueCoding: {
        system: 'http://loinc.org',
        code: '1234-5',
        display: 'Example display',
        version: '1.0',
        userSelected: true
      }
    };
    const result = parseItemInitialToAnswer(initial);
    expect(result?.valueCoding).toMatchObject({
      system: 'http://loinc.org',
      code: '1234-5',
      display: 'Example display'
    });
  });

  it('should return valueQuantity answer', () => {
    const initial: QuestionnaireItemInitial = {
      valueQuantity: { value: 180, unit: 'cm', system: 'http://unitsofmeasure.org', code: 'cm' }
    };
    expect(parseItemInitialToAnswer(initial)).toEqual({
      valueQuantity: {
        value: 180,
        unit: 'cm',
        system: 'http://unitsofmeasure.org',
        code: 'cm'
      }
    });
  });

  it('should return valueReference answer', () => {
    const initial: QuestionnaireItemInitial = {
      valueReference: { reference: 'Patient/123', display: 'John Doe' }
    };
    expect(parseItemInitialToAnswer(initial)).toEqual({
      valueReference: { reference: 'Patient/123', display: 'John Doe' }
    });
  });

  it('should return null for unsupported input', () => {
    const initial: QuestionnaireItemInitial = {}; // no value[x]
    expect(parseItemInitialToAnswer(initial)).toBeNull();
  });
});

describe('parseValueToAnswer', () => {
  it('returns answerOption if found', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'choice',
      answerOption: [
        { valueString: 'opt1' },
        { valueCoding: { system: 'sys', code: 'code1', display: 'Code One' } }
      ]
    };
    const result = parseValueToAnswer(qItem, 'opt1');
    expect(result).toEqual({ valueString: 'opt1' });

    const result2 = parseValueToAnswer(qItem, 'code1');
    expect(result2).toEqual({
      valueCoding: { system: 'sys', code: 'code1', display: 'Code One' }
    });
  });

  it('returns valueBoolean for boolean type and boolean value', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'boolean'
    };
    expect(parseValueToAnswer(qItem, true)).toEqual({ valueBoolean: true });
    expect(parseValueToAnswer(qItem, false)).toEqual({ valueBoolean: false });
  });

  it('returns valueDecimal for decimal type and number value', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'decimal'
    };
    expect(parseValueToAnswer(qItem, 3.14)).toEqual({ valueDecimal: 3.14 });
  });

  it('returns valueInteger for integer type and number value', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'integer'
    };
    expect(parseValueToAnswer(qItem, 42)).toEqual({ valueInteger: 42 });
  });

  it('returns valueQuantity for object with unit', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'quantity'
    };
    const value = { unit: 'mg', value: 10 };
    expect(parseValueToAnswer(qItem, value)).toEqual({ valueQuantity: value });
  });

  it('returns valueCoding for object with system and code', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'choice'
    };
    const value = { system: 'sys', code: 'cd', display: 'disp' };

    expect(parseValueToAnswer(qItem, value)).toEqual({
      valueCoding: { system: 'sys', code: 'cd', display: 'disp' }
    });
  });

  it('returns valueDate for type date with valid datetime string', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'date'
    };
    const datetime = '2023-08-06T12:00:00Z';

    // checkIsDateTime should return true for this format
    expect(checkIsDateTime(datetime)).toBe(true);

    // The returned valueDate should be 'YYYY-MM-DD'
    const result = parseValueToAnswer(qItem, datetime);
    expect(result).toEqual({ valueDate: convertDateTimeToDate(datetime) });
  });

  it('returns valueDateTime for type dateTime with valid datetime string', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'dateTime'
    };
    const datetime = '2023-08-06T12:00:00Z';

    expect(checkIsDateTime(datetime)).toBe(true);
    expect(parseValueToAnswer(qItem, datetime)).toEqual({
      valueDateTime: datetime
    });
  });

  it('returns valueTime for type time with valid time string', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'time'
    };
    const time = '12:34:56';

    expect(checkIsTime(time)).toBe(true);
    expect(parseValueToAnswer(qItem, time)).toEqual({ valueTime: time });
  });

  it('returns valueString as fallback', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string'
    };
    expect(parseValueToAnswer(qItem, 'some string')).toEqual({
      valueString: 'some string'
    });
  });
});
