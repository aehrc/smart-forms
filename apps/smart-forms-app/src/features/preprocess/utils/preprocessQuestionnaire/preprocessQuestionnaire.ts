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

import type { Questionnaire } from 'fhir/r4';
import type { Tabs } from '../../../renderer/types/tab.interface.ts';
import type { LaunchContext } from '../../../prepopulate/types/populate.interface.ts';
import type { QuestionnaireModel } from '../../types/questionnaireModel.ts';
import { extractLaunchContexts } from './extractLaunchContext.ts';
import { extractQuestionnaireLevelVariables } from './extractVariables.ts';
import { extractTabs } from './extractTabs.ts';
import { extractContainedValueSets } from './extractContainedValueSets.ts';
import type { Variables } from '../../../../providers/questionnaireProvider.interfaces.ts';
import { extractOtherExtensions } from './extractOtherExtensions.ts';
import { resolveValueSets } from './resolveValueSets.ts';

export async function createQuestionnaireModel(
  questionnaire: Questionnaire
): Promise<QuestionnaireModel> {
  if (!questionnaire.item) {
    return createEmptyModel();
  }

  const tabs: Tabs = extractTabs(questionnaire);

  const launchContexts: Record<string, LaunchContext> = extractLaunchContexts(questionnaire);

  let variables: Variables = extractQuestionnaireLevelVariables(questionnaire);

  const extractContainedValueSetsResult = extractContainedValueSets(questionnaire);
  let valueSetPromises = extractContainedValueSetsResult.valueSetPromises;
  let processedValueSetCodings = extractContainedValueSetsResult.processedValueSetCodings;
  const processedValueSetUrls = extractContainedValueSetsResult.processedValueSetUrls;

  const extractOtherExtensionsResult = extractOtherExtensions(
    questionnaire,
    variables,
    valueSetPromises
  );

  const { enableWhenItems, enableWhenExpressions, calculatedExpressions, answerExpressions } =
    extractOtherExtensionsResult;
  variables = extractOtherExtensionsResult.variables;
  valueSetPromises = extractOtherExtensionsResult.valueSetPromises;

  const resolveValueSetsResult = await resolveValueSets(
    variables,
    valueSetPromises,
    processedValueSetCodings
  );

  variables = resolveValueSetsResult.variables;
  processedValueSetCodings = resolveValueSetsResult.processedValueSetCodings;

  return {
    tabs,
    variables,
    launchContexts,
    enableWhenItems,
    enableWhenExpressions,
    calculatedExpressions,
    answerExpressions,
    processedValueSetCodings,
    processedValueSetUrls
  };
}

function createEmptyModel(): QuestionnaireModel {
  return {
    tabs: {},
    variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
    launchContexts: {},
    calculatedExpressions: {},
    enableWhenExpressions: {},
    answerExpressions: {},
    enableWhenItems: {},
    processedValueSetCodings: {},
    processedValueSetUrls: {}
  };
}
