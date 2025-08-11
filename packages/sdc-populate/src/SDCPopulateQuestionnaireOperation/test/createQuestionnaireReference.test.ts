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
import { createQuestionnaireReference } from '../utils/createQuestionnaireReference';

describe('createQuestionnaireReference', () => {
  it('should return url|version if both exist', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      url: 'http://example.com/assessments/test/1',
      version: '1.0.0'
    };
    expect(createQuestionnaireReference(questionnaire)).toBe(
      'http://example.com/assessments/test/1|1.0.0'
    );
  });

  it('should return just url if version is missing', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      url: 'http://example.com/assessments/test/1'
    };
    expect(createQuestionnaireReference(questionnaire)).toBe(
      'http://example.com/assessments/test/1'
    );
  });

  it('should return Questionnaire/{id} if url is missing', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      id: '12345'
    };
    expect(createQuestionnaireReference(questionnaire)).toBe('Questionnaire/12345');
  });

  it('should return empty string if both url and id are missing', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft'
    };
    expect(createQuestionnaireReference(questionnaire)).toBe('');
  });
});
