import type { OperationOutcome, Questionnaire } from 'fhir/r5';
import type { AssembleOutputParameters, AssembleOutputParametersWithIssues } from './Interfaces';

/**
 * Create output parameters as a response to be returned to the renderer without any issues.
 *
 * @author Sean Fong
 */
export function createOutputParameters(assembled: Questionnaire): AssembleOutputParameters {
  return {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'return',
        resource: assembled
      }
    ]
  };
}

/**
 * Create output parameters as a response to be returned to the renderer with issues.
 *
 * @author Sean Fong
 */
export function createOutputParametersWithIssues(
  outcome: OperationOutcome
): AssembleOutputParametersWithIssues {
  return {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'outcome',
        resource: outcome
      }
    ]
  };
}
