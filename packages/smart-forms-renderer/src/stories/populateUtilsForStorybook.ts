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
  FhirResource,
  OperationOutcome,
  Parameters,
  ParametersParameter,
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
import type { RequestConfig } from './populateCallbackForStorybook';
import { fetchResourceCallback } from './populateCallbackForStorybook';

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

async function requestPopulate(
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

function getQuestionnaireLevelXFhirQueryVariables(
  questionnaire: Questionnaire
): QuestionnaireLevelXFhirQueryVariable[] {
  if (questionnaire.extension && questionnaire.extension.length > 0) {
    return questionnaire.extension.filter((extension) =>
      isXFhirQueryVariable(extension)
    ) as QuestionnaireLevelXFhirQueryVariable[];
  }

  return [];
}

// PopulateInputParameter private functions
function createPopulateInputParameters(
  questionnaire: Questionnaire,
  patient: Patient,
  user: Practitioner,
  launchContexts: LaunchContext[],
  sourceQueries: SourceQuery[],
  questionnaireLevelVariables: QuestionnaireLevelXFhirQueryVariable[],
  fhirPathContext: Record<string, any>
): Parameters | null {
  const patientSubject = createPatientSubject(questionnaire, patient);
  if (!patientSubject) {
    return null;
  }

  const inputParameters: Parameters = {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'questionnaire',
        resource: questionnaire
      },
      {
        name: 'subject',
        valueReference: patientSubject
      }
    ]
  };

  // canonical
  if (questionnaire.url) {
    inputParameters.parameter?.push(createCanonicalParam(questionnaire.url));
  }

  // contexts
  const contexts: ParametersParameter[] = [];
  // add launch contexts
  if (launchContexts.length > 0) {
    for (const launchContext of launchContexts) {
      const launchContextParam = createLaunchContextParam(
        launchContext,
        patient,
        user,
        fhirPathContext
      );
      if (launchContextParam) {
        contexts.push(launchContextParam);
      }
    }
  }

  // add source queries
  if (sourceQueries.length > 0) {
    for (let index = 0; index < sourceQueries.length; index++) {
      const sourceQuery = sourceQueries[index];
      contexts.push(createSourceQueryParams(sourceQuery, index));
    }
  }

  // add questionnaire-level variables
  if (questionnaireLevelVariables.length > 0) {
    for (const variable of questionnaireLevelVariables) {
      contexts.push(createVariableParam(variable));
    }
  }

  if (contexts.length > 0) {
    inputParameters.parameter?.push(...contexts);
  }

  // local
  inputParameters.parameter?.push(createLocalParam());

  return inputParameters;
}

function createPatientSubject(questionnaire: Questionnaire, patient: Patient): Reference | null {
  const subjectTypes = questionnaire.subjectType;

  // If subjectTypes array is not empty AND "Patient" is not in the array, we cannot create a Patient subject reference.
  if (subjectTypes && subjectTypes.length > 0) {
    const patientSubject = subjectTypes.find((subject) => subject === 'Patient');
    if (!patientSubject) {
      return null;
    }
  }

  return {
    type: 'Patient',
    reference: 'Patient/' + patient.id
  };
}

function createCanonicalParam(canonicalUrl: string): ParametersParameter {
  return {
    name: 'canonical',
    valueString: canonicalUrl
  };
}

// setting local parameter as false as we are calling $populate with an NPM package, not a server
// package doesn't contain any fhir resources to "know" the context from
function createLocalParam(): ParametersParameter {
  return {
    name: 'local',
    valueBoolean: false
  };
}

function createLaunchContextParam(
  launchContext: LaunchContext,
  patient: Patient,
  user: Practitioner,
  fhirPathContext: Record<string, any>
): ParametersParameter | null {
  const name = launchContext.extension[0].valueId ?? launchContext.extension[0].valueCoding?.code;
  if (!name) {
    return null;
  }

  const resourceType = launchContext.extension[1].valueCode;
  let resource: FhirResource | null;
  if (name === 'patient' && resourceType === 'Patient') {
    resource = patient;
  } else if (name === 'user' && resourceType === 'Practitioner') {
    resource = user;
  } else {
    return null;
  }

  if (!resource) {
    return null;
  }

  // Update fhirPathContext with launchContext resources
  fhirPathContext[name] = resource;

  return {
    name: 'context',
    part: [
      {
        name: 'name',
        valueString: name
      },
      {
        name: 'content',
        resource: resource
      }
    ]
  };
}

function createSourceQueryParams(sourceQuery: SourceQuery, index: number): ParametersParameter {
  const reference = sourceQuery.valueReference.reference;
  if (reference && reference.startsWith('#')) {
    const containedReference = reference.slice(1);
    return {
      name: 'context',
      part: [
        {
          name: 'name',
          valueString: containedReference
        },
        {
          name: 'content',
          valueReference: sourceQuery.valueReference
        }
      ]
    };
  }

  // if sourceQuery cannot be referenced to a contained bundle, return itself as a context
  // this most likely shouldn't happen
  return {
    name: 'context',
    part: [
      {
        name: 'name',
        valueString: `sourceQuery${index}`
      },
      {
        name: 'content',
        valueReference: sourceQuery.valueReference
      }
    ]
  };
}

function createVariableParam(variable: QuestionnaireLevelXFhirQueryVariable): ParametersParameter {
  const query = variable.valueExpression.expression;
  const resourceType = query.split('?')[0];

  return {
    name: 'context',
    part: [
      {
        name: 'name',
        valueString: variable.valueExpression.name
      },
      {
        name: 'content',
        valueReference: { reference: query, type: resourceType }
      }
    ]
  };
}

// interfaces
interface LaunchContext extends Extension {
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

interface SourceQuery extends Extension {
  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-sourceQueries';
  valueReference: Reference;
}

interface QuestionnaireLevelXFhirQueryVariable extends Extension {
  url: 'http://hl7.org/fhir/StructureDefinition/variable';
  valueExpression: XFhirQueryVariableExpression;
}

interface XFhirQueryVariableExpression extends Expression {
  name: string;
  language: 'application/x-fhir-query';
  expression: string;
}
