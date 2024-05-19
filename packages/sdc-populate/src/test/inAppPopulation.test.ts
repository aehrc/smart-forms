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

import { populateQuestionnaire } from '../inAppPopulation';
import { quesBMICalculation } from './resources/QuesBmiCalculation';
import { patSmartForm } from './resources/PatSmartForm';
import { pracPrimaryPeter } from './resources/PracPrimaryPeter';
import { fetchResourceCallbackTest, requestConfigTest } from './fetchResourceCallbackTest';

describe.only('in app population test', () => {
  test('specifying age as key after evaluation should return 87', async () => {
    const { populateSuccess, populateResult } = await populateQuestionnaire({
      questionnaire: quesBMICalculation,
      patient: patSmartForm,
      user: pracPrimaryPeter,
      fetchResourceCallback: fetchResourceCallbackTest,
      requestConfig: requestConfigTest
    });

    expect(populateSuccess).toBe(true);
    expect(populateResult).toBeTruthy();
    expect(populateResult?.populatedResponse).toBeTruthy();

    const response = populateResult?.populatedResponse;

    expect(response?.item).toBeTruthy();
    expect(response?.item?.[0]).toBeTruthy();

    const parentGroup = response?.item?.[0];

    expect(parentGroup?.item?.[0]?.answer?.[0]?.valueDecimal).toBe(163);
    expect(parentGroup?.item?.[1]?.answer?.[0]?.valueDecimal).toBe(77.3);
  });
});
