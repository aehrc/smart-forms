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

import type { Patient } from 'fhir/r4';

export const patRepop: Patient = {
  resourceType: 'Patient',
  id: 'pat-repop',
  meta: {
    versionId: '1',
    lastUpdated: '2025-07-30T04:53:53.420+00:00',
    profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-patient']
  },
  text: {
    status: 'generated',
    div: '<div xmlns="http://www.w3.org/1999/xhtml"><p style="border: 1px #661aff solid; background-color: #e6e6ff; padding: 10px;"><b>Kimberly Repop</b> female, DoB: 1968-10-11 ( Medicare Number/69514496771 (period: (?) --&gt; 2024-08))</p><hr/><table class="grid"><tr><td style="background-color: #f3f5da" title="Other Ids (see the one above)">Other Id:</td><td colspan="3">IHI/8003608833357361</td></tr><tr><td style="background-color: #f3f5da" title="Alternate names (see the one above)">Alt. Name:</td><td colspan="3">Kimberly Repop(OFFICIAL)</td></tr><tr><td style="background-color: #f3f5da" title="Ways to contact the Patient">Contact Details:</td><td colspan="3"><ul><li>ph: 0491 572 665(MOBILE)</li><li>ph: 0123456879(HOME)</li><li>4 Brisbane Street Brisbane QLD 4112 AU (HOME)</li><li>PO Box Number Brisbane QLD 4112 AU (TEMP)</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="Languages spoken">Language:</td><td colspan="3"><span title="Codes: {urn:ietf:bcp:47 yub}">Yugambal</span></td></tr><tr><td style="background-color: #f3f5da" title="Nominated Contact: Emergency Contact">Emergency Contact:</td><td colspan="3"><ul><li>Ms Phone A Friend</li><li>0987654321</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="The pronouns to use when referring to an individual in verbal or written communication.">Individual Pronouns:</td><td colspan="3"><ul><li>value: <span title="Codes: {http://loinc.org LA29520-6}">they/them/their/theirs/themselves</span></li><li>period: 2018-02 --&gt; 2022-06</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="The pronouns to use when referring to an individual in verbal or written communication.">Individual Pronouns:</td><td colspan="3"><ul><li>value: <span title="Codes: {http://loinc.org LA29519-8}">she/her/her/hers/herself</span></li><li>period: 2022-06 --&gt; (ongoing)</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="Recorded sex or gender (RSG) information includes the various sex and gender concepts that are often used in existing systems but are known NOT to represent a gender identity, sex parameter for clinical use, or attributes related to sexuality, such as sexual orientation, sexual activity, or sexual attraction. Examples of recorded sex or gender concepts include administrative gender, administrative sex, and sex assigned at birth.  When exchanging this concept, refer to the guidance in the [Gender Harmony Implementation Guide](http://hl7.org/xprod/ig/uv/gender-harmony/).\n\nThis extension is published in this guide to meet the short-term needs of implementers. This extension may be deprecated in a future version of this guide when there are alternative approaches available (e.g. R6 Patient resource, clinical reasoning, etc.).">Recorded sex or gender:</td><td colspan="3"><ul><li>value: <span title="Codes: {http://hl7.org/fhir/administrative-gender female}">female</span></li><li>type: <span title="Codes: {http://loinc.org 76689-9}">Sex assigned at birth</span></li></ul></td></tr></table></div>'
  },
  extension: [
    {
      url: 'http://hl7.org.au/fhir/StructureDefinition/closing-the-gap-registration',
      valueBoolean: true
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/individual-pronouns',
      extension: [
        {
          url: 'value',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://loinc.org',
                code: 'LA29520-6',
                display: 'they/them/their/theirs/themselves'
              }
            ]
          }
        },
        {
          url: 'period',
          valuePeriod: {
            start: '2018-02',
            end: '2022-06'
          }
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/individual-pronouns',
      extension: [
        {
          url: 'value',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://loinc.org',
                code: 'LA29519-8',
                display: 'she/her/her/hers/herself'
              }
            ]
          }
        },
        {
          url: 'period',
          valuePeriod: {
            start: '2022-06'
          }
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/individual-recordedSexOrGender',
      extension: [
        {
          url: 'value',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/administrative-gender',
                code: 'female'
              }
            ]
          }
        },
        {
          url: 'type',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '76689-9',
                display: 'Sex assigned at birth'
              }
            ]
          }
        }
      ]
    }
  ],
  identifier: [
    {
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
      value: '69514496771',
      period: {
        end: '2024-08'
      }
    },
    {
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'NI',
            display: 'National unique individual identifier'
          }
        ],
        text: 'IHI'
      },
      system: 'http://ns.electronichealth.net.au/id/hi/ihi/1.0',
      value: '8003608833357361'
    }
  ],
  name: [
    {
      use: 'usual',
      text: 'Kimberly Repop',
      family: 'Repop',
      given: ['Kimberly']
    }
  ],
  telecom: [
    {
      system: 'phone',
      value: '0491 572 665',
      use: 'mobile'
    },
    {
      system: 'phone',
      value: '0123456879',
      use: 'home'
    }
  ],
  gender: 'female',
  birthDate: '1968-10-11',
  address: [
    {
      use: 'home',
      line: ['4 Brisbane Street'],
      city: 'Brisbane',
      state: 'QLD',
      postalCode: '4112',
      country: 'AU'
    },
    {
      use: 'temp',
      line: ['PO Box Number'],
      city: 'Brisbane',
      state: 'QLD',
      postalCode: '4112',
      country: 'AU'
    }
  ],
  contact: [
    {
      relationship: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
              code: 'C',
              display: 'Emergency Contact'
            }
          ]
        }
      ],
      name: {
        text: 'Ms Phone A Friend'
      },
      telecom: [
        {
          system: 'phone',
          value: '0987654321'
        }
      ]
    }
  ],
  communication: [
    {
      language: {
        coding: [
          {
            system: 'urn:ietf:bcp:47',
            code: 'yub',
            display: 'Yugambal'
          }
        ],
        text: 'Yugambal'
      }
    }
  ]
};
