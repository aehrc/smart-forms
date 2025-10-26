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

import type { CalculatedExpression } from '../interfaces';
import type { Quantity, QuestionnaireItem } from 'fhir/r4';
import { getItemTerminologyServerToUse } from './preferredTerminologyServer';
import { validateCodePromise } from './valueSet';
import type {
  CodeParameter,
  DisplayParameter,
  SystemParameter,
  ValidateCodeResponse
} from '../interfaces/valueSet.interface';

const UCUM_VALUE_SET_URL = 'http://hl7.org/fhir/ValueSet/ucum-units';
const UCUM_SYSTEM = 'http://unitsofmeasure.org';

/**
 * Validates if a value represents a quantity with a unit enclosed in single quotes,
 * supporting escaped single quotes within the unit.
 *
 * @param input - The value to validate.
 * @returns {boolean} Returns true if the input matches the pattern: a number followed by a space and a unit enclosed in single quotes, (allowing escaped single quotes); otherwise, false.
 */
export function isQuantityString(input: unknown): input is string {
  const regex = /^\d+(?:\.\d+)?\s+'(?:\\'|[^'])*'$/;
  return typeof input === 'string' && regex.test(input);
}

interface UcumQuantityPromise {
  numericValueString: string;
  promise: Promise<ValidateCodeResponse | null>;
}

/**
 * Validates a UCUM unit code from a FHIR Quantity string using a terminology server.
 * Based on https://hl7.org/fhirpath/N1/#toquantityunit-string-quantity.
 *
 * @param rawValue - Quantity string (e.g. "10 'mg'").
 * @param qItem - The QuestionnaireItem metadata.
 * @param itemPreferredTerminologyServers - Map of item-specific terminology servers.
 * @param defaultTerminologyServerUrl - Fallback terminology server URL.
 * @returns Promise resolving to a ValidateCodeResponse or null.
 */
export function validateQuantityUcumCode(
  rawValue: string,
  qItem: Omit<QuestionnaireItem, 'item'>,
  itemPreferredTerminologyServers: Record<string, string>,
  defaultTerminologyServerUrl: string
): UcumQuantityPromise {
  // Based on https://hl7.org/fhirpath/N1/#toquantityunit-string-quantity
  const [numericValueString, unitCode] = rawValue.split(' ');
  const unitCodeFormatted = unitCode.replace(/'/g, '');

  const terminologyServerUrl = getItemTerminologyServerToUse(
    qItem,
    itemPreferredTerminologyServers,
    defaultTerminologyServerUrl
  );

  return {
    numericValueString,
    promise: validateCodePromise(
      UCUM_VALUE_SET_URL,
      UCUM_SYSTEM,
      unitCodeFormatted,
      terminologyServerUrl
    )
  };
}

/**
 * Parse and convert calculatedExpression values of type `quantity` into valid UCUM-coded `Quantity` objects.
 *
 * This function:
 * - Iterates over calculatedExpressions grouped by `linkId`
 * - Identifies expressions with `from: "item"` and valid quantity strings (e.g. `"10 'mg'"`)
 * - Validates the UCUM unit code against a terminology server
 * - Converts validated expressions into FHIR `Quantity` objects with `value`, `system`, `code`, and `unit`
 * - Leaves non-quantity or invalid expressions unchanged
 *
 * @param diffCalculatedExpressions - Map of `linkId` → calculatedExpressions to process
 * @param questionnaireItemMap - Map of `linkId` → QuestionnaireItem metadata
 * @param itemPreferredTerminologyServers - Map of `linkId` → preferred terminology server URL
 * @param defaultTerminologyServerUrl - Default terminology server URL if no item-specific server is defined
 * @returns A promise resolving to the same structure as `diffCalculatedExpressions`, with quantity expressions converted to FHIR `Quantity` objects where possible
 */
export async function parseAndConvertUcumQuantities(
  diffCalculatedExpressions: Record<string, CalculatedExpression[]>,
  questionnaireItemMap: Record<string, Omit<QuestionnaireItem, 'item'>>,
  itemPreferredTerminologyServers: Record<string, string>,
  defaultTerminologyServerUrl: string
): Promise<Record<string, CalculatedExpression[]>> {
  /* Store Quantity calculatedExpressions with UCUM unit codes in promises to be executed in parallel */
  const promisesMap = new Map<string, UcumQuantityPromise>();

  for (const [linkId, calcExpressions] of Object.entries(diffCalculatedExpressions)) {
    const qItem = questionnaireItemMap[linkId];
    // Skip if qItem is not a quantity item
    if (!qItem || qItem.type !== 'quantity') {
      continue;
    }

    // Skip if no calculated expression
    const calcExpression = calcExpressions.find((exp) => exp.from === 'item');
    if (!calcExpression) {
      continue;
    }

    // Skip if calculated expression value is not a valid quantity string
    if (!isQuantityString(calcExpression.value)) {
      continue;
    }

    // Validate the unit code and convert if valid
    const ucumQuantityPromise = validateQuantityUcumCode(
      calcExpression.value,
      qItem,
      itemPreferredTerminologyServers,
      defaultTerminologyServerUrl
    );
    promisesMap.set(linkId, ucumQuantityPromise);
  }

  /* Execute all promises in parallel and convert to Quantity objects */
  const promisesTuples = Array.from(promisesMap.entries());
  try {
    const settledPromises = await Promise.allSettled(promisesTuples.map(([, p]) => p.promise));
    for (const [i, settledPromise] of settledPromises.entries()) {
      // Skip rejected promises
      if (settledPromise.status === 'rejected') {
        console.warn(
          `UCUM Quantity conversion network error: Details below:` + settledPromise.reason
        );
        continue;
      }

      // Skip null or invalid responses
      const validateCodeResponse = settledPromise.value;
      if (!validateCodeResponse?.parameter) {
        continue;
      }

      // Get corresponding linkId and calculatedExpression
      const [linkId, originalPromise] = promisesTuples[i];
      const numericValueString = originalPromise.numericValueString;
      const calcExpression = diffCalculatedExpressions[linkId].find((exp) => exp.from === 'item');
      if (!calcExpression) {
        continue;
      }

      // Extract system, code, and display from the response parameters
      const systemParameter = validateCodeResponse.parameter.find(
        (p) => p.name === 'system'
      ) as SystemParameter;
      const codeParameter = validateCodeResponse.parameter.find(
        (p) => p.name === 'code'
      ) as CodeParameter;
      const displayParameter = validateCodeResponse.parameter.find(
        (p) => p.name === 'display'
      ) as DisplayParameter;

      if (systemParameter.valueUri && codeParameter.valueCode && displayParameter.valueString) {
        calcExpression.value = {
          value: parseFloat(numericValueString),
          system: systemParameter.valueUri,
          code: codeParameter.valueCode,
          unit: displayParameter.valueString
        } as Quantity;
      }
    }
  } catch (e) {
    // e is not thrown as an Error type in fhirpath.js, so we can't use `if (e instanceof Error)` here
    console.warn(
      'UCUM Quantity conversion error: fhirpath evaluation for calculatedExpression failed. Details below:',
      e
    );
  }

  return diffCalculatedExpressions;
}
