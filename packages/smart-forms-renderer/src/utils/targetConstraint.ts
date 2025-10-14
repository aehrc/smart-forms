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

import type { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import { createFhirPathContext, handleFhirPathResult } from './fhirpath';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import type { TargetConstraint } from '../interfaces/targetConstraint.interface';
import type { Variables } from '../interfaces';

interface EvaluateInitialTargetConstraintsParams {
  initialResponse: QuestionnaireResponse;
  initialResponseItemMap: Record<string, QuestionnaireResponseItem[]>;
  targetConstraints: Record<string, TargetConstraint>;
  variables: Variables;
  existingFhirPathContext: Record<string, any>;
  fhirPathTerminologyCache: Record<string, any>;
  terminologyServerUrl: string;
}

export async function evaluateInitialTargetConstraints(
  params: EvaluateInitialTargetConstraintsParams
): Promise<{
  initialTargetConstraints: Record<string, TargetConstraint>;
  updatedFhirPathContext: Record<string, any>;
  fhirPathTerminologyCache: Record<string, any>;
}> {
  const {
    initialResponse,
    initialResponseItemMap,
    targetConstraints,
    variables,
    existingFhirPathContext,
    terminologyServerUrl
  } = params;
  let { fhirPathTerminologyCache } = params;

  const fhirPathEvalResult = await createFhirPathContext(
    initialResponse,
    initialResponseItemMap,
    variables,
    existingFhirPathContext,
    fhirPathTerminologyCache,
    terminologyServerUrl
  );
  const updatedFhirPathContext = fhirPathEvalResult.fhirPathContext;
  fhirPathTerminologyCache = fhirPathEvalResult.fhirPathTerminologyCache;

  for (const key in targetConstraints) {
    const initialValue = targetConstraints[key].isInvalid;
    const expression = targetConstraints[key].valueExpression?.expression;
    
    if (!expression) {
      continue;
    }

    const cacheKey = JSON.stringify(expression); // Use expression as cache key
    if (fhirPathTerminologyCache[cacheKey]) {
      continue;
    }

    try {
      const fhirPathResult = fhirpath.evaluate(
        {},
        expression,
        updatedFhirPathContext,
        fhirpath_r4_model,
        {
          async: true,
          terminologyUrl: terminologyServerUrl
        }
      );
      const result = await handleFhirPathResult(fhirPathResult);

      // Update targetConstraints if length of result array > 0
      // Only update when current isInvalid value is different from the result, otherwise it will result in am infinite loop as per #733
      if (result.length > 0 && typeof result[0] === 'boolean') {
        // Invert the logic: if the constraint expression returns false, the constraint is invalid (violated)
        const isInvalid = !result[0];
        if (initialValue !== isInvalid) {
          targetConstraints[key].isInvalid = isInvalid;
        }
      }

      // Update isInvalid value to false if no result is returned
      if (result.length === 0 && initialValue !== false) {
        targetConstraints[key].isInvalid = false;
      }

      // handle intersect edge case - evaluate() returns empty array if result is false
      if (expression.includes('intersect') && result.length === 0 && initialValue !== false) {
        targetConstraints[key].isInvalid = false;
      }

      // If fhirPathResult is an async terminology call, cache the result
      if (fhirPathResult instanceof Promise) {
        fhirPathTerminologyCache[cacheKey] = result;
      }
    } catch (e) {
      console.warn(`[TARGET_CONSTRAINT_DEBUG] Error evaluating ${key}:`, e.message, `Target Constraint Key: ${key}\nExpression: ${expression}`);
    }
  }

  return {
    initialTargetConstraints: targetConstraints,
    updatedFhirPathContext,
    fhirPathTerminologyCache
  };
}

export async function evaluateTargetConstraints(
  fhirPathContext: Record<string, any>,
  fhirPathTerminologyCache: Record<string, any>,
  targetConstraints: Record<string, TargetConstraint>,
  terminologyServerUrl: string
): Promise<{
  isUpdated: boolean;
  updatedTargetConstraints: Record<string, TargetConstraint>;
}> {
  let isUpdated = false;
  
  for (const key in targetConstraints) {
    const initialValue = targetConstraints[key].isInvalid;
    const expression = targetConstraints[key].valueExpression?.expression;
    
    if (!expression) {
      continue;
    }

    const cacheKey = JSON.stringify(expression); // Use expression as cache key
    if (fhirPathTerminologyCache[cacheKey]) {
      continue;
    }

    try {
      const fhirPathResult = fhirpath.evaluate({}, expression, fhirPathContext, fhirpath_r4_model, {
        async: true,
        terminologyUrl: terminologyServerUrl
      });
      const result = await handleFhirPathResult(fhirPathResult);

      // Update targetConstraints if length of result array > 0
      // Only update when current isInvalid value is different from the result, otherwise it will result in am infinite loop as per #733
      if (result.length > 0 && typeof result[0] === 'boolean') {
        // Invert the logic: if the constraint expression returns false, the constraint is invalid (violated)
        const isInvalid = !result[0];
        if (initialValue !== isInvalid) {
          targetConstraints[key].isInvalid = isInvalid;
          isUpdated = true;
        }
      }

      // Update isInvalid value to false if no result is returned
      if (result.length === 0 && initialValue !== false) {
        targetConstraints[key].isInvalid = false;
        isUpdated = true;
      }

      // handle intersect edge case - evaluate() returns empty array if result is false
      if (expression.includes('intersect') && result.length === 0 && initialValue !== false) {
        targetConstraints[key].isInvalid = false;
        isUpdated = true;
      }

      // If fhirPathResult is an async terminology call, cache the result
      if (fhirPathResult instanceof Promise) {
        fhirPathTerminologyCache[cacheKey] = result;
      }
    } catch (e) {
      console.warn(`[TARGET_CONSTRAINT_DEBUG] Error evaluating updated ${key}:`, e.message, `Target Constraint Key: ${key}\nExpression: ${expression}`);
    }
  }

  return {
    isUpdated: isUpdated,
    updatedTargetConstraints: targetConstraints
  };
}

export function readTargetConstraintLocationLinkIds(
  questionnaire: Questionnaire,
  targetConstraints: Record<string, TargetConstraint>
) {
  const targetConstraintLinkIds: Record<string, string[]> = {};
  for (const [targetConstraintKey, targetConstraint] of Object.entries(targetConstraints)) {
    if (targetConstraint.location) {
      const targetConstraintLinkId = getTargetConstraintLocationLinkId(
        questionnaire,
        targetConstraint.location
      );

      if (targetConstraintLinkId) {
        // Add to targetConstraintLinkIds <linkId, key>
        // If targetConstraintLinkId is not in targetConstraintLinkIds, create an array
        if (targetConstraintLinkIds[targetConstraintLinkId]) {
          targetConstraintLinkIds[targetConstraintLinkId].push(targetConstraintKey);
        } else {
          targetConstraintLinkIds[targetConstraintLinkId] = [targetConstraintKey];
        }

        // Add to targetConstraint.linkId
        targetConstraints[targetConstraintKey].linkId = targetConstraintLinkId;
      }
    }
  }

  return targetConstraintLinkIds;
}

/**
 * Reads a value from a Questionnaire based on a FHIRPath location string.
 * @param questionnaire - The Questionnaire resource.
 * @param location - The FHIRPath location string.
 * @returns - The matched linkId, or null if no match is found.
 */
function getTargetConstraintLocationLinkId(
  questionnaire: Questionnaire,
  location: string
): string | null {
  try {
    const fhirPathResult = fhirpath.evaluate(questionnaire, location, {}, fhirpath_r4_model, {
      async: false
    });

    if (fhirPathResult.length > 0) {
      const singleResult = fhirPathResult[0];
      if (
        typeof singleResult === 'object' &&
        singleResult.linkId &&
        typeof singleResult.linkId === 'string'
      ) {
        return singleResult.linkId;
      }
    }
  } catch (e) {
    console.warn(e.message, `Target Constraint Location: ${location}`);
  }

  return null;
}
