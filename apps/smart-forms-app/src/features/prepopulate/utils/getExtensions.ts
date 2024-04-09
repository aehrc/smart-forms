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

import type { Extension, Questionnaire, QuestionnaireItem } from 'fhir/r4';
import type {
  LaunchContext,
  QuestionnaireLevelXFhirQueryVariable,
  SourceQuery
} from '../types/populate.interface.ts';

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
export function getXFhirQueryVariables(
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
