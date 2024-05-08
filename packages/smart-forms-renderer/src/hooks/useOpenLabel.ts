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

import { getOldOpenLabelAnswer } from '../utils/openChoice';
import { useState } from 'react';
import type { QuestionnaireItemAnswerOption, QuestionnaireResponseItemAnswer } from 'fhir/r4';

function useOpenLabel(
  options: QuestionnaireItemAnswerOption[],
  answers: QuestionnaireResponseItemAnswer[]
) {
  let initialOpenLabelValue = '';
  let initialOpenLabelChecked = false;

  if (options.length > 0) {
    const oldLabelAnswer = getOldOpenLabelAnswer(answers, options);
    if (oldLabelAnswer && oldLabelAnswer.valueString) {
      initialOpenLabelValue = oldLabelAnswer.valueString;
      initialOpenLabelChecked = true;
    }
  }

  const [openLabelValue, setOpenLabelValue] = useState(initialOpenLabelValue);
  const [openLabelChecked, setOpenLabelChecked] = useState(initialOpenLabelChecked);

  return { openLabelValue, setOpenLabelValue, openLabelChecked, setOpenLabelChecked };
}

export default useOpenLabel;
