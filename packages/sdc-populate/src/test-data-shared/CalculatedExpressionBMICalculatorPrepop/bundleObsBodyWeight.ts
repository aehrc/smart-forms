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

import type { Bundle } from 'fhir/r4';

export const bundleObsBodyWeight: Bundle = {
  resourceType: 'Bundle',
  id: 'af3ac19e-b5f0-49e6-aad5-425f8414fa6c',
  meta: {
    lastUpdated: '2025-08-07T05:38:43.876+00:00'
  },
  type: 'searchset',
  total: 1,
  link: [
    {
      relation: 'self',
      url: 'http://proxy.smartforms.io/fhir/Observation?_count=1&_sort=-date&code=29463-7&patient=pat-repop'
    }
  ],
  entry: [
    {
      fullUrl: 'http://proxy.smartforms.io/fhir/Observation/bodyweight-pat-repop',
      resource: {
        resourceType: 'Observation',
        id: 'bodyweight-pat-repop',
        meta: {
          versionId: '2',
          lastUpdated: '2025-08-01T09:29:33.626+00:00',
          profile: [
            'http://hl7.org.au/fhir/core/StructureDefinition/au-core-bodyweight',
            'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation'
          ]
        },
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="bodyweight-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;bodyweight-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-bodyweight.html">AU Core Body Weight</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Vital Signs <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#vital-signs)</span></p><p><b>code</b>: weight <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#29463-7 &quot;Body weight&quot;; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#27113001)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>encounter</b>: <a href="Encounter-annualvisit-2.html">Encounter/annualvisit-2</a></p><p><b>effective</b>: 2022-02-10</p><p><b>performer</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>value</b>: 77.3 kg<span style="background: LightGoldenRodYellow"> (Details: UCUM code kg = \'kg\')</span></p></div>'
        },
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs'
              }
            ],
            text: 'Vital Signs'
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '29463-7',
              display: 'Body weight'
            },
            {
              system: 'http://snomed.info/sct',
              code: '27113001'
            }
          ],
          text: 'weight'
        },
        subject: {
          reference: 'Patient/pat-repop'
        },
        encounter: {
          reference: 'Encounter/annualvisit-2'
        },
        effectiveDateTime: '2022-02-10',
        performer: [
          {
            reference: 'PractitionerRole/bobrester-bob-gp'
          }
        ],
        valueQuantity: {
          value: 79.3,
          unit: 'kg',
          system: 'http://unitsofmeasure.org',
          code: 'kg'
        }
      },
      search: {
        mode: 'match'
      }
    }
  ]
};
