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
  const pages = useQuestionnaireStore.use.pages();
  const currentPageIndex = useQuestionnaireStore.use.currentPageIndex();
  const variables = useQuestionnaireStore.use.variables();
  const launchContexts = useQuestionnaireStore.use.launchContexts();
  const targetConstraints = useQuestionnaireStore.use.targetConstraints();
  const targetConstraintLinkIds = useQuestionnaireStore.use.targetConstraintLinkIds();
  const enableWhenItems = useQuestionnaireStore.use.enableWhenItems();
  const enableWhenLinkedQuestions = useQuestionnaireStore.use.enableWhenLinkedQuestions();
  const enableWhenIsActivated = useQuestionnaireStore.use.enableWhenIsActivated();
  const enableWhenExpressions = useQuestionnaireStore.use.enableWhenExpressions();
  const calculatedExpressions = useQuestionnaireStore.use.calculatedExpressions();
  const initialExpressions = useQuestionnaireStore.use.initialExpressions();
  const answerExpressions = useQuestionnaireStore.use.answerExpressions();
  const processedValueSets = useQuestionnaireStore.use.processedValueSets();
  const cachedValueSetCodings = useQuestionnaireStore.use.cachedValueSetCodings();
  const fhirPathContext = useQuestionnaireStore.use.fhirPathContext();
  const fhirPathTerminologyCache = useQuestionnaireStore.use.fhirPathTerminologyCache();
  const populatedContext = useQuestionnaireStore.use.populatedContext();
  const qItemOverrideComponents = useQuestionnaireStore.use.qItemOverrideComponents();
  const sdcUiOverrideComponents = useQuestionnaireStore.use.sdcUiOverrideComponents();
  const focusedLinkId = useQuestionnaireStore.use.focusedLinkId();
  const readOnly = useQuestionnaireStore.use.readOnly();

  return (
    {
      sourceQuestionnaire,
      itemTypes,
      itemPreferredTerminologyServers,
      tabs,
      currentTabIndex,
      pages,
      currentPageIndex,
      variables,
      launchContexts,
      targetConstraints,
      targetConstraintLinkIds,
      enableWhenItems,
      enableWhenLinkedQuestions,
      enableWhenIsActivated,
      enableWhenExpressions,
      calculatedExpressions,
      initialExpressions,
      answerExpressions,
      processedValueSets,
      cachedValueSetCodings,
      fhirPathContext,
      fhirPathTerminologyCache,
      populatedContext,
      qItemOverrideComponents,
      sdcUiOverrideComponents,
      focusedLinkId,
      readOnly
    }[selectedProperty] || null
  );
}

export default useShowQuestionnaireStoreProperty;
