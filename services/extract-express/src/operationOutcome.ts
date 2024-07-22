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

import type { OperationOutcome } from 'fhir/r4b';

export function createNoFormsServerUrlSetOutcome(): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'invalid',
        details: { text: 'FORMS_SERVER_URL environment variable must be set.' }
      }
    ]
  };
}

export function createInvalidParametersOutcome(): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'invalid',
        details: { text: 'Parameters provided is invalid against the $extract specification.' }
      }
    ]
  };
}

export function createInvalidFhirMappingLanguageMap(): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'invalid',
        details: { text: 'Input provided is not a valid FHIR Mapping Language map.' }
      }
    ]
  };
}

export function createInvalidQuestionnaireCanonicalOutcome(): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'invalid',
        details: { text: 'No questionnaire URL found in QuestionnaireResponse.questionnaire.' }
      }
    ]
  };
}

export function createNoQuestionnairesFoundOutcome(
  questionnaireCanonical: string,
  formsServerUrl: string
): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'invalid',
        details: {
          text: `No questionnaires found with the canonical url "${questionnaireCanonical}" at the FHIR server ${formsServerUrl}.`
        }
      }
    ]
  };
}

export function createNoTargetStructureMapCanonicalFoundOutcome(
  questionnaireId: string
): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'invalid',
        details: {
          text: `Questionnaire ${questionnaireId} doesn't have a "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-targetStructureMap" extension or it's valueCanonical is empty.`
        }
      }
    ]
  };
}

export function createNoTargetStructureMapFoundOutcome(
  targetStructureMapCanonical: string,
  formsServerUrl: string
): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'invalid',
        details: {
          text: `No structure maps found with the canonical url "${targetStructureMapCanonical}" at the FHIR server ${formsServerUrl}.`
        }
      }
    ]
  };
}

export function createFailStructureMapConversionOutcome(): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'invalid',
        details: {
          text: `Failed to convert the provided FHIR Mapping Language map to a StructureMap.`
        }
      }
    ]
  };
}

export function createOperationOutcome(errorMessage: string): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'error',
        code: 'invalid',
        details: {
          text: errorMessage
        }
      }
    ]
  };
}
