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

import { canBeTemplateExtracted } from '@aehrc/sdc-template-extract';
// import { getExtractMechanism } from '../utils/extract';
// import { canBeObservationExtracted } from '@aehrc/smart-forms-renderer';
import type { Questionnaire } from 'fhir/r4';

describe('getExtractMechanism', () => {
  const questionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: '123',
    status: 'draft'
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns 'template-based' if canBeTemplateExtracted is true", () => {
    (canBeTemplateExtracted as jest.Mock).mockReturnValue(true);
    // (canBeObservationExtracted as jest.Mock).mockReturnValue(false);

    // expect(getExtractMechanism(questionnaire)).toBe('template-based');
    expect(canBeTemplateExtracted).toHaveBeenCalledWith(questionnaire);

    // Should not call the observation check if template true
    // expect(canBeObservationExtracted).not.toHaveBeenCalled();
  });

  // it("returns 'observation-based' if canBeTemplateExtracted is false and canBeObservationExtracted is true", () => {
  //   (canBeTemplateExtracted as jest.Mock).mockReturnValue(false);
  //   // (canBeObservationExtracted as jest.Mock).mockReturnValue(true);
  //
  //   // expect(getExtractMechanism(questionnaire)).toBe('observation-based');
  //   expect(canBeTemplateExtracted).toHaveBeenCalledWith(questionnaire);
  //   // expect(canBeObservationExtracted).toHaveBeenCalledWith(questionnaire);
  // });
  //
  // it('returns null if neither extraction method is supported', () => {
  //   (canBeTemplateExtracted as jest.Mock).mockReturnValue(false);
  //   // (canBeObservationExtracted as jest.Mock).mockReturnValue(false);
  //
  //   // expect(getExtractMechanism(questionnaire)).toBeNull();
  //   expect(canBeTemplateExtracted).toHaveBeenCalledWith(questionnaire);
  //   // expect(canBeObservationExtracted).toHaveBeenCalledWith(questionnaire);
  // });
});
