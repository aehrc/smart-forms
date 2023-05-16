/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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
  FhirResource,
  Parameters,
  ParametersParameter,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireResponse,
  Reference
} from 'fhir/r4';
import { getQuestionnaireLevelXFhirQueryVariables } from './VariablePopulateFunctions';
import { getLaunchContexts, getSourceQueries } from './PrePopQueryPopulateFunctions';
import type { LaunchContext } from './launchContext.interface.ts';
import type {
  QuestionnaireLevelXFhirQueryVariable,
  SourceQuery
} from './sourceQueries.interface.ts';
import type { IssuesParameter, ResponseParameter } from 'sdc-populate';
import populate, { isPopulateInputParameters } from 'sdc-populate';
import type { RequestConfig } from './callback.ts';
import { fetchResourceCallback } from './callback.ts';
import type Client from 'fhirclient/lib/Client';

/**
 * Pre-populate questionnaire from CMS patient data to form a populated questionnaireResponse
 *
 * @author Sean Fong
 */
export async function populateQuestionnaire(
  questionnaire: Questionnaire,
  fhirClient: Client,
  patient: Patient,
  user: Practitioner,
  encounter: Encounter | null,
  populateForm: {
    (questionnaireResponse: QuestionnaireResponse, hasWarnings: boolean): void;
  },
  exitSpinner: { (): void }
) {
  // Get launch contexts and questionnaire-level variables
  const launchContexts = getLaunchContexts(questionnaire);
  const sourceQueries = getSourceQueries(questionnaire);
  const questionnaireLevelVariables = getQuestionnaireLevelXFhirQueryVariables(questionnaire);

  if (
    launchContexts.length === 0 &&
    sourceQueries.length === 0 &&
    questionnaireLevelVariables.length === 0
  ) {
    exitSpinner();
    return;
  }

  // Define population input parameters from PrePopQuery and x-fhir-query variables
  const inputParameters = createPopulationInputParameters(
    questionnaire,
    patient,
    user,
    encounter,
    launchContexts,
    sourceQueries,
    questionnaireLevelVariables
  );

  if (!inputParameters) {
    exitSpinner();
    return;
  }

  // Perform population if parameters satisfies input parameters
  if (isPopulateInputParameters(inputParameters)) {
    const requestConfig: RequestConfig = {
      clientEndpoint: fhirClient.state.serverUrl,
      authToken: fhirClient.state.tokenResponse!.access_token!
    };

    const outputParameters = await populate(inputParameters, fetchResourceCallback, requestConfig);
    if (outputParameters.resourceType === 'OperationOutcome') {
      exitSpinner();
    } else {
      const responseParameter = outputParameters.parameter.find(
        (param) => param.name === 'response'
      ) as ResponseParameter;
      const issuesParameter = outputParameters.parameter.find(
        (param) => param.name === 'issues'
      ) as IssuesParameter | undefined;

      if (issuesParameter) {
        for (const issue of issuesParameter.resource.issue) {
          if (issue.details?.text) {
            console.warn(issue.details.text);
          }
        }
        populateForm(responseParameter.resource, true);
      } else {
        populateForm(responseParameter.resource, false);
      }
    }
  } else {
    exitSpinner();
  }
}

// If none are specified, then the subject is unlimited.
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
  encounter: Encounter | null
): ParametersParameter | null {
  const name = launchContext.extension[0].valueId ?? launchContext.extension[0].valueCoding?.code;
  if (!name) {
    return null;
  }

  // let resource :string
  const resourceType = launchContext.extension[1].valueCode;
  let resource: FhirResource | null;
  switch (resourceType) {
    case 'Patient':
      resource = patient;
      break;
    case 'Practitioner':
      resource = user;
      break;
    case 'Encounter':
      resource = encounter;
      break;
    default:
      return null;
  }

  if (!resource) {
    return null;
  }

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

/**
 * Define population input parameters without any batch response contexts
 *
 * @author Sean Fong
 */
function createPopulationInputParameters(
  questionnaire: Questionnaire,
  patient: Patient,
  user: Practitioner,
  encounter: Encounter | null,
  launchContexts: LaunchContext[],
  sourceQueries: SourceQuery[],
  questionnaireLevelVariables: QuestionnaireLevelXFhirQueryVariable[]
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
      const launchContextParam = createLaunchContextParam(launchContext, patient, user, encounter);
      if (launchContextParam) {
        contexts.push(launchContextParam);
      }
    }
  }

  // add source queries
  if (sourceQueries.length > 0) {
    for (const [index, sourceQuery] of sourceQueries.entries()) {
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
