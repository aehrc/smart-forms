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

import type { Practitioner } from 'fhir/r4';

export const pracPrimaryPeter: Practitioner = {
  resourceType: 'Practitioner',
  id: 'primary-peter',
  meta: {
    versionId: '1',
    lastUpdated: '2024-05-14T04:18:27.156+00:00',
    source: '#7awrHf9svvQ9oRrA',
    profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-practitioner']
  },
  text: {
    status: 'generated',
    div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Practitioner</b><a name="primary-peter"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Practitioner &quot;primary-peter&quot; Version &quot;2&quot; Updated &quot;2022-04-21 20:04:20+0000&quot; </p><p style="margin-bottom: 0px">Information Source: #PFl2LJ5HsUkESlP1!</p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-au-core-practitioner.html">AU Core Practitioner</a></p></div><p><b>identifier</b>: <code>http://www.acme.org/practitioners</code>/25456</p><p><b>name</b>: Peter Primary </p><p><b>address</b>: 310 Hay St East Perth WA 6004 (WORK)</p></div>'
  },
  identifier: [
    {
      system: 'http://www.acme.org/practitioners',
      value: '25456'
    }
  ],
  name: [
    {
      family: 'Primary',
      given: ['Peter'],
      prefix: ['Dr']
    }
  ],
  address: [
    {
      use: 'work',
      line: ['310 Hay St'],
      city: 'East Perth',
      state: 'WA',
      postalCode: '6004'
    }
  ]
};
