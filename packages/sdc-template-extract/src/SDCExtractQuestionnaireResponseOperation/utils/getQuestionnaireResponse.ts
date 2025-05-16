import type { OperationOutcome, QuestionnaireResponse } from 'fhir/r4';
import type { InputParameters } from '../interfaces/inputParameters.interface';
import { isQuestionnaireResponseParameter } from './typePredicates';
import { createErrorOutcome } from './operationOutcome';

export function getQuestionnaireResponse(
  inputParameters: InputParameters | QuestionnaireResponse
): QuestionnaireResponse | OperationOutcome {
  // Check if the input is a QuestionnaireResponse directly
  if (inputParameters.resourceType === 'QuestionnaireResponse') {
    return inputParameters;
  }

  // Check if the input is Parameters and find the QuestionnaireResponse parameter
  if (inputParameters.resourceType === 'Parameters') {
    const questionnaireResponseParam = inputParameters.parameter.find((param) =>
      isQuestionnaireResponseParameter(param)
    );

    if (
      questionnaireResponseParam &&
      questionnaireResponseParam.resource &&
      questionnaireResponseParam.resource.resourceType === 'QuestionnaireResponse'
    ) {
      return questionnaireResponseParam.resource;
    }
  }

  // If no QuestionnaireResponse is found, return null
  return createErrorOutcome(`No QuestionnaireResponse found in input parameters`);
}
