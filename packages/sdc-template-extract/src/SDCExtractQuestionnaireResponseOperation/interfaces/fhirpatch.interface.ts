import type { Parameters, ParametersParameter } from 'fhir/r4';

/**
 *  Interface representing a https://build.fhir.org/fhirpatch.html
 */
export interface FhirPatchParameters extends Parameters {
  resourceType: 'Parameters';
  parameter: FhirPatchParameterEntry[];
}

export type FhirPatchOperationType = 'add' | 'insert' | 'delete' | 'replace' | 'move';

export type FhirPatchPart =
  | { name: 'type'; valueCode: FhirPatchOperationType }
  | { name: 'path'; valueString: string }
  | { name: 'name'; valueString: string } // (add operation only)
  | { name: 'value'; [key: string]: unknown } // value[x], e.g., valueString, valueInteger, etc.
  | { name: 'index'; valueInteger: number }
  | { name: 'source'; valueInteger: number }
  | { name: 'destination'; valueInteger: number };

export interface FhirPatchParameterEntry extends ParametersParameter {
  part: FhirPatchPart[];
}
