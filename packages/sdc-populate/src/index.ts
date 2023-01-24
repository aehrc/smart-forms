import type {
  InitialExpression,
  PopulateInputParameters,
  PopulateOutputParameters,
  PopulateOutputParametersWithIssues,
  PrePopQueryContextParameter,
  VariablesContextParameter
} from './Interfaces';
import { readInitialExpressions } from './ReadInitialExpressions';
import { addVariablesToContext } from './VariableProcessing';
import { constructResponse } from './ConstructQuestionnaireResponse';
import { createOutputParameters } from './CreateOutputParameters';
import type { Parameters, ParametersParameter } from 'fhir/r5';
import {
  isLaunchPatientContent,
  isLaunchPatientName,
  isPrePopQueryName,
  isPrePopQueryOrVariablesContent,
  isQuestionnaireParameter,
  isSubjectParameter,
  isVariablesName
} from './TypePredicates';
import { evaluateInitialExpressions } from './EvaluateInitialExpressions';

/**
 * Main function of this populate module.
 * Input and output specific parameters conformant to the SDC populate specification.
 *
 * @author Sean Fong
 */
export default async function populate(
  parameters: PopulateInputParameters
): Promise<PopulateOutputParameters | PopulateOutputParametersWithIssues> {
  const params = parameters.parameter;

  const questionnaire = params[0].resource;
  const subject = params[1].valueReference;
  const launchPatient = params[2].part[1].resource;

  let initialExpressions = readInitialExpressions(questionnaire);
  let context: Record<string, any> = {
    patient: launchPatient
  };

  // Add PrePopQuery and variables to context
  if (params.length === 5) {
    for (const param of [params[3], params[4]]) {
      context = getContextContent(param, context, initialExpressions);
    }
  } else {
    context = getContextContent(params[3], context, initialExpressions);
  }

  // Perform evaluate of initialExpressions based on context
  initialExpressions = evaluateInitialExpressions(initialExpressions, context);

  const questionnaireResponse = await constructResponse(questionnaire, subject, initialExpressions);

  return createOutputParameters(questionnaireResponse);
}

function getContextContent(
  param: PrePopQueryContextParameter | VariablesContextParameter,
  context: Record<string, any>,
  initialExpressions: Record<string, InitialExpression>
) {
  const contextName = param.part[0].valueString;
  const contextContent = param.part[1].resource;

  switch (contextName) {
    case 'PrePopQuery':
      context['PrePopQuery'] = contextContent;
      break;
    case 'Variables':
      context = addVariablesToContext(initialExpressions, context, contextContent);
      break;
  }
  return context;
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

  const launchPatientPresent = !!parameters.parameter?.find(
    (parameter: ParametersParameter) =>
      parameter.name === 'context' &&
      parameter.part?.find(isLaunchPatientName) &&
      parameter.part?.find(isLaunchPatientContent)
  );

  const prePopQueryPresent = !!parameters.parameter?.find(
    (parameter: ParametersParameter) =>
      parameter.name === 'context' &&
      parameter.part?.find(isPrePopQueryName) &&
      parameter.part?.find(isPrePopQueryOrVariablesContent)
  );

  const variablesPresent = !!parameters.parameter?.find(
    (parameter: ParametersParameter) =>
      parameter.name === 'context' &&
      parameter.part?.find(isVariablesName) &&
      parameter.part?.find(isPrePopQueryOrVariablesContent)
  );

  return (
    questionnairePresent &&
    subjectPresent &&
    launchPatientPresent &&
    (prePopQueryPresent || variablesPresent)
  );
}
