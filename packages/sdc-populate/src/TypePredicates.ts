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

import type { ParametersParameter } from 'fhir/r5';
import type {
  LaunchPatientContent,
  LaunchPatientName,
  PrePopQueryContent,
  PrePopQueryName,
  QuestionnaireParameter,
  SubjectParameter
} from './Interfaces';

export function isQuestionnaireParameter(
  parameter: ParametersParameter
): parameter is QuestionnaireParameter {
  return parameter.name === 'questionnaire' && parameter.resource?.resourceType === 'Questionnaire';
}

export function isSubjectParameter(parameter: ParametersParameter): parameter is SubjectParameter {
  return parameter.name === 'subject' && parameter.valueReference !== undefined;
}

export function isLaunchPatientName(
  parameter: ParametersParameter
): parameter is LaunchPatientName {
  return parameter.name === 'name' && parameter.valueString === 'LaunchPatient';
}

export function isLaunchPatientContent(
  parameter: ParametersParameter
): parameter is LaunchPatientContent {
  return parameter.name === 'content' && parameter.resource?.resourceType === 'Patient';
}

export function isPrePopQueryName(parameter: ParametersParameter): parameter is PrePopQueryName {
  return parameter.name === 'name' && parameter.valueString === 'PrePopQuery';
}

export function isVariablesName(parameter: ParametersParameter): parameter is PrePopQueryName {
  return parameter.name === 'name' && parameter.valueString === 'Variables';
}

export function isPrePopQueryOrVariablesContent(
  parameter: ParametersParameter
): parameter is PrePopQueryContent {
  return parameter.name === 'content' && parameter.resource?.resourceType === 'Bundle';
}
