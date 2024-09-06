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

import type {
  Coding,
  Encounter,
  Expression,
  Extension,
  FhirResource,
  Patient,
  Practitioner,
  QuestionnaireItem,
  ValueSet
} from 'fhir/r4';
import * as FHIR from 'fhirclient';
import type { FhirResourceString } from '../interfaces/populate.interface';
import type { VariableXFhirQuery } from '../interfaces/variables.interface';
import type { ValidateCodeResponse, ValueSetPromise } from '../interfaces/valueSet.interface';

const VALID_VALUE_SET_URL_REGEX =
  /https?:\/\/(www\.)?[-\w@:%.+~#=]{2,256}\.[a-z]{2,4}\b([-@\w:%+.~#?&/=]*ValueSet[-@\w:%+.~#?&/=]*)/;

const VALID_FHIRPATH_VARIABLE_REGEX = /%(.*?)\./;

export function getTerminologyServerUrl(qItem: QuestionnaireItem): string | undefined {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/terminology-server'
  );
  if (itemControl) {
    return itemControl.valueUrl;
  }
  return undefined;
}

export function getValueSetPromise(url: string, terminologyServerUrl: string): Promise<ValueSet> {
  let valueSetUrl = url;

  if (url.includes('ValueSet/$expand?url=')) {
    const splitUrl = url.split('ValueSet/$expand?url=');
    if (splitUrl[0] && splitUrl[1]) {
      terminologyServerUrl = splitUrl[0];
      valueSetUrl = splitUrl[1];
    }
  }

  valueSetUrl = valueSetUrl.replace('|', '&version=');

  return FHIR.client({ serverUrl: terminologyServerUrl }).request({
    url: 'ValueSet/$expand?url=' + valueSetUrl
  });
}

function validateCodeResponseIsValid(response: any): response is ValidateCodeResponse {
  return (
    response &&
    response.resourceType === 'Parameters' &&
    response.parameter &&
    response.parameter.find((p: any) => p.name === 'code') &&
    response.parameter.find((p: any) => p.name === 'code').valueCode &&
    response.parameter.find((p: any) => p.name === 'system') &&
    response.parameter.find((p: any) => p.name === 'system').valueUri &&
    response.parameter.find((p: any) => p.name === 'display') &&
    response.parameter.find((p: any) => p.name === 'display').valueString
  );
}

export async function validateCodePromise(
  url: string,
  system: string,
  code: string,
  terminologyServerUrl: string
): Promise<ValidateCodeResponse | null> {
  const validateCodeResponse = await FHIR.client({ serverUrl: terminologyServerUrl }).request({
    url: `ValueSet/$validate-code?url=${url}&system=${system}&code=${code}`
  });

  if (validateCodeResponse && validateCodeResponseIsValid(validateCodeResponse)) {
    return validateCodeResponse;
  }

  return null;
}

async function addTimeoutToPromise(promise: Promise<any>, timeoutMs: number) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Promise timed out after ${timeoutMs} milliseconds`));
    }, timeoutMs);
  });

  // Use Promise.race to wait for either the original promise or the timeout promise
  return Promise.race([promise, timeoutPromise]);
}

export async function resolveValueSetPromises(
  valueSetPromises: Record<string, ValueSetPromise>
): Promise<Record<string, ValueSetPromise>> {
  const newValueSetPromises: Record<string, ValueSetPromise> = {};

  const valueSetPromiseKeys = Object.keys(valueSetPromises);
  const valueSetPromiseValues = Object.values(valueSetPromises);

  const timeoutMs = 5000;
  const promises = valueSetPromiseValues.map((valueSetPromise) =>
    addTimeoutToPromise(valueSetPromise.promise, timeoutMs)
  );

  const settledPromises = await Promise.allSettled(promises);

  for (const [i, settledPromise] of settledPromises.entries()) {
    // Only add valueSet if the promise was fulfilled
    if (settledPromise.status === 'fulfilled') {
      const valueSet = settledPromise.value;
      const key = valueSetPromiseKeys[i];
      const valueSetPromise = valueSetPromiseValues[i];

      if (key && valueSetPromise) {
        valueSetPromise.valueSet = valueSet;
        newValueSetPromises[key] = valueSetPromise;
      }
    }
  }
  return newValueSetPromises;
}

/**
 * Sets an array of codings with the values from a valueSet
 *
 * @author Sean Fong
 */
export function getValueSetCodings(valueSet: ValueSet): Coding[] {
  return valueSet.expansion?.contains?.map((coding) => coding) ?? [];
}

/**
 * Evaluate valueSets in answerExpression with fhirpath
 *
 * @author Sean Fong
 */
export function evaluateAnswerExpressionValueSet(
  answerExpression: Expression,
  itemLevelVariables: Expression[],
  preprocessedCodings: Record<string, Coding[]>
): Coding[] {
  const expression = answerExpression.expression;
  if (!expression) return [];

  const match = expression.match(VALID_FHIRPATH_VARIABLE_REGEX);
  const variableName = match?.[1];
  if (!variableName) return [];

  const matchedVariable = itemLevelVariables?.find((variable) => variable.name === variableName);
  if (!matchedVariable) return [];

  const valueSetExpression = matchedVariable.expression;
  if (!valueSetExpression) return [];

  if (!VALID_VALUE_SET_URL_REGEX.test(valueSetExpression)) return [];

  return preprocessedCodings[valueSetExpression] ?? [];
}

export function createValueSetToXFhirQueryVariableNameMap(
  variables: Record<string, VariableXFhirQuery>
): Record<string, string> {
  const valueSetToNameMap: Record<string, string> = {};
  for (const [name, variable] of Object.entries(variables)) {
    const expressionStr = variable.valueExpression.expression;
    if (expressionStr && VALID_VALUE_SET_URL_REGEX.test(expressionStr)) {
      valueSetToNameMap[expressionStr] = name;
    }
  }
  return valueSetToNameMap;
}

export function getResourceFromLaunchContext(
  resourceType: FhirResourceString,
  patient: Patient | null,
  user: Practitioner | null,
  encounter: Encounter | null
): FhirResource | null {
  switch (resourceType) {
    case 'Patient':
      return patient;
    case 'Practitioner':
      return user;
    case 'Encounter':
      return encounter;
  }
  return null;
}
