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

import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import type { RepeatAnswer } from '../interfaces/repeatItem.interface';
import _isEqual from 'lodash/isEqual';

function useRepeatAnswers(
  valueFromProps: RepeatAnswer[]
): [RepeatAnswer[], Dispatch<SetStateAction<RepeatAnswer[]>>] {
  const [repeatAnswers, setRepeatAnswers] = useState(valueFromProps);

  useEffect(
    () => {
      const valueFromPropsQRItemAnswers = valueFromProps.map((answer) => answer.answer);
      const repeatAnswersQRItemAnswers = repeatAnswers.map((answer) => answer.answer);

      if (!_isEqual(valueFromPropsQRItemAnswers, repeatAnswersQRItemAnswers)) {
        setRepeatAnswers(valueFromProps);
      }
    },
    // Only trigger this effect if prop value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [valueFromProps]
  );

  return [repeatAnswers, setRepeatAnswers];
}

export default useRepeatAnswers;
