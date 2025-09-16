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

import type { Encounter } from 'fhir/r4';

export const encHealthCheck: Encounter = {
  resourceType: 'Encounter',
  id: 'health-check-pat-repop',
  meta: {
    versionId: '1',
    lastUpdated: '2025-01-20T04:53:53.420+00:00',
    profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-encounter']
  },
  text: {
    status: 'generated',
    div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Encounter</b><a name="health-check-pat-repop"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Encounter &quot;health-check-pat-repop&quot; Version &quot;1&quot; Updated &quot;2025-01-20 04:53:53+0000&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-au-core-encounter.html">AU Core Encounter</a></p></div><p><b>status</b>: finished</p><p><b>class</b>: ambulatory</p><p><b>type</b>: General health check-up</p><p><b>subject</b>: <a href="Patient-pat-repop.html">Patient/pat-repop: Kimberly Repop</a></p><p><b>period</b>: 2025-01-20 08:00:00+0000 --&gt; 2025-01-20 09:00:00+0000</p></div>'
  },
  status: 'finished',
  class: {
    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
    code: 'AMB',
    display: 'ambulatory'
  },
  type: [
    {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '185349003',
          display: 'General health check-up'
        }
      ],
      text: 'General health check-up'
    }
  ],
  serviceType: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '788007007',
        display: 'General practice service'
      }
    ]
  },
  subject: {
    reference: 'Patient/pat-repop',
    display: 'Kimberly Repop',
    identifier: {
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MC',
            display: "Patient's Medicare Number"
          }
        ],
        text: 'Medicare Number'
      },
      system: 'http://ns.electronichealth.net.au/id/medicare-number',
      value: '69514496771'
    }
  },
  participant: [
    {
      type: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
              code: 'PPRF',
              display: 'primary performer'
            }
          ]
        }
      ],
      period: {
        start: '2025-01-20T08:00:00+00:00',
        end: '2025-01-20T09:00:00+00:00'
      },
      individual: {
        reference: 'Practitioner/primary-peter',
        display: 'Peter Primary'
      }
    }
  ],
  period: {
    start: '2025-01-20T08:00:00+00:00',
    end: '2025-01-20T09:00:00+00:00'
  },
  reasonCode: [
    {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '410620009',
          display: 'Well child visit'
        }
      ]
    }
  ],
  location: [
    {
      location: {
        reference: 'Location/1',
        display: 'General Practice Clinic'
      }
    }
  ]
};
