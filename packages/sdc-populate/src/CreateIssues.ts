import { createParameters } from './CreateParameters';

export function createInvalidParametersIssue() {
  return createParameters({
    name: 'issues',
    resource: {
      resourceType: 'OperationOutcome',
      issue: [
        {
          code: 'invalid',
          severity: 'fatal',
          details: {
            text: 'Parameters are invalid.'
          }
        }
      ]
    }
  });
}

export function createInvalidQuestionnaireIssue() {
  return createParameters({
    name: 'issues',
    resource: {
      resourceType: 'OperationOutcome',
      issue: [
        {
          code: 'invalid',
          severity: 'fatal',
          details: {
            text: 'Questionnaire is invalid.'
          }
        }
      ]
    }
  });
}

export function createInvalidPatientIssue() {
  return createParameters({
    name: 'issues',
    resource: {
      resourceType: 'OperationOutcome',
      issue: [
        {
          code: 'invalid',
          severity: 'fatal',
          details: {
            text: 'Patient is invalid.'
          }
        }
      ]
    }
  });
}

export function createInvalidQueryIssue() {
  return createParameters({
    name: 'issues',
    resource: {
      resourceType: 'OperationOutcome',
      issue: [
        {
          code: 'invalid',
          severity: 'fatal',
          details: {
            text: 'Query is invalid.'
          }
        }
      ]
    }
  });
}
