import type { OperationOutcome } from 'fhir/r5';

/**
 * Return an OperationOutcome for invalid master questionnaire items
 *
 * @author Sean Fong
 */
export function createInvalidMasterQuestionnaireOutcome(): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'invalid',
        details: { text: 'Master questionnaire does not have a valid item.' }
      }
    ]
  };
}

/**
 * Return an OperationOutcome for invalid subquestionnaires
 *
 * @author Sean Fong
 */
export function createInvalidSubquestionnairesOutcome(): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'invalid',
        details: { text: 'Master questionnaire contains an invalid subquestionnaire.' }
      }
    ]
  };
}

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
