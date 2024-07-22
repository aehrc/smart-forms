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

import type { Coding } from 'fhir/r4';
import {
  createValueSetToXFhirQueryVariableNameMap,
  getValueSetCodings,
  getValueSetPromise,
  resolveValueSetPromises
} from '../valueSet';
import type { Variables } from '../../interfaces/variables.interface';
import type { ValueSetPromise } from '../../interfaces/valueSet.interface';

export async function resolveValueSets(
  variables: Variables,
  valueSetPromises: Record<string, ValueSetPromise>,
  processedValueSetCodings: Record<string, Coding[]>,
  terminologyServerUrl: string
): Promise<{ variables: Variables; processedValueSetCodings: Record<string, Coding[]> }> {
  // Create a <valueSetUrl, XFhirQueryVariableName> map
  const valueSetToXFhirQueryVariableNameMap: Record<string, string> =
    createValueSetToXFhirQueryVariableNameMap(variables.xFhirQueryVariables);

  if (Object.keys(valueSetToXFhirQueryVariableNameMap).length > 0) {
    for (const valueSetUrl in valueSetToXFhirQueryVariableNameMap) {
      valueSetPromises[valueSetUrl] = {
        promise: getValueSetPromise(valueSetUrl, terminologyServerUrl)
      };
    }
  }

  // Resolve promises and store valueSet codings in preprocessedValueSetCodings AND XFhirQueryVariables
  const resolvedPromises = await resolveValueSetPromises(valueSetPromises);

  for (const valueSetUrl in resolvedPromises) {
    const valueSet = resolvedPromises[valueSetUrl]?.valueSet;

    if (valueSet) {
      if (valueSetToXFhirQueryVariableNameMap[valueSetUrl]) {
        // valueSetUrl is in x-fhir-query variables, save to variable
        const variableName = valueSetToXFhirQueryVariableNameMap[valueSetUrl];
        if (variableName) {
          const variable = variables.xFhirQueryVariables[variableName];
          if (variable) {
            variables.xFhirQueryVariables[variableName] = {
              ...variable,
              result: resolvedPromises[valueSetUrl]?.valueSet
            };
          }
        }
      } else {
        // valueSetUrl is in x-fhir-query variables, save to preprocessedValueSetCodings
        processedValueSetCodings[valueSetUrl] = getValueSetCodings(valueSet);
      }
    }
  }

  return { variables, processedValueSetCodings };
}
