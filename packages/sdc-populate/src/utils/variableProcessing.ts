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

import type { InitialExpression } from '../interfaces/expressions.interface';
import type { Bundle } from 'fhir/r4';

export function constructVariableMap(bundle: Bundle): Record<string, Bundle> {
  const variableMap: Record<string, Bundle> = {};
  if (bundle.entry) {
    for (const entry of bundle.entry) {
      const resource = entry.resource;
      if (resource && resource.id && resource.resourceType === 'Bundle') {
        variableMap[resource.id] = resource;
      }
    }
  }
  return variableMap;
}

function getVariableName(expression: string): string | null {
  const regExp = /%[a-zA-Z0-9]+/;
  let match = expression.match(regExp)?.toString();

  // Remove '%' character from variable name
  if (match) {
    match = match.slice(1);
    return match;
  }

  return null;
}

export function addVariablesToContext(
  initialExpressions: Record<string, InitialExpression>,
  context: Record<string, any>,
  batchResponse: Bundle
): Record<string, any> {
  const variableMap = constructVariableMap(batchResponse);

  for (const linkId in initialExpressions) {
    const initialExpression = initialExpressions[linkId];
    if (initialExpression) {
      const expression = initialExpression.expression;

      // Identify variable name from expression
      const variable = getVariableName(expression);

      // Add variable to context
      if (variable && variableMap[variable]) {
        context[variable] = variableMap[variable];
      }
    }
  }
  return context;
}
