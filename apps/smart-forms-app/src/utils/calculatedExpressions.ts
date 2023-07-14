/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import type { CalculatedExpression } from '../features/calculatedExpression/types/calculatedExpression.interface.ts';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';

export function evaluateCalculatedExpressions(
  fhirPathContext: Record<string, any>,
  calculatedExpressions: Record<string, CalculatedExpression>
): {
  calculatedExpsIsUpdated: boolean;
  updatedCalculatedExpressions: Record<string, CalculatedExpression>;
} {
  const updatedCalculatedExpressions: Record<string, CalculatedExpression> = {
    ...calculatedExpressions
  };

  let isUpdated = false;
  for (const linkId in calculatedExpressions) {
    try {
      const result = fhirpath.evaluate(
        '',
        calculatedExpressions[linkId].expression,
        fhirPathContext,
        fhirpath_r4_model
      );

      if (result.length > 0) {
        if (calculatedExpressions[linkId].value !== result[0]) {
          isUpdated = true;
          updatedCalculatedExpressions[linkId].value = result[0];
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }

  return {
    calculatedExpsIsUpdated: isUpdated,
    updatedCalculatedExpressions: updatedCalculatedExpressions
  };
}
