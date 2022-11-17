import {
  PopulateInputParameters,
  PopulateOutputParameters,
  PopulateOutputParametersWithIssues
} from './Interfaces';
import { readInitialExpressions } from './ReadInitialExpressions';
import { evaluateInitialExpressions } from './EvaulateInitialExpressions';
import { constructResponse } from './ConstructQuestionnaireResponse';
import { createOutputParameters } from './CreateParameters';
import { Parameters } from 'fhir/r5';
import {
  isContextPatientParameter,
  isContextQueryParameter,
  isQuestionnaireParameter,
  isSubjectParameter
} from './TypePredicates';

export default function sdcPopulate(
  parameters: PopulateInputParameters
): PopulateOutputParameters | PopulateOutputParametersWithIssues {
  const parameterArr = parameters.parameter;

  const questionnaire = parameterArr[0].resource;
  const subject = parameterArr[1].valueReference;
  const patient = parameterArr[2].part[0].resource;
  const query = parameterArr[2].part[1].resource;

  let initialExpressions = readInitialExpressions(questionnaire);
  initialExpressions = evaluateInitialExpressions(initialExpressions, {
    LaunchPatient: patient,
    PrePopQuery: query
  });

  const questionnaireResponse = constructResponse(questionnaire, subject, initialExpressions);

  return createOutputParameters(questionnaireResponse);
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
