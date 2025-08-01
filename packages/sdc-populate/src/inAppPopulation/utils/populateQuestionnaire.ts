/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
  Encounter,
  OperationOutcome,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r4';
import type {
  CustomContextResultParameter,
  FetchResourceCallback,
  FetchResourceRequestConfig,
  FetchTerminologyCallback,
  FetchTerminologyRequestConfig,
  InputParameters,
  IssuesParameter,
  OutputParameters,
  ResponseParameter
} from '../../SDCPopulateQuestionnaireOperation';
import {
  isInputParameters,
  isOutputParameters,
  populate
} from '../../SDCPopulateQuestionnaireOperation';
import { Base64 } from 'js-base64';
import type { FhirContext } from '../interfaces/fhirContext.interface';
import { isRecord } from './isRecord';
import { initialiseInputParameters } from './inputParameters';

export interface PopulateResult {
  populatedResponse: QuestionnaireResponse;
  issues?: OperationOutcome;
  populatedContext?: Record<string, any>;
}

/**
 * @property questionnaire - Questionnaire to populate
 * @property fetchResourceCallback - A callback function to fetch resources from your FHIR server
 * @property fetchResourceRequestConfig - Any request configuration to be passed to the fetchResourceCallback i.e. headers, auth etc.
 * @property patient - Patient resource as patient in context
 * @property user - Practitioner resource as user in context, optional
 * @property encounter - Encounter resource as encounter in context, optional
 * @property fhirContext - An array of contextual resources within a launch. See https://build.fhir.org/ig/HL7/smart-app-launch/scopes-and-launch-context.html#fhircontext-exp
 * @property fetchTerminologyCallback - A callback function to fetch terminology resources, optional
 * @property fetchTerminologyRequestConfig - Any request configuration to be passed to the fetchTerminologyCallback i.e. headers, auth etc., optional
 * @property timeoutMs - Timeout in milliseconds for the $populate operation, default is 10000ms (10 seconds)
 *
 * @author Sean Fong
 */
export interface PopulateQuestionnaireParams {
  questionnaire: Questionnaire;
  fetchResourceCallback: FetchResourceCallback;
  fetchResourceRequestConfig: FetchResourceRequestConfig;
  patient: Patient;
  user?: Practitioner;
  encounter?: Encounter;
  fhirContext?: FhirContext[];
  fetchTerminologyCallback?: FetchTerminologyCallback;
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig;
  timeoutMs?: number;
}

/**
 * Performs an in-app population of the provided questionnaire.
 * By in-app, it means that a callback function is provided to fetch resources instead of it calling to a $populate service.
 * This function helps to you create a nice set of populate input parameters from the provided params.
 * If you already have them, use https://github.com/aehrc/smart-forms/blob/main/packages/sdc-populate/src/SDCPopulateQuestionnaireOperation/utils/populate.ts#L842 instead.
 *
 * @param params - Refer to PopulateQuestionnaireParams interface
 * @returns populateSuccess - A boolean indicating if the population was successful
 * @returns populateResult - An object containing populated response and issues if any
 *
 * @author Sean Fong
 */
export async function populateQuestionnaire(params: PopulateQuestionnaireParams): Promise<{
  populateSuccess: boolean;
  populateResult: PopulateResult | null;
}> {
  const {
    questionnaire,
    fetchResourceCallback,
    fetchResourceRequestConfig,
    patient,
    user,
    encounter,
    fhirContext,
    fetchTerminologyCallback,
    fetchTerminologyRequestConfig,
    timeoutMs = 10000
  } = params;

  const { inputParameters } = await initialiseInputParameters(
    questionnaire,
    patient,
    user ?? null,
    encounter ?? null,
    fhirContext ?? null,
    fetchResourceCallback,
    fetchResourceRequestConfig,
    timeoutMs
  );

  if (!inputParameters || !isInputParameters(inputParameters)) {
    return {
      populateSuccess: false,
      populateResult: null
    };
  }

  // Perform population if parameters satisfies input parameters
  const outputParameters = await performInAppPopulation(
    inputParameters,
    fetchResourceCallback,
    fetchResourceRequestConfig,
    timeoutMs,
    fetchTerminologyCallback,
    fetchTerminologyRequestConfig
  );

  if (outputParameters.resourceType === 'OperationOutcome') {
    return {
      populateSuccess: false,
      populateResult: null
    };
  }

  const responseParameter = outputParameters.parameter.find(
    (param) => param.name === 'response'
  ) as ResponseParameter;
  const issuesParameter = outputParameters.parameter.find((param) => param.name === 'issues') as
    | IssuesParameter
    | undefined;
  const contextResultParameter = outputParameters.parameter.find(
    (param) => param.name === 'contextResult-custom'
  ) as CustomContextResultParameter | undefined;

  const populateResult: PopulateResult = {
    populatedResponse: responseParameter.resource
  };

  // Add populated context to populateResult if it exists
  if (contextResultParameter?.valueAttachment.data) {
    const contextResult = JSON.parse(Base64.decode(contextResultParameter.valueAttachment.data));

    if (isRecord(contextResult)) {
      populateResult.populatedContext = contextResult;
    }
  }

  if (issuesParameter) {
    populateResult.issues = issuesParameter.resource;
  }

  return {
    populateSuccess: true,
    populateResult: populateResult
  };
}

async function performInAppPopulation(
  inputParameters: InputParameters,
  fetchResourceCallback: FetchResourceCallback,
  fetchResourceRequestConfig: FetchResourceRequestConfig,
  timeoutMs: number,
  fetchTerminologyCallback?: FetchTerminologyCallback,
  fetchTerminologyRequestConfig?: FetchTerminologyRequestConfig
): Promise<OutputParameters | OperationOutcome> {
  const populatePromise = populate(
    inputParameters,
    fetchResourceCallback,
    fetchResourceRequestConfig,
    fetchTerminologyCallback,
    fetchTerminologyRequestConfig
  );

  try {
    const promiseResult = await addTimeoutToPromise(populatePromise, timeoutMs);

    if (promiseResult.timeout) {
      return {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'timeout',
            details: { text: '$populate operation timed out.' }
          }
        ]
      };
    }

    if (isOutputParameters(promiseResult)) {
      return promiseResult;
    }

    return {
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: {
            text: 'Output parameters do not match the specification.'
          }
        }
      ]
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'unknown',
          details: { text: 'An unknown error occurred.' }
        }
      ]
    };
  }
}

export async function addTimeoutToPromise(promise: Promise<any>, timeoutMs: number) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Promise timed out after ${timeoutMs} milliseconds`));
    }, timeoutMs);
  });

  // Use Promise.race to wait for either the original promise or the timeout promise
  return Promise.race([promise, timeoutPromise]);
}
