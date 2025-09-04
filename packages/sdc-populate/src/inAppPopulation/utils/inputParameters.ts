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
  Extension,
  FhirResource,
  Parameters,
  ParametersParameter,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireItem,
  Reference
} from 'fhir/r4';
import type {
  LaunchContext,
  QuestionnaireLevelXFhirQueryVariable,
  SourceQuery
} from '../interfaces/inAppPopulation.interface';
import { getDisplayName } from '../../SDCPopulateQuestionnaireOperation/utils/humanName';
import type { FhirContext } from '../interfaces/fhirContext.interface';
import { resolveFhirContextReferences } from './resolveFhirContexts';
import type {
  FetchResourceCallback,
  FetchResourceRequestConfig
} from '../../SDCPopulateQuestionnaireOperation';

/**
 * Prepares input parameters and FHIRPath context for questionnaire population or evaluation.
 *
 * This function collects launch context variables, source queries, and x-fhir-query variables from the questionnaire,
 * and constructs a `Parameters` resource that can be used for FHIRPath evaluation or population.
 */
export async function initialiseInputParameters(
  questionnaire: Questionnaire,
  patient: Patient,
  user: Practitioner | null,
  encounter: Encounter | null,
  fhirContext: FhirContext[] | null,
  fetchResourceCallback: FetchResourceCallback,
  fetchResourceRequestConfig: FetchResourceRequestConfig,
  timeoutMs: number
): Promise<{
  inputParameters: Parameters | null;
  fhirPathContext: Record<string, any>;
}> {
  // FHIRPath Context map that will be used to evaluate FHIRPath expressions, this is different from the fhirContext in the params.
  const fhirPathContext: Record<string, any> = {};

  // Get launch contexts, source queries and questionnaire-level variables
  const launchContexts = getLaunchContexts(questionnaire);
  const sourceQueries = getSourceQueries(questionnaire);
  const questionnaireLevelVariables = getXFhirQueryVariables(questionnaire);

  if (
    launchContexts.length === 0 &&
    sourceQueries.length === 0 &&
    questionnaireLevelVariables.length === 0
  ) {
    return { inputParameters: null, fhirPathContext: fhirPathContext };
  }

  // Define population input parameters from launch contexts, source queries and questionnaire-level variables
  const inputParameters = await constructPopulateInputParameters(
    questionnaire,
    patient,
    user,
    encounter,
    fhirContext,
    launchContexts,
    sourceQueries,
    questionnaireLevelVariables,
    fhirPathContext,
    fetchResourceCallback,
    fetchResourceRequestConfig,
    timeoutMs
  );

  return { inputParameters, fhirPathContext };
}

function isLaunchContext(extension: Extension): extension is LaunchContext {
  const hasLaunchContextName =
    extension.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext' &&
    !!extension.extension?.find(
      (ext) => ext.url === 'name' && (ext.valueId || (ext.valueCoding && ext.valueCoding.code))
    );

  const hasLaunchContextType = !!extension.extension?.find(
    (ext) => ext.url === 'type' && ext.valueCode
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

export async function constructPopulateInputParameters(
  questionnaire: Questionnaire,
  patient: Patient,
  user: Practitioner | null,
  encounter: Encounter | null,
  fhirContext: FhirContext[] | null,
  launchContexts: LaunchContext[],
  sourceQueries: SourceQuery[],
  questionnaireLevelVariables: QuestionnaireLevelXFhirQueryVariable[],
  fhirPathContext: Record<string, any>,
  fetchResourceCallback: FetchResourceCallback,
  fetchResourceRequestConfig: FetchResourceRequestConfig,
  timeoutMs: number
): Promise<Parameters | null> {
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

  // resolve fhirContexts references if provided
  const resolvedFhirContextReferences = await resolveFhirContextReferences(
    fhirContext,
    fetchResourceCallback,
    fetchResourceRequestConfig,
    timeoutMs
  );

  // add launch contexts
  if (launchContexts.length > 0) {
    for (const launchContext of launchContexts) {
      const launchContextParam = createLaunchContextParam(
        launchContext,
        patient,
        user,
        encounter,
        resolvedFhirContextReferences,
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

      if (sourceQuery) {
        contexts.push(createSourceQueryParams(sourceQuery, index));
      }
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

/**
 * Creates a Reference object for the patient subject if the Questionnaire allows Patient as subject.
 * Returns null if Patient is not a valid subject type for the Questionnaire.
 */
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
    reference: 'Patient/' + patient.id,
    display: getDisplayName(patient.name)
  };
}

/**
 * Creates a ParametersParameter for the canonical URL of the Questionnaire.
 * Used to identify the Questionnaire resource in $populate input.
 */
function createCanonicalParam(canonicalUrl: string): ParametersParameter {
  return {
    name: 'canonical',
    valueString: canonicalUrl
  };
}

/**
 * Creates a ParametersParameter for the local context, always set to false for in-app population.
// Setting local parameter as false as we are calling $populate with an NPM package, not a server
// Package doesn't contain any fhir resources to "know" the context from
 */
function createLocalParam(): ParametersParameter {
  return {
    name: 'local',
    valueBoolean: false
  };
}

/**
 * Creates a ParametersParameter for a launch context resource (patient, user, encounter, etc).
 * Adds the resource to the FHIRPath context for use in population expressions.
 */
function createLaunchContextParam(
  launchContext: LaunchContext,
  patient: Patient,
  user: Practitioner | null,
  encounter: Encounter | null,
  resolvedFhirContextReferences: Record<string, FhirResource>,
  fhirPathContext: Record<string, any>
): ParametersParameter | null {
  const name = launchContext.extension[0].valueId ?? launchContext.extension[0].valueCoding?.code;
  if (!name) {
    return null;
  }

  const resourceType = launchContext.extension[1].valueCode;
  let resource: FhirResource | null = null;

  if (name === 'patient' && resourceType === 'Patient') {
    resource = patient;
  } else if (name === 'user' && resourceType === 'Practitioner' && user) {
    resource = user;
  } else if (name === 'encounter' && resourceType === 'Encounter' && encounter) {
    resource = encounter;
  } else {
    // Check resolved resources from FHIR context references
    // This assumes that there is one resource per resourceType in fhirContext
    const resolvedResource = resolvedFhirContextReferences[resourceType];
    if (resolvedResource) {
      resource = resolvedResource;
    }
  }

  if (!resource) {
    return null;
  }

  // Update context with launchContext resources
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

/**
 * Creates a ParametersParameter for a source query, referencing a contained resource or itself.
 * Used to provide additional context for population from source queries.
 */
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

/**
 * Creates a ParametersParameter for a questionnaire-level variable, referencing its FHIR query.
 * Used to provide context for population from variables defined in the Questionnaire.
 */
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
