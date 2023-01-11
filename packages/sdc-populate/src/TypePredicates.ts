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

export function isPrePopQueryContent(
  parameter: ParametersParameter
): parameter is PrePopQueryContent {
  return parameter.name === 'content' && parameter.resource?.resourceType === 'Patient';
}
