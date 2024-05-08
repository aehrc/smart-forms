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

import type { Expression, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import { createFhirPathContext } from './fhirpath';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import type {
  EnableWhenExpressions,
  EnableWhenRepeatExpression,
  EnableWhenSingleExpression
} from '../interfaces';

interface EvaluateInitialEnableWhenExpressionsParams {
  initialResponse: QuestionnaireResponse;
  initialResponseItemMap: Record<string, QuestionnaireResponseItem[]>;
  enableWhenExpressions: EnableWhenExpressions;
  variablesFhirPath: Record<string, Expression[]>;
  existingFhirPathContext: Record<string, any>;
}

export function evaluateInitialEnableWhenExpressions(
  params: EvaluateInitialEnableWhenExpressionsParams
): {
  initialEnableWhenExpressions: EnableWhenExpressions;
  updatedFhirPathContext: Record<string, any>;
} {
  const {
    initialResponse,
    initialResponseItemMap,
    enableWhenExpressions,
    variablesFhirPath,
    existingFhirPathContext
  } = params;

  const initialEnableWhenExpressions: EnableWhenExpressions = {
    ...enableWhenExpressions
  };
  const updatedFhirPathContext = createFhirPathContext(
    initialResponse,
    initialResponseItemMap,
    variablesFhirPath,
    existingFhirPathContext
  );

  const initialEnableWhenSingleExpressions = evaluateEnableWhenSingleExpressions(
    initialEnableWhenExpressions.singleExpressions,
    updatedFhirPathContext
  );

  const initialEnableWhenRepeatExpressions = evaluateEnableWhenRepeatExpressions(
    initialEnableWhenExpressions.repeatExpressions,
    updatedFhirPathContext
  );

  return {
    initialEnableWhenExpressions: {
      singleExpressions: initialEnableWhenSingleExpressions.updatedExpressions,
      repeatExpressions: initialEnableWhenRepeatExpressions.updatedExpressions
    },
    updatedFhirPathContext
  };
}

function evaluateEnableWhenSingleExpressions(
  enableWhenSingleExpressions: Record<string, EnableWhenSingleExpression>,
  updatedFhirPathContext: Record<string, any>
): {
  updatedExpressions: Record<string, EnableWhenSingleExpression>;
  isUpdated: boolean;
} {
  let isUpdated = false;
  for (const linkId in enableWhenSingleExpressions) {
    const initialValue = enableWhenSingleExpressions[linkId].isEnabled;
    const expression = enableWhenSingleExpressions[linkId].expression;

    try {
      const result = fhirpath.evaluate('', expression, updatedFhirPathContext, fhirpath_r4_model);

      // Update enableWhenExpressions if length of result array > 0
      // Only update when current isEnabled value is different from the result, otherwise it will result in an infinite loop as per issue #733
      if (result.length > 0 && initialValue !== result[0] && typeof result[0] === 'boolean') {
        enableWhenSingleExpressions[linkId].isEnabled = result[0];
        isUpdated = true;
      }

      // Update isEnabled value to false if no result is returned
      if (result.length === 0 && initialValue !== false) {
        enableWhenSingleExpressions[linkId].isEnabled = false;
        isUpdated = true;
      }

      // handle intersect edge case - evaluate() returns empty array if result is false
      if (
        enableWhenSingleExpressions[linkId].expression.includes('intersect') &&
        result.length === 0 &&
        initialValue !== false
      ) {
        enableWhenSingleExpressions[linkId].isEnabled = false;
        isUpdated = true;
      }
    } catch (e) {
      console.warn(
        e.message,
        `LinkId: ${linkId}\nExpression: ${enableWhenSingleExpressions[linkId].expression}`
      );
    }
  }

  return { updatedExpressions: enableWhenSingleExpressions, isUpdated };
}

function getNumOfEnableWhenExpressionItemInstances(
  enableWhenExpression: EnableWhenRepeatExpression,
  fhirPathContext: Record<string, any>
) {
  const result = fhirpath.evaluate(
    '',
    `%resource.descendants().where(linkId = '${enableWhenExpression.parentLinkId}').count()`,
    fhirPathContext,
    fhirpath_r4_model
  );

  return typeof result[0] === 'number' ? result[0] : null;
}

function evaluateEnableWhenRepeatExpressions(
  enableWhenRepeatExpressions: Record<string, EnableWhenRepeatExpression>,
  fhirPathContext: Record<string, any>
): {
  updatedExpressions: Record<string, EnableWhenRepeatExpression>;
  isUpdated: boolean;
} {
  let aggregatedUpdated = false;
  for (const linkId in enableWhenRepeatExpressions) {
    // Get number of repeat group instances in the QR
    const enableWhenExpression = enableWhenRepeatExpressions[linkId];

    const numOfInstances = getNumOfEnableWhenExpressionItemInstances(
      enableWhenExpression,
      fhirPathContext
    );
    if (!numOfInstances) {
      continue;
    }

    const lastLinkIdIndex = enableWhenExpression.expression.lastIndexOf('.where(linkId');
    if (lastLinkIdIndex === -1) {
      continue;
    }

    for (let i = 0; i < numOfInstances; i++) {
      const { isEnabled, isUpdated } = evaluateEnableWhenRepeatExpressionInstance(
        linkId,
        fhirPathContext,
        enableWhenExpression,
        lastLinkIdIndex,
        i
      );

      if (typeof isEnabled === 'boolean') {
        enableWhenRepeatExpressions[linkId].enabledIndexes[i] = isEnabled;
      }

      aggregatedUpdated = aggregatedUpdated || isUpdated;
    }
  }

  return { updatedExpressions: enableWhenRepeatExpressions, isUpdated: aggregatedUpdated };
}

export function evaluateEnableWhenRepeatExpressionInstance(
  linkId: string,
  fhirPathContext: Record<string, any>,
  enableWhenRepeatExpression: EnableWhenRepeatExpression,
  lastLinkIdIndex: number,
  instanceIndex: number
): { isEnabled: boolean | null; isUpdated: boolean } {
  const expression = enableWhenRepeatExpression.expression;
  const parentLinkId = enableWhenRepeatExpression.parentLinkId;
  const initialValue = enableWhenRepeatExpression.enabledIndexes[instanceIndex];

  const modifiedExpression =
    expression.slice(0, lastLinkIdIndex) +
    `.where(linkId='${parentLinkId}').item[${instanceIndex}]` +
    expression.slice(lastLinkIdIndex);

  let isEnabled = null;
  let isUpdated = false;
  try {
    const result = fhirpath.evaluate('', modifiedExpression, fhirPathContext, fhirpath_r4_model);

    // Update enableWhenExpressions if length of result array > 0
    // Only update when current isEnabled value is different from the result, otherwise it will result in am infinite loop as per #733
    if (result.length > 0 && initialValue !== result[0] && typeof result[0] === 'boolean') {
      isEnabled = result[0];
      isUpdated = true;
    }

    // Update isEnabled value to false if no result is returned
    if (result.length === 0 && initialValue !== false) {
      isEnabled = false;
      isUpdated = true;
    }

    // handle intersect edge case - evaluate() returns empty array if result is false
    if (expression.includes('intersect') && result.length === 0 && initialValue !== result[0]) {
      isEnabled = false;
      isUpdated = true;
    }
  } catch (e) {
    console.warn(e.message, `LinkId: ${linkId}\nExpression: ${expression}`);
  }

  return { isEnabled, isUpdated };
}

export function evaluateEnableWhenExpressions(
  fhirPathContext: Record<string, any>,
  enableWhenExpressions: EnableWhenExpressions
): {
  enableWhenExpsIsUpdated: boolean;
  updatedEnableWhenExpressions: EnableWhenExpressions;
} {
  const updatedEnableWhenExpressions: EnableWhenExpressions = {
    ...enableWhenExpressions
  };

  const updatedEnableWhenSingleExpressions = evaluateEnableWhenSingleExpressions(
    updatedEnableWhenExpressions.singleExpressions,
    fhirPathContext
  );

  const updatedEnableWhenRepeatExpressions = evaluateEnableWhenRepeatExpressions(
    updatedEnableWhenExpressions.repeatExpressions,
    fhirPathContext
  );

  const isUpdated =
    updatedEnableWhenSingleExpressions.isUpdated || updatedEnableWhenRepeatExpressions.isUpdated;

  return {
    enableWhenExpsIsUpdated: isUpdated,
    updatedEnableWhenExpressions: {
      singleExpressions: updatedEnableWhenSingleExpressions.updatedExpressions,
      repeatExpressions: updatedEnableWhenRepeatExpressions.updatedExpressions
    }
  };
}

interface MutateRepeatEnableWhenExpressionInstancesParams {
  questionnaireResponse: QuestionnaireResponse;
  questionnaireResponseItemMap: Record<string, QuestionnaireResponseItem[]>;
  variablesFhirPath: Record<string, Expression[]>;
  existingFhirPathContext: Record<string, any>;
  enableWhenExpressions: EnableWhenExpressions;
  parentRepeatGroupLinkId: string;
  parentRepeatGroupIndex: number;
  actionType: 'add' | 'remove';
}

export function mutateRepeatEnableWhenExpressionInstances(
  params: MutateRepeatEnableWhenExpressionInstancesParams
): { updatedEnableWhenExpressions: EnableWhenExpressions; isUpdated: boolean } {
  const {
    questionnaireResponse,
    questionnaireResponseItemMap,
    variablesFhirPath,
    existingFhirPathContext,
    enableWhenExpressions,
    parentRepeatGroupLinkId,
    parentRepeatGroupIndex,
    actionType
  } = params;

  const { repeatExpressions } = enableWhenExpressions;

  const updatedFhirPathContext = createFhirPathContext(
    questionnaireResponse,
    questionnaireResponseItemMap,
    variablesFhirPath,
    existingFhirPathContext
  );

  let isUpdated = false;
  for (const linkId in repeatExpressions) {
    if (repeatExpressions[linkId].parentLinkId !== parentRepeatGroupLinkId) {
      continue;
    }

    if (actionType === 'add') {
      const { isEnabled } = evaluateEnableWhenRepeatExpressionInstance(
        linkId,
        updatedFhirPathContext,
        repeatExpressions[linkId],
        repeatExpressions[linkId].expression.lastIndexOf('.where(linkId'),
        parentRepeatGroupIndex
      );

      if (typeof isEnabled === 'boolean') {
        repeatExpressions[linkId].enabledIndexes[parentRepeatGroupIndex] = isEnabled;
      }
    } else if (actionType === 'remove') {
      repeatExpressions[linkId].enabledIndexes.splice(parentRepeatGroupIndex, 1);
    }

    isUpdated = true;
  }

  return { updatedEnableWhenExpressions: enableWhenExpressions, isUpdated };
}
