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

import type { Expression, Extension, Questionnaire } from 'fhir/r4';
import type { Variables } from '../../interfaces/variables.interface';

export function extractQuestionnaireLevelVariables(questionnaire: Questionnaire): Variables {
  const variables: Variables = { fhirPathVariables: {}, xFhirQueryVariables: {} };

  variables.fhirPathVariables['QuestionnaireLevel'] = [];

  if (!questionnaire.extension || questionnaire.extension.length === 0) {
    return variables;
  }

  variables.fhirPathVariables['QuestionnaireLevel'] = getFhirPathVariables(questionnaire.extension);

  for (const exp of getXFhirQueryVariables(questionnaire.extension)) {
    if (exp.name) {
      variables.xFhirQueryVariables[exp.name] = {
        valueExpression: exp
      };
    }
  }

  return variables;
}

/**
 * Get fhirpath variables from an array of extensions
 *
 * @author Sean Fong
 */
export function getFhirPathVariables(extensions: Extension[]): Expression[] {
  return (
    extensions
      .filter(
        (extension) =>
          extension.url === 'http://hl7.org/fhir/StructureDefinition/variable' &&
          extension.valueExpression?.language === 'text/fhirpath'
      )
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map((extension) => extension.valueExpression!)
  );
}

/**
 * Get x-fhir-query variables from an array of extensions
 *
 * @author Sean Fong
 */
export function getXFhirQueryVariables(extensions: Extension[]): Expression[] {
  return (
    extensions
      .filter(
        (extension) =>
          extension.url === 'http://hl7.org/fhir/StructureDefinition/variable' &&
          extension.valueExpression?.language === 'application/x-fhir-query'
      )
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map((extension) => extension.valueExpression!)
  );
}
