import type { QuestionnaireResponse } from 'fhir/r4';
import type { InputParameters } from '../interfaces/inputParameters.interface';
import { isCustomComparisonSourceResponseParameter } from './typePredicates';

export function getComparisonSourceResponse(
  inputParameters: InputParameters | QuestionnaireResponse
): QuestionnaireResponse | null {
  // Input parameters is a QR, that means comparison-source-response does not exist
  if (inputParameters.resourceType === 'QuestionnaireResponse') {
    return null;
  }

  // Check if the input is Parameters and find the ComparisonSourceResponse parameter
  if (inputParameters.resourceType === 'Parameters') {
    const comparisonSourceResponseParam = inputParameters.parameter.find((param) =>
      isCustomComparisonSourceResponseParameter(param)
    );

    if (
      comparisonSourceResponseParam &&
      comparisonSourceResponseParam.resource &&
      comparisonSourceResponseParam.resource.resourceType === 'QuestionnaireResponse'
    ) {
      return comparisonSourceResponseParam.resource;
    }
  }

  // If no ComparisonSourceResponse found, return null
  return null;
}
