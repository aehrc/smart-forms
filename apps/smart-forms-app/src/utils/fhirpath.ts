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

import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import type { Expression, QuestionnaireResponse } from 'fhir/r4';

export function createFhirPathContext(
  questionnaireResponse: QuestionnaireResponse,
  variablesFhirPath: Record<string, Expression[]>
): Record<string, any> {
  const fhirPathContext: Record<string, any> = { resource: questionnaireResponse };

  if (!questionnaireResponse.item) {
    return fhirPathContext;
  }

  for (const topLevelItem of questionnaireResponse.item) {
    const variablesTopLevelItem = variablesFhirPath[topLevelItem.linkId];
    if (variablesTopLevelItem && variablesTopLevelItem.length > 0) {
      variablesTopLevelItem.forEach((variable) => {
        try {
          fhirPathContext[`${variable.name}`] = fhirpath.evaluate(
            topLevelItem,
            {
              base: 'QuestionnaireResponse.item',
              expression: `${variable.expression}`
            },
            fhirPathContext,
            fhirpath_r4_model
          );
        } catch (e) {
          console.warn(e);
        }
      });
    }
  }

  return fhirPathContext;
}
