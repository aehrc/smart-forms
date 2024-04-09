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

import type { Extension } from 'fhir/r4';
import type { LaunchContext } from '../interfaces/populate.interface';

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
