import type { ParametersParameter } from 'fhir/r5';
import type {
  ContextPatientParameter,
  ContextQueryParameter,
  QuestionnaireParameter,
  SubjectParameter
} from './Interfaces';

export function isQuestionnaireParameter(
  parameter: ParametersParameter
): parameter is QuestionnaireParameter {
  return parameter.name === 'questionnaire' && parameter.resource?.resourceType === 'Questionnaire';
}

export function isSubjectParameter(parameter: ParametersParameter): parameter is SubjectParameter {
  return parameter.name === 'subject' && parameter.valueReference !== null;
}

export function isContextPatientParameter(
  parameter: ParametersParameter
): parameter is ContextPatientParameter {
  return parameter.name === 'patient' && parameter.resource?.resourceType === 'Patient';
}

export function isContextQueryParameter(
  parameter: ParametersParameter
): parameter is ContextQueryParameter {
  return parameter.name === 'query' && parameter.resource?.resourceType === 'Bundle';
}
