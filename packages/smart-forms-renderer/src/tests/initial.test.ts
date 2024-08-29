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

import { expect, test } from '@jest/globals';
import { initialiseQuestionnaireResponse } from '../utils';
import { qInitialValueSample } from './test-data/initialValueSample';

test('item.initial is properly pre-filled into QuestionnaireResponse', () => {
  const outputResponse = initialiseQuestionnaireResponse(qInitialValueSample);

  expect(outputResponse?.item?.[0]).toBeTruthy();
  expect(outputResponse?.item?.[0].item?.[0]).toBeTruthy();
  expect(outputResponse?.item?.[0].item?.[0].item?.[0]).toBeTruthy();
  expect(outputResponse?.item?.[0].item?.[0].item?.[0].item?.[0].answer?.[0]).toStrictEqual({
    valueCoding: {
      system: 'http://snomed.info/sct',
      code: '373066001'
    }
  });
});
