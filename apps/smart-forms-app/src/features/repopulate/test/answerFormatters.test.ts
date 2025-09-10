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

import { getAnswerValueAsString } from '../utils/answerFormatters.ts';

describe('getAnswerValueAsString', () => {
  it('returns empty string if answer is null or undefined', () => {
    expect(getAnswerValueAsString(undefined as any)).toBe('');
    expect(getAnswerValueAsString(null as any)).toBe('');
  });

  it('returns valueString directly', () => {
    expect(getAnswerValueAsString({ valueString: 'foo' })).toBe('foo');
    expect(getAnswerValueAsString({ valueString: '' })).toBe('');
  });

  it('returns Yes/No for valueBoolean', () => {
    expect(getAnswerValueAsString({ valueBoolean: true })).toBe('Yes');
    expect(getAnswerValueAsString({ valueBoolean: false })).toBe('No');
  });

  it('returns integer as string', () => {
    expect(getAnswerValueAsString({ valueInteger: 42 })).toBe('42');
  });

  it('returns decimal as string', () => {
    expect(getAnswerValueAsString({ valueDecimal: 3.141 })).toBe('3.141');
  });

  it('formats valueDate as DD/MM/YYYY', () => {
    expect(getAnswerValueAsString({ valueDate: '2024-05-20' })).toBe('20/05/2024');
  });

  it('formats valueDateTime (YYYY-MM-DD) as DD/MM/YYYY hh:mm A (TZ=Australia/Sydney)', () => {
    expect(getAnswerValueAsString({ valueDateTime: '2024-05-20' })).toBe('20/05/2024 12:00 AM');
  });

  it('formats valueDateTime (YYYY-MM-DDThh:mm:ssZ) as DD/MM/YYYY hh:mm A (TZ=Australia/Sydney)', () => {
    expect(getAnswerValueAsString({ valueDateTime: '2024-05-20T15:12:00Z' })).toBe(
      '21/05/2024 01:12 AM'
    );
  });

  it('formats valueDateTime (YYYY-MM-DDThh:mm:ss±zz:zz) as DD/MM/YYYY hh:mm A', () => {
    expect(getAnswerValueAsString({ valueDateTime: '2024-05-20T15:12:00+10:00' })).toBe(
      '20/05/2024 03:12 PM'
    );
  });

  it('returns valueTime unchanged', () => {
    expect(getAnswerValueAsString({ valueTime: '09:30' })).toBe('09:30');
  });

  it('returns valueUri unchanged', () => {
    expect(getAnswerValueAsString({ valueUri: 'https://example.com' })).toBe('https://example.com');
  });

  it('formats valueQuantity as value and unit', () => {
    expect(getAnswerValueAsString({ valueQuantity: { value: 123, unit: 'mg' } })).toBe('123 mg');
    expect(getAnswerValueAsString({ valueQuantity: { value: 456 } })).toBe('456');
  });

  it('returns valueCoding.display if present, else code, else empty', () => {
    expect(getAnswerValueAsString({ valueCoding: { display: 'DisplayText', code: 'CODE' } })).toBe(
      'DisplayText'
    );
    expect(getAnswerValueAsString({ valueCoding: { code: 'CODE' } })).toBe('CODE');
    expect(getAnswerValueAsString({ valueCoding: {} })).toBe('');
  });

  it('returns valueAttachment.title if present, else "Attachment"', () => {
    expect(getAnswerValueAsString({ valueAttachment: { url: 'abc.com', title: 'Doc.pdf' } })).toBe(
      'Doc.pdf'
    );
    expect(getAnswerValueAsString({ valueAttachment: { url: 'abc.com' } })).toBe('Attachment');
  });

  it('returns valueReference.display if present, else reference, else empty', () => {
    expect(
      getAnswerValueAsString({
        valueReference: { display: 'Patient Name', reference: 'Patient/123' }
      })
    ).toBe('Patient Name');
    expect(getAnswerValueAsString({ valueReference: { reference: 'Patient/123' } })).toBe(
      'Patient/123'
    );
    expect(getAnswerValueAsString({ valueReference: {} })).toBe('');
  });

  it('returns empty string for unknown/empty input', () => {
    expect(getAnswerValueAsString({} as any)).toBe('');
  });
});
