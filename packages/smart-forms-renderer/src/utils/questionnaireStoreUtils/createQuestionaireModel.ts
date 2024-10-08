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

import type { Questionnaire } from 'fhir/r4';
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
import { addAdditionalVariables } from './addAdditionalVariables';
import { getLinkIdPreferredTerminologyServerTuples, getLinkIdTypeTuples } from '../qItem';
import { addDisplayToAnswerOptions, addDisplayToProcessedCodings } from './addDisplayToCodings';

export async function createQuestionnaireModel(
  questionnaire: Questionnaire,
  additionalVariables: Record<string, object>,
  terminologyServerUrl: string
): Promise<QuestionnaireModel> {
  if (!questionnaire.item) {
    return createEmptyModel();
  }

  const itemTypes: Record<string, string> = Object.fromEntries(getLinkIdTypeTuples(questionnaire));
  const itemPreferredTerminologyServers: Record<string, string> = Object.fromEntries(
    getLinkIdPreferredTerminologyServerTuples(questionnaire)
  );
  const tabs: Tabs = extractTabs(questionnaire);
  const pages: Pages = extractPages(questionnaire);

  const launchContexts: Record<string, LaunchContext> = extractLaunchContexts(questionnaire);

  let variables: Variables = extractQuestionnaireLevelVariables(questionnaire);
  variables = addAdditionalVariables(variables, additionalVariables);

  const extractContainedValueSetsResult = extractContainedValueSets(
    questionnaire,
    terminologyServerUrl
  );
  let valueSetPromises = extractContainedValueSetsResult.valueSetPromises;
  let processedValueSetCodings = extractContainedValueSetsResult.processedValueSetCodings;
  const processedValueSetUrls = extractContainedValueSetsResult.processedValueSetUrls;

  const extractOtherExtensionsResult = extractOtherExtensions(
    questionnaire,
    variables,
    valueSetPromises,
    itemPreferredTerminologyServers,
    terminologyServerUrl
  );

  const {
    enableWhenItems,
    enableWhenExpressions,
    calculatedExpressions,
    initialExpressions,
    answerExpressions,
    answerOptions
  } = extractOtherExtensionsResult;
  variables = extractOtherExtensionsResult.variables;
  valueSetPromises = extractOtherExtensionsResult.valueSetPromises;

  const resolveValueSetsResult = await resolveValueSets(
    variables,
    valueSetPromises,
    processedValueSetCodings,
    terminologyServerUrl
  );

  variables = resolveValueSetsResult.variables;
  processedValueSetCodings = resolveValueSetsResult.processedValueSetCodings;

  // In processedCodings, add display values to codings lacking them
  processedValueSetCodings = await addDisplayToProcessedCodings(
    processedValueSetCodings,
    terminologyServerUrl
  );

  // In answerOptions, add display values to codings lacking them
  const completeAnswerOptions = await addDisplayToAnswerOptions(
    answerOptions,
    terminologyServerUrl
  );

  return {
    itemTypes,
    itemPreferredTerminologyServers,
    tabs,
    pages,
    variables,
    launchContexts,
    enableWhenItems,
    enableWhenExpressions,
    calculatedExpressions,
    initialExpressions,
    answerExpressions,
    answerOptions: completeAnswerOptions,
    processedValueSetCodings,
    processedValueSetUrls,
    fhirPathContext: {}
  };
}

function createEmptyModel(): QuestionnaireModel {
  return {
    itemTypes: {},
    itemPreferredTerminologyServers: {},
    tabs: {},
    pages: {},
    variables: { fhirPathVariables: {}, xFhirQueryVariables: {} },
    launchContexts: {},
    calculatedExpressions: {},
    initialExpressions: {},
    enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
    answerExpressions: {},
    answerOptions: {},
    enableWhenItems: { singleItems: {}, repeatItems: {} },
    processedValueSetCodings: {},
    processedValueSetUrls: {},
    fhirPathContext: {}
  };
}
