import type { OperationOutcome } from 'fhir/r5';

/**
 * Return an OperationOutcome with a supplied errorMessage
 *
 * @author Sean Fong
 */
export function createOperationOutcome(errorMessage: string): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'invalid',
        details: { text: errorMessage }
      }
    ]
  };
}
