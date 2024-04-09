/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import type { Extension } from 'fhir/r4';
import type { Variables } from '../../interfaces/variables.interface';

export function addAdditionalVariables(
  existingVariables: Variables,
  additionalVariables: Record<string, object>
) {
  for (const key in additionalVariables) {
    const variable = additionalVariables[key];

    if (variable && isVariable(variable)) {
      const expression = variable.valueExpression;
      if (expression && expression.language && expression.name) {
        if (expression.language === 'text/fhirpath') {
          existingVariables.fhirPathVariables['QuestionnaireLevel'].push(expression);
        } else if (expression.language === 'application/x-fhir-query') {
          existingVariables.xFhirQueryVariables[expression.name] = {
            valueExpression: expression
          };
        }
      }
    }
  }

  return existingVariables;
}

function isVariable(variable: object): variable is Extension {
  const v = variable as Extension;
  return (
    (v.url === 'http://hl7.org/fhir/StructureDefinition/variable' &&
      v.valueExpression?.language === 'text/fhirpath') ||
    v.valueExpression?.language === 'application/x-fhir-query'
  );
}
