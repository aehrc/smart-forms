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

export const bundleObsBodyHeight: Bundle = {
  resourceType: 'Bundle',
  id: '2748fc32-fbad-4272-a9df-6183a0cf1f14',
  meta: {
    lastUpdated: '2025-08-07T05:38:43.876+00:00'
  },
  type: 'searchset',
  total: 1,
  link: [
    {
      relation: 'self',
      url: 'http://proxy.smartforms.io/fhir/Observation?_count=1&_sort=-date&code=8302-2&patient=pat-repop'
    }
  ],
  entry: [
    {
      fullUrl: 'http://proxy.smartforms.io/fhir/Observation/bodyheight-pat-repop',
      resource: {
        resourceType: 'Observation',
        id: 'bodyheight-pat-repop',
        meta: {
          versionId: '1',
          lastUpdated: '2025-07-30T04:53:53.420+00:00',
          profile: [
            'http://hl7.org.au/fhir/core/StructureDefinition/au-core-bodyheight',
            'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation'
          ]
        },
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="bodyheight-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;bodyheight-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-bodyheight.html">AU Core Body Height</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Vital Signs <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#vital-signs)</span></p><p><b>code</b>: height <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#8302-2 &quot;Body height&quot;; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#50373000)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>encounter</b>: <a href="Encounter-annualvisit-2.html">Encounter/annualvisit-2</a></p><p><b>effective</b>: 2022-02-10</p><p><b>performer</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>value</b>: 163 cm<span style="background: LightGoldenRodYellow"> (Details: UCUM code cm = \'cm\')</span></p></div>'
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
              code: '8302-2',
              display: 'Body height'
            },
            {
              system: 'http://snomed.info/sct',
              code: '50373000'
            }
          ],
          text: 'height'
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
          value: 163,
          unit: 'cm',
          system: 'http://unitsofmeasure.org',
          code: 'cm'
        }
      },
      search: {
        mode: 'match'
      }
    }
  ]
};
