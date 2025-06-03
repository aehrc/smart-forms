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

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import type {
  CustomQuestionnaireParameter,
  InputParamArray,
  InputParameters,
  QuestionnaireResponseParameter
} from '../interfaces/inputParameters.interface';

/**
 * Create input parameters to be passed to sdc-template-extract extract(). Questionnaire parameter is optional.
 * Refer to https://build.fhir.org/ig/HL7/sdc/OperationDefinition-QuestionnaireResponse-extract.html.
 */
export function createInputParameters(
  questionnaireResponse: QuestionnaireResponse,
  questionnaire: Questionnaire | undefined
): InputParameters {
  return {
    resourceType: 'Parameters',
    parameter: createInputParamArray(questionnaireResponse, questionnaire)
  };
}

/**
 * Builds the input parameter array for the extract() function.
 * Includes the QuestionnaireResponse and optionally the Questionnaire.
 */
function createInputParamArray(
  questionnaireResponse: QuestionnaireResponse,
  questionnaire: Questionnaire | undefined
): InputParamArray {
  const questionnaireResponseParameter: QuestionnaireResponseParameter = {
    name: 'questionnaire-response',
    resource: questionnaireResponse
  };

  if (!questionnaire) {
    return [
      {
        name: 'questionnaire-response',
        resource: questionnaireResponse
      }
    ];
  }

  const customQuestionnaireParameter: CustomQuestionnaireParameter = {
    name: 'questionnaire',
    resource: questionnaire
  };

  return [questionnaireResponseParameter, customQuestionnaireParameter];
}
