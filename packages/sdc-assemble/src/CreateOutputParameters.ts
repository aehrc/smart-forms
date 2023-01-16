import type { OperationOutcome, Questionnaire } from 'fhir/r5';
import type { AssembleOutputParameters, AssembleOutputParametersWithIssues } from './Interfaces';

/**
 * Create output parameters as a response to be returned to the renderer. If they are issues, return with an issues parameter.
 *
 * @author Sean Fong
 */
export function createOutputParameters(
  assembleResult: Questionnaire | OperationOutcome
): AssembleOutputParameters | AssembleOutputParametersWithIssues {
  if (assembleResult.resourceType === 'Questionnaire') {
    return {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'return',
          resource: assembleResult
        }
      ]
    };
  } else {
    return {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'outcome',
          resource: assembleResult
        }
      ]
    };
  }
}
