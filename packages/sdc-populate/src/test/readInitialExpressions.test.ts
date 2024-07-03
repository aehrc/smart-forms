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

import { readPopulationExpressions } from '../SDCPopulateQuestionnaireOperation/utils/readPopulationExpressions';
import type { Questionnaire } from 'fhir/r4';
// @ts-ignore
import Q715XFhirQuery from './resources/715-v.json';

describe('read initial expressions', () => {
  const questionnaire = Q715XFhirQuery as Questionnaire;
  const { initialExpressions } = readPopulationExpressions(questionnaire);

  test('getting an initial expression with a linkId key should return an object containing its expression', () => {
    const prePopQuery0 = {
      expression:
        "%PrePopQuery0.entry.resource.select(relationship.coding.display + ' - ' + condition.code.coding.display).join(' ')"
    };

    expect(initialExpressions['cfdc0b14-7271-4145-b57a-9c1faffd6516']).toEqual(prePopQuery0);
  });
});
