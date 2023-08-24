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

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { createQuestionnaireResponse } from '../features/renderer/utils/qrItem.ts';
import useQuestionnaireStore from '../stores/useQuestionnaireStore.ts';
import useQuestionnaireResponseStore from '../stores/useQuestionnaireResponseStore.ts';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

interface StoriesWrapperProps {
  children: ReactNode;
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
}

// TODO add terminiology server
function StoriesWrapper(props: StoriesWrapperProps) {
  const { children, questionnaire, questionnaireResponse } = props;

  const [loading, setLoading] = useState(true);

  const buildSourceQuestionnaire = useQuestionnaireStore((state) => state.buildSourceQuestionnaire);
  const updatePopulatedProperties = useQuestionnaireStore(
    (state) => state.updatePopulatedProperties
  );
  const buildSourceResponse = useQuestionnaireResponseStore((state) => state.buildSourceResponse);
  const populateResponse = useQuestionnaireResponseStore((state) => state.populateResponse);

  // @ts-ignore
  useEffect(async () => {
    await buildSourceQuestionnaire(questionnaire);
    buildSourceResponse(createQuestionnaireResponse(questionnaire));

    if (questionnaireResponse) {
      const updatedResponse = updatePopulatedProperties(questionnaireResponse);
      populateResponse(updatedResponse);
    }
    setLoading(false);
  }, [
    questionnaire,
    questionnaireResponse,
    buildSourceQuestionnaire,
    buildSourceResponse,
    populateResponse,
    updatePopulatedProperties
  ]);

  if (loading) {
    return <div>Loading questionnaire...</div>;
  }

  return <div>{children}</div>;
}

export default StoriesWrapper;
