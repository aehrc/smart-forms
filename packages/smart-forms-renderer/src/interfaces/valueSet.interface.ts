/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ValueSet } from 'fhir/r4';

export interface ProcessedValueSet {
  initialValueSetUrl: string;
  updatableValueSetUrl: string;
  bindingParameters: BindingParameter[];
  isDynamic: boolean;
  linkIds: string[];
}

export interface ValueSetPromise {
  promise: Promise<ValueSet>;
  valueSet?: ValueSet;
}

export interface ValidateCodeResponse extends Parameters<any> {
  parameter: [SystemParameter, CodeParameter, DisplayParameter];
}

export interface SystemParameter {
  name: 'system';
  valueUri: string;
}

export interface CodeParameter {
  name: 'code';
  valueCode: string;
}

export interface DisplayParameter {
  name: 'display';
  valueString: string;
}

// For parameterised value sets
// See https://build.fhir.org/ig/FHIR/fhir-tools-ig/StructureDefinition-binding-parameter.html
export interface BindingParameter {
  name: string;
  value: string; // This is either the fixed value or an evaluated value from the fhirPathExpression, defaults to '' if no evaluated value
  fhirPathExpression?: string;
}
