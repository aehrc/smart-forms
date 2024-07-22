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

// PopulateInputParameter private functions
import type {
  Encounter,
  FhirResource,
  Parameters,
  ParametersParameter,
  Patient,
  Practitioner,
  Questionnaire,
  Reference
} from 'fhir/r4';
import type {
  LaunchContext,
  QuestionnaireLevelXFhirQueryVariable,
  SourceQuery
} from '../interfaces/inAppPopulation.interface';

export function createPopulateInputParameters(
  questionnaire: Questionnaire,
  patient: Patient,
  user: Practitioner | null,
  encounter: Encounter | null,
  launchContexts: LaunchContext[],
  sourceQueries: SourceQuery[],
  questionnaireLevelVariables: QuestionnaireLevelXFhirQueryVariable[],
  context: Record<string, any>
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
        encounter,
        context
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
  user: Practitioner | null,
  encounter: Encounter | null,
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
  } else if (name === 'user' && resourceType === 'Practitioner' && user) {
    resource = user;
  } else if (name === 'encounter' && resourceType === 'Encounter' && encounter) {
    resource = encounter;
  } else {
    return null;
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
