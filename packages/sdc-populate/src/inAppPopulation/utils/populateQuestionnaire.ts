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
  Encounter,
  Extension,
  OperationOutcome,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse
} from 'fhir/r4';
import type {
  CustomContextResultParameter,
  FetchResourceCallback,
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
import { createPopulateInputParameters } from './createInputParameters';
import type {
  LaunchContext,
  QuestionnaireLevelXFhirQueryVariable,
  SourceQuery
} from '../interfaces/inAppPopulation.interface';
import { Base64 } from 'js-base64';

export interface PopulateResult {
  populatedResponse: QuestionnaireResponse;
  issues?: OperationOutcome;
  populatedContext?: Record<string, any>;
}

/**
 * @property questionnaire - Questionnaire to populate
 * @property fetchResourceCallback - A callback function to fetch resources
 * @property requestConfig - Any request configuration to be passed to the fetchResourceCallback i.e. headers, auth etc.
 * @property patient - Patient resource as patient in context
 * @property user - Practitioner resource as user in context
 * @property encounter - Encounter resource as encounter in context, optional
 * @property terminologyCallback - A callback function to fetch terminology resources, optional
 * @property terminologyRequestConfig - Any request configuration to be passed to the terminologyCallback i.e. headers, auth etc., optional
 *
 * @author Sean Fong
 */
export interface PopulateQuestionnaireParams {
  questionnaire: Questionnaire;
  fetchResourceCallback: FetchResourceCallback;
  requestConfig: any;
  patient: Patient;
  user?: Practitioner;
  encounter?: Encounter;
  terminologyCallback?: FetchResourceCallback;
  terminologyRequestConfig?: any;
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
    requestConfig,
    patient,
    user,
    encounter,
    terminologyCallback,
    terminologyRequestConfig
  } = params;

  const context: Record<string, any> = {};

  // Get launch contexts, source queries and questionnaire-level variables
  const launchContexts = getLaunchContexts(questionnaire);
  const sourceQueries = getSourceQueries(questionnaire);
  const questionnaireLevelVariables = getXFhirQueryVariables(questionnaire);

  if (
    launchContexts.length === 0 &&
    sourceQueries.length === 0 &&
    questionnaireLevelVariables.length === 0
  ) {
    return {
      populateSuccess: false,
      populateResult: null
    };
  }

  // Define population input parameters from launch contexts, source queries and questionnaire-level variables
  const inputParameters = createPopulateInputParameters(
    questionnaire,
    patient,
    user ?? null,
    encounter ?? null,
    launchContexts,
    sourceQueries,
    questionnaireLevelVariables,
    context
  );

  if (!inputParameters) {
    return {
      populateSuccess: false,
      populateResult: null
    };
  }

  if (!isInputParameters(inputParameters)) {
    return {
      populateSuccess: false,
      populateResult: null
    };
  }

  // Perform population if parameters satisfies input parameters
  const outputParameters = await performInAppPopulation(
    inputParameters,
    fetchResourceCallback,
    requestConfig,
    terminologyCallback,
    terminologyRequestConfig
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
  requestConfig: any,
  terminologyCallback?: FetchResourceCallback,
  terminologyRequestConfig?: any
): Promise<OutputParameters | OperationOutcome> {
  const populatePromise = populate(
    inputParameters,
    fetchResourceCallback,
    requestConfig,
    terminologyCallback,
    terminologyRequestConfig
  );

  try {
    const promiseResult = await addTimeoutToPromise(populatePromise, 10000);

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

async function addTimeoutToPromise(promise: Promise<any>, timeoutMs: number) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Promise timed out after ${timeoutMs} milliseconds`));
    }, timeoutMs);
  });

  // Use Promise.race to wait for either the original promise or the timeout promise
  return Promise.race([promise, timeoutPromise]);
}

function isLaunchContext(extension: Extension): extension is LaunchContext {
  const hasLaunchContextName =
    extension.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext' &&
    !!extension.extension?.find(
      (ext) =>
        ext.url === 'name' &&
        (ext.valueId ||
          (ext.valueCoding &&
            (ext.valueCoding.code === 'patient' ||
              ext.valueCoding.code === 'encounter' ||
              ext.valueCoding.code === 'location' ||
              ext.valueCoding.code === 'user' ||
              ext.valueCoding.code === 'study' ||
              ext.valueCoding.code === 'sourceQueries')))
    );

  const hasLaunchContextType = !!extension.extension?.find(
    (ext) =>
      ext.url === 'type' &&
      ext.valueCode &&
      (ext.valueCode === 'Patient' ||
        ext.valueCode === 'Practitioner' ||
        ext.valueCode === 'Encounter')
  );

  return (
    extension.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext' &&
    hasLaunchContextName &&
    hasLaunchContextType
  );
}

function getLaunchContexts(questionnaire: Questionnaire): LaunchContext[] {
  if (questionnaire.extension && questionnaire.extension.length > 0) {
    return questionnaire.extension.filter((extension) =>
      isLaunchContext(extension)
    ) as LaunchContext[];
  }

  return [];
}

function isSourceQuery(extension: Extension): extension is SourceQuery {
  return (
    extension.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-sourceQueries' &&
    !!extension.valueReference
  );
}

function getSourceQueries(questionnaire: Questionnaire): SourceQuery[] {
  if (questionnaire.extension && questionnaire.extension.length > 0) {
    return questionnaire.extension.filter((extension) => isSourceQuery(extension)) as SourceQuery[];
  }

  return [];
}

function isXFhirQueryVariable(
  extension: Extension
): extension is QuestionnaireLevelXFhirQueryVariable {
  return (
    extension.url === 'http://hl7.org/fhir/StructureDefinition/variable' &&
    !!extension.valueExpression?.name &&
    extension.valueExpression?.language === 'application/x-fhir-query' &&
    !!extension.valueExpression?.expression
  );
}

function getXFhirQueryVariables(
  questionnaire: Questionnaire
): QuestionnaireLevelXFhirQueryVariable[] {
  const xFhirQueryVariables: QuestionnaireLevelXFhirQueryVariable[] = [];
  if (questionnaire.extension && questionnaire.extension.length > 0) {
    xFhirQueryVariables.push(
      ...(questionnaire.extension.filter((extension) =>
        isXFhirQueryVariable(extension)
      ) as QuestionnaireLevelXFhirQueryVariable[])
    );
  }

  if (questionnaire.item && questionnaire.item.length > 0) {
    for (const qItem of questionnaire.item) {
      xFhirQueryVariables.push(
        ...(getXFhirQueryVariablesRecursive(qItem) as QuestionnaireLevelXFhirQueryVariable[])
      );
    }
  }

  return xFhirQueryVariables;
}

function getXFhirQueryVariablesRecursive(qItem: QuestionnaireItem) {
  let xFhirQueryVariables: Extension[] = [];

  if (qItem.item) {
    for (const childItem of qItem.item) {
      xFhirQueryVariables = xFhirQueryVariables.concat(getXFhirQueryVariablesRecursive(childItem));
    }
  }

  if (qItem.extension) {
    xFhirQueryVariables.push(
      ...qItem.extension.filter((extension) => isXFhirQueryVariable(extension))
    );
  }

  return xFhirQueryVariables;
}

function isRecord(obj: any): obj is Record<string, any> {
  if (!obj) {
    return false;
  }

  return Object.keys(obj).every((key) => typeof key === 'string');
}
