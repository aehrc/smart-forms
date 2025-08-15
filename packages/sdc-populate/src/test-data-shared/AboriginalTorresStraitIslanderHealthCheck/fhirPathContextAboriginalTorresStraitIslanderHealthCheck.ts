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

import { pracPrimaryPeter } from '../pracPrimaryPeter';
import { patRepop } from '../patRepop';

export const FhirPathContextAboriginalTorresStraitIslanderHealthCheck: Record<string, any> = {
  resource: {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress'
  },
  rootResource: {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress'
  },
  patient: patRepop,
  user: pracPrimaryPeter,
  Condition: {
    resourceType: 'Bundle',
    id: 'cac8fefa-53f8-4c28-8d58-425976baec47',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.290+00:00'
    },
    type: 'searchset',
    total: 7,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Condition?category=http%3A%2F%2Fterminology.hl7.org%2FCodeSystem%2Fcondition-category%7Cproblem-list-item&patient=pat-repop'
      }
    ],
    entry: [
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Condition/ckd-pat-repop',
        resource: {
          resourceType: 'Condition',
          id: 'ckd-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
          },
          text: {
            status: 'extensions',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Condition</b><a name="ckd-pat-repop"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Condition &quot;ckd-pat-repop&quot; Version &quot;5&quot; Updated &quot;2022-06-17 23:22:56+0000&quot; </p><p style="margin-bottom: 0px">Information Source: #5R98DWXS6a48AGkD!</p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-au-core-condition.html">AU Core Condition</a></p></div><p><b>pertains to goal</b>: <a href="Goal-hpt-wnl.html">Goal/hpt-wnl</a></p><p><b>clinicalStatus</b>: Active <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-clinical.html">Condition Clinical Status Codes</a>#active)</span></p><p><b>verificationStatus</b>: Confirmed <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-ver-status.html">ConditionVerificationStatus</a>#confirmed)</span></p><p><b>category</b>: Problem <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-category.html">Condition Category Codes</a>#problem-list-item &quot;Problem List Item&quot;)</span></p><p><b>severity</b>: Severe <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#24484000)</span></p><p><b>code</b>: Chronic kidney disease stage 3B (disorder) <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#700379002)</span></p><p><b>subject</b>: <a href="Patient-pat-repop.html">Patient/pat-repop</a> &quot; FORM&quot;</p><p><b>onset</b>: 52 years<span style="background: LightGoldenRodYellow"> (Details: UCUM code a = \'a\')</span></p><p><b>recordedDate</b>: 2018-12-01</p><h3>Evidences</h3><table class="grid"><tr><td style="display: none">-</td><td><b>Detail</b></td></tr><tr><td style="display: none">*</td><td><a href="FamilyMemberHistory-father.html">FamilyMemberHistory/father: Father had Chronic Kidney disease</a>, <a href="Procedure-dialysis.html">Procedure/dialysis: Patient receives regular dialysis</a>, <a href="Observation-bun-mcc.html">Observation/bun-mcc: BUN is 24 mg/dL</a></td></tr></table></div>'
          },
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/resource-pertainsToGoal',
              valueReference: {
                reference: 'Goal/hpt-wnl'
              }
            }
          ],
          clinicalStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'inactive',
                display: 'Inactive'
              }
            ]
          },
          verificationStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                code: 'confirmed'
              }
            ]
          },
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                  code: 'problem-list-item',
                  display: 'Problem List Item'
                }
              ],
              text: 'Problem'
            }
          ],
          severity: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '24484000',
                display: 'Severe'
              }
            ]
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '700379002',
                display: 'Chronic kidney disease stage 3B (disorder)'
              }
            ]
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          onsetAge: {
            value: 52,
            unit: 'years',
            system: 'http://unitsofmeasure.org',
            code: 'a'
          },
          recordedDate: '2018-12-01',
          evidence: [
            {
              detail: [
                {
                  reference: 'FamilyMemberHistory/father',
                  display: 'Father had Chronic Kidney disease'
                },
                {
                  reference: 'Procedure/dialysis',
                  display: 'Patient receives regular dialysis'
                },
                {
                  reference: 'Observation/bun-mcc',
                  display: 'BUN is 24 mg/dL'
                }
              ]
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Condition/coronary-syndrome-pat-repop',
        resource: {
          resourceType: 'Condition',
          id: 'coronary-syndrome-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
          },
          text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Condition</b><a name="coronary-syndrome-pat-repop"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Condition &quot;coronary-syndrome-pat-repop&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-au-core-condition.html">AU Core Condition</a></p></div><p><b>clinicalStatus</b>: Active <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-clinical.html">Condition Clinical Status Codes</a>#active)</span></p><p><b>verificationStatus</b>: Confirmed <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-ver-status.html">ConditionVerificationStatus</a>#confirmed)</span></p><p><b>category</b>: Problem <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#55607006; <a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-category.html">Condition Category Codes</a>#problem-list-item)</span></p><p><b>code</b>: Acute coronary syndrome <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#394659003)</span></p><p><b>subject</b>: <a href="Patient-pat-repop.html">Patient/pat-repop</a> &quot; FORM&quot;</p><p><b>onset</b>: 2015-02-12 12:00:00+0000</p><p><b>recordedDate</b>: 2015-02-12</p><p><b>recorder</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>asserter</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p></div>'
          },
          clinicalStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'inactive',
                display: 'Inactive'
              }
            ]
          },
          verificationStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                code: 'confirmed',
                display: 'Confirmed'
              }
            ]
          },
          category: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '55607006',
                  display: 'Problem'
                },
                {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                  code: 'problem-list-item'
                }
              ]
            }
          ],
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '394659003',
                display: 'Acute coronary syndrome'
              }
            ]
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          onsetDateTime: '2015-02-12T12:00:00+00:00',
          recordedDate: '2015-02-12',
          recorder: {
            reference: 'PractitionerRole/bobrester-bob-gp'
          },
          asserter: {
            reference: 'PractitionerRole/bobrester-bob-gp'
          }
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Condition/uti-pat-repop',
        resource: {
          resourceType: 'Condition',
          id: 'uti-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
          },
          text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Condition</b><a name="uti-pat-repop"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Condition &quot;uti-pat-repop&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-au-core-condition.html">AU Core Condition</a></p></div><p><b>clinicalStatus</b>: Active <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-clinical.html">Condition Clinical Status Codes</a>#active)</span></p><p><b>verificationStatus</b>: Confirmed <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-ver-status.html">ConditionVerificationStatus</a>#confirmed)</span></p><p><b>category</b>: Problem List Item <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-category.html">Condition Category Codes</a>#problem-list-item)</span></p><p><b>code</b>: Urinary tract infection <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#68566005)</span></p><p><b>subject</b>: <a href="Patient-pat-repop.html">Patient/pat-repop</a> &quot; FORM&quot;</p><p><b>onset</b>: 2020-05-10</p><p><b>recorder</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>asserter</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p></div>'
          },
          clinicalStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'inactive',
                display: 'Inactive'
              }
            ]
          },
          verificationStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                code: 'confirmed',
                display: 'Confirmed'
              }
            ]
          },
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                  code: 'problem-list-item',
                  display: 'Problem List Item'
                }
              ]
            }
          ],
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '68566005',
                display: 'Urinary tract infection'
              }
            ]
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          onsetDateTime: '2020-05-10',
          abatementDateTime: '2025-06-04',
          recorder: {
            reference: 'PractitionerRole/bobrester-bob-gp'
          },
          asserter: {
            reference: 'PractitionerRole/bobrester-bob-gp'
          }
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Condition/diabetes-pat-repop',
        resource: {
          resourceType: 'Condition',
          id: 'diabetes-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
          },
          text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Condition</b><a name="diabetes-pat-repop"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Condition &quot;diabetes-pat-repop&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-au-core-condition.html">AU Core Condition</a></p></div><p><b>clinicalStatus</b>: Active <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-clinical.html">Condition Clinical Status Codes</a>#active)</span></p><p><b>verificationStatus</b>: Confirmed <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-ver-status.html">ConditionVerificationStatus</a>#confirmed)</span></p><p><b>category</b>: Problem <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#55607006; <a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-category.html">Condition Category Codes</a>#problem-list-item)</span></p><p><b>code</b>: Type 2 diabetes mellitus <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#44054006)</span></p><p><b>subject</b>: <a href="Patient-pat-repop.html">Patient/pat-repop</a> &quot; FORM&quot;</p><p><b>onset</b>: 2015-02-12 12:00:00+0000</p><p><b>recordedDate</b>: 2015-02-12</p><p><b>recorder</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>asserter</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p></div>'
          },
          clinicalStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'inactive',
                display: 'Inactive'
              }
            ]
          },
          verificationStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                code: 'confirmed',
                display: 'Confirmed'
              }
            ]
          },
          category: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '55607006',
                  display: 'Problem'
                },
                {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                  code: 'problem-list-item'
                }
              ]
            }
          ],
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '44054006',
                display: 'Type 2 diabetes mellitus'
              }
            ]
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          onsetDateTime: '2015-02-12T12:00:00+00:00',
          abatementDateTime: '2025-06-30',
          recordedDate: '2015-02-12',
          recorder: {
            reference: 'PractitionerRole/bobrester-bob-gp'
          },
          asserter: {
            reference: 'PractitionerRole/bobrester-bob-gp'
          }
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Condition/fever-pat-repop',
        resource: {
          resourceType: 'Condition',
          id: 'fever-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
          },
          text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Condition</b><a name="fever-pat-repop"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Condition &quot;fever-pat-repop&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-au-core-condition.html">AU Core Condition</a></p></div><p><b>clinicalStatus</b>: Resolved <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-clinical.html">Condition Clinical Status Codes</a>#resolved)</span></p><p><b>verificationStatus</b>: Confirmed <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-ver-status.html">ConditionVerificationStatus</a>#confirmed)</span></p><p><b>category</b>: Problem <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#55607006; <a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-category.html">Condition Category Codes</a>#problem-list-item)</span></p><p><b>severity</b>: Moderate <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#6736007)</span></p><p><b>code</b>: Fever <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#386661006)</span></p><p><b>subject</b>: <a href="Patient-pat-repop.html">Patient/pat-repop</a> &quot; FORM&quot;</p><p><b>onset</b>: 2015-02-11</p><p><b>abatement</b>: 2015-02-14</p><p><b>recordedDate</b>: 2015-02-12</p><p><b>recorder</b>: <a href="PractitionerRole-sandyson-sandy-nurse.html">PractitionerRole/sandyson-sandy-nurse</a></p><p><b>asserter</b>: <a href="PractitionerRole-sandyson-sandy-nurse.html">PractitionerRole/sandyson-sandy-nurse</a></p><h3>Evidences</h3><table class="grid"><tr><td style="display: none">-</td><td><b>Code</b></td><td><b>Detail</b></td></tr><tr><td style="display: none">*</td><td>degrees C <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#258710007)</span></td><td><a href="Observation-bodytemp-fever.html">Observation/bodytemp-fever: Temperature</a></td></tr></table></div>'
          },
          clinicalStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'resolved',
                display: 'Resolved'
              }
            ],
            text: 'Resolved'
          },
          verificationStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                code: 'confirmed',
                display: 'Confirmed'
              }
            ],
            text: 'Confirmed'
          },
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                  code: 'problem-list-item'
                }
              ]
            }
          ],
          severity: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '6736007',
                display: 'Moderate'
              }
            ]
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '63993003',
                display: 'Remittent fever'
              }
            ],
            text: 'Remittent fever'
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          onsetDateTime: '2015-02-11T00:00:00.000Z',
          abatementDateTime: '2015-02-14T00:00:00.000Z',
          recordedDate: '2015-02-12',
          recorder: {
            reference: 'Practitioner/levin-henry'
          },
          asserter: {
            reference: 'PractitionerRole/sandyson-sandy-nurse'
          },
          evidence: [
            {
              code: [
                {
                  coding: [
                    {
                      system: 'http://snomed.info/sct',
                      code: '258710007',
                      display: 'degrees C'
                    }
                  ]
                }
              ],
              detail: [
                {
                  reference: 'Observation/bodytemp-fever',
                  display: 'Temperature'
                }
              ]
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Condition/584a-pat-repop',
        resource: {
          resourceType: 'Condition',
          id: '584a-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
          },
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                  code: 'problem-list-item'
                }
              ],
              text: 'Problem'
            }
          ],
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '38341003',
                display: 'Hypertension'
              }
            ],
            text: 'Hypertension'
          },
          subject: {
            reference: 'Patient/pat-repop',
            type: 'Patient',
            display: 'Repopulate Tester'
          }
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Condition/613a-pat-repop',
        resource: {
          resourceType: 'Condition',
          id: '613a-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
          },
          clinicalStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'resolved',
                display: 'Resolved'
              }
            ],
            text: 'Resolved'
          },
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                  code: 'problem-list-item'
                }
              ],
              text: 'Problem'
            }
          ],
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '125605004',
                display: 'Fracture of bone'
              }
            ],
            text: 'Fracture of bone'
          },
          bodySite: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '720532008',
                  display: 'Left ankle joint structure'
                }
              ],
              text: 'Left ankle joint structure'
            }
          ],
          subject: {
            reference: 'Patient/pat-repop',
            type: 'Patient',
            display: 'Repopulate Tester'
          },
          note: [
            {
              text: 'long time ago'
            }
          ]
        },
        search: {
          mode: 'match'
        }
      }
    ]
  },
  ObsBloodPressure: {
    resourceType: 'Bundle',
    id: 'fd8ad06b-fa53-40f8-9f13-845a4d28d8eb',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.296+00:00'
    },
    type: 'searchset',
    total: 2,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Observation?_sort=-date&code=85354-9&patient=pat-repop'
      }
    ],
    entry: [
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Observation/bloodpressure2-pat-repop',
        resource: {
          resourceType: 'Observation',
          id: 'bloodpressure2-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: [
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-bloodpressure',
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation'
            ]
          },
          text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="bloodpressure2-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;bloodpressure2-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-bloodpressure.html">AU Core Blood Pressure</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Vital Signs <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#vital-signs)</span></p><p><b>code</b>: Blood pressure systolic and diastolic <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#85354-9 &quot;Blood pressure panel with all children optional&quot;; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#75367002)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>effective</b>: 2023-09-13</p><p><b>performer</b>: <a href="PractitionerRole-gp-primary-peter.html">PractitionerRole/gp-primary-peter</a></p><p><b>interpretation</b>: Significantly high <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-v3-ObservationInterpretation.html">ObservationInterpretation</a>#HU)</span></p><p><b>bodySite</b>: Right arm <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#368209003 &quot;Structure of right upper arm&quot;)</span></p><p><b>method</b>: Standing position <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#10904000 &quot;Orthostatic body position&quot;)</span></p><blockquote><p><b>component</b></p><p><b>code</b>: Systolic blood pressure <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#8480-6; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#271649006)</span></p><p><b>value</b>: 165 mmHg<span style="background: LightGoldenRodYellow"> (Details: UCUM code mm[Hg] = \'mm[Hg]\')</span></p><h3>ReferenceRanges</h3><table class="grid"><tr><td style="display: none">-</td><td><b>Text</b></td></tr><tr><td style="display: none">*</td><td>Less than 120 mmHg</td></tr></table></blockquote><blockquote><p><b>component</b></p><p><b>code</b>: Diastolic blood pressure <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#8462-4; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#271650006)</span></p><p><b>value</b>: 95 mmHg<span style="background: LightGoldenRodYellow"> (Details: UCUM code mm[Hg] = \'mm[Hg]\')</span></p><h3>ReferenceRanges</h3><table class="grid"><tr><td style="display: none">-</td><td><b>Text</b></td></tr><tr><td style="display: none">*</td><td>Less than 80 mmHg</td></tr></table></blockquote></div>'
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
                code: '85354-9',
                display: 'Blood pressure panel with all children optional'
              },
              {
                system: 'http://snomed.info/sct',
                code: '75367002'
              }
            ],
            text: 'Blood pressure systolic and diastolic'
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          effectiveDateTime: '2023-09-13',
          performer: [
            {
              reference: 'PractitionerRole/gp-primary-peter'
            }
          ],
          interpretation: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                  code: 'HU',
                  display: 'Significantly high'
                }
              ]
            }
          ],
          bodySite: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '368209003',
                display: 'Structure of right upper arm'
              }
            ],
            text: 'Right arm'
          },
          method: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '10904000',
                display: 'Orthostatic body position'
              }
            ],
            text: 'Standing position'
          },
          component: [
            {
              code: {
                coding: [
                  {
                    system: 'http://loinc.org',
                    code: '8480-6',
                    display: 'Systolic blood pressure'
                  },
                  {
                    system: 'http://snomed.info/sct',
                    code: '271649006'
                  }
                ],
                text: 'Systolic blood pressure'
              },
              valueQuantity: {
                value: 165,
                unit: 'mmHg',
                system: 'http://unitsofmeasure.org',
                code: 'mm[Hg]'
              },
              referenceRange: [
                {
                  text: 'Less than 120 mmHg'
                }
              ]
            },
            {
              code: {
                coding: [
                  {
                    system: 'http://loinc.org',
                    code: '8462-4',
                    display: 'Diastolic blood pressure'
                  },
                  {
                    system: 'http://snomed.info/sct',
                    code: '271650006'
                  }
                ],
                text: 'Diastolic blood pressure'
              },
              valueQuantity: {
                value: 95,
                unit: 'mmHg',
                system: 'http://unitsofmeasure.org',
                code: 'mm[Hg]'
              },
              referenceRange: [
                {
                  text: 'Less than 80 mmHg'
                }
              ]
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Observation/bloodpressure-pat-repop',
        resource: {
          resourceType: 'Observation',
          id: 'bloodpressure-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: [
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-bloodpressure',
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation'
            ]
          },
          text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="bloodpressure-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;bloodpressure-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-bloodpressure.html">AU Core Blood Pressure</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Vital Signs <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#vital-signs)</span></p><p><b>code</b>: Blood pressure systolic and diastolic <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#85354-9 &quot;Blood pressure panel with all children optional&quot;; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#75367002)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>encounter</b>: <a href="Encounter-annualvisit-2.html">Encounter/annualvisit-2</a></p><p><b>effective</b>: 2022-02-10</p><p><b>performer</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>interpretation</b>: Significantly high <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-v3-ObservationInterpretation.html">ObservationInterpretation</a>#HU)</span></p><p><b>bodySite</b>: Right arm <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#368209003 &quot;Structure of right upper arm&quot;)</span></p><p><b>method</b>: Standing position <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#10904000 &quot;Orthostatic body position&quot;)</span></p><blockquote><p><b>component</b></p><p><b>code</b>: Systolic blood pressure <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#8480-6; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#271649006)</span></p><p><b>value</b>: 170 mmHg<span style="background: LightGoldenRodYellow"> (Details: UCUM code mm[Hg] = \'mm[Hg]\')</span></p><h3>ReferenceRanges</h3><table class="grid"><tr><td style="display: none">-</td><td><b>Text</b></td></tr><tr><td style="display: none">*</td><td>Less than 120 mmHg</td></tr></table></blockquote><blockquote><p><b>component</b></p><p><b>code</b>: Diastolic blood pressure <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#8462-4; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#271650006)</span></p><p><b>value</b>: 100 mmHg<span style="background: LightGoldenRodYellow"> (Details: UCUM code mm[Hg] = \'mm[Hg]\')</span></p><h3>ReferenceRanges</h3><table class="grid"><tr><td style="display: none">-</td><td><b>Text</b></td></tr><tr><td style="display: none">*</td><td>Less than 80 mmHg</td></tr></table></blockquote></div>'
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
                code: '85354-9',
                display: 'Blood pressure panel with all children optional'
              },
              {
                system: 'http://snomed.info/sct',
                code: '75367002'
              }
            ],
            text: 'Blood pressure systolic and diastolic'
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
          interpretation: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                  code: 'HU',
                  display: 'Significantly high'
                }
              ]
            }
          ],
          bodySite: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '368209003',
                display: 'Structure of right upper arm'
              }
            ],
            text: 'Right arm'
          },
          method: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '10904000',
                display: 'Orthostatic body position'
              }
            ],
            text: 'Standing position'
          },
          component: [
            {
              code: {
                coding: [
                  {
                    system: 'http://loinc.org',
                    code: '8480-6',
                    display: 'Systolic blood pressure'
                  },
                  {
                    system: 'http://snomed.info/sct',
                    code: '271649006'
                  }
                ],
                text: 'Systolic blood pressure'
              },
              valueQuantity: {
                value: 170,
                unit: 'mmHg',
                system: 'http://unitsofmeasure.org',
                code: 'mm[Hg]'
              },
              referenceRange: [
                {
                  text: 'Less than 120 mmHg'
                }
              ]
            },
            {
              code: {
                coding: [
                  {
                    system: 'http://loinc.org',
                    code: '8462-4',
                    display: 'Diastolic blood pressure'
                  },
                  {
                    system: 'http://snomed.info/sct',
                    code: '271650006'
                  }
                ],
                text: 'Diastolic blood pressure'
              },
              valueQuantity: {
                value: 100,
                unit: 'mmHg',
                system: 'http://unitsofmeasure.org',
                code: 'mm[Hg]'
              },
              referenceRange: [
                {
                  text: 'Less than 80 mmHg'
                }
              ]
            }
          ]
        },
        search: {
          mode: 'match'
        }
      }
    ]
  },
  ObsTobaccoSmokingStatus: {
    resourceType: 'Bundle',
    id: '00aebda4-e514-41a3-9919-66d92e4fb81c',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.296+00:00'
    },
    type: 'searchset',
    total: 1,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Observation?_sort=-date&code=72166-2&patient=pat-repop'
      }
    ],
    entry: [
      {
        fullUrl:
          'http://proxy.smartforms.io/fhir/Observation/smokingstatus-current-smoker-pat-repop',
        resource: {
          resourceType: 'Observation',
          id: 'smokingstatus-current-smoker-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: [
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation',
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-smokingstatus'
            ]
          },
          text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="smokingstatus-current-smoker-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;smokingstatus-current-smoker-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-smokingstatus.html">AU Core Smoking Status</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Social History <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#social-history)</span></p><p><b>code</b>: Smoking status <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#266918002; <a href="https://loinc.org/">LOINC</a>#72166-2)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>encounter</b>: <span>: GP Visit</span></p><p><b>effective</b>: 2016-07-02</p><p><b>performer</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>value</b>: Smoker <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#77176002 &quot;Current smoker&quot;; <a href="https://loinc.org/">LOINC</a>#LA18979-7)</span></p></div>'
          },
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'social-history',
                  display: 'Social History'
                }
              ],
              text: 'Social History'
            }
          ],
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '1747861000168109'
              },
              {
                system: 'http://loinc.org',
                code: '72166-2'
              }
            ],
            text: 'Smoking status'
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          encounter: {
            display: 'GP Visit'
          },
          effectiveDateTime: '2016-07-02',
          performer: [
            {
              reference: 'PractitionerRole/bobrester-bob-gp',
              identifier: {
                type: {
                  coding: [
                    {
                      system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                      code: 'NPI',
                      display: 'National provider identifier'
                    }
                  ],
                  text: 'HPI-I'
                },
                system: 'http://ns.electronichealth.net.au/id/hi/hpii/1.0',
                value: '8003614900041243'
              }
            }
          ],
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '77176002',
                display: 'Current smoker'
              },
              {
                system: 'http://loinc.org',
                code: 'LA18979-7'
              }
            ],
            text: 'Smoker'
          }
        },
        search: {
          mode: 'match'
        }
      }
    ]
  },
  QuestionnaireResponseLatestCompleted: {
    resourceType: 'Bundle',
    id: '3ebaec04-df57-429a-abc1-888122a2db63',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.293+00:00'
    },
    type: 'searchset',
    total: 0,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/QuestionnaireResponse?_count=1&_sort=-authored&patient=pat-repop&status=completed'
      }
    ]
  },
  QuestionnaireResponseLatest: {
    resourceType: 'Bundle',
    id: '052b9f51-d9d7-4515-a870-d09b371aee1b',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.317+00:00'
    },
    type: 'searchset',
    total: 4,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/QuestionnaireResponse?_count=1&_sort=-authored&patient=pat-repop'
      },
      {
        relation: 'next',
        url: 'http://proxy.smartforms.io/fhir?_getpages=052b9f51-d9d7-4515-a870-d09b371aee1b&_getpagesoffset=1&_count=1&_pretty=true&_bundletype=searchset'
      }
    ],
    entry: [
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/QuestionnaireResponse/595',
        resource: {
          resourceType: 'QuestionnaireResponse',
          id: '595',
          meta: {
            versionId: '2',
            lastUpdated: '2025-07-30T15:01:04.904+00:00'
          },
          text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><article style="color-scheme: light; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0; color: #1f2328; background-color: #ffffff; font-family: -apple-system,BlinkMacSystemFont,\'Segoe UI\',\'Noto Sans\',Helvetica,Arial,sans-serif,\'Apple Color Emoji\',\'Segoe UI Emoji\'; font-size: 16px; line-height: 1.5; word-wrap: break-word;"><h1 style="margin-top: 0; margin-bottom: .67em; font-weight: 600; padding-bottom: .3em; font-size: 2em; border-bottom: 1px solid #d1d9e0b3;">\n  Aboriginal and Torres Strait Islander Health Check \n  </h1><p style="margin-top: 0; margin-bottom: 1rem; font-weight: 400;"><strong style="font-weight: 600;">Patient</strong>: Kimberly Repop<br/><strong style="font-weight: 600;">Author</strong>: Dr Peter Primary<br/><strong style="font-weight: 600;">Date Authored</strong>: 31/07/2025 00:10</p><section><h2 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; padding-bottom: 0.3em; font-size: 1.5em; border-bottom: 1px solid #d1d9e0b3;">About the health check</h2><p style="margin-top: 0; margin-bottom: 1rem; font-weight: 400;"><strong style="font-weight: 600;">Health check already in progress?</strong><br/>Yes</p><p style="margin-top: 0; margin-bottom: 1rem; font-weight: 400;"><strong style="font-weight: 600;">Date this health check commenced</strong><br/>31/07/2025</p></section><section><h2 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; padding-bottom: 0.3em; font-size: 1.5em; border-bottom: 1px solid #d1d9e0b3;">Consent</h2><p style="margin-top: 0; margin-bottom: 1rem; font-weight: 400;"><strong style="font-weight: 600;">Date</strong><br/>31/07/2025</p></section><section><h2 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; padding-bottom: 0.3em; font-size: 1.5em; border-bottom: 1px solid #d1d9e0b3;">Patient Details</h2><p style="margin-top: 0; margin-bottom: 1rem; font-weight: 400;"><strong style="font-weight: 600;">Name</strong><br/>Repop, Kimberly</p><p style="margin-top: 0; margin-bottom: 1rem; font-weight: 400;"><strong style="font-weight: 600;">Preferred name</strong><br/>Repop, Kimberly</p><p style="margin-top: 0; margin-bottom: 1rem; font-weight: 400;"><strong style="font-weight: 600;">Preferred pronouns</strong><br/>she/her/her/hers/herself</p><p style="margin-top: 0; margin-bottom: 1rem; font-weight: 400;"><strong style="font-weight: 600;">Date of birth</strong><br/>11/10/1968</p><p style="margin-top: 0; margin-bottom: 1rem; font-weight: 400;"><strong style="font-weight: 600;">Age</strong><br/>56</p><section><h3 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; font-size: 1.25em;">Home address</h3><section><h4 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; font-size: 1em;">Home address</h4><table style="margin-top: 0; margin-bottom: 1rem; font-weight: 400; border-spacing: 0; border-collapse: collapse; display: block; width: max-content; max-width: 100%; overflow: auto; font-variant: tabular-nums;"><thead><tr style="background-color: #f6f8fa; border-top: 1px solid #d1d9e0b3;"><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Street address</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">City</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">State</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Postcode</th></tr></thead><tbody><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">4 Brisbane Street</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Brisbane</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Queensland</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">4112</td></tr></tbody></table><div style="margin-bottom: 0.5em;"><strong style="font-weight: 600;">Home phone</strong></div><ul style="margin-top: 0; margin-bottom: 1rem; font-weight: 400; padding-left: 2em;"><li>0123456879</li></ul><div style="margin-bottom: 0.5em;"><strong style="font-weight: 600;">Mobile phone</strong></div><ul style="margin-top: 0; margin-bottom: 1rem; font-weight: 400; padding-left: 2em;"><li>0491 572 665</li></ul></section></section><section><h3 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; font-size: 1.25em;">Emergency contact</h3><table style="margin-top: 0; margin-bottom: 1rem; font-weight: 400; border-spacing: 0; border-collapse: collapse; display: block; width: max-content; max-width: 100%; overflow: auto; font-variant: tabular-nums;"><thead><tr style="background-color: #f6f8fa; border-top: 1px solid #d1d9e0b3;"><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Name</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Relationship to child</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Relationship to patient</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Phone</th></tr></thead><tbody><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Ms Phone A Friend</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">0987654321</td></tr></tbody></table></section><section><h3 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; font-size: 1.25em;">Medicare number</h3><p style="margin-top: 0; margin-bottom: 1rem; font-weight: 400;"><strong style="font-weight: 600;">Number</strong><br/>6951449677</p><p style="margin-top: 0; margin-bottom: 1rem; font-weight: 400;"><strong style="font-weight: 600;">Reference number</strong><br/>1</p><p style="margin-top: 0; margin-bottom: 1rem; font-weight: 400;"><strong style="font-weight: 600;">Expiry</strong><br/>2024-08</p><p style="margin-top: 0; margin-bottom: 1rem; font-weight: 400;"><strong style="font-weight: 600;">Registered for Closing the Gap PBS Co-payment Measure (CTG)</strong><br/>Yes</p></section></section><section><h2 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; padding-bottom: 0.3em; font-size: 1.5em; border-bottom: 1px solid #d1d9e0b3;">Medical history and current problems</h2><section><h3 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; font-size: 1.25em;">Medical history summary</h3><section><h4 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; font-size: 1em;">Medical history summary</h4><table style="margin-top: 0; margin-bottom: 1rem; font-weight: 400; border-spacing: 0; border-collapse: collapse; display: block; width: max-content; max-width: 100%; overflow: auto; font-variant: tabular-nums;"><thead><tr style="background-color: #f6f8fa; border-top: 1px solid #d1d9e0b3;"><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Condition</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Clinical status</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Onset date</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Abatement date</th></tr></thead><tbody><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Chronic kidney disease stage 3B (disorder)</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Inactive</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Acute coronary syndrome</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Inactive</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Urinary tract infection</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Inactive</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">10/05/2020</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">04/06/2025</td></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Type 2 diabetes mellitus</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Inactive</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">30/06/2025</td></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Remittent fever</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Hypertension</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Fracture of bone</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/></tr></tbody></table></section></section></section><section><h2 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; padding-bottom: 0.3em; font-size: 1.5em; border-bottom: 1px solid #d1d9e0b3;">Regular medications</h2><section><h3 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; font-size: 1.25em;">Medication summary</h3><section><h4 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; font-size: 1em;">Current medications</h4><table style="margin-top: 0; margin-bottom: 1rem; font-weight: 400; border-spacing: 0; border-collapse: collapse; display: block; width: max-content; max-width: 100%; overflow: auto; font-variant: tabular-nums;"><thead><tr style="background-color: #f6f8fa; border-top: 1px solid #d1d9e0b3;"><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Medication</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Status</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Dosage</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Clinical indication</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Comment</th></tr></thead><tbody><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Chloramphenicol 1% eye ointment</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Active</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Apply 1 drop to each eye every 2 hours for 7 days</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Bacterial conjunctivitis</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Karvezide 300/12.5 tablet</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Active</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Take one tablet per day.</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Hypertension</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Review regularly for blood pressure control and side effects.</td></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Active</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">1 at night</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Active</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">1/2 tablet in the morning</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Active</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Apply a thin layer to affected area twice daily</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Rash</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Patient instructed to avoid contact with eyes.</td></tr></tbody></table></section></section></section><section><h2 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; padding-bottom: 0.3em; font-size: 1.5em; border-bottom: 1px solid #d1d9e0b3;">Allergies/adverse reactions</h2><section><h3 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; font-size: 1.25em;">Adverse reaction risk summary</h3><section><h4 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; font-size: 1em;">Adverse reaction risk summary</h4><table style="margin-top: 0; margin-bottom: 1rem; font-weight: 400; border-spacing: 0; border-collapse: collapse; display: block; width: max-content; max-width: 100%; overflow: auto; font-variant: tabular-nums;"><thead><tr style="background-color: #f6f8fa; border-top: 1px solid #d1d9e0b3;"><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Substance</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Status</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Manifestation</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Comment</th></tr></thead><tbody><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Bee pollen</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Active</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Rash</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">comment</td></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Dried flowers</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Active</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Sneezing</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Hayfever</td></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Pollen</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Active</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Sneezing</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Ibuprofen</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Active</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Rash</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Penicillin</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Active</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Hives</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">The criticality is high due to a documented episode of hives following penicillin administration.</td></tr></tbody></table></section></section></section><section><h2 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; padding-bottom: 0.3em; font-size: 1.5em; border-bottom: 1px solid #d1d9e0b3;">Immunisation</h2><section><h3 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; font-size: 1.25em;">Vaccines previously given</h3><table style="margin-top: 0; margin-bottom: 1rem; font-weight: 400; border-spacing: 0; border-collapse: collapse; display: block; width: max-content; max-width: 100%; overflow: auto; font-variant: tabular-nums;"><thead><tr style="background-color: #f6f8fa; border-top: 1px solid #d1d9e0b3;"><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Vaccine</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Batch number</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Administration date</th><th style="padding: 6px 13px; border: 1px solid #d1d9e0; font-weight: 600;">Comment</th></tr></thead><tbody><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">AstraZeneca Vaxzevria</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">15/01/2025</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">comment</td></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">AstraZeneca Vaxzevria</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">15/12/2020</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">first one</td></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Diphtheria + tetanus + pertussis 3 component vaccine</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;"/><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">test</td></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Comirnaty</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">300000000P</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">15/07/2021</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Second dose of Comirnaty vaccine administered.</td></tr><tr style="background-color: #fff; border-top: 1px solid #d1d9e0b3;"><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">Comirnaty</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">200000000P</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">17/06/2021</td><td style="padding: 6px 13px; border: 1px solid #d1d9e0;">First dose of Comirnaty vaccine administered.</td></tr></tbody></table></section></section><section><h2 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; padding-bottom: 0.3em; font-size: 1.5em; border-bottom: 1px solid #d1d9e0b3;">Absolute cardiovascular disease risk calculation</h2><section><h3 style="margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; line-height: 1.25; font-size: 1.25em;">CVD risk result</h3><p style="margin-top: 0; margin-bottom: 1rem; font-weight: 400;"><strong style="font-weight: 600;">Latest available result</strong><br/>Not available</p></section></section></article></div>'
          },
          questionnaire: 'http://www.health.gov.au/assessments/mbs/715|0.3.0-assembled',
          _questionnaire: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/display',
                valueString: 'Aboriginal and Torres Strait Islander Health Check'
              }
            ]
          },
          status: 'in-progress',
          subject: {
            reference: 'Patient/pat-repop',
            type: 'Patient',
            display: 'Kimberly Repop'
          },
          authored: '2025-07-31T00:31:04+09:30',
          author: {
            reference: 'Practitioner/primary-peter',
            type: 'Practitioner',
            display: 'Dr Peter Primary'
          },
          item: [
            {
              linkId: 'fd5af92e-c248-497a-8007-ee0952ccd4d9',
              item: [
                {
                  linkId: '2e82032a-dc28-45f2-916e-862303d39fe5',
                  text: 'About the health check',
                  item: [
                    {
                      linkId: '5960c096-d5f7-4745-bd74-44ff2775bde9',
                      text: 'Health check already in progress?',
                      answer: [
                        {
                          valueBoolean: true
                        }
                      ]
                    },
                    {
                      linkId: '63fe14f3-2374-4382-bce7-180e2747c97f',
                      text: 'Date this health check commenced',
                      answer: [
                        {
                          valueDate: '2025-07-31'
                        }
                      ]
                    }
                  ]
                },
                {
                  linkId: '1016f79d-9756-4daf-b6ee-29add134b34f',
                  text: 'Consent',
                  item: [
                    {
                      linkId: '84162f36-f4af-4509-b178-ef2a3849d0b6',
                      text: 'Date',
                      answer: [
                        {
                          valueDate: '2025-07-31'
                        }
                      ]
                    }
                  ]
                },
                {
                  linkId: '5b224753-9365-44e3-823b-9c17e7394005',
                  text: 'Patient Details',
                  item: [
                    {
                      linkId: '17596726-34cf-4133-9960-7081e1d63558',
                      text: 'Name',
                      answer: [
                        {
                          valueString: 'Repop, Kimberly'
                        }
                      ]
                    },
                    {
                      linkId: '57093a06-62f7-4b8b-8cb4-2c9f451ac851',
                      text: 'Preferred name',
                      answer: [
                        {
                          valueString: 'Repop, Kimberly'
                        }
                      ]
                    },
                    {
                      linkId: '540b1034-7c9a-4aba-a9ef-afb77d445a58',
                      text: 'Preferred pronouns',
                      answer: [
                        {
                          valueCoding: {
                            system: 'http://loinc.org',
                            code: 'LA29519-8',
                            display: 'she/her/her/hers/herself'
                          }
                        }
                      ]
                    },
                    {
                      linkId: '418e4a02-de77-48a0-a92a-fe8fcc52b1aa',
                      text: 'Administrative gender',
                      answer: [
                        {
                          valueCoding: {
                            system: 'http://hl7.org/fhir/administrative-gender',
                            code: 'female',
                            display: 'Female'
                          }
                        }
                      ]
                    },
                    {
                      linkId: '90ad8f16-16e4-4438-a7aa-b3189f510da2',
                      text: 'Date of birth',
                      answer: [
                        {
                          valueDate: '1968-10-11'
                        }
                      ]
                    },
                    {
                      linkId: 'e2a16e4d-2765-4b61-b286-82cfc6356b30',
                      text: 'Age',
                      answer: [
                        {
                          valueInteger: 56
                        }
                      ]
                    },
                    {
                      linkId: 'f1262ade-843c-4eba-a86d-51a9c97d134b',
                      text: 'Home address',
                      item: [
                        {
                          linkId: '4e0dc185-f83e-4027-b7a8-ecb543d42c6d',
                          text: 'Home address',
                          item: [
                            {
                              linkId: '2fee2d51-7828-4178-b8c1-35edd32ba338',
                              text: 'Street address',
                              answer: [
                                {
                                  valueString: '4 Brisbane Street'
                                }
                              ]
                            },
                            {
                              linkId: 'ddb65ed1-f4b2-4730-af2a-2f98bc73c76f',
                              text: 'City',
                              answer: [
                                {
                                  valueString: 'Brisbane'
                                }
                              ]
                            },
                            {
                              linkId: 'd9a1236c-8d6e-4f20-a12a-9d5de5a1d0f6',
                              text: 'State',
                              answer: [
                                {
                                  valueCoding: {
                                    system:
                                      'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
                                    code: 'QLD',
                                    display: 'Queensland'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: '3f61a1ea-1c74-4f52-8519-432ce861a74f',
                              text: 'Postcode',
                              answer: [
                                {
                                  valueString: '4112'
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    {
                      linkId: '9541f0b0-f5ba-4fe7-a8e9-ad003cef897b',
                      text: 'Home phone',
                      answer: [
                        {
                          valueString: '0123456879'
                        }
                      ]
                    },
                    {
                      linkId: '4037a02b-4a85-40e0-9be6-5b17df1aac56',
                      text: 'Mobile phone',
                      answer: [
                        {
                          valueString: '0491 572 665'
                        }
                      ]
                    },
                    {
                      linkId: 'c22390d3-1be6-4fd1-b775-6443b7239a6b',
                      text: 'Emergency contact',
                      item: [
                        {
                          linkId: 'd7f2dd75-20c8-480f-8c22-71d604ebee8d',
                          text: 'Name',
                          answer: [
                            {
                              valueString: 'Ms Phone A Friend'
                            }
                          ]
                        },
                        {
                          linkId: '626e3723-6310-4b99-81c1-525676b027c8',
                          text: 'Phone',
                          answer: [
                            {
                              valueString: '0987654321'
                            }
                          ]
                        }
                      ]
                    },
                    {
                      linkId: 'df1475ea-bf7e-4bf0-a69f-7f9608c3ed3c',
                      text: 'Medicare number',
                      item: [
                        {
                          linkId: 'eb2a59ed-9632-4df1-b5b1-1e85c3b4b7cf',
                          text: 'Number',
                          answer: [
                            {
                              valueString: '6951449677'
                            }
                          ]
                        },
                        {
                          linkId: 'd6253253-a124-494e-a1d8-7ce02c69ec11',
                          text: 'Reference number',
                          answer: [
                            {
                              valueString: '1'
                            }
                          ]
                        },
                        {
                          linkId: 'c520e213-5313-42c3-860a-d30206620290',
                          text: 'Expiry',
                          answer: [
                            {
                              valueString: '2024-08'
                            }
                          ]
                        }
                      ]
                    },
                    {
                      linkId: '83814495-3a81-43f4-88df-42186cce516a',
                      text: 'Registered for Closing the Gap PBS Co-payment Measure (CTG)',
                      answer: [
                        {
                          valueBoolean: true
                        }
                      ]
                    }
                  ]
                },
                {
                  linkId: '28d5dbe4-1e65-487c-847a-847f544a6a91',
                  text: 'Medical history and current problems',
                  item: [
                    {
                      linkId: 'medicalhistorysummary',
                      text: 'Medical history summary',
                      item: [
                        {
                          linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                          text: 'Medical history summary',
                          item: [
                            {
                              linkId: 'conditionId',
                              answer: [
                                {
                                  valueString: 'ckd-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                              text: 'Condition',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '700379002',
                                    display: 'Chronic kidney disease stage 3B (disorder)'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                              text: 'Clinical status',
                              answer: [
                                {
                                  valueCoding: {
                                    system:
                                      'http://terminology.hl7.org/CodeSystem/condition-clinical',
                                    code: 'inactive',
                                    display: 'Inactive'
                                  }
                                }
                              ]
                            }
                          ]
                        },
                        {
                          linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                          text: 'Medical history summary',
                          item: [
                            {
                              linkId: 'conditionId',
                              answer: [
                                {
                                  valueString: 'coronary-syndrome-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                              text: 'Condition',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '394659003',
                                    display: 'Acute coronary syndrome'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                              text: 'Clinical status',
                              answer: [
                                {
                                  valueCoding: {
                                    system:
                                      'http://terminology.hl7.org/CodeSystem/condition-clinical',
                                    code: 'inactive',
                                    display: 'Inactive'
                                  }
                                }
                              ]
                            }
                          ]
                        },
                        {
                          linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                          text: 'Medical history summary',
                          item: [
                            {
                              linkId: 'conditionId',
                              answer: [
                                {
                                  valueString: 'uti-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                              text: 'Condition',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '68566005',
                                    display: 'Urinary tract infection'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                              text: 'Clinical status',
                              answer: [
                                {
                                  valueCoding: {
                                    system:
                                      'http://terminology.hl7.org/CodeSystem/condition-clinical',
                                    code: 'inactive',
                                    display: 'Inactive'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: '6ae641ad-95bb-4cdc-8910-5a52077e492c',
                              text: 'Onset date',
                              answer: [
                                {
                                  valueDate: '2020-05-10'
                                }
                              ]
                            },
                            {
                              linkId: 'e4524654-f6de-4717-b288-34919394d46b',
                              text: 'Abatement date',
                              answer: [
                                {
                                  valueDate: '2025-06-04'
                                }
                              ]
                            }
                          ]
                        },
                        {
                          linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                          text: 'Medical history summary',
                          item: [
                            {
                              linkId: 'conditionId',
                              answer: [
                                {
                                  valueString: 'diabetes-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                              text: 'Condition',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '44054006',
                                    display: 'Type 2 diabetes mellitus'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                              text: 'Clinical status',
                              answer: [
                                {
                                  valueCoding: {
                                    system:
                                      'http://terminology.hl7.org/CodeSystem/condition-clinical',
                                    code: 'inactive',
                                    display: 'Inactive'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'e4524654-f6de-4717-b288-34919394d46b',
                              text: 'Abatement date',
                              answer: [
                                {
                                  valueDate: '2025-06-30'
                                }
                              ]
                            }
                          ]
                        },
                        {
                          linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                          text: 'Medical history summary',
                          item: [
                            {
                              linkId: 'conditionId',
                              answer: [
                                {
                                  valueString: 'fever-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                              text: 'Condition',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '63993003',
                                    display: 'Remittent fever'
                                  }
                                }
                              ]
                            }
                          ]
                        },
                        {
                          linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                          text: 'Medical history summary',
                          item: [
                            {
                              linkId: 'conditionId',
                              answer: [
                                {
                                  valueString: '584a-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                              text: 'Condition',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '38341003',
                                    display: 'Hypertension'
                                  }
                                }
                              ]
                            }
                          ]
                        },
                        {
                          linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                          text: 'Medical history summary',
                          item: [
                            {
                              linkId: 'conditionId',
                              answer: [
                                {
                                  valueString: '613a-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                              text: 'Condition',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '125605004',
                                    display: 'Fracture of bone'
                                  }
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  linkId: '7dfe7c6a-ca7f-4ddf-9241-a7b918a9695a',
                  text: 'Regular medications',
                  item: [
                    {
                      linkId: 'regularmedications-summary',
                      text: 'Medication summary',
                      item: [
                        {
                          linkId: 'regularmedications-summary-current',
                          text: 'Current medications',
                          item: [
                            {
                              linkId: 'medicationStatementId',
                              answer: [
                                {
                                  valueString: 'chloramphenicol-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-medication',
                              text: 'Medication',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '22717011000036101',
                                    display: 'Chloramphenicol 1% eye ointment'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-status',
                              text: 'Status',
                              answer: [
                                {
                                  valueCoding: {
                                    system:
                                      'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                                    code: 'active',
                                    display: 'Active'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-dosage',
                              text: 'Dosage',
                              answer: [
                                {
                                  valueString: 'Apply 1 drop to each eye every 2 hours for 7 days'
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-reasoncode',
                              text: 'Clinical indication',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '128350005',
                                    display: 'Bacterial conjunctivitis'
                                  }
                                }
                              ]
                            }
                          ]
                        },
                        {
                          linkId: 'regularmedications-summary-current',
                          text: 'Current medications',
                          item: [
                            {
                              linkId: 'medicationStatementId',
                              answer: [
                                {
                                  valueString: 'karvezide-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-medication',
                              text: 'Medication',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '6554011000036100',
                                    display: 'Karvezide 300/12.5 tablet'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-status',
                              text: 'Status',
                              answer: [
                                {
                                  valueCoding: {
                                    system:
                                      'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                                    code: 'active',
                                    display: 'Active'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-dosage',
                              text: 'Dosage',
                              answer: [
                                {
                                  valueString: 'Take one tablet per day.'
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-reasoncode',
                              text: 'Clinical indication',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '38341003',
                                    display: 'Hypertension'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-comment',
                              text: 'Comment',
                              answer: [
                                {
                                  valueString:
                                    'Review regularly for blood pressure control and side effects.'
                                }
                              ]
                            }
                          ]
                        },
                        {
                          linkId: 'regularmedications-summary-current',
                          text: 'Current medications',
                          item: [
                            {
                              linkId: 'medicationStatementId',
                              answer: [
                                {
                                  valueString: 'intended-coq10-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-status',
                              text: 'Status',
                              answer: [
                                {
                                  valueCoding: {
                                    system:
                                      'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                                    code: 'active',
                                    display: 'Active'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-dosage',
                              text: 'Dosage',
                              answer: [
                                {
                                  valueString: '1 at night'
                                }
                              ]
                            }
                          ]
                        },
                        {
                          linkId: 'regularmedications-summary-current',
                          text: 'Current medications',
                          item: [
                            {
                              linkId: 'medicationStatementId',
                              answer: [
                                {
                                  valueString: 'active-bisoprolol-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-status',
                              text: 'Status',
                              answer: [
                                {
                                  valueCoding: {
                                    system:
                                      'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                                    code: 'active',
                                    display: 'Active'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-dosage',
                              text: 'Dosage',
                              answer: [
                                {
                                  valueString: '1/2 tablet in the morning'
                                }
                              ]
                            }
                          ]
                        },
                        {
                          linkId: 'regularmedications-summary-current',
                          text: 'Current medications',
                          item: [
                            {
                              linkId: 'medicationStatementId',
                              answer: [
                                {
                                  valueString: 'hc-ms-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-status',
                              text: 'Status',
                              answer: [
                                {
                                  valueCoding: {
                                    system:
                                      'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                                    code: 'active',
                                    display: 'Active'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-dosage',
                              text: 'Dosage',
                              answer: [
                                {
                                  valueString: 'Apply a thin layer to affected area twice daily'
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-reasoncode',
                              text: 'Clinical indication',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '271807003',
                                    display: 'Rash'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'regularmedications-summary-current-comment',
                              text: 'Comment',
                              answer: [
                                {
                                  valueString: 'Patient instructed to avoid contact with eyes.'
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  linkId: 'allergy',
                  text: 'Allergies/adverse reactions',
                  item: [
                    {
                      linkId: 'allergyinstruction',
                      text: 'Adverse reaction risk summary',
                      item: [
                        {
                          linkId: 'allergysummary',
                          text: 'Adverse reaction risk summary',
                          item: [
                            {
                              linkId: 'allergyIntoleranceId',
                              answer: [
                                {
                                  valueString: '604a-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-substance',
                              text: 'Substance',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '412583005',
                                    display: 'Bee pollen'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-status',
                              text: 'Status',
                              answer: [
                                {
                                  valueCoding: {
                                    system:
                                      'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                                    code: 'active',
                                    display: 'Active'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-manifestation',
                              text: 'Manifestation',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '271807003',
                                    display: 'Rash'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-comment',
                              text: 'Comment',
                              answer: [
                                {
                                  valueString: 'comment'
                                }
                              ]
                            }
                          ]
                        },
                        {
                          linkId: 'allergysummary',
                          text: 'Adverse reaction risk summary',
                          item: [
                            {
                              linkId: 'allergyIntoleranceId',
                              answer: [
                                {
                                  valueString: '614a-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-substance',
                              text: 'Substance',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '228659004',
                                    display: 'Dried flowers'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-status',
                              text: 'Status',
                              answer: [
                                {
                                  valueCoding: {
                                    system:
                                      'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                                    code: 'active',
                                    display: 'Active'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-manifestation',
                              text: 'Manifestation',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '76067001',
                                    display: 'Sneezing'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-comment',
                              text: 'Comment',
                              answer: [
                                {
                                  valueString: 'Hayfever'
                                }
                              ]
                            }
                          ]
                        },
                        {
                          linkId: 'allergysummary',
                          text: 'Adverse reaction risk summary',
                          item: [
                            {
                              linkId: 'allergyIntoleranceId',
                              answer: [
                                {
                                  valueString: '676a-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-substance',
                              text: 'Substance',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '256259004',
                                    display: 'Pollen'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-status',
                              text: 'Status',
                              answer: [
                                {
                                  valueCoding: {
                                    system:
                                      'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                                    code: 'active',
                                    display: 'Active'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-manifestation',
                              text: 'Manifestation',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '76067001',
                                    display: 'Sneezing'
                                  }
                                }
                              ]
                            }
                          ]
                        },
                        {
                          linkId: 'allergysummary',
                          text: 'Adverse reaction risk summary',
                          item: [
                            {
                              linkId: 'allergyIntoleranceId',
                              answer: [
                                {
                                  valueString: 'allergyintolerance-aspirin-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-substance',
                              text: 'Substance',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '38268001',
                                    display: 'Ibuprofen'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-status',
                              text: 'Status',
                              answer: [
                                {
                                  valueCoding: {
                                    system:
                                      'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                                    code: 'active',
                                    display: 'Active'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-manifestation',
                              text: 'Manifestation',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '271807003',
                                    display: 'Rash'
                                  }
                                }
                              ]
                            }
                          ]
                        },
                        {
                          linkId: 'allergysummary',
                          text: 'Adverse reaction risk summary',
                          item: [
                            {
                              linkId: 'allergyIntoleranceId',
                              answer: [
                                {
                                  valueString: 'penicillin-pat-repop'
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-substance',
                              text: 'Substance',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '764146007',
                                    display: 'Penicillin'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-status',
                              text: 'Status',
                              answer: [
                                {
                                  valueCoding: {
                                    system:
                                      'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                                    code: 'active',
                                    display: 'Active'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-manifestation',
                              text: 'Manifestation',
                              answer: [
                                {
                                  valueCoding: {
                                    system: 'http://snomed.info/sct',
                                    code: '247472004',
                                    display: 'Hives'
                                  }
                                }
                              ]
                            },
                            {
                              linkId: 'allergysummary-comment',
                              text: 'Comment',
                              answer: [
                                {
                                  valueString:
                                    'The criticality is high due to a documented episode of hives following penicillin administration.'
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  linkId: '205677d6-17c7-4285-a7c4-61aa02b6c816',
                  text: 'Immunisation',
                  item: [
                    {
                      linkId: 'vaccinesprevious',
                      text: 'Vaccines previously given',
                      item: [
                        {
                          linkId: 'vaccinesprevious-vaccine',
                          text: 'Vaccine',
                          answer: [
                            {
                              valueCoding: {
                                system:
                                  'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
                                code: 'COVAST',
                                display: 'AstraZeneca Vaxzevria'
                              }
                            }
                          ]
                        },
                        {
                          linkId: 'vaccinesprevious-date',
                          text: 'Administration date',
                          answer: [
                            {
                              valueDate: '2025-01-15'
                            }
                          ]
                        },
                        {
                          linkId: 'vaccinesprevious-comment',
                          text: 'Comment',
                          answer: [
                            {
                              valueString: 'comment'
                            }
                          ]
                        }
                      ]
                    },
                    {
                      linkId: 'vaccinesprevious',
                      text: 'Vaccines previously given',
                      item: [
                        {
                          linkId: 'vaccinesprevious-vaccine',
                          text: 'Vaccine',
                          answer: [
                            {
                              valueCoding: {
                                system:
                                  'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
                                code: 'COVAST',
                                display: 'AstraZeneca Vaxzevria'
                              }
                            }
                          ]
                        },
                        {
                          linkId: 'vaccinesprevious-date',
                          text: 'Administration date',
                          answer: [
                            {
                              valueDate: '2020-12-15'
                            }
                          ]
                        },
                        {
                          linkId: 'vaccinesprevious-comment',
                          text: 'Comment',
                          answer: [
                            {
                              valueString: 'first one'
                            }
                          ]
                        }
                      ]
                    },
                    {
                      linkId: 'vaccinesprevious',
                      text: 'Vaccines previously given',
                      item: [
                        {
                          linkId: 'vaccinesprevious-vaccine',
                          text: 'Vaccine',
                          answer: [
                            {
                              valueCoding: {
                                system: 'http://snomed.info/sct',
                                code: '837621000168102',
                                display: 'Diphtheria + tetanus + pertussis 3 component vaccine'
                              }
                            }
                          ]
                        },
                        {
                          linkId: 'vaccinesprevious-comment',
                          text: 'Comment',
                          answer: [
                            {
                              valueString: 'test'
                            }
                          ]
                        }
                      ]
                    },
                    {
                      linkId: 'vaccinesprevious',
                      text: 'Vaccines previously given',
                      item: [
                        {
                          linkId: 'vaccinesprevious-vaccine',
                          text: 'Vaccine',
                          answer: [
                            {
                              valueCoding: {
                                system: 'http://snomed.info/sct',
                                code: '1525011000168107',
                                display: 'Comirnaty'
                              }
                            }
                          ]
                        },
                        {
                          linkId: 'vaccinesprevious-batch',
                          text: 'Batch number',
                          answer: [
                            {
                              valueString: '300000000P'
                            }
                          ]
                        },
                        {
                          linkId: 'vaccinesprevious-date',
                          text: 'Administration date',
                          answer: [
                            {
                              valueDate: '2021-07-15'
                            }
                          ]
                        },
                        {
                          linkId: 'vaccinesprevious-comment',
                          text: 'Comment',
                          answer: [
                            {
                              valueString: 'Second dose of Comirnaty vaccine administered.'
                            }
                          ]
                        }
                      ]
                    },
                    {
                      linkId: 'vaccinesprevious',
                      text: 'Vaccines previously given',
                      item: [
                        {
                          linkId: 'vaccinesprevious-vaccine',
                          text: 'Vaccine',
                          answer: [
                            {
                              valueCoding: {
                                system: 'http://snomed.info/sct',
                                code: '1525011000168107',
                                display: 'Comirnaty'
                              }
                            }
                          ]
                        },
                        {
                          linkId: 'vaccinesprevious-batch',
                          text: 'Batch number',
                          answer: [
                            {
                              valueString: '200000000P'
                            }
                          ]
                        },
                        {
                          linkId: 'vaccinesprevious-date',
                          text: 'Administration date',
                          answer: [
                            {
                              valueDate: '2021-06-17'
                            }
                          ]
                        },
                        {
                          linkId: 'vaccinesprevious-comment',
                          text: 'Comment',
                          answer: [
                            {
                              valueString: 'First dose of Comirnaty vaccine administered.'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  linkId: 'd95abe99-8ef2-4b97-bc88-a2901e2ebc9c',
                  text: 'Absolute cardiovascular disease risk calculation',
                  item: [
                    {
                      linkId: 'dabdc7b4-51db-44a0-9d59-77a88587cbe9',
                      text: 'CVD risk result',
                      item: [
                        {
                          linkId: 'cvdrisk-latestresult',
                          text: 'Latest available result',
                          answer: [
                            {
                              valueString: 'Not available'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        search: {
          mode: 'match'
        }
      }
    ]
  },
  MedicationStatement: {
    resourceType: 'Bundle',
    id: 'd9a3d1da-7ea3-4bb6-a065-1d169eff486b',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.323+00:00'
    },
    type: 'searchset',
    total: 5,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/MedicationStatement?_include=MedicationStatement%3Amedication&patient=pat-repop&status=active'
      }
    ],
    entry: [
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/MedicationStatement/chloramphenicol-pat-repop',
        resource: {
          resourceType: 'MedicationStatement',
          id: 'chloramphenicol-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-medicationstatement']
          },
          status: 'active',
          medicationCodeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '22717011000036101',
                display: 'Chloramphenicol 1% eye ointment'
              }
            ],
            text: 'Chloramphenicol 1% eye ointment'
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          dateAsserted: '2024-02-05',
          reasonCode: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '128350005'
                }
              ],
              text: 'Bacterial conjunctivitis'
            }
          ],
          dosage: [
            {
              text: 'Apply 1 drop to each eye every 2 hours for 7 days'
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/MedicationStatement/karvezide-pat-repop',
        resource: {
          resourceType: 'MedicationStatement',
          id: 'karvezide-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-medicationstatement']
          },
          status: 'active',
          medicationCodeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '6554011000036100',
                display: 'Karvezide 300/12.5 tablet'
              }
            ],
            text: 'Karvezide 300/12.5 tablet (Blood pressure lowering medicine)'
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          dateAsserted: '2024-09-08',
          reasonCode: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '38341003'
                }
              ],
              text: 'Hypertension'
            }
          ],
          note: [
            {
              text: 'Review regularly for blood pressure control and side effects.'
            }
          ],
          dosage: [
            {
              text: 'Take one tablet per day.'
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/MedicationStatement/intended-coq10-pat-repop',
        resource: {
          resourceType: 'MedicationStatement',
          id: 'intended-coq10-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-medicationstatement']
          },
          contained: [
            {
              resourceType: 'Medication',
              id: 'coq10',
              code: {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '920941011000036100',
                    display: 'CoQ10 (Blackmores)'
                  }
                ],
                text: 'CoQ10 150mg tab'
              }
            }
          ],
          status: 'active',
          medicationReference: {
            reference: '#coq10'
          },
          subject: {
            reference: 'Patient/pat-repop',
            identifier: {
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
              value: '8003608166895854'
            }
          },
          effectiveDateTime: '2023-06-25',
          dateAsserted: '2019-02-05',
          dosage: [
            {
              text: '1 at night'
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/MedicationStatement/active-bisoprolol-pat-repop',
        resource: {
          resourceType: 'MedicationStatement',
          id: 'active-bisoprolol-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-medicationstatement']
          },
          status: 'active',
          medicationReference: {
            reference: 'Medication/bisoprolol-pat-repop'
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          dateAsserted: '2019-02-05',
          dosage: [
            {
              text: '1/2 tablet in the morning'
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/MedicationStatement/hc-ms-pat-repop',
        resource: {
          resourceType: 'MedicationStatement',
          id: 'hc-ms-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00'
          },
          status: 'active',
          medicationReference: {
            reference: 'Medication/hc-med-pat-repop'
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          effectiveDateTime: '2025-07-10T10:00:00+09:30',
          dateAsserted: '2025-07-10T10:00:00+09:30',
          reasonCode: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '271807003',
                  display: 'Dermatitis'
                }
              ],
              text: 'For treatment of dermatitis'
            }
          ],
          note: [
            {
              text: 'Patient instructed to avoid contact with eyes.'
            }
          ],
          dosage: [
            {
              text: 'Apply a thin layer to affected area twice daily',
              site: {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '39937001',
                    display: 'Skin structure'
                  }
                ]
              },
              route: {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '6064005',
                    display: 'Topical'
                  }
                ]
              },
              doseAndRate: [
                {
                  doseQuantity: {
                    value: 1,
                    unit: 'application',
                    system: 'http://unitsofmeasure.org',
                    code: 'application'
                  }
                }
              ]
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Medication/bisoprolol-pat-repop',
        resource: {
          resourceType: 'Medication',
          id: 'bisoprolol-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00'
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '23281011000036106',
                display: 'Bisoprolol fumarate 2.5 mg tablet'
              }
            ],
            text: 'Bisoprolol 2.5mg tab'
          }
        },
        search: {
          mode: 'include'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Medication/hc-med-pat-repop',
        resource: {
          resourceType: 'Medication',
          id: 'hc-med-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00'
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '22015011000036108',
                display: 'Hydrocortisone 1% Topical Cream'
              }
            ],
            text: 'Hydrocortisone 1% Topical Cream'
          },
          status: 'active'
        },
        search: {
          mode: 'include'
        }
      }
    ]
  },
  AllergyIntolerance: {
    resourceType: 'Bundle',
    id: '1271fe18-8b86-4797-a875-ab399017d555',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.296+00:00'
    },
    type: 'searchset',
    total: 12,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/AllergyIntolerance?patient=pat-repop'
      }
    ],
    entry: [
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/AllergyIntolerance/533a-pat-repop',
        resource: {
          resourceType: 'AllergyIntolerance',
          id: '533a-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00'
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '288328004',
                display: 'Bee venom'
              }
            ],
            text: 'Bee venom'
          },
          patient: {
            reference: 'Patient/pat-repop',
            type: 'Patient',
            display: 'Mrs. Repopulate Tester'
          }
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/AllergyIntolerance/534a-pat-repop',
        resource: {
          resourceType: 'AllergyIntolerance',
          id: '534a-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00'
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '764146007',
                display: 'Penicillin'
              }
            ],
            text: 'Penicillin'
          },
          patient: {
            reference: 'Patient/pat-repop',
            type: 'Patient',
            display: 'Mrs. Repopulate Tester'
          }
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/AllergyIntolerance/543a-pat-repop',
        resource: {
          resourceType: 'AllergyIntolerance',
          id: '543a-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00'
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '387458008',
                display: 'Aspirin'
              }
            ],
            text: 'Aspirin'
          },
          patient: {
            reference: 'Patient/pat-repop',
            type: 'Patient',
            display: 'Mrs. Repopulate Tester'
          }
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/AllergyIntolerance/562a-pat-repop',
        resource: {
          resourceType: 'AllergyIntolerance',
          id: '562a-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00'
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '710715008',
                display: 'Barley pollen'
              }
            ],
            text: 'Barley pollen'
          },
          patient: {
            reference: 'Patient/pat-repop',
            type: 'Patient',
            display: 'Mrs. Repopulate Tester'
          },
          reaction: [
            {
              manifestation: [
                {
                  coding: [
                    {
                      system: 'http://snomed.info/sct',
                      code: '271807003',
                      display: 'Rash'
                    }
                  ],
                  text: 'Rash'
                }
              ]
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/AllergyIntolerance/574a-pat-repop',
        resource: {
          resourceType: 'AllergyIntolerance',
          id: '574a-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00'
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '89811004',
                display: 'Gluten'
              }
            ],
            text: 'Gluten'
          },
          patient: {
            reference: 'Patient/pat-repop',
            type: 'Patient',
            display: 'Mrs. Repopulate Tester'
          },
          reaction: [
            {
              manifestation: [
                {
                  coding: [
                    {
                      system: 'http://snomed.info/sct',
                      code: '12584003',
                      display: 'Bone pain'
                    }
                  ],
                  text: 'Bone pain'
                }
              ]
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/AllergyIntolerance/585a-pat-repop',
        resource: {
          resourceType: 'AllergyIntolerance',
          id: '585a-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-allergyintolerance']
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '3718001',
                display: "Cow's milk"
              }
            ],
            text: "Cow's milk"
          },
          patient: {
            reference: 'Patient/pat-repop',
            type: 'Patient',
            display: 'Mrs. Repopulate Tester'
          },
          note: [
            {
              text: 'Rash'
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/AllergyIntolerance/590a-pat-repop',
        resource: {
          resourceType: 'AllergyIntolerance',
          id: '590a-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-allergyintolerance']
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '255703002',
                display: 'Hay dust'
              }
            ],
            text: 'Hay dust'
          },
          patient: {
            reference: 'Patient/pat-repop',
            type: 'Patient',
            display: 'Mrs. Repopulate Tester'
          }
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/AllergyIntolerance/604a-pat-repop',
        resource: {
          resourceType: 'AllergyIntolerance',
          id: '604a-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-allergyintolerance']
          },
          clinicalStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                code: 'active'
              }
            ]
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '412583005',
                display: 'Bee pollen'
              }
            ],
            text: 'Bee pollen'
          },
          patient: {
            reference: 'Patient/pat-repop',
            type: 'Patient',
            display: 'Mrs. Repopulate Tester'
          },
          note: [
            {
              text: 'comment'
            }
          ],
          reaction: [
            {
              manifestation: [
                {
                  coding: [
                    {
                      system: 'http://snomed.info/sct',
                      code: '271807003',
                      display: 'Rash'
                    }
                  ],
                  text: 'Rash'
                }
              ]
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/AllergyIntolerance/614a-pat-repop',
        resource: {
          resourceType: 'AllergyIntolerance',
          id: '614a-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-allergyintolerance']
          },
          clinicalStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                code: 'active'
              }
            ]
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '228659004',
                display: 'Dried flowers'
              }
            ],
            text: 'Dried flowers'
          },
          patient: {
            reference: 'Patient/pat-repop',
            type: 'Patient',
            display: 'Mrs. Repopulate Tester'
          },
          note: [
            {
              text: 'Hayfever'
            }
          ],
          reaction: [
            {
              manifestation: [
                {
                  coding: [
                    {
                      system: 'http://snomed.info/sct',
                      code: '76067001',
                      display: 'Sneezing'
                    }
                  ],
                  text: 'Sneezing'
                }
              ]
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/AllergyIntolerance/676a-pat-repop',
        resource: {
          resourceType: 'AllergyIntolerance',
          id: '676a-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-allergyintolerance']
          },
          clinicalStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                code: 'active'
              }
            ]
          },
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '256259004',
                display: 'Pollen'
              }
            ],
            text: 'Pollen'
          },
          patient: {
            reference: 'Patient/pat-repop',
            type: 'Patient',
            display: 'Mrs. Repopulate Tester'
          },
          reaction: [
            {
              manifestation: [
                {
                  coding: [
                    {
                      system: 'http://snomed.info/sct',
                      code: '76067001',
                      display: 'Sneezing'
                    }
                  ],
                  text: 'Sneezing'
                }
              ]
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl:
          'http://proxy.smartforms.io/fhir/AllergyIntolerance/allergyintolerance-aspirin-pat-repop',
        resource: {
          resourceType: 'AllergyIntolerance',
          id: 'allergyintolerance-aspirin-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-allergyintolerance']
          },
          clinicalStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                code: 'active'
              }
            ],
            text: 'Active'
          },
          verificationStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
                code: 'confirmed'
              }
            ],
            text: 'Confirmed'
          },
          category: ['medication'],
          criticality: 'unable-to-assess',
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '38268001'
              }
            ],
            text: 'Ibuprofen'
          },
          patient: {
            reference: 'Patient/pat-repop'
          },
          recordedDate: '2024-02-10',
          recorder: {
            reference: 'Practitioner/primary-peter'
          },
          asserter: {
            reference: 'Practitioner/primary-peter'
          },
          reaction: [
            {
              manifestation: [
                {
                  coding: [
                    {
                      system: 'http://snomed.info/sct',
                      code: '271807003'
                    }
                  ],
                  text: 'Rash'
                }
              ],
              severity: 'moderate',
              note: [
                {
                  text: 'Patient experienced a rash after taking Ibuprofen.'
                }
              ]
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/AllergyIntolerance/penicillin-pat-repop',
        resource: {
          resourceType: 'AllergyIntolerance',
          id: 'penicillin-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-allergyintolerance']
          },
          clinicalStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                code: 'active',
                display: 'Active'
              }
            ]
          },
          criticality: 'high',
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '764146007',
                display: 'Penicillin'
              }
            ]
          },
          patient: {
            reference: 'Patient/pat-repop'
          },
          recordedDate: '1999-08-25',
          note: [
            {
              text: 'The criticality is high due to a documented episode of hives following penicillin administration.'
            }
          ],
          reaction: [
            {
              manifestation: [
                {
                  coding: [
                    {
                      system: 'http://snomed.info/sct',
                      code: '247472004',
                      display: 'Hives'
                    }
                  ]
                }
              ]
            }
          ]
        },
        search: {
          mode: 'match'
        }
      }
    ]
  },
  Immunization: {
    resourceType: 'Bundle',
    id: '478ad1d8-17eb-48b8-ab38-b96a1ba1a684',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.317+00:00'
    },
    type: 'searchset',
    total: 5,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Immunization?patient=pat-repop&status=completed'
      }
    ],
    entry: [
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Immunization/606a-pat-repop',
        resource: {
          resourceType: 'Immunization',
          id: '606a-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-immunization']
          },
          status: 'completed',
          vaccineCode: {
            coding: [
              {
                system:
                  'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
                version: '20240207',
                code: 'COVAST',
                display: 'AstraZeneca Vaxzevria'
              }
            ],
            text: 'AstraZeneca Vaxzevria'
          },
          patient: {
            reference: 'Patient/pat-repop',
            type: 'Patient',
            display: 'Mrs. Repopulate Tester'
          },
          occurrenceDateTime: '2025-01-15',
          note: [
            {
              text: 'comment'
            }
          ],
          protocolApplied: [
            {
              doseNumberString: '2'
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Immunization/609a-pat-repop',
        resource: {
          resourceType: 'Immunization',
          id: '609a-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-immunization']
          },
          status: 'completed',
          vaccineCode: {
            coding: [
              {
                system:
                  'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
                version: '20240207',
                code: 'COVAST',
                display: 'AstraZeneca Vaxzevria'
              }
            ],
            text: 'AstraZeneca Vaxzevria'
          },
          patient: {
            reference: 'Patient/pat-repop',
            type: 'Patient',
            display: 'Mrs. Repopulate Tester'
          },
          occurrenceDateTime: '2020-12-15',
          note: [
            {
              text: 'first one'
            }
          ],
          protocolApplied: [
            {
              doseNumberString: '1'
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Immunization/432a-pat-repop',
        resource: {
          resourceType: 'Immunization',
          id: '432a-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-immunization']
          },
          status: 'completed',
          vaccineCode: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                version: 'http://snomed.info/sct/32506021000036107/version/20250131',
                code: '837621000168102',
                display: 'Diphtheria + tetanus + pertussis 3 component vaccine'
              }
            ],
            text: 'Diphtheria + tetanus + pertussis 3 component vaccine'
          },
          patient: {
            reference: 'Patient/pat-repop',
            type: 'Patient',
            display: 'Mrs. Repopulate Tester'
          },
          note: [
            {
              text: 'test'
            }
          ],
          protocolApplied: [
            {
              doseNumberString: '3'
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Immunization/covid-2-pat-repop',
        resource: {
          resourceType: 'Immunization',
          id: 'covid-2-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-immunization']
          },
          status: 'completed',
          vaccineCode: {
            coding: [
              {
                system:
                  'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
                code: 'COMIRN'
              },
              {
                system: 'http://snomed.info/sct',
                code: '1525011000168107',
                display: 'Comirnaty'
              }
            ],
            text: 'Pfizer Comirnaty'
          },
          patient: {
            reference: 'Patient/pat-repop'
          },
          occurrenceDateTime: '2021-07-15',
          recorded: '2021-07-15',
          primarySource: true,
          manufacturer: {
            display: 'Pfizer Australia Ltd'
          },
          lotNumber: '300000000P',
          site: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '368208006',
                display: 'Structure of left upper arm'
              }
            ],
            text: 'Left upper arm'
          },
          note: [
            {
              text: 'Second dose of Comirnaty vaccine administered.'
            }
          ]
        },
        search: {
          mode: 'match'
        }
      },
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Immunization/covid-1-pat-repop',
        resource: {
          resourceType: 'Immunization',
          id: 'covid-1-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-immunization']
          },
          status: 'completed',
          vaccineCode: {
            coding: [
              {
                system:
                  'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
                code: 'COMIRN'
              },
              {
                system: 'http://snomed.info/sct',
                code: '1525011000168107',
                display: 'Comirnaty'
              }
            ],
            text: 'Pfizer Comirnaty'
          },
          patient: {
            reference: 'Patient/pat-repop'
          },
          occurrenceDateTime: '2021-06-17',
          recorded: '2021-06-17',
          primarySource: true,
          manufacturer: {
            display: 'Pfizer Australia Ltd'
          },
          lotNumber: '200000000P',
          site: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '368208006',
                display: 'Structure of left upper arm'
              }
            ],
            text: 'Left upper arm'
          },
          note: [
            {
              text: 'First dose of Comirnaty vaccine administered.'
            }
          ]
        },
        search: {
          mode: 'match'
        }
      }
    ]
  },
  ObsWaistCircumference: {
    resourceType: 'Bundle',
    id: '0f9803cc-1724-4fc5-87a2-0364a8edaa72',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.305+00:00'
    },
    type: 'searchset',
    total: 1,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Observation?_sort=-date&code=8280-0&patient=pat-repop'
      }
    ],
    entry: [
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Observation/waistcircum-pat-repop',
        resource: {
          resourceType: 'Observation',
          id: 'waistcircum-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: [
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation',
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-waistcircum'
            ]
          },
          text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="waistcircum-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;waistcircum-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-waistcircum.html">AU Core Waist Circumference</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Vital Signs <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#vital-signs)</span></p><p><b>code</b>: Waist Circumference <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#8280-0 &quot;Waist Circumference at umbilicus by Tape measure&quot;; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#276361009 &quot;Waist circumference&quot;)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>effective</b>: 2023-03-14</p><p><b>performer</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>value</b>: 88 cm<span style="background: LightGoldenRodYellow"> (Details: UCUM code cm = \'cm\')</span></p></div>'
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
                code: '8280-0',
                display: 'Waist Circumference at umbilicus by Tape measure'
              },
              {
                system: 'http://snomed.info/sct',
                code: '276361009',
                display: 'Waist circumference'
              }
            ],
            text: 'Waist Circumference'
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          effectiveDateTime: '2023-03-14',
          performer: [
            {
              reference: 'PractitionerRole/bobrester-bob-gp',
              identifier: {
                type: {
                  coding: [
                    {
                      system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                      code: 'NPI',
                      display: 'National provider identifier'
                    }
                  ],
                  text: 'HPI-I'
                },
                system: 'http://ns.electronichealth.net.au/id/hi/hpii/1.0',
                value: '8003614900041243'
              }
            }
          ],
          valueQuantity: {
            value: 88,
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
  },
  ObsHeartRate: {
    resourceType: 'Bundle',
    id: 'eeab3dc7-34d2-425f-a586-58968413be5b',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.297+00:00'
    },
    type: 'searchset',
    total: 1,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Observation?_sort=-date&code=8867-4&patient=pat-repop'
      }
    ],
    entry: [
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Observation/heartrate-pat-repop',
        resource: {
          resourceType: 'Observation',
          id: 'heartrate-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: [
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-heartrate',
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation'
            ]
          },
          text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="heartrate-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;heartrate-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-heartrate.html">AU Core Heart Rate</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Vital Signs <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#vital-signs)</span></p><p><b>code</b>: Heart rate <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#8867-4; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#364075005)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>encounter</b>: <span>: GP Visit</span></p><p><b>effective</b>: 2016-07-02</p><p><b>performer</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>value</b>: 80 beats/minute<span style="background: LightGoldenRodYellow"> (Details: UCUM code /min = \'/min\')</span></p></div>'
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
                code: '8867-4',
                display: 'Heart rate'
              },
              {
                system: 'http://snomed.info/sct',
                code: '364075005',
                display: 'Heart rate'
              }
            ],
            text: 'Heart rate'
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          encounter: {
            display: 'GP Visit'
          },
          effectiveDateTime: '2016-07-02',
          performer: [
            {
              reference: 'PractitionerRole/bobrester-bob-gp',
              identifier: {
                type: {
                  coding: [
                    {
                      system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                      code: 'NPI',
                      display: 'National provider identifier'
                    }
                  ],
                  text: 'HPI-I'
                },
                system: 'http://ns.electronichealth.net.au/id/hi/hpii/1.0',
                value: '8003614900041243'
              }
            }
          ],
          valueQuantity: {
            value: 80,
            unit: 'beats/minute',
            system: 'http://unitsofmeasure.org',
            code: '/min'
          }
        },
        search: {
          mode: 'match'
        }
      }
    ]
  },
  ObsHeartRhythm: {
    resourceType: 'Bundle',
    id: 'acbed795-b3c9-49ab-b507-85b9386cf3ca',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.296+00:00'
    },
    type: 'searchset',
    total: 0,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Observation?_sort=-date&code=364074009&patient=pat-repop'
      }
    ]
  },
  ObsBodyHeight: {
    resourceType: 'Bundle',
    id: 'ce97fec6-1da5-4d4c-baf2-5182ca3859ba',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.319+00:00'
    },
    type: 'searchset',
    total: 1,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Observation?_sort=-date&code=8302-2&patient=pat-repop'
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
  },
  ObsBodyWeight: {
    resourceType: 'Bundle',
    id: 'f8c0c423-4148-46c7-badd-6ac4d563458d',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.293+00:00'
    },
    type: 'searchset',
    total: 1,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Observation?_sort=-date&code=29463-7&patient=pat-repop'
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
  },
  ObsHeadCircumference: {
    resourceType: 'Bundle',
    id: '8c06ef12-8c36-4daa-8013-8d3d3f893d41',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.320+00:00'
    },
    type: 'searchset',
    total: 0,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Observation?_sort=-date&code=9843-4&patient=pat-repop'
      }
    ]
  },
  ObsTotalCholesterol: {
    resourceType: 'Bundle',
    id: '75fbf4ba-c3db-4708-afc4-2da3f9e45909',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.332+00:00'
    },
    type: 'searchset',
    total: 1,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Observation?_sort=-date&code=14647-2&patient=pat-repop'
      }
    ],
    entry: [
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Observation/lipid-chol-pat-repop',
        resource: {
          resourceType: 'Observation',
          id: 'lipid-chol-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: [
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-diagnosticresult-path',
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-lipid-result',
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation'
            ]
          },
          text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="lipid-chol-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;lipid-chol-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-lipid-result.html">AU Core Lipid Result</a>, <a href="StructureDefinition-au-core-diagnosticresult-path.html">AU Core Pathology Result Observation</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Laboratory <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#laboratory)</span>, Chemistry <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-v2-0074.html">diagnosticServiceSectionId</a>#CH)</span></p><p><b>code</b>: Cholesterol <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#14647-2 &quot;Cholesterol [Moles/volume] in Serum or Plasma&quot;)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>effective</b>: 2023-01-17</p><p><b>value</b>: 5.9 mmol/L<span style="background: LightGoldenRodYellow"> (Details: UCUM code mmol/L = \'mmol/L\')</span></p><p><b>interpretation</b>: High <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-v3-ObservationInterpretation.html">ObservationInterpretation</a>#H)</span></p><h3>ReferenceRanges</h3><table class="grid"><tr><td style="display: none">-</td><td><b>High</b></td></tr><tr><td style="display: none">*</td><td>5.6 mmol/L<span style="background: LightGoldenRodYellow"> (Details: UCUM code mmol/L = \'mmol/L\')</span></td></tr></table></div>'
          },
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'laboratory',
                  display: 'Laboratory'
                }
              ]
            },
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
                  code: 'CH',
                  display: 'Chemistry'
                }
              ],
              text: 'Chemistry'
            }
          ],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '14647-2',
                display: 'Cholesterol [Moles/volume] in Serum or Plasma'
              }
            ],
            text: 'Cholesterol'
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          effectiveDateTime: '2023-01-17',
          valueQuantity: {
            value: 5.9,
            unit: 'mmol/L',
            system: 'http://unitsofmeasure.org',
            code: 'mmol/L'
          },
          interpretation: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                  code: 'H',
                  display: 'High'
                }
              ]
            }
          ],
          referenceRange: [
            {
              high: {
                value: 5.6,
                unit: 'mmol/L',
                system: 'http://unitsofmeasure.org',
                code: 'mmol/L'
              }
            }
          ]
        },
        search: {
          mode: 'match'
        }
      }
    ]
  },
  ObsHDLCholesterol: {
    resourceType: 'Bundle',
    id: '84d04004-cc03-4724-84e4-8a03763fab2a',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.340+00:00'
    },
    type: 'searchset',
    total: 1,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Observation?_sort=-date&code=14646-4&patient=pat-repop'
      }
    ],
    entry: [
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Observation/lipid-hdl-pat-repop',
        resource: {
          resourceType: 'Observation',
          id: 'lipid-hdl-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-30T04:53:53.420+00:00',
            profile: [
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-diagnosticresult-path',
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-lipid-result',
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation'
            ]
          },
          text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="lipid-hdl-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;lipid-hdl-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-lipid-result.html">AU Core Lipid Result</a>, <a href="StructureDefinition-au-core-diagnosticresult-path.html">AU Core Pathology Result Observation</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Laboratory <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#laboratory)</span>, Chemistry <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-v2-0074.html">diagnosticServiceSectionId</a>#CH)</span></p><p><b>code</b>: HDL <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#14646-4 &quot;Cholesterol in HDL [Moles/volume] in Serum or Plasma&quot;)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>effective</b>: 2023-01-17</p><p><b>value</b>: 1.5 mmol/L<span style="background: LightGoldenRodYellow"> (Details: UCUM code mmol/L = \'mmol/L\')</span></p><p><b>interpretation</b>: Normal <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-v3-ObservationInterpretation.html">ObservationInterpretation</a>#N)</span></p><h3>ReferenceRanges</h3><table class="grid"><tr><td style="display: none">-</td><td><b>Low</b></td><td><b>High</b></td></tr><tr><td style="display: none">*</td><td>1.0 mmol/L<span style="background: LightGoldenRodYellow"> (Details: UCUM code mmol/L = \'mmol/L\')</span></td><td>2.2 mmol/L<span style="background: LightGoldenRodYellow"> (Details: UCUM code mmol/L = \'mmol/L\')</span></td></tr></table></div>'
          },
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'laboratory',
                  display: 'Laboratory'
                }
              ]
            },
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
                  code: 'CH',
                  display: 'Chemistry'
                }
              ],
              text: 'Chemistry'
            }
          ],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '14646-4',
                display: 'Cholesterol in HDL [Moles/volume] in Serum or Plasma'
              }
            ],
            text: 'HDL'
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          effectiveDateTime: '2023-01-17',
          valueQuantity: {
            value: 1.5,
            unit: 'mmol/L',
            system: 'http://unitsofmeasure.org',
            code: 'mmol/L'
          },
          interpretation: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                  code: 'N',
                  display: 'Normal'
                }
              ]
            }
          ],
          referenceRange: [
            {
              low: {
                value: 1,
                unit: 'mmol/L',
                system: 'http://unitsofmeasure.org',
                code: 'mmol/L'
              },
              high: {
                value: 2.2,
                unit: 'mmol/L',
                system: 'http://unitsofmeasure.org',
                code: 'mmol/L'
              }
            }
          ]
        },
        search: {
          mode: 'match'
        }
      }
    ]
  },
  CVDRiskResult: {
    resourceType: 'Bundle',
    id: 'fdc11c30-4540-4020-a2b3-03fd0cbfcf00',
    meta: {
      lastUpdated: '2025-08-07T07:08:45.335+00:00'
    },
    type: 'searchset',
    total: 0,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Observation?_sort=-date&code=441829007&patient=pat-repop'
      }
    ]
  },
  SexAtBirthCoding: [],
  ObsBloodPressureLatest: [
    {
      resourceType: 'Observation',
      id: 'bloodpressure2-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: [
          'http://hl7.org.au/fhir/core/StructureDefinition/au-core-bloodpressure',
          'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation'
        ]
      },
      text: {
        status: 'generated',
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="bloodpressure2-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;bloodpressure2-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-bloodpressure.html">AU Core Blood Pressure</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Vital Signs <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#vital-signs)</span></p><p><b>code</b>: Blood pressure systolic and diastolic <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#85354-9 &quot;Blood pressure panel with all children optional&quot;; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#75367002)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>effective</b>: 2023-09-13</p><p><b>performer</b>: <a href="PractitionerRole-gp-primary-peter.html">PractitionerRole/gp-primary-peter</a></p><p><b>interpretation</b>: Significantly high <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-v3-ObservationInterpretation.html">ObservationInterpretation</a>#HU)</span></p><p><b>bodySite</b>: Right arm <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#368209003 &quot;Structure of right upper arm&quot;)</span></p><p><b>method</b>: Standing position <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#10904000 &quot;Orthostatic body position&quot;)</span></p><blockquote><p><b>component</b></p><p><b>code</b>: Systolic blood pressure <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#8480-6; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#271649006)</span></p><p><b>value</b>: 165 mmHg<span style="background: LightGoldenRodYellow"> (Details: UCUM code mm[Hg] = \'mm[Hg]\')</span></p><h3>ReferenceRanges</h3><table class="grid"><tr><td style="display: none">-</td><td><b>Text</b></td></tr><tr><td style="display: none">*</td><td>Less than 120 mmHg</td></tr></table></blockquote><blockquote><p><b>component</b></p><p><b>code</b>: Diastolic blood pressure <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#8462-4; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#271650006)</span></p><p><b>value</b>: 95 mmHg<span style="background: LightGoldenRodYellow"> (Details: UCUM code mm[Hg] = \'mm[Hg]\')</span></p><h3>ReferenceRanges</h3><table class="grid"><tr><td style="display: none">-</td><td><b>Text</b></td></tr><tr><td style="display: none">*</td><td>Less than 80 mmHg</td></tr></table></blockquote></div>'
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
            code: '85354-9',
            display: 'Blood pressure panel with all children optional'
          },
          {
            system: 'http://snomed.info/sct',
            code: '75367002'
          }
        ],
        text: 'Blood pressure systolic and diastolic'
      },
      subject: {
        reference: 'Patient/pat-repop'
      },
      effectiveDateTime: '2023-09-13',
      performer: [
        {
          reference: 'PractitionerRole/gp-primary-peter'
        }
      ],
      interpretation: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              code: 'HU',
              display: 'Significantly high'
            }
          ]
        }
      ],
      bodySite: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '368209003',
            display: 'Structure of right upper arm'
          }
        ],
        text: 'Right arm'
      },
      method: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '10904000',
            display: 'Orthostatic body position'
          }
        ],
        text: 'Standing position'
      },
      component: [
        {
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '8480-6',
                display: 'Systolic blood pressure'
              },
              {
                system: 'http://snomed.info/sct',
                code: '271649006'
              }
            ],
            text: 'Systolic blood pressure'
          },
          valueQuantity: {
            value: 165,
            unit: 'mmHg',
            system: 'http://unitsofmeasure.org',
            code: 'mm[Hg]'
          },
          referenceRange: [
            {
              text: 'Less than 120 mmHg'
            }
          ]
        },
        {
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '8462-4',
                display: 'Diastolic blood pressure'
              },
              {
                system: 'http://snomed.info/sct',
                code: '271650006'
              }
            ],
            text: 'Diastolic blood pressure'
          },
          valueQuantity: {
            value: 95,
            unit: 'mmHg',
            system: 'http://unitsofmeasure.org',
            code: 'mm[Hg]'
          },
          referenceRange: [
            {
              text: 'Less than 80 mmHg'
            }
          ]
        }
      ]
    }
  ],
  ObsTobaccoSmokingStatusLatest: [
    {
      resourceType: 'Observation',
      id: 'smokingstatus-current-smoker-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: [
          'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation',
          'http://hl7.org.au/fhir/core/StructureDefinition/au-core-smokingstatus'
        ]
      },
      text: {
        status: 'generated',
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="smokingstatus-current-smoker-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;smokingstatus-current-smoker-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-smokingstatus.html">AU Core Smoking Status</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Social History <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#social-history)</span></p><p><b>code</b>: Smoking status <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#266918002; <a href="https://loinc.org/">LOINC</a>#72166-2)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>encounter</b>: <span>: GP Visit</span></p><p><b>effective</b>: 2016-07-02</p><p><b>performer</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>value</b>: Smoker <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#77176002 &quot;Current smoker&quot;; <a href="https://loinc.org/">LOINC</a>#LA18979-7)</span></p></div>'
      },
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'social-history',
              display: 'Social History'
            }
          ],
          text: 'Social History'
        }
      ],
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '1747861000168109'
          },
          {
            system: 'http://loinc.org',
            code: '72166-2'
          }
        ],
        text: 'Smoking status'
      },
      subject: {
        reference: 'Patient/pat-repop'
      },
      encounter: {
        display: 'GP Visit'
      },
      effectiveDateTime: '2016-07-02',
      performer: [
        {
          reference: 'PractitionerRole/bobrester-bob-gp',
          identifier: {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'NPI',
                  display: 'National provider identifier'
                }
              ],
              text: 'HPI-I'
            },
            system: 'http://ns.electronichealth.net.au/id/hi/hpii/1.0',
            value: '8003614900041243'
          }
        }
      ],
      valueCodeableConcept: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '77176002',
            display: 'Current smoker'
          },
          {
            system: 'http://loinc.org',
            code: 'LA18979-7'
          }
        ],
        text: 'Smoker'
      }
    }
  ],
  age: [],
  postcode: [],
  HealthPrioritiesSummaryCurrentPriorities: [],
  HealthPrioritiesSummaryMedicalHistory: [],
  HealthPrioritiesSummaryRegularMedications: [],
  HealthPrioritiesSummaryAllergiesAdverseReactions: [],
  HealthPrioritiesSummaryFamilyHistory: [],
  HealthPrioritiesSummarySocialEmotionalWellbeing: [],
  HealthPrioritiesSummarySocialHistory: [],
  HealthPrioritiesSummaryHomeFamily: [],
  HealthPrioritiesSummaryLearningDevelopment: [],
  HealthPrioritiesSummaryLearningWorkAdults: [],
  HealthPrioritiesSummaryLearningWorkOlder: [],
  HealthPrioritiesSummaryMood: [],
  HealthPrioritiesSummaryMemoryThinking: [],
  HealthPrioritiesSummaryChronicDiseaseAgeing: [],
  HealthPrioritiesSummaryScreeningPrograms: [],
  HealthPrioritiesSummaryHealthyEating: [],
  HealthPrioritiesSummaryPhysicalActivityScreenTimeNotOlder: [],
  HealthPrioritiesSummaryPhysicalActivityScreenTimeOlder: [],
  HealthPrioritiesSummarySubstanceUse: [],
  HealthPrioritiesSummaryGambling: [],
  HealthPrioritiesSummarySexualHealthAdolescents: [],
  HealthPrioritiesSummarySexualHealthAdults: [],
  HealthPrioritiesSummarySexualHealthOlder: [],
  HealthPrioritiesSummaryEyeHealth: [],
  HealthPrioritiesSummaryEarHealthHearing: [],
  HealthPrioritiesSummaryOralDentalHealth: [],
  HealthPrioritiesSummarySkin: [],
  HealthPrioritiesSummaryImmunisation: [],
  HealthPrioritiesSummaryExamination: [],
  HealthPrioritiesSummaryAbsoluteCVDRisk: [],
  HealthPrioritiesSummaryInvestigations: [],
  PostalAddress: [],
  medicationsFromContained: [
    {
      resourceType: 'Medication',
      id: 'coq10',
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '920941011000036100',
            display: 'CoQ10 (Blackmores)'
          }
        ],
        text: 'CoQ10 150mg tab'
      }
    }
  ],
  medicationsFromRef: [
    {
      resourceType: 'Medication',
      id: 'bisoprolol-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00'
      },
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '23281011000036106',
            display: 'Bisoprolol fumarate 2.5 mg tablet'
          }
        ],
        text: 'Bisoprolol 2.5mg tab'
      }
    },
    {
      resourceType: 'Medication',
      id: 'hc-med-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00'
      },
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '22015011000036108',
            display: 'Hydrocortisone 1% Topical Cream'
          }
        ],
        text: 'Hydrocortisone 1% Topical Cream'
      },
      status: 'active'
    }
  ],
  ObsTobaccoSmokingStatusValue: [
    {
      system: 'http://snomed.info/sct',
      code: '77176002',
      display: 'Current smoker'
    }
  ],
  ObsTobaccoSmokingStatusDateString: ['2016-07-02'],
  ObsTobaccoSmokingStatusDateFormatted: ['2 Jul 2016'],
  ObsWaistCircumferenceLatest: [
    {
      resourceType: 'Observation',
      id: 'waistcircum-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: [
          'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation',
          'http://hl7.org.au/fhir/core/StructureDefinition/au-core-waistcircum'
        ]
      },
      text: {
        status: 'generated',
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="waistcircum-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;waistcircum-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-waistcircum.html">AU Core Waist Circumference</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Vital Signs <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#vital-signs)</span></p><p><b>code</b>: Waist Circumference <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#8280-0 &quot;Waist Circumference at umbilicus by Tape measure&quot;; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#276361009 &quot;Waist circumference&quot;)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>effective</b>: 2023-03-14</p><p><b>performer</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>value</b>: 88 cm<span style="background: LightGoldenRodYellow"> (Details: UCUM code cm = \'cm\')</span></p></div>'
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
            code: '8280-0',
            display: 'Waist Circumference at umbilicus by Tape measure'
          },
          {
            system: 'http://snomed.info/sct',
            code: '276361009',
            display: 'Waist circumference'
          }
        ],
        text: 'Waist Circumference'
      },
      subject: {
        reference: 'Patient/pat-repop'
      },
      effectiveDateTime: '2023-03-14',
      performer: [
        {
          reference: 'PractitionerRole/bobrester-bob-gp',
          identifier: {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'NPI',
                  display: 'National provider identifier'
                }
              ],
              text: 'HPI-I'
            },
            system: 'http://ns.electronichealth.net.au/id/hi/hpii/1.0',
            value: '8003614900041243'
          }
        }
      ],
      valueQuantity: {
        value: 88,
        unit: 'cm',
        system: 'http://unitsofmeasure.org',
        code: 'cm'
      }
    }
  ],
  ObsHeartRateLatest: [
    {
      resourceType: 'Observation',
      id: 'heartrate-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: [
          'http://hl7.org.au/fhir/core/StructureDefinition/au-core-heartrate',
          'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation'
        ]
      },
      text: {
        status: 'generated',
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="heartrate-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;heartrate-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-heartrate.html">AU Core Heart Rate</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Vital Signs <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#vital-signs)</span></p><p><b>code</b>: Heart rate <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#8867-4; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#364075005)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>encounter</b>: <span>: GP Visit</span></p><p><b>effective</b>: 2016-07-02</p><p><b>performer</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>value</b>: 80 beats/minute<span style="background: LightGoldenRodYellow"> (Details: UCUM code /min = \'/min\')</span></p></div>'
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
            code: '8867-4',
            display: 'Heart rate'
          },
          {
            system: 'http://snomed.info/sct',
            code: '364075005',
            display: 'Heart rate'
          }
        ],
        text: 'Heart rate'
      },
      subject: {
        reference: 'Patient/pat-repop'
      },
      encounter: {
        display: 'GP Visit'
      },
      effectiveDateTime: '2016-07-02',
      performer: [
        {
          reference: 'PractitionerRole/bobrester-bob-gp',
          identifier: {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'NPI',
                  display: 'National provider identifier'
                }
              ],
              text: 'HPI-I'
            },
            system: 'http://ns.electronichealth.net.au/id/hi/hpii/1.0',
            value: '8003614900041243'
          }
        }
      ],
      valueQuantity: {
        value: 80,
        unit: 'beats/minute',
        system: 'http://unitsofmeasure.org',
        code: '/min'
      }
    }
  ],
  ObsHeartRhythmLatest: [],
  ObsBodyHeightLatest: [
    {
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
    }
  ],
  ObsBodyWeightLatest: [
    {
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
    }
  ],
  ObsHeadCircumferenceLatest: [],
  ObsBodyHeightValue: [163],
  ObsBodyHeightDateString: ['2022-02-10'],
  ObsBodyHeightDateFormatted: ['10 Feb 2022'],
  ObsBodyWeightValue: [79.3],
  ObsBodyWeightDateString: ['2022-02-10'],
  ObsBodyWeightDateFormatted: ['10 Feb 2022'],
  ObsHeadCircumferenceValue: [],
  ObsHeadCircumferenceDateString: [],
  ObsHeadCircumferenceDateFormatted: [],
  ObsWaistCircumferenceValue: [88],
  ObsWaistCircumferenceDateString: ['2023-03-14'],
  ObsWaistCircumferenceDateFormatted: ['14 Mar 2023'],
  ObsHeartRateValue: [80],
  ObsHeartRateDateString: ['2016-07-02'],
  ObsHeartRateDateFormatted: ['2 Jul 2016'],
  ObsHeartRhythmValue: [],
  ObsHeartRhythmDateString: [],
  ObsHeartRhythmDateFormatted: [],
  ObsBloodPressureValue: ['165 / 95'],
  ObsBloodPressureDateString: ['2023-09-13'],
  ObsBloodPressureDateFormatted: ['13 Sep 2023'],
  weight: [],
  height: [],
  ObsTotalCholesterolLatest: [
    {
      resourceType: 'Observation',
      id: 'lipid-chol-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: [
          'http://hl7.org.au/fhir/core/StructureDefinition/au-core-diagnosticresult-path',
          'http://hl7.org.au/fhir/core/StructureDefinition/au-core-lipid-result',
          'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation'
        ]
      },
      text: {
        status: 'generated',
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="lipid-chol-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;lipid-chol-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-lipid-result.html">AU Core Lipid Result</a>, <a href="StructureDefinition-au-core-diagnosticresult-path.html">AU Core Pathology Result Observation</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Laboratory <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#laboratory)</span>, Chemistry <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-v2-0074.html">diagnosticServiceSectionId</a>#CH)</span></p><p><b>code</b>: Cholesterol <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#14647-2 &quot;Cholesterol [Moles/volume] in Serum or Plasma&quot;)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>effective</b>: 2023-01-17</p><p><b>value</b>: 5.9 mmol/L<span style="background: LightGoldenRodYellow"> (Details: UCUM code mmol/L = \'mmol/L\')</span></p><p><b>interpretation</b>: High <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-v3-ObservationInterpretation.html">ObservationInterpretation</a>#H)</span></p><h3>ReferenceRanges</h3><table class="grid"><tr><td style="display: none">-</td><td><b>High</b></td></tr><tr><td style="display: none">*</td><td>5.6 mmol/L<span style="background: LightGoldenRodYellow"> (Details: UCUM code mmol/L = \'mmol/L\')</span></td></tr></table></div>'
      },
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'laboratory',
              display: 'Laboratory'
            }
          ]
        },
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
              code: 'CH',
              display: 'Chemistry'
            }
          ],
          text: 'Chemistry'
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '14647-2',
            display: 'Cholesterol [Moles/volume] in Serum or Plasma'
          }
        ],
        text: 'Cholesterol'
      },
      subject: {
        reference: 'Patient/pat-repop'
      },
      effectiveDateTime: '2023-01-17',
      valueQuantity: {
        value: 5.9,
        unit: 'mmol/L',
        system: 'http://unitsofmeasure.org',
        code: 'mmol/L'
      },
      interpretation: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              code: 'H',
              display: 'High'
            }
          ]
        }
      ],
      referenceRange: [
        {
          high: {
            value: 5.6,
            unit: 'mmol/L',
            system: 'http://unitsofmeasure.org',
            code: 'mmol/L'
          }
        }
      ]
    }
  ],
  ObsHDLCholesterolLatest: [
    {
      resourceType: 'Observation',
      id: 'lipid-hdl-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: [
          'http://hl7.org.au/fhir/core/StructureDefinition/au-core-diagnosticresult-path',
          'http://hl7.org.au/fhir/core/StructureDefinition/au-core-lipid-result',
          'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation'
        ]
      },
      text: {
        status: 'generated',
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="lipid-hdl-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;lipid-hdl-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-lipid-result.html">AU Core Lipid Result</a>, <a href="StructureDefinition-au-core-diagnosticresult-path.html">AU Core Pathology Result Observation</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Laboratory <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#laboratory)</span>, Chemistry <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-v2-0074.html">diagnosticServiceSectionId</a>#CH)</span></p><p><b>code</b>: HDL <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#14646-4 &quot;Cholesterol in HDL [Moles/volume] in Serum or Plasma&quot;)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>effective</b>: 2023-01-17</p><p><b>value</b>: 1.5 mmol/L<span style="background: LightGoldenRodYellow"> (Details: UCUM code mmol/L = \'mmol/L\')</span></p><p><b>interpretation</b>: Normal <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-v3-ObservationInterpretation.html">ObservationInterpretation</a>#N)</span></p><h3>ReferenceRanges</h3><table class="grid"><tr><td style="display: none">-</td><td><b>Low</b></td><td><b>High</b></td></tr><tr><td style="display: none">*</td><td>1.0 mmol/L<span style="background: LightGoldenRodYellow"> (Details: UCUM code mmol/L = \'mmol/L\')</span></td><td>2.2 mmol/L<span style="background: LightGoldenRodYellow"> (Details: UCUM code mmol/L = \'mmol/L\')</span></td></tr></table></div>'
      },
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'laboratory',
              display: 'Laboratory'
            }
          ]
        },
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
              code: 'CH',
              display: 'Chemistry'
            }
          ],
          text: 'Chemistry'
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '14646-4',
            display: 'Cholesterol in HDL [Moles/volume] in Serum or Plasma'
          }
        ],
        text: 'HDL'
      },
      subject: {
        reference: 'Patient/pat-repop'
      },
      effectiveDateTime: '2023-01-17',
      valueQuantity: {
        value: 1.5,
        unit: 'mmol/L',
        system: 'http://unitsofmeasure.org',
        code: 'mmol/L'
      },
      interpretation: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              code: 'N',
              display: 'Normal'
            }
          ]
        }
      ],
      referenceRange: [
        {
          low: {
            value: 1,
            unit: 'mmol/L',
            system: 'http://unitsofmeasure.org',
            code: 'mmol/L'
          },
          high: {
            value: 2.2,
            unit: 'mmol/L',
            system: 'http://unitsofmeasure.org',
            code: 'mmol/L'
          }
        }
      ]
    }
  ],
  CVDRiskResultLatest: [],
  CVDRiskResultValue: [],
  CVDRiskResultDateString: [],
  CVDRiskResultDateFormatted: [],
  NewAssessmentQuestionAnswer: [],
  AusCVDRiskiAccessAnswer: [],
  RepopulateOverrideAnswer: [],
  HomeAddressRepeat: [
    {
      use: 'home',
      line: ['4 Brisbane Street'],
      city: 'Brisbane',
      state: 'QLD',
      postalCode: '4112',
      country: 'AU'
    }
  ],
  PostalAddressRepeat: [],
  EmergencyContactRepeat: [
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
  ConditionRepeat: [
    {
      resourceType: 'Condition',
      id: 'ckd-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
      },
      text: {
        status: 'extensions',
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Condition</b><a name="ckd-pat-repop"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Condition &quot;ckd-pat-repop&quot; Version &quot;5&quot; Updated &quot;2022-06-17 23:22:56+0000&quot; </p><p style="margin-bottom: 0px">Information Source: #5R98DWXS6a48AGkD!</p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-au-core-condition.html">AU Core Condition</a></p></div><p><b>pertains to goal</b>: <a href="Goal-hpt-wnl.html">Goal/hpt-wnl</a></p><p><b>clinicalStatus</b>: Active <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-clinical.html">Condition Clinical Status Codes</a>#active)</span></p><p><b>verificationStatus</b>: Confirmed <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-ver-status.html">ConditionVerificationStatus</a>#confirmed)</span></p><p><b>category</b>: Problem <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-category.html">Condition Category Codes</a>#problem-list-item &quot;Problem List Item&quot;)</span></p><p><b>severity</b>: Severe <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#24484000)</span></p><p><b>code</b>: Chronic kidney disease stage 3B (disorder) <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#700379002)</span></p><p><b>subject</b>: <a href="Patient-pat-repop.html">Patient/pat-repop</a> &quot; FORM&quot;</p><p><b>onset</b>: 52 years<span style="background: LightGoldenRodYellow"> (Details: UCUM code a = \'a\')</span></p><p><b>recordedDate</b>: 2018-12-01</p><h3>Evidences</h3><table class="grid"><tr><td style="display: none">-</td><td><b>Detail</b></td></tr><tr><td style="display: none">*</td><td><a href="FamilyMemberHistory-father.html">FamilyMemberHistory/father: Father had Chronic Kidney disease</a>, <a href="Procedure-dialysis.html">Procedure/dialysis: Patient receives regular dialysis</a>, <a href="Observation-bun-mcc.html">Observation/bun-mcc: BUN is 24 mg/dL</a></td></tr></table></div>'
      },
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/resource-pertainsToGoal',
          valueReference: {
            reference: 'Goal/hpt-wnl'
          }
        }
      ],
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'inactive',
            display: 'Inactive'
          }
        ]
      },
      verificationStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'confirmed'
          }
        ]
      },
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'problem-list-item',
              display: 'Problem List Item'
            }
          ],
          text: 'Problem'
        }
      ],
      severity: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '24484000',
            display: 'Severe'
          }
        ]
      },
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '700379002',
            display: 'Chronic kidney disease stage 3B (disorder)'
          }
        ]
      },
      subject: {
        reference: 'Patient/pat-repop'
      },
      onsetAge: {
        value: 52,
        unit: 'years',
        system: 'http://unitsofmeasure.org',
        code: 'a'
      },
      recordedDate: '2018-12-01',
      evidence: [
        {
          detail: [
            {
              reference: 'FamilyMemberHistory/father',
              display: 'Father had Chronic Kidney disease'
            },
            {
              reference: 'Procedure/dialysis',
              display: 'Patient receives regular dialysis'
            },
            {
              reference: 'Observation/bun-mcc',
              display: 'BUN is 24 mg/dL'
            }
          ]
        }
      ]
    },
    {
      resourceType: 'Condition',
      id: 'coronary-syndrome-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
      },
      text: {
        status: 'generated',
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Condition</b><a name="coronary-syndrome-pat-repop"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Condition &quot;coronary-syndrome-pat-repop&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-au-core-condition.html">AU Core Condition</a></p></div><p><b>clinicalStatus</b>: Active <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-clinical.html">Condition Clinical Status Codes</a>#active)</span></p><p><b>verificationStatus</b>: Confirmed <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-ver-status.html">ConditionVerificationStatus</a>#confirmed)</span></p><p><b>category</b>: Problem <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#55607006; <a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-category.html">Condition Category Codes</a>#problem-list-item)</span></p><p><b>code</b>: Acute coronary syndrome <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#394659003)</span></p><p><b>subject</b>: <a href="Patient-pat-repop.html">Patient/pat-repop</a> &quot; FORM&quot;</p><p><b>onset</b>: 2015-02-12 12:00:00+0000</p><p><b>recordedDate</b>: 2015-02-12</p><p><b>recorder</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>asserter</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p></div>'
      },
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'inactive',
            display: 'Inactive'
          }
        ]
      },
      verificationStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'confirmed',
            display: 'Confirmed'
          }
        ]
      },
      category: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '55607006',
              display: 'Problem'
            },
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'problem-list-item'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '394659003',
            display: 'Acute coronary syndrome'
          }
        ]
      },
      subject: {
        reference: 'Patient/pat-repop'
      },
      onsetDateTime: '2015-02-12T12:00:00+00:00',
      recordedDate: '2015-02-12',
      recorder: {
        reference: 'PractitionerRole/bobrester-bob-gp'
      },
      asserter: {
        reference: 'PractitionerRole/bobrester-bob-gp'
      }
    },
    {
      resourceType: 'Condition',
      id: 'uti-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
      },
      text: {
        status: 'generated',
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Condition</b><a name="uti-pat-repop"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Condition &quot;uti-pat-repop&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-au-core-condition.html">AU Core Condition</a></p></div><p><b>clinicalStatus</b>: Active <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-clinical.html">Condition Clinical Status Codes</a>#active)</span></p><p><b>verificationStatus</b>: Confirmed <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-ver-status.html">ConditionVerificationStatus</a>#confirmed)</span></p><p><b>category</b>: Problem List Item <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-category.html">Condition Category Codes</a>#problem-list-item)</span></p><p><b>code</b>: Urinary tract infection <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#68566005)</span></p><p><b>subject</b>: <a href="Patient-pat-repop.html">Patient/pat-repop</a> &quot; FORM&quot;</p><p><b>onset</b>: 2020-05-10</p><p><b>recorder</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>asserter</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p></div>'
      },
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'inactive',
            display: 'Inactive'
          }
        ]
      },
      verificationStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'confirmed',
            display: 'Confirmed'
          }
        ]
      },
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'problem-list-item',
              display: 'Problem List Item'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '68566005',
            display: 'Urinary tract infection'
          }
        ]
      },
      subject: {
        reference: 'Patient/pat-repop'
      },
      onsetDateTime: '2020-05-10',
      abatementDateTime: '2025-06-04',
      recorder: {
        reference: 'PractitionerRole/bobrester-bob-gp'
      },
      asserter: {
        reference: 'PractitionerRole/bobrester-bob-gp'
      }
    },
    {
      resourceType: 'Condition',
      id: 'diabetes-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
      },
      text: {
        status: 'generated',
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Condition</b><a name="diabetes-pat-repop"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Condition &quot;diabetes-pat-repop&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-au-core-condition.html">AU Core Condition</a></p></div><p><b>clinicalStatus</b>: Active <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-clinical.html">Condition Clinical Status Codes</a>#active)</span></p><p><b>verificationStatus</b>: Confirmed <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-ver-status.html">ConditionVerificationStatus</a>#confirmed)</span></p><p><b>category</b>: Problem <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#55607006; <a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-category.html">Condition Category Codes</a>#problem-list-item)</span></p><p><b>code</b>: Type 2 diabetes mellitus <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#44054006)</span></p><p><b>subject</b>: <a href="Patient-pat-repop.html">Patient/pat-repop</a> &quot; FORM&quot;</p><p><b>onset</b>: 2015-02-12 12:00:00+0000</p><p><b>recordedDate</b>: 2015-02-12</p><p><b>recorder</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>asserter</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p></div>'
      },
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'inactive',
            display: 'Inactive'
          }
        ]
      },
      verificationStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'confirmed',
            display: 'Confirmed'
          }
        ]
      },
      category: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '55607006',
              display: 'Problem'
            },
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'problem-list-item'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '44054006',
            display: 'Type 2 diabetes mellitus'
          }
        ]
      },
      subject: {
        reference: 'Patient/pat-repop'
      },
      onsetDateTime: '2015-02-12T12:00:00+00:00',
      abatementDateTime: '2025-06-30',
      recordedDate: '2015-02-12',
      recorder: {
        reference: 'PractitionerRole/bobrester-bob-gp'
      },
      asserter: {
        reference: 'PractitionerRole/bobrester-bob-gp'
      }
    },
    {
      resourceType: 'Condition',
      id: 'fever-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
      },
      text: {
        status: 'generated',
        div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Condition</b><a name="fever-pat-repop"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Condition &quot;fever-pat-repop&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-au-core-condition.html">AU Core Condition</a></p></div><p><b>clinicalStatus</b>: Resolved <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-clinical.html">Condition Clinical Status Codes</a>#resolved)</span></p><p><b>verificationStatus</b>: Confirmed <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-ver-status.html">ConditionVerificationStatus</a>#confirmed)</span></p><p><b>category</b>: Problem <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#55607006; <a href="http://terminology.hl7.org/5.3.0/CodeSystem-condition-category.html">Condition Category Codes</a>#problem-list-item)</span></p><p><b>severity</b>: Moderate <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#6736007)</span></p><p><b>code</b>: Fever <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#386661006)</span></p><p><b>subject</b>: <a href="Patient-pat-repop.html">Patient/pat-repop</a> &quot; FORM&quot;</p><p><b>onset</b>: 2015-02-11</p><p><b>abatement</b>: 2015-02-14</p><p><b>recordedDate</b>: 2015-02-12</p><p><b>recorder</b>: <a href="PractitionerRole-sandyson-sandy-nurse.html">PractitionerRole/sandyson-sandy-nurse</a></p><p><b>asserter</b>: <a href="PractitionerRole-sandyson-sandy-nurse.html">PractitionerRole/sandyson-sandy-nurse</a></p><h3>Evidences</h3><table class="grid"><tr><td style="display: none">-</td><td><b>Code</b></td><td><b>Detail</b></td></tr><tr><td style="display: none">*</td><td>degrees C <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#258710007)</span></td><td><a href="Observation-bodytemp-fever.html">Observation/bodytemp-fever: Temperature</a></td></tr></table></div>'
      },
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'resolved',
            display: 'Resolved'
          }
        ],
        text: 'Resolved'
      },
      verificationStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'confirmed',
            display: 'Confirmed'
          }
        ],
        text: 'Confirmed'
      },
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'problem-list-item'
            }
          ]
        }
      ],
      severity: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '6736007',
            display: 'Moderate'
          }
        ]
      },
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '63993003',
            display: 'Remittent fever'
          }
        ],
        text: 'Remittent fever'
      },
      subject: {
        reference: 'Patient/pat-repop'
      },
      onsetDateTime: '2015-02-11T00:00:00.000Z',
      abatementDateTime: '2015-02-14T00:00:00.000Z',
      recordedDate: '2015-02-12',
      recorder: {
        reference: 'Practitioner/levin-henry'
      },
      asserter: {
        reference: 'PractitionerRole/sandyson-sandy-nurse'
      },
      evidence: [
        {
          code: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '258710007',
                  display: 'degrees C'
                }
              ]
            }
          ],
          detail: [
            {
              reference: 'Observation/bodytemp-fever',
              display: 'Temperature'
            }
          ]
        }
      ]
    },
    {
      resourceType: 'Condition',
      id: '584a-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
      },
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'problem-list-item'
            }
          ],
          text: 'Problem'
        }
      ],
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '38341003',
            display: 'Hypertension'
          }
        ],
        text: 'Hypertension'
      },
      subject: {
        reference: 'Patient/pat-repop',
        type: 'Patient',
        display: 'Repopulate Tester'
      }
    },
    {
      resourceType: 'Condition',
      id: '613a-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-condition']
      },
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'resolved',
            display: 'Resolved'
          }
        ],
        text: 'Resolved'
      },
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'problem-list-item'
            }
          ],
          text: 'Problem'
        }
      ],
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '125605004',
            display: 'Fracture of bone'
          }
        ],
        text: 'Fracture of bone'
      },
      bodySite: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '720532008',
              display: 'Left ankle joint structure'
            }
          ],
          text: 'Left ankle joint structure'
        }
      ],
      subject: {
        reference: 'Patient/pat-repop',
        type: 'Patient',
        display: 'Repopulate Tester'
      },
      note: [
        {
          text: 'long time ago'
        }
      ]
    }
  ],
  MedicationStatementRepeat: [
    {
      resourceType: 'MedicationStatement',
      id: 'chloramphenicol-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-medicationstatement']
      },
      status: 'active',
      medicationCodeableConcept: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '22717011000036101',
            display: 'Chloramphenicol 1% eye ointment'
          }
        ],
        text: 'Chloramphenicol 1% eye ointment'
      },
      subject: {
        reference: 'Patient/pat-repop'
      },
      dateAsserted: '2024-02-05',
      reasonCode: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '128350005'
            }
          ],
          text: 'Bacterial conjunctivitis'
        }
      ],
      dosage: [
        {
          text: 'Apply 1 drop to each eye every 2 hours for 7 days'
        }
      ]
    },
    {
      resourceType: 'MedicationStatement',
      id: 'karvezide-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-medicationstatement']
      },
      status: 'active',
      medicationCodeableConcept: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '6554011000036100',
            display: 'Karvezide 300/12.5 tablet'
          }
        ],
        text: 'Karvezide 300/12.5 tablet (Blood pressure lowering medicine)'
      },
      subject: {
        reference: 'Patient/pat-repop'
      },
      dateAsserted: '2024-09-08',
      reasonCode: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '38341003'
            }
          ],
          text: 'Hypertension'
        }
      ],
      note: [
        {
          text: 'Review regularly for blood pressure control and side effects.'
        }
      ],
      dosage: [
        {
          text: 'Take one tablet per day.'
        }
      ]
    },
    {
      resourceType: 'MedicationStatement',
      id: 'intended-coq10-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-medicationstatement']
      },
      contained: [
        {
          resourceType: 'Medication',
          id: 'coq10',
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '920941011000036100',
                display: 'CoQ10 (Blackmores)'
              }
            ],
            text: 'CoQ10 150mg tab'
          }
        }
      ],
      status: 'active',
      medicationReference: {
        reference: '#coq10'
      },
      subject: {
        reference: 'Patient/pat-repop',
        identifier: {
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
          value: '8003608166895854'
        }
      },
      effectiveDateTime: '2023-06-25',
      dateAsserted: '2019-02-05',
      dosage: [
        {
          text: '1 at night'
        }
      ]
    },
    {
      resourceType: 'MedicationStatement',
      id: 'active-bisoprolol-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-medicationstatement']
      },
      status: 'active',
      medicationReference: {
        reference: 'Medication/bisoprolol-pat-repop'
      },
      subject: {
        reference: 'Patient/pat-repop'
      },
      dateAsserted: '2019-02-05',
      dosage: [
        {
          text: '1/2 tablet in the morning'
        }
      ]
    },
    {
      resourceType: 'MedicationStatement',
      id: 'hc-ms-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00'
      },
      status: 'active',
      medicationReference: {
        reference: 'Medication/hc-med-pat-repop'
      },
      subject: {
        reference: 'Patient/pat-repop'
      },
      effectiveDateTime: '2025-07-10T10:00:00+09:30',
      dateAsserted: '2025-07-10T10:00:00+09:30',
      reasonCode: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '271807003',
              display: 'Dermatitis'
            }
          ],
          text: 'For treatment of dermatitis'
        }
      ],
      note: [
        {
          text: 'Patient instructed to avoid contact with eyes.'
        }
      ],
      dosage: [
        {
          text: 'Apply a thin layer to affected area twice daily',
          site: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '39937001',
                display: 'Skin structure'
              }
            ]
          },
          route: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '6064005',
                display: 'Topical'
              }
            ]
          },
          doseAndRate: [
            {
              doseQuantity: {
                value: 1,
                unit: 'application',
                system: 'http://unitsofmeasure.org',
                code: 'application'
              }
            }
          ]
        }
      ]
    }
  ],
  AllergyIntoleranceRepeat: [
    {
      resourceType: 'AllergyIntolerance',
      id: '604a-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-allergyintolerance']
      },
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
            code: 'active'
          }
        ]
      },
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '412583005',
            display: 'Bee pollen'
          }
        ],
        text: 'Bee pollen'
      },
      patient: {
        reference: 'Patient/pat-repop',
        type: 'Patient',
        display: 'Mrs. Repopulate Tester'
      },
      note: [
        {
          text: 'comment'
        }
      ],
      reaction: [
        {
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '271807003',
                  display: 'Rash'
                }
              ],
              text: 'Rash'
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '614a-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-allergyintolerance']
      },
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
            code: 'active'
          }
        ]
      },
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '228659004',
            display: 'Dried flowers'
          }
        ],
        text: 'Dried flowers'
      },
      patient: {
        reference: 'Patient/pat-repop',
        type: 'Patient',
        display: 'Mrs. Repopulate Tester'
      },
      note: [
        {
          text: 'Hayfever'
        }
      ],
      reaction: [
        {
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '76067001',
                  display: 'Sneezing'
                }
              ],
              text: 'Sneezing'
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: '676a-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-allergyintolerance']
      },
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
            code: 'active'
          }
        ]
      },
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '256259004',
            display: 'Pollen'
          }
        ],
        text: 'Pollen'
      },
      patient: {
        reference: 'Patient/pat-repop',
        type: 'Patient',
        display: 'Mrs. Repopulate Tester'
      },
      reaction: [
        {
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '76067001',
                  display: 'Sneezing'
                }
              ],
              text: 'Sneezing'
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: 'allergyintolerance-aspirin-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-allergyintolerance']
      },
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
            code: 'active'
          }
        ],
        text: 'Active'
      },
      verificationStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
            code: 'confirmed'
          }
        ],
        text: 'Confirmed'
      },
      category: ['medication'],
      criticality: 'unable-to-assess',
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '38268001'
          }
        ],
        text: 'Ibuprofen'
      },
      patient: {
        reference: 'Patient/pat-repop'
      },
      recordedDate: '2024-02-10',
      recorder: {
        reference: 'Practitioner/primary-peter'
      },
      asserter: {
        reference: 'Practitioner/primary-peter'
      },
      reaction: [
        {
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '271807003'
                }
              ],
              text: 'Rash'
            }
          ],
          severity: 'moderate',
          note: [
            {
              text: 'Patient experienced a rash after taking Ibuprofen.'
            }
          ]
        }
      ]
    },
    {
      resourceType: 'AllergyIntolerance',
      id: 'penicillin-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-allergyintolerance']
      },
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
            code: 'active',
            display: 'Active'
          }
        ]
      },
      criticality: 'high',
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '764146007',
            display: 'Penicillin'
          }
        ]
      },
      patient: {
        reference: 'Patient/pat-repop'
      },
      recordedDate: '1999-08-25',
      note: [
        {
          text: 'The criticality is high due to a documented episode of hives following penicillin administration.'
        }
      ],
      reaction: [
        {
          manifestation: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '247472004',
                  display: 'Hives'
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  ImmunizationRepeat: [
    {
      resourceType: 'Immunization',
      id: '606a-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-immunization']
      },
      status: 'completed',
      vaccineCode: {
        coding: [
          {
            system:
              'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
            version: '20240207',
            code: 'COVAST',
            display: 'AstraZeneca Vaxzevria'
          }
        ],
        text: 'AstraZeneca Vaxzevria'
      },
      patient: {
        reference: 'Patient/pat-repop',
        type: 'Patient',
        display: 'Mrs. Repopulate Tester'
      },
      occurrenceDateTime: '2025-01-15',
      note: [
        {
          text: 'comment'
        }
      ],
      protocolApplied: [
        {
          doseNumberString: '2'
        }
      ]
    },
    {
      resourceType: 'Immunization',
      id: '609a-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-immunization']
      },
      status: 'completed',
      vaccineCode: {
        coding: [
          {
            system:
              'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
            version: '20240207',
            code: 'COVAST',
            display: 'AstraZeneca Vaxzevria'
          }
        ],
        text: 'AstraZeneca Vaxzevria'
      },
      patient: {
        reference: 'Patient/pat-repop',
        type: 'Patient',
        display: 'Mrs. Repopulate Tester'
      },
      occurrenceDateTime: '2020-12-15',
      note: [
        {
          text: 'first one'
        }
      ],
      protocolApplied: [
        {
          doseNumberString: '1'
        }
      ]
    },
    {
      resourceType: 'Immunization',
      id: '432a-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-immunization']
      },
      status: 'completed',
      vaccineCode: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107/version/20250131',
            code: '837621000168102',
            display: 'Diphtheria + tetanus + pertussis 3 component vaccine'
          }
        ],
        text: 'Diphtheria + tetanus + pertussis 3 component vaccine'
      },
      patient: {
        reference: 'Patient/pat-repop',
        type: 'Patient',
        display: 'Mrs. Repopulate Tester'
      },
      note: [
        {
          text: 'test'
        }
      ],
      protocolApplied: [
        {
          doseNumberString: '3'
        }
      ]
    },
    {
      resourceType: 'Immunization',
      id: 'covid-2-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-immunization']
      },
      status: 'completed',
      vaccineCode: {
        coding: [
          {
            system:
              'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
            code: 'COMIRN'
          },
          {
            system: 'http://snomed.info/sct',
            code: '1525011000168107',
            display: 'Comirnaty'
          }
        ],
        text: 'Pfizer Comirnaty'
      },
      patient: {
        reference: 'Patient/pat-repop'
      },
      occurrenceDateTime: '2021-07-15',
      recorded: '2021-07-15',
      primarySource: true,
      manufacturer: {
        display: 'Pfizer Australia Ltd'
      },
      lotNumber: '300000000P',
      site: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '368208006',
            display: 'Structure of left upper arm'
          }
        ],
        text: 'Left upper arm'
      },
      note: [
        {
          text: 'Second dose of Comirnaty vaccine administered.'
        }
      ]
    },
    {
      resourceType: 'Immunization',
      id: 'covid-1-pat-repop',
      meta: {
        versionId: '1',
        lastUpdated: '2025-07-30T04:53:53.420+00:00',
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-immunization']
      },
      status: 'completed',
      vaccineCode: {
        coding: [
          {
            system:
              'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
            code: 'COMIRN'
          },
          {
            system: 'http://snomed.info/sct',
            code: '1525011000168107',
            display: 'Comirnaty'
          }
        ],
        text: 'Pfizer Comirnaty'
      },
      patient: {
        reference: 'Patient/pat-repop'
      },
      occurrenceDateTime: '2021-06-17',
      recorded: '2021-06-17',
      primarySource: true,
      manufacturer: {
        display: 'Pfizer Australia Ltd'
      },
      lotNumber: '200000000P',
      site: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '368208006',
            display: 'Structure of left upper arm'
          }
        ],
        text: 'Left upper arm'
      },
      note: [
        {
          text: 'First dose of Comirnaty vaccine administered.'
        }
      ]
    }
  ]
};
