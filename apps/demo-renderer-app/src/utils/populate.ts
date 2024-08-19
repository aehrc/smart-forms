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
  Expression,
  Extension,
  OperationOutcome,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireResponse,
  Reference
} from 'fhir/r4';
import type {
  InputParameters,
  IssuesParameter,
  OutputParameters,
  ResponseParameter
} from '@aehrc/sdc-populate';
import { isInputParameters, isOutputParameters, populate } from '@aehrc/sdc-populate';
import type { RequestConfig } from './populateCallback';
import { fetchResourceCallback } from './populateCallback';
import { createPopulateInputParameters } from './populateInputParams';

export interface PopulateResult {
  populated: QuestionnaireResponse;
  hasWarnings: boolean;
}

export async function populateQuestionnaire(
  questionnaire: Questionnaire,
  patient: Patient,
  user: Practitioner,
  requestConfig: RequestConfig
): Promise<{
  populateSuccess: boolean;
  populateResult: PopulateResult | null;
}> {
  const fhirPathContext: Record<string, any> = {};

  // Get launch contexts, source queries and questionnaire-level variables
  const launchContexts = getLaunchContexts(questionnaire);
  const sourceQueries = getSourceQueries(questionnaire);
  const questionnaireLevelVariables = getQuestionnaireLevelXFhirQueryVariables(questionnaire);

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
    user,
    launchContexts,
    sourceQueries,
    questionnaireLevelVariables,
    fhirPathContext
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
  const outputParameters = await requestPopulate(inputParameters, requestConfig);

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

  if (issuesParameter) {
    for (const issue of issuesParameter.resource.issue) {
      if (issue.details?.text) {
        console.warn(issue.details.text);
      }
    }
    return {
      populateSuccess: true,
      populateResult: {
        populated: responseParameter.resource,
        hasWarnings: true
      }
    };
  }

  return {
    populateSuccess: true,
    populateResult: {
      populated: responseParameter.resource,
      hasWarnings: false
    }
  };
}

export async function requestPopulate(
  inputParameters: InputParameters,
  requestConfig: RequestConfig
): Promise<OutputParameters | OperationOutcome> {
  const populatePromise = populate(inputParameters, fetchResourceCallback, requestConfig);

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

export function isLaunchContext(extension: Extension): extension is LaunchContext {
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

export function getLaunchContexts(questionnaire: Questionnaire): LaunchContext[] {
  if (questionnaire.extension && questionnaire.extension.length > 0) {
    return questionnaire.extension.filter((extension) =>
      isLaunchContext(extension)
    ) as LaunchContext[];
  }

  return [];
}

export function isSourceQuery(extension: Extension): extension is SourceQuery {
  return (
    extension.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-sourceQueries' &&
    !!extension.valueReference
  );
}

// get source query references
export function getSourceQueries(questionnaire: Questionnaire): SourceQuery[] {
  if (questionnaire.extension && questionnaire.extension.length > 0) {
    return questionnaire.extension.filter((extension) => isSourceQuery(extension)) as SourceQuery[];
  }

  return [];
}

export function isXFhirQueryVariable(
  extension: Extension
): extension is QuestionnaireLevelXFhirQueryVariable {
  return (
    extension.url === 'http://hl7.org/fhir/StructureDefinition/variable' &&
    !!extension.valueExpression?.name &&
    extension.valueExpression?.language === 'application/x-fhir-query' &&
    !!extension.valueExpression?.expression
  );
}

/**
 * Filter x-fhir-query variables from questionnaire's extensions needed for population
 *
 * @author Sean Fong
 */
export function getQuestionnaireLevelXFhirQueryVariables(
  questionnaire: Questionnaire
): QuestionnaireLevelXFhirQueryVariable[] {
  if (questionnaire.extension && questionnaire.extension.length > 0) {
    return questionnaire.extension.filter((extension) =>
      isXFhirQueryVariable(extension)
    ) as QuestionnaireLevelXFhirQueryVariable[];
  }

  return [];
}

// interfaces
export interface LaunchContext extends Extension {
  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext';
  extension: LaunchContextExtensions;
}

type LaunchContextExtensions =
  | [LaunchContextName, LaunchContextType]
  | [LaunchContextName, LaunchContextType, LaunchContextDescription];

type LaunchContextName = LaunchContextNameId | LaunchContextNameCoding;

// for backwards compatibility with old questionnaires (though it is not conformant)
interface LaunchContextNameId extends Extension {
  url: 'name';
  valueId: string;
}

interface LaunchContextNameCoding extends Extension {
  url: 'name';
  valueCoding: LaunchContextNameCodingValueCoding;
}

interface LaunchContextNameCodingValueCoding extends Coding {
  code: 'patient' | 'encounter' | 'location' | 'user' | 'study';
}

interface LaunchContextType extends Extension {
  url: 'type';
  valueCode: string;
}

interface LaunchContextDescription extends Extension {
  url: 'description';
  valueString: string;
}

export interface SourceQuery extends Extension {
  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-sourceQueries';
  valueReference: Reference;
}

export interface QuestionnaireLevelXFhirQueryVariable extends Extension {
  url: 'http://hl7.org/fhir/StructureDefinition/variable';
  valueExpression: XFhirQueryVariableExpression;
}

interface XFhirQueryVariableExpression extends Expression {
  name: string;
  language: 'application/x-fhir-query';
  expression: string;
}
