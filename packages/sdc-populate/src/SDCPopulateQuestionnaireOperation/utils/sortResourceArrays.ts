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

import type { Condition, FhirResource, Observation } from 'fhir/r4';
import dayjs from 'dayjs';

/**
 * Sorts resource bundles within context based on specific date attributes
 *
 * @author Sean Fong
 */
export function sortResourceArrays(context: Record<string, any>): Record<string, any> {
  for (const key in context) {
    if (context[key] instanceof Array && context[key].length > 0) {
      // check if resource type is a valid FhirResource
      if (!context[key][0].resourceType) continue;

      const resources = context[key] as FhirResource[];
      if (!resources[0]) continue;

      // check if all resources in the array has the same resource type
      if (resources.every((resource) => resource.resourceType === resources?.[0]?.resourceType)) {
        switch (resources?.[0]?.resourceType) {
          case 'Observation':
            {
              const observations = resources as Observation[];
              context[key] = observations.sort((a, b) => {
                if (!a.effectiveDateTime) {
                  return -1;
                }

                if (!b.effectiveDateTime) {
                  return 1;
                }

                return dayjs(b.effectiveDateTime).diff(dayjs(a.effectiveDateTime));
              });
            }
            break;

          case 'Condition': {
            const conditions = resources as Condition[];
            context[key] = conditions.sort((a, b) => {
              if (!a.recordedDate) {
                return -1;
              }

              if (!b.recordedDate) {
                return 1;
              }

              return dayjs(b.recordedDate).diff(dayjs(a.recordedDate));
            });
          }
        }
      }
    }
  }
  return context;
}
