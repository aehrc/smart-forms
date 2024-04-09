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

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type { RepeatAnswer } from '../interfaces/repeatItem.interface';
import { nanoid } from 'nanoid';
import { useMemo } from 'react';

function useInitialiseRepeatAnswers(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | null
): RepeatAnswer[] {
  return useMemo(
    () => {
      let initialRepeatAnswers: RepeatAnswer[] = [
        {
          nanoId: nanoid(),
          answer: null
        }
      ];

      if (qrItem?.answer) {
        initialRepeatAnswers = qrItem.answer.map((answer) => {
          return {
            nanoId: nanoid(),
            answer
          };
        });
      }

      return initialRepeatAnswers;
    },
    // init initialRepeatAnswers on first render only, leave dependency array empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [qItem]
  );
}

export default useInitialiseRepeatAnswers;
