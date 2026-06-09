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

import fhirpath from 'fhirpath';
// Need to specifically import from 'index.js' to get it working with ts
import fhirpath_r4_model from 'fhirpath/fhir-context/r4/index.js';
import type {
  ItemPopulationContext,
  PopulationExpressions
} from '../interfaces/expressions.interface';
import type { OperationOutcomeIssue } from 'fhir/r4';
import { createInvalidWarningIssue } from './operationOutcome';
import type { FetchTerminologyRequestConfig, FetchResourceRequestConfig } from '../interfaces';
import { handleFhirPathResult } from './createFhirPathContext';
import { TERMINOLOGY_SERVER_URL } from '../../globals';

/**
 * Stamps fhirpath's internal __path__ metadata onto a FHIR resource so it can be safely
 * used as an array context variable (%name) in subsequent fhirpath.evaluate() calls.
 *
 * fhirpath v4 requires each item in an array context variable to carry __path__ so the
 * R4 model can resolve nested BackboneElement paths (e.g. reaction.manifestation.select(…)).
 * Without it, fhirpath throws when navigating past the first level.
 *
 * The mechanism is documented in the fhirpath README and CHANGELOG (since v2.11.0):
 * objects returned by fhirpath.evaluate() automatically receive __path__.
 * Evaluating a resource against '$this' is the minimal way to attach this metadata
 * to plain JSON objects that have not yet passed through fhirpath.
 *
 * Non-resource values (no resourceType) are returned unchanged.
 */
export function stampFhirpathMetadata(item: any): any {
  if (!item?.resourceType) return item;
  const stamped = fhirpath.evaluate(item, '$this', {}, fhirpath_r4_model) as any[];
  return stamped[0] ?? item;
}

/**
 * Use FHIRPath.js to evaluate initialExpressions and generate its values to be populated into the questionnaireResponse.
 * Removes unsupported functions from expressions to avoid errors. Populates values for each linkId.
 *
 * @author Sean Fong
 */
export async function generateExpressionValues(
  populationExpressions: PopulationExpressions,
  contextMap: Record<string, any>,
  issues: OperationOutcomeIssue[],
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig,
  fetchResourceRequestConfig?: FetchResourceRequestConfig
) {
  const { initialExpressions, itemPopulationContexts } = populationExpressions;

  const terminologyServerUrl = fetchTerminologyRequestConfig?.terminologyServerUrl ?? null;
  const fhirServerUrl = fetchResourceRequestConfig?.sourceServerUrl ?? null;

  for (const linkId in initialExpressions) {
    const initialExpression = initialExpressions[linkId];
    if (initialExpression) {
      const expression = initialExpression.expression;

      // Evaluate expression by LaunchPatient or PrePopQuery
      try {
        const fhirPathResult = fhirpath.evaluate({}, expression, contextMap, fhirpath_r4_model, {
          async: true,
          terminologyUrl: terminologyServerUrl ?? TERMINOLOGY_SERVER_URL,
          ...(fhirServerUrl && { fhirServerUrl })
        });

        initialExpression.value = await handleFhirPathResult(fhirPathResult);
      } catch (e) {
        // e is not thrown as an Error type in fhirpath.js, so we can't use `if (e instanceof Error)` here
        console.warn(
          `SDC-Populate Error: fhirpath evaluation for InitialExpression ${expression} failed. Details below:` +
            e
        );
        issues.push(createInvalidWarningIssue(String(e)));
        continue;
      }

      initialExpressions[linkId] = initialExpression;
    }
  }

  for (const linkId in itemPopulationContexts) {
    const itemPopulationContext = itemPopulationContexts[linkId];
    if (itemPopulationContext) {
      const expression = itemPopulationContext.expression;

      try {
        const fhirPathResult = fhirpath.evaluate({}, expression, contextMap, fhirpath_r4_model, {
          async: true,
          terminologyUrl: terminologyServerUrl ?? TERMINOLOGY_SERVER_URL,
          ...(fhirServerUrl && { fhirServerUrl })
        });
        const rawValues = await handleFhirPathResult(fhirPathResult);

        // Stamp __path__ on each resource so it can be safely used as an array context variable
        // in constructRepeatGroupInstances. See stampFhirpathMetadata for full explanation.
        itemPopulationContext.value = rawValues.map(stampFhirpathMetadata);
      } catch (e) {
        // e is not thrown as an Error type in fhirpath.js, so we can't use `if (e instanceof Error)` here
        console.warn(
          `SDC-Populate Error: fhirpath evaluation for ItemPopulationContext ${expression} failed. Details below:` +
            e
        );
        issues.push(createInvalidWarningIssue(String(e)));
        continue;
      }

      // Save evaluated item population context result into context object
      itemPopulationContexts[linkId] = itemPopulationContext;
    }
  }

  return {
    evaluatedInitialExpressions: initialExpressions,
    evaluatedItemPopulationContexts: itemPopulationContexts
  };
}

/**
 * Use FHIRPath.js to evaluate initialExpressions and generate its values to be populated into the questionnaireResponse.
 * There are some functions that are yet to be implemented in FHIRPath.js - these functions would be removed from the expressions to avoid errors.
 *
 * @author Sean Fong
 */
export async function evaluateItemPopulationContexts(
  itemPopulationContexts: Record<string, ItemPopulationContext>,
  contextMap: Record<string, any>,
  issues: OperationOutcomeIssue[],
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig,
  fetchResourceRequestConfig?: FetchResourceRequestConfig
): Promise<Record<string, any>> {
  const terminologyServerUrl = fetchTerminologyRequestConfig?.terminologyServerUrl ?? null;
  const fhirServerUrl = fetchResourceRequestConfig?.sourceServerUrl ?? null;

  for (const name in itemPopulationContexts) {
    const itemPopulationContext = itemPopulationContexts[name];
    if (itemPopulationContext) {
      let evaluatedResult: any[];
      const expression = itemPopulationContext.expression;

      // Evaluate expression by LaunchPatient or PrePopQuery
      try {
        const fhirPathResult = fhirpath.evaluate({}, expression, contextMap, fhirpath_r4_model, {
          async: true,
          terminologyUrl: terminologyServerUrl ?? TERMINOLOGY_SERVER_URL,
          ...(fhirServerUrl && { fhirServerUrl })
        });
        evaluatedResult = await handleFhirPathResult(fhirPathResult);
      } catch (e) {
        // e is not thrown as an Error type in fhirpath.js, so we can't use `if (e instanceof Error)` here
        console.warn(
          `SDC-Populate Error: fhirpath evaluation for ItemPopulationContext ${expression} failed. Details below:` +
            e
        );
        issues.push(createInvalidWarningIssue(String(e)));

        continue;
      }

      // Stamp __path__ on each resource before storing in contextMap.
      // See stampFhirpathMetadata for full explanation.
      contextMap[itemPopulationContext.name] = evaluatedResult.map(stampFhirpathMetadata);
    }
  }

  return contextMap;
}
