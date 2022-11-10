import { ParametersParameter } from 'fhir/r5';

export function createParameters(parameter: ParametersParameter) {
  return {
    resourceType: 'Parameters',
    parameter: [parameter]
  };
}
