import type {
  PopulateInputParameters,
  PopulateOutputParameters,
  PopulateOutputParametersWithIssues
} from './Interfaces';
import { readInitialExpressions } from './ReadInitialExpressions';
import { evaluateInitialExpressions } from './EvaluateInitialExpressions';
import { constructResponse } from './ConstructQuestionnaireResponse';
import { createOutputParameters } from './CreateParameters';
import type { Parameters, ParametersParameter } from 'fhir/r5';
import {
  isLaunchPatientContent,
  isLaunchPatientName,
  isPrePopQueryContent,
  isPrePopQueryName,
  isQuestionnaireParameter,
  isSubjectParameter
} from './TypePredicates';

/**
 * Main function of this populate module.
 * Input and output specific parameters conformant to the SDC populate specification.
 *
 * @author Sean Fong
 */
export default function populate(
  parameters: PopulateInputParameters
): PopulateOutputParameters | PopulateOutputParametersWithIssues {
  const parameterArr = parameters.parameter;

  const questionnaire = parameterArr[0].resource;
  const subject = parameterArr[1].valueReference;
  const launchPatient = parameterArr[2].part[1].resource;
  const prePopQuery = parameterArr[3].part[1].resource;

  let initialExpressions = readInitialExpressions(questionnaire);
  initialExpressions = evaluateInitialExpressions(initialExpressions, {
    patient: launchPatient,
    PrePopQuery: prePopQuery
  });

  const questionnaireResponse = constructResponse(questionnaire, subject, initialExpressions);

  return createOutputParameters(questionnaireResponse);
}

/**
 * Checks if the parameters passed satisfies the conditions of populateInputParameters.
 *
 * @author Sean Fong
 */
export function isPopulateInputParameters(
  parameters: Parameters
): parameters is PopulateInputParameters {
  const questionnairePresent = !!parameters.parameter?.find(isQuestionnaireParameter);

  const subjectPresent = !!parameters.parameter?.find(isSubjectParameter);

  const launchPatientPresent = !!parameters.parameter?.find((parameter: ParametersParameter) => {
    parameter.name === 'context' &&
      parameter.part?.find(isLaunchPatientName) &&
      parameter.part?.find(isLaunchPatientContent);
  });

  const prePopQueryPresent = !!parameters.parameter?.find(
    (parameter: ParametersParameter) =>
      parameter.name === 'context' &&
      parameter.part?.find(isPrePopQueryName) &&
      parameter.part?.find(isPrePopQueryContent)
  );

  return questionnairePresent && subjectPresent && launchPatientPresent && prePopQueryPresent;
}
