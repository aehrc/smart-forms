/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import { isQuestionnaire } from '../typePredicates/isQuestionnaire';

describe('isQuestionnaire', () => {
  it('returns true if jsonObject.resourceType is Questionnaire', () => {
    const jsonObject = { resourceType: 'Questionnaire' };
    expect(isQuestionnaire(jsonObject)).toBe(true);
  });

  it('returns false if jsonObject.resourceType is not Questionnaire', () => {
    const jsonObject = { resourceType: 'Patient' };
    expect(isQuestionnaire(jsonObject)).toBe(false);
  });

  it('returns false if resourceType is missing', () => {
    const jsonObject = {};
    expect(isQuestionnaire(jsonObject)).toBe(false);
  });

  it('returns false if jsonObject is null or undefined', () => {
    expect(isQuestionnaire(null)).toBe(false);
    expect(isQuestionnaire(undefined)).toBe(false);
  });
});
