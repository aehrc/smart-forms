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

import type { Parameters, ParametersParameter } from 'fhir/r4';
import type {
  CanonicalParameter,
  ContextParameter,
  InputParameters,
  QuestionnaireDataParameter,
  SubjectParameter
} from '../interfaces/inputParameters.interface';
import type { OutputParameters, ResponseParameter } from '../interfaces';

/**
 * Checks if the parameters passed satisfies the conditions of populateInputParameters.
 *
 * @author Sean Fong
 */
export function isInputParameters(parameters: Parameters): parameters is InputParameters {
  const questionnairePresent = !!parameters.parameter?.find(isQuestionnaireDataParameter);

  const subjectPresent = !!parameters.parameter?.find(isSubjectParameter);

  return questionnairePresent && subjectPresent;
}

function isQuestionnaireDataParameter(
  parameter: ParametersParameter
): parameter is QuestionnaireDataParameter {
  return (
    (parameter.name === 'identifier' && !!parameter.valueIdentifier) ||
    (parameter.name === 'questionnaire' && parameter.resource?.resourceType === 'Questionnaire') ||
    (parameter.name === 'questionnaireRef' && !!parameter.valueReference)
  );
}

export function isCanonicalParameter(
  parameter: ParametersParameter
): parameter is CanonicalParameter {
  return parameter.name === 'canonical' && !!parameter.valueCanonical;
}

export function isSubjectParameter(parameter: ParametersParameter): parameter is SubjectParameter {
  return parameter.name === 'subject' && !!parameter.valueReference;
}

export function isEncounterContextParameter(
  parameter: ParametersParameter
): parameter is ContextParameter {
  return (
    parameter.name === 'context' &&
    parameter.part?.[0]?.name === 'name' &&
    parameter.part?.[0]?.valueString === 'encounter' &&
    parameter.part?.[1]?.name === 'content' &&
    !!parameter.part?.[1]?.resource
  );
}

export function isContextParameter(parameter: ParametersParameter): parameter is ContextParameter {
  return (
    parameter.name === 'context' &&
    parameter.part?.[0]?.name === 'name' &&
    !!parameter.part?.[0]?.valueString &&
    parameter.part?.[1]?.name === 'content' &&
    !!(parameter.part?.[1]?.resource || parameter.part?.[1]?.valueReference)
  );
}

export function isOutputParameters(parameters: Parameters): parameters is OutputParameters {
  return !!parameters.parameter?.find(isResponseParameter);
}

export function isResponseParameter(
  parameter: ParametersParameter
): parameter is ResponseParameter {
  return (
    parameter.name === 'response' && parameter.resource?.resourceType === 'QuestionnaireResponse'
  );
}
