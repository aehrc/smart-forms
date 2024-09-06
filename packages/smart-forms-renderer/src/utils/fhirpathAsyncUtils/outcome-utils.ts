import type { Coding, OperationOutcome, OperationOutcomeIssue } from 'fhir/r4b';

// --------------------------------------------------------------------------
// From: https://github.com/brianpos/fhirpathjs-async-poc/commit/950475900d09bf399574c24f142f3eeae1552fe6
// Forked from: https://github.com/brianpos/fhirpathjs-async-poc
// --------------------------------------------------------------------------

export function CreateOperationOutcome(
  severity: 'error' | 'fatal' | 'warning' | 'information',
  code:
    | 'invalid'
    | 'structure'
    | 'required'
    | 'value'
    | 'invariant'
    | 'security'
    | 'login'
    | 'unknown'
    | 'expired'
    | 'forbidden'
    | 'suppressed'
    | 'processing'
    | 'not-supported'
    | 'duplicate'
    | 'multiple-matches'
    | 'not-found'
    | 'deleted'
    | 'too-long'
    | 'code-invalid'
    | 'extension'
    | 'too-costly'
    | 'business-rule'
    | 'conflict'
    | 'transient'
    | 'lock-error'
    | 'no-store'
    | 'exception'
    | 'timeout'
    | 'incomplete'
    | 'throttled'
    | 'informational',
  message: string,
  coding?: Coding,
  diagnostics?: string
): fhir4b.OperationOutcome {
  const result: fhir4b.OperationOutcome = {
    resourceType: 'OperationOutcome',
    issue: []
  };

  const issue: OperationOutcomeIssue = {
    severity: severity,
    code: code,
    details: { text: message }
  };
  if (coding && issue.details) issue.details.coding = [coding];
  if (diagnostics) issue.diagnostics = diagnostics;
  result.issue.push(issue);
  return result;
}

export function logMessage(
  enabled: boolean,
  outcome: OperationOutcome,
  message: string,
  data?: any
) {
  if (enabled) {
    // and append it into the outcome issues
    const issue: OperationOutcomeIssue = {
      severity: 'information',
      code: 'informational',
      details: { text: message }
    };
    outcome.issue.push(issue);
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean')
      issue.details!.text += '' + data;
    if (data) {
      if (typeof data === 'string') issue.diagnostics = data;
      else issue.diagnostics = JSON.stringify(data);
    }
  }
}
