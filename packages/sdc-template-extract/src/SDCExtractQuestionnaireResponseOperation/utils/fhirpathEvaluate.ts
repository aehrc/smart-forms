import fhirpath, { type Model } from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';

/**
 * Input parameters for evaluating a FHIRPath expression.
 *
 * These map directly to the arguments used by `fhirpath.evaluate(fhirData, path)`.
 */
export interface FhirPathEvaluateParams {
  fhirData: any;
  path: string;
}

/**
 * Evaluates a FHIRPath expression against a given FHIR resource using the R4 model.
 *
 * @param params - Object containing the FHIR resource (`fhirData`) and the FHIRPath expression (`path`).
 * @returns The result of the FHIRPath evaluation as an array of matched values.
 */
export function fhirPathEvaluate(params: FhirPathEvaluateParams) {
  const { fhirData, path } = params;

  return fhirpath.evaluate(fhirData, path, undefined, fhirpath_r4_model as Model, {
    async: false
  });
}
