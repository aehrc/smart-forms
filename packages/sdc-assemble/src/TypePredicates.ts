import type { ParametersParameter } from 'fhir/r5';
import type { QuestionnaireParameter } from './Interfaces';

export function isQuestionnaireParameter(
  parameter: ParametersParameter
): parameter is QuestionnaireParameter {
  return parameter.name === 'questionnaire' && parameter.resource?.resourceType === 'Questionnaire';
}
