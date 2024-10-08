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

import { useQuestionnaireStore } from '@aehrc/smart-forms-renderer';

function useShowQuestionnaireStoreProperty(selectedProperty: string) {
  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const itemTypes = useQuestionnaireStore.use.itemTypes();
  const itemPreferredTerminologyServers =
    useQuestionnaireStore.use.itemPreferredTerminologyServers();
  const tabs = useQuestionnaireStore.use.tabs();
  const currentTabIndex = useQuestionnaireStore.use.currentTabIndex();
  const variables = useQuestionnaireStore.use.variables();
  const launchContexts = useQuestionnaireStore.use.launchContexts();
  const enableWhenItems = useQuestionnaireStore.use.enableWhenItems();
  const enableWhenLinkedQuestions = useQuestionnaireStore.use.enableWhenLinkedQuestions();
  const enableWhenIsActivated = useQuestionnaireStore.use.enableWhenIsActivated();
  const enableWhenExpressions = useQuestionnaireStore.use.enableWhenExpressions();
  const calculatedExpressions = useQuestionnaireStore.use.calculatedExpressions();
  const answerExpressions = useQuestionnaireStore.use.answerExpressions();
  const processedValueSetCodings = useQuestionnaireStore.use.processedValueSetCodings();
  const processedValueSetUrls = useQuestionnaireStore.use.processedValueSetUrls();
  const cachedValueSetCodings = useQuestionnaireStore.use.cachedValueSetCodings();
  const fhirPathContext = useQuestionnaireStore.use.fhirPathContext();
  const populatedContext = useQuestionnaireStore.use.populatedContext();
  const focusedLinkId = useQuestionnaireStore.use.focusedLinkId();
  const readOnly = useQuestionnaireStore.use.readOnly();

  return (
    {
      sourceQuestionnaire,
      itemTypes,
      itemPreferredTerminologyServers,
      tabs,
      currentTabIndex,
      variables,
      launchContexts,
      enableWhenItems,
      enableWhenLinkedQuestions,
      enableWhenIsActivated,
      enableWhenExpressions,
      calculatedExpressions,
      answerExpressions,
      processedValueSetCodings,
      processedValueSetUrls,
      cachedValueSetCodings,
      fhirPathContext,
      populatedContext,
      focusedLinkId,
      readOnly
    }[selectedProperty] || null
  );
}

export default useShowQuestionnaireStoreProperty;
