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

import type { Questionnaire } from 'fhir/r4';

export const qSelectivePrePopTester: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'SelectivePrePopTester',
  name: 'SelectivePrePopTester',
  title: 'Selective Pre-pop Tester',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/tester/prepop-1',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'administrative-gender',
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/shareablevalueset']
      },
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-wg',
          valueCode: 'pa'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status',
          valueCode: 'normative'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-fmm',
          valueInteger: 5
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-normative-version',
          valueCode: '4.0.0'
        }
      ],
      url: 'http://hl7.org/fhir/ValueSet/administrative-gender',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:2.16.840.1.113883.4.642.3.1'
        }
      ],
      version: '4.0.1',
      name: 'AdministrativeGender',
      title: 'AdministrativeGender',
      status: 'active',
      experimental: false,
      date: '2019-11-01T09:29:23+11:00',
      publisher: 'HL7 (FHIR Project)',
      contact: [
        {
          telecom: [
            {
              system: 'url',
              value: 'http://hl7.org/fhir'
            },
            {
              system: 'email',
              value: 'fhir@lists.hl7.org'
            }
          ]
        }
      ],
      description: 'The gender of a person used for administrative purposes.',
      immutable: true,
      copyright: 'Copyright © 2011+ HL7. Licensed under Creative Commons "No Rights Reserved".',
      compose: {
        include: [
          {
            system: 'http://hl7.org/fhir/administrative-gender'
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:50f050c9-3975-48d6-bdb7-baae4ebc70cd',
        timestamp: '2024-04-05T12:31:27+10:00',
        total: 4,
        parameter: [
          {
            name: 'version',
            valueUri: 'http://hl7.org/fhir/administrative-gender|4.0.1'
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://hl7.org/fhir/administrative-gender|4.0.1'
          }
        ],
        contains: [
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'female',
            display: 'Female'
          },
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'male',
            display: 'Male'
          },
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'other',
            display: 'Other'
          },
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'unknown',
            display: 'Unknown'
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'MedicalHistory',
      url: 'https://smartforms.csiro.au/ig/ValueSet/MedicalHistory',
      name: 'MedicalHistory',
      title: 'Medical History',
      status: 'draft',
      experimental: false,
      description:
        'The Medical History value set includes values that may be used to represent medical history, operations and hospital admissions.',
      compose: {
        include: [
          {
            system: 'http://snomed.info/sct',
            filter: [
              {
                property: 'constraint',
                op: '=',
                value:
                  '^32570581000036105|Problem/Diagnosis reference set| OR ^32570141000036105|Procedure foundation reference set|'
              }
            ]
          }
        ]
      }
    }
  ],
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'Condition',
        language: 'application/x-fhir-query',
        expression: 'Condition?patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBloodPressure',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=75367002&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsTobaccoSmokingStatus',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=72166-2&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    }
  ],
  item: [
    {
      linkId: 'container',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'sex',
            language: 'text/fhirpath',
            expression: "item.where(linkId='sex-at-birth-initial-expression').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'smoker',
            language: 'text/fhirpath',
            expression: "item.where(linkId='smoking-status-initial-expression').answer.value"
          }
        }
      ],
      text: '',
      type: 'group',
      item: [
        {
          linkId: 'display-description',
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
              valueString:
                '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <div style="font-size:0.875em"> This questionnaire is used by Playwright to do regression testing of the <pre style="display: inline">@aehrc/sdc-populate</pre> library\'s pre-population logic. Items will be incrementally added as needed.</div><br/></div>'
            }
          ],
          text: "This questionnaire is used by Playwright to do regression testing of the @aehrc/sdc-populate library's pre-population logic. Items will be incrementally added as needed.",
          type: 'display',
          repeats: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%patient.gender'
              }
            }
          ],
          linkId: 'gender-avs-url',
          text: 'Administrative gender (answerValueSet url)',
          type: 'choice',
          repeats: false,
          answerValueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%patient.gender'
              }
            }
          ],
          linkId: 'gender-avs-contained',
          text: 'Administrative gender (answerValueSet contained)',
          type: 'choice',
          repeats: false,
          answerValueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%patient.extension.where(exists(url='http://hl7.org/fhir/StructureDefinition/individual-recordedSexOrGender' and extension.where(exists(url='type' and value.coding.code='1515311000168102')) and extension.where(url='effectivePeriod').value.end.empty())).extension.where(url='value').value.coding"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'drop-down'
                  }
                ]
              }
            }
          ],
          linkId: 'sex-at-birth-initial-expression',
          text: 'Sex assigned at birth (initialExpression)',
          type: 'choice',
          repeats: false,
          answerValueSet: 'https://healthterminologies.gov.au/fhir/ValueSet/biological-sex-1'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
              valueExpression: {
                description: 'Calculated Sex At Birth',
                language: 'text/fhirpath',
                expression: '%sex'
              }
            }
          ],
          linkId: 'sex-at-birth-calculated',
          text: 'Sex assigned at birth (calculatedExpression)',
          type: 'choice',
          repeats: false,
          readOnly: true,
          answerValueSet: 'https://healthterminologies.gov.au/fhir/ValueSet/biological-sex-1'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ObsTobaccoSmokingStatus.entry.resource.value.coding.where(system='http://snomed.info/sct')"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'radio-button'
                  }
                ]
              }
            }
          ],
          linkId: 'smoking-status-initial-expression',
          text: 'Smoking status (initialExpression)',
          type: 'choice',
          repeats: false,
          answerOption: [
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '266919005',
                display: 'Never smoked'
              }
            },
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '77176002',
                display: 'Smoker'
              }
            },
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '8517006',
                display: 'Ex-smoker'
              }
            },
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '16090371000119103',
                display: 'Exposure to second hand tobacco smoke'
              }
            },
            {
              valueString: 'Wants to quit'
            },
            {
              valueString: 'Other tobacco use'
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
              valueExpression: {
                description: 'Calculated Smoking Status',
                language: 'text/fhirpath',
                expression: '%smoker'
              }
            }
          ],
          linkId: 'smoking-status-calculated',
          text: 'Smoking status (calculatedExpression)',
          type: 'choice',
          repeats: false,
          readOnly: true,
          answerOption: [
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '266919005',
                display: 'Never smoked'
              }
            },
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '77176002',
                display: 'Smoker'
              }
            },
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '8517006',
                display: 'Ex-smoker'
              }
            },
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '16090371000119103',
                display: 'Exposure to second hand tobacco smoke'
              }
            },
            {
              valueString: 'Wants to quit'
            },
            {
              valueString: 'Other tobacco use'
            }
          ]
        },
        {
          linkId: 'blood-pressure-unit-fixed',
          text: 'Blood Pressure',
          type: 'quantity',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsBloodPressure.entry[0].resource.component[0].value'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: 'mm[Hg]',
                display: 'mmHg'
              }
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'gtable'
                  }
                ]
              }
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
              valueExpression: {
                name: 'ConditionRepeat',
                language: 'text/fhirpath',
                expression:
                  "%Condition.entry.resource.where(category.coding.exists(code='problem-list-item'))"
              }
            }
          ],
          linkId: 'medical-history',
          text: 'Medical history and current problems list',
          type: 'group',
          repeats: true,
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [
                      {
                        system: 'http://hl7.org/fhir/questionnaire-item-control',
                        code: 'autocomplete'
                      }
                    ]
                  }
                },
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%ConditionRepeat.code.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())"
                  }
                }
              ],
              linkId: 'medical-history-condition',
              text: 'Condition',
              type: 'open-choice',
              answerValueSet: '#MedicalHistory'
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [
                      {
                        system: 'http://hl7.org/fhir/questionnaire-item-control',
                        code: 'drop-down'
                      }
                    ]
                  }
                },
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%ConditionRepeat.clinicalStatus.coding'
                  }
                }
              ],
              linkId: 'medical-history-status',
              text: 'Clinical Status',
              type: 'choice',
              answerValueSet: 'http://hl7.org/fhir/ValueSet/condition-clinical'
            }
          ]
        }
      ]
    }
  ]
};
