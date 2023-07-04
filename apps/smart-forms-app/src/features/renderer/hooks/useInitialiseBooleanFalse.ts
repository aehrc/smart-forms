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

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import useQuestionnaireStore from '../../../stores/useQuestionnaireStore.ts';
import { useEffect } from 'react';
import { createEmptyQrItem } from '../utils/qrItem.ts';

function useInitialiseBooleanFalse(
  questionnaireItem: QuestionnaireItem,
  questionnaireResponseItem: QuestionnaireResponseItem,
  onQrItemChange: (qrItem: QuestionnaireResponseItem) => unknown
) {
  const initialValueBoolean = questionnaireResponseItem?.answer?.[0].valueBoolean;

  // Trigger enableWhen on init - special case
  const enableWhenLinkedQuestions = useQuestionnaireStore(
    (state) => state.enableWhenLinkedQuestions
  );
  useEffect(
    () => {
      // if boolean item is an enableWhen linked question and it does not have an answer yet
      // set default answer to false - to trigger enableWhen == false
      if (
        questionnaireItem.linkId in enableWhenLinkedQuestions &&
        typeof initialValueBoolean === 'undefined'
      ) {
        onQrItemChange({
          ...createEmptyQrItem(questionnaireItem),
          answer: [{ valueBoolean: false }]
        });
      }
    },
    // Only run effect on init
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}

export default useInitialiseBooleanFalse;
