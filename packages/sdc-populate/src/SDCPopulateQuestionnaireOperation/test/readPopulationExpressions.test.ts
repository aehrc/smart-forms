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

import type { Questionnaire } from 'fhir/r4';
import { readPopulationExpressions } from '../utils/readPopulationExpressions';
import { QTestFhirContext } from './resources/QTestFhirContext';

describe('readPopulationExpressions', () => {
  const questionnaire = QTestFhirContext as Questionnaire;
  const { initialExpressions } = readPopulationExpressions(questionnaire);

  it('should extract x-fhir-query variables ObsBodyHeight and ObsBodyWeight', () => {
    expect(initialExpressions.q1.expression).toEqual('%ObsBodyHeight.toString()');
  });
});
