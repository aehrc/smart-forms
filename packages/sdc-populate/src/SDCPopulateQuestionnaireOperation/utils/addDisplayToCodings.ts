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

import type {
  CodeSystemLookupPromise,
  InitialExpression
} from '../interfaces/expressions.interface';
import type { Coding } from 'fhir/r4';
import { getCodeSystemLookupPromise } from '../api/lookupCodeSystem';
import type { FetchTerminologyCallback, FetchTerminologyRequestConfig } from '../interfaces';
import { resolveLookupPromises } from './resolveLookupPromises';

/**
 * Adds display values to Coding objects in initialExpressions by performing CodeSystem $lookup if needed.
 * Ensures all codings have a display for proper rendering and validation.
 */
export async function addDisplayToInitialExpressionsCodings(
  initialExpressions: Record<string, InitialExpression>,
  fetchTerminologyCallback?: FetchTerminologyCallback,
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig
): Promise<Record<string, InitialExpression>> {
  // Store code system lookup promises for codings without displays
  const codeSystemLookupPromises: Record<string, CodeSystemLookupPromise> = {};
  for (const key in initialExpressions) {
    const initialExpression = initialExpressions[key];
    if (!initialExpression?.value) {
      continue;
    }

    for (const value of initialExpression.value) {
      if (valueIsCoding(value)) {
        if (!value.display) {
          getCodeSystemLookupPromise(
            value,
            codeSystemLookupPromises,
            fetchTerminologyCallback,
            fetchTerminologyRequestConfig
          );
        }
      }
    }
  }

  // Resolves lookup promises in one go and assign newCodings to initialExpressions
  const resolvedCodeSystemLookupPromises = await resolveLookupPromises(codeSystemLookupPromises);
  for (const key in initialExpressions) {
    const initialExpression = initialExpressions[key];
    if (!initialExpression?.value) {
      continue;
    }

    for (const value of initialExpression.value) {
      if (valueIsCoding(value)) {
        const lookUpKey = `system=${value.system}&code=${value.code}`;
        const resolvedLookup = resolvedCodeSystemLookupPromises[lookUpKey];

        if (resolvedLookup?.newCoding?.display) {
          value.display = resolvedLookup.newCoding.display;
        }
      }
    }
  }

  return initialExpressions;
}

/**
 * Type guard to check if a value is a FHIR Coding object.
 * Used to filter and process codings in initialExpressions.
 */
function valueIsCoding(initialExpressionValue: any): initialExpressionValue is Coding {
  return !!(
    initialExpressionValue &&
    initialExpressionValue.system &&
    initialExpressionValue.code &&
    !initialExpressionValue.unit // To exclude valueQuantity objects
  );
}
