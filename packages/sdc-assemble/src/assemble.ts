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

import type { OperationOutcome, OperationOutcomeIssue, Questionnaire } from 'fhir/r4';
import type { InputParameters, OutputParameters } from './interfaces/parameters.interface';
import { assembleQuestionnaire } from './assembleQuestionnaire';
import type { FetchQuestionnaireCallback } from './interfaces/callback.interface';
import { createOutputParameters } from './parameters';

/**
 * The $assemble operation - https://build.fhir.org/ig/HL7/sdc/OperationDefinition-Questionnaire-assemble.html
 *
 * @param parameters - The input parameters for $assemble
 * @param fetchQuestionnaireCallback - A callback function defined by the implementer to fetch Questionnaire resources by a canonical url
 * @returns A fully assembled questionnaire, an operationOutcome error(if present) or both (if there are warnings)
 *
 * @author Sean Fong
 */
export async function assemble(
  parameters: InputParameters,
  fetchQuestionnaireCallback: FetchQuestionnaireCallback
): Promise<Questionnaire | OperationOutcome | OutputParameters> {
  // Get root questionnaire from input params
  const rootQuestionnaire = parameters.parameter[0].resource;
  const totalCanonicals: string[] = [];
  const issues: OperationOutcomeIssue[] = [];

  // Starting point to assemble questionnaire recursively
  const result = await assembleQuestionnaire(
    rootQuestionnaire,
    totalCanonicals,
    issues,
    fetchQuestionnaireCallback
  );

  // Return different outputs based on result of the operation
  // (from http://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-assemble)
  //
  // The result of the operation will be one of three things:
  //
  // If there are any errors, there will be a 4xx or 5xx error code and, ideally an OperationOutcome as the body of the response.
  // If there are no errors, warnings or information messages that result from the assembly process, the body can just be the bare Questionnaire resource that resulted from the operation.
  // If there are any warnings or information messages, then the body will be a Parameters instance with two parameters - 'response' containing the reulting Questionnaire and 'outcome' containing an OperationOutcome with the warning and/or information messages.

  if (result.resourceType === 'OperationOutcome') {
    // return result as an OperationOutcome
    return result;
  } else {
    if (issues.length > 0) {
      // return result as OutputParameters
      return createOutputParameters(result, issues);
    } else {
      // return assembled Questionnaire resource
      return result;
    }
  }
}
