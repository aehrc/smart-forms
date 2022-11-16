import { Parameters, ParametersParameter } from 'fhir/r5';
import {
  ContextPatientParameter,
  ContextQueryParameter,
  PopulateInputParameters,
  QuestionnaireParameter,
  SubjectParameter
} from './Interfaces';

function isQuestionnaireParameter(
  parameter: ParametersParameter
): parameter is QuestionnaireParameter {
  return parameter.name === 'questionnaire' && parameter.resource?.resourceType === 'Questionnaire';
}

function isSubjectParameter(parameter: ParametersParameter): parameter is SubjectParameter {
  return parameter.name === 'subject' && parameter.valueReference !== null;
}

function isContextPatientParameter(
  parameter: ParametersParameter
): parameter is ContextPatientParameter {
  return parameter.name === 'questionnaire' && parameter.resource?.resourceType === 'Questionnaire';
}

function isContextQueryParameter(
  parameter: ParametersParameter
): parameter is ContextQueryParameter {
  return parameter.name === 'context.query' && parameter.resource?.resourceType === 'Bundle';
}

export function isPopulateInputParameters(
  parameters: Parameters
): parameters is PopulateInputParameters {
  const questionnairePresent = !!parameters.parameter?.find((parameter) =>
    isQuestionnaireParameter(parameter)
  );

  const subjectPresent = !!parameters.parameter?.find((parameter) => isSubjectParameter(parameter));

  const contextPatientPresent = !!parameters.parameter?.find(
    (parameter) =>
      parameter.name === 'context' &&
      parameter.part?.find((parameter) => isContextPatientParameter(parameter))
  );

  const contextQueryPresent = !!parameters.parameter?.find(
    (parameter) =>
      parameter.name === 'context' &&
      parameter.part?.find((parameter) => isContextQueryParameter(parameter))
  );

  return questionnairePresent && subjectPresent && contextPatientPresent && contextQueryPresent;
}
