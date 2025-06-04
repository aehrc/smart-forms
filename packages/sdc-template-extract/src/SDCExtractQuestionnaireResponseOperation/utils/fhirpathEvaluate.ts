import fhirpath, { type Model } from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import type { OperationOutcomeIssue } from 'fhir/r4';
import { createInvalidWarningIssue } from './operationOutcome';
import { normaliseExpression } from './expressionManipulation';
import type { FhirPathEvalResult } from '../interfaces/templateExtractPath.interface';

/**
 * Input parameters for evaluating a FHIRPath expression.
 *
 * These map directly to the arguments used by `fhirpath.evaluate(fhirData, path)`.
 */
export interface FhirPathEvaluateParams {
  fhirData: any;
  path: string;
  envVars: Record<string, any>;
  warnings: OperationOutcomeIssue[];
}

/**
 * Evaluates a FHIRPath expression against a given FHIR resource using the R4 model.
 *
 * @param params - Object containing the FHIR resource (`fhirData`) and the FHIRPath expression (`path`).
 * @returns The result of the FHIRPath evaluation as an array of matched values.
 */
export function fhirPathEvaluate(params: FhirPathEvaluateParams): FhirPathEvalResult {
  const { fhirData, path, envVars, warnings } = params;
  try {
    return fhirpath.evaluate(
      fhirData,
      normaliseExpression(path),
      envVars,
      fhirpath_r4_model as Model,
      {
        async: false
      }
    );
  } catch (e) {
    if (e instanceof Error) {
      console.warn(
        `SDC-template-extract error:\nFHIRPath evaluation failed for ${path}.\n\nDetails below: ` +
          e
      );
      warnings.push(createInvalidWarningIssue(e.message));
    }
  }

  // Return an empty array if evaluation fails
  return [];
}
