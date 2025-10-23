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

import type { Questionnaire, QuestionnaireItem } from 'fhir/r4';
import type { Tabs } from '../../interfaces/tab.interface';
import type { Pages } from '../../interfaces/page.interface';
import type { LaunchContext } from '../../interfaces/populate.interface';
import type { QuestionnaireModel } from '../../interfaces/questionnaireStore.interface';
import { extractLaunchContexts } from './extractLaunchContext';
import { extractQuestionnaireLevelVariables } from './extractVariables';
import { extractTabs } from './extractTabs';
import { extractPages } from './extractPages';
import { extractContainedValueSets } from './extractContainedValueSets';
import { extractOtherExtensions } from './extractOtherExtensions';
import type { Variables } from '../../interfaces/variables.interface';
import { resolveValueSets } from './resolveValueSets';
import { getLinkIdPartialItemMap, getLinkIdPreferredTerminologyServerTuples } from '../qItem';
import { addDisplayToAnswerOptions, addDisplayToCacheCodings } from './addDisplayToCodings';
import type { TargetConstraint } from '../../interfaces/targetConstraint.interface';
import { extractTargetConstraints } from './extractTargetConstraint';

export async function createQuestionnaireModel(
  questionnaire: Questionnaire,
  terminologyServerUrl: string
): Promise<QuestionnaireModel> {
  if (!questionnaire.item) {
    return createEmptyModel();
  }

  const itemMap: Record<string, Omit<QuestionnaireItem, 'item'>> = getLinkIdPartialItemMap(
    questionnaire
  );
  const itemPreferredTerminologyServers: Record<string, string> = Object.fromEntries(
    getLinkIdPreferredTerminologyServerTuples(questionnaire)
  );
  const tabs: Tabs = extractTabs(questionnaire);
  const pages: Pages = extractPages(questionnaire);

  const launchContexts: Record<string, LaunchContext> = extractLaunchContexts(questionnaire);
  const targetConstraints: Record<string, TargetConstraint> =
    extractTargetConstraints(questionnaire);

  let variables: Variables = extractQuestionnaireLevelVariables(questionnaire);

  const extractContainedValueSetsResult = extractContainedValueSets(
    questionnaire,
    terminologyServerUrl
  );
  let valueSetPromises = extractContainedValueSetsResult.valueSetPromises;
  let processedValueSets = extractContainedValueSetsResult.processedValueSets;
  let cachedValueSetCodings = extractContainedValueSetsResult.cachedValueSetCodings;

  const extractOtherExtensionsResult = await extractOtherExtensions(
    questionnaire,
    variables,
    valueSetPromises,
    processedValueSets,
    cachedValueSetCodings,
    itemPreferredTerminologyServers,
    terminologyServerUrl
  );

  const {
    enableWhenItems,
    enableWhenExpressions,
    calculatedExpressions,
    initialExpressions,
    answerExpressions,
    answerOptions,
    answerOptionsToggleExpressions
  } = extractOtherExtensionsResult;
  variables = extractOtherExtensionsResult.variables;
  valueSetPromises = extractOtherExtensionsResult.valueSetPromises;
  processedValueSets = extractOtherExtensionsResult.processedValueSets;
  cachedValueSetCodings = extractOtherExtensionsResult.cachedValueSetCodings;

  const resolveValueSetsResult = await resolveValueSets(
    variables,
    valueSetPromises,
    cachedValueSetCodings,
    terminologyServerUrl
  );

  variables = resolveValueSetsResult.variables;
  cachedValueSetCodings = resolveValueSetsResult.cachedValueSetCodings;

  // In processedCodings, add display values to codings lacking them
  cachedValueSetCodings = await addDisplayToCacheCodings(
    cachedValueSetCodings,
    terminologyServerUrl
  );

  // In answerOptions, add display values to codings lacking them
  const completeAnswerOptions = await addDisplayToAnswerOptions(
    answerOptions,
    terminologyServerUrl
  );

  return {
    itemMap,
    itemPreferredTerminologyServers,
    tabs,
    pages,
    variables,
    launchContexts,
    targetConstraints,
    enableWhenItems,
    enableWhenExpressions,
    calculatedExpressions,
    initialExpressions,
    answerExpressions,
    answerOptions: completeAnswerOptions,
    answerOptionsToggleExpressions: answerOptionsToggleExpressions,
    processedValueSets,
    cachedValueSetCodings,
    fhirPathContext: {},
    fhirPathTerminologyCache: {}
  };
}

function createEmptyModel(): QuestionnaireModel {
  return {
    itemMap: {},
    itemPreferredTerminologyServers: {},
    tabs: {},
    pages: {},
    variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
    launchContexts: {},
    targetConstraints: {},
    calculatedExpressions: {},
    initialExpressions: {},
    enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
    answerExpressions: {},
    answerOptions: {},
    answerOptionsToggleExpressions: {},
    enableWhenItems: { singleItems: {}, repeatItems: {} },
    processedValueSets: {},
    cachedValueSetCodings: {},
    fhirPathContext: {},
    fhirPathTerminologyCache: {}
  };
}
