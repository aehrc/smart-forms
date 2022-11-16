import { readInitialExpressions } from './ReadInitialExpressions';
import { constructResponse } from './ConstructQuestionnaireResponse';
import { evaluateInitialExpressions } from './EvaulateInitialExpressions';
import { createOutputParameters } from './CreateParameters';
import {
  PopulateInputParameters,
  PopulateOutputParameters,
  PopulateOutputParametersWithIssues
} from './Interfaces';

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
