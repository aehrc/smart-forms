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

import {
  isQuantityString,
  parseAndConvertUcumQuantities,
  validateQuantityUcumCode
} from '../utils/ucumQuantityConversion';
import { getItemTerminologyServerToUse } from '../utils/preferredTerminologyServer';
import { validateCodePromise } from '../utils/valueSet';
import type { Quantity, QuestionnaireItem } from 'fhir/r4';
import type { ValidateCodeResponse } from '../interfaces/valueSet.interface';
import { CalculatedExpression } from '../interfaces';

jest.mock('../utils/preferredTerminologyServer');
jest.mock('../utils/valueSet');

const mockGetItemTerminologyServerToUse = getItemTerminologyServerToUse as jest.Mock;
const mockValidateCodePromise = validateCodePromise as jest.Mock;

describe('isQuantityString', () => {
  it('returns true for valid quantity strings', () => {
    expect(isQuantityString("10 'mg'")).toBe(true);
    expect(isQuantityString("3.14 'cm'")).toBe(true);
    expect(isQuantityString("5 '\\''")).toBe(true); // escaped quote
  });

  it('returns false for invalid strings', () => {
    expect(isQuantityString('10mg')).toBe(false);
    expect(isQuantityString("ten 'mg'")).toBe(false);
    expect(isQuantityString(123)).toBe(false);
    expect(isQuantityString(null)).toBe(false);
  });
});

describe('validateQuantityUcumCode', () => {
  it('calls validateCodePromise with correct parameters', () => {
    mockGetItemTerminologyServerToUse.mockReturnValue('http://ts.example.org');
    mockValidateCodePromise.mockReturnValue(Promise.resolve({}));

    const qItem: Partial<QuestionnaireItem> = { linkId: 'q1', type: 'quantity' };

    const result = validateQuantityUcumCode(
      "10 'mg'",
      qItem as QuestionnaireItem,
      {},
      'http://default-ts.org'
    );

    expect(result.numericValueString).toBe('10');
    expect(mockGetItemTerminologyServerToUse).toHaveBeenCalledWith(
      qItem,
      {},
      'http://default-ts.org'
    );
    expect(mockValidateCodePromise).toHaveBeenCalledWith(
      'http://hl7.org/fhir/ValueSet/ucum-units',
      'http://unitsofmeasure.org',
      'mg',
      'http://ts.example.org'
    );
  });
});

describe('parseAndConvertUcumQuantities', () => {
  const qItem: Partial<QuestionnaireItem> = { linkId: 'q1', type: 'quantity' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('converts valid UCUM quantity strings into FHIR Quantity objects', async () => {
    const diffCalculatedExpressions: Record<string, CalculatedExpression[]> = {
      q1: [{ from: 'item', value: "10 'mg'", expression: "10 'mg'" }]
    };

    const questionnaireItemMap = {
      q1: qItem as QuestionnaireItem
    };

    const validateCodeResponse: ValidateCodeResponse = {
      resourceType: 'Parameters',
      parameter: [
        { name: 'system', valueUri: 'http://unitsofmeasure.org' },
        { name: 'code', valueCode: 'mg' },
        { name: 'display', valueString: 'mg' }
      ]
    };

    mockGetItemTerminologyServerToUse.mockReturnValue('http://ts.example.org');
    mockValidateCodePromise.mockResolvedValue(validateCodeResponse);

    const result = await parseAndConvertUcumQuantities(
      diffCalculatedExpressions,
      questionnaireItemMap,
      {},
      'http://default-ts.org'
    );

    const converted = result.q1[0].value as Quantity;
    expect(converted.value).toBe(10);
    expect(converted.system).toBe('http://unitsofmeasure.org');
    expect(converted.code).toBe('mg');
    expect(converted.unit).toBe('mg');
  });

  it('leaves value unchanged when item type is not quantity', async () => {
    const diffCalculatedExpressions: Record<string, CalculatedExpression[]> = {
      q1: [{ from: 'item', value: "10 'mg'", expression: "10 'mg'" }]
    };

    const questionnaireItemMap = {
      q1: { linkId: 'q1', type: 'string' } as QuestionnaireItem
    };

    const result = await parseAndConvertUcumQuantities(
      diffCalculatedExpressions,
      questionnaireItemMap,
      {},
      'http://default-ts.org'
    );

    expect(result.q1[0].value).toBe("10 'mg'");
  });

  it('leaves value unchanged when expression is not a valid UCUM quantity string', async () => {
    const diffCalculatedExpressions: Record<string, CalculatedExpression[]> = {
      q1: [{ from: 'item', value: 'not-a-quantity', expression: 'not-a-quantity' }]
    };

    const questionnaireItemMap = {
      q1: qItem as QuestionnaireItem
    };

    const result = await parseAndConvertUcumQuantities(
      diffCalculatedExpressions,
      questionnaireItemMap,
      {},
      'http://default-ts.org'
    );

    expect(result.q1[0].value).toBe('not-a-quantity');
  });

  it('leaves value unchanged when terminology server returns null', async () => {
    const diffCalculatedExpressions: Record<string, CalculatedExpression[]> = {
      q1: [{ from: 'item', value: "10 'mg'", expression: "10 'mg'" }]
    };

    const questionnaireItemMap = {
      q1: qItem as QuestionnaireItem
    };

    mockGetItemTerminologyServerToUse.mockReturnValue('http://ts.example.org');
    mockValidateCodePromise.mockResolvedValue(null);

    const result = await parseAndConvertUcumQuantities(
      diffCalculatedExpressions,
      questionnaireItemMap,
      {},
      'http://default-ts.org'
    );

    expect(result.q1[0].value).toBe("10 'mg'");
  });
});
