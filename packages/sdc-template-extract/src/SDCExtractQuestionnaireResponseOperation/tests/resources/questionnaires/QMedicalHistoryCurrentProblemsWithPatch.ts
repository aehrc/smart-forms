import type { Questionnaire } from 'fhir/r4';

export const QMedicalHistoryCurrentProblemsWithPatch: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'MedicalHistoryCurrentProblemsWithPatch',
  meta: {
    versionId: '1',
    lastUpdated: '2025-05-23T05:57:50.522+00:00',
    source: '#Bt6moCWZmWbVDeEY',
    profile: [
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-modular',
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-pop-exp',
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-render'
    ]
  },
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'condition-clinical',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-wg',
          valueCode: 'pc'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status',
          valueCode: 'trial-use'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-fmm',
          valueInteger: 3
        }
      ],
      url: 'http://hl7.org/fhir/ValueSet/condition-clinical',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:2.16.840.1.113883.4.642.3.164'
        }
      ],
      version: '4.0.1',
      name: 'ConditionClinicalStatusCodes',
      title: 'Condition Clinical Status Codes',
      status: 'draft',
      experimental: false,
      date: '2019-11-01T09:29:23+11:00',
      publisher: 'FHIR Project team',
      contact: [
        {
          telecom: [
            {
              system: 'url',
              value: 'http://hl7.org/fhir'
            }
          ]
        }
      ],
      description: 'Preferred value set for Condition Clinical Status.',
      copyright: 'Copyright © 2011+ HL7. Licensed under Creative Commons "No Rights Reserved".',
      compose: {
        include: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical'
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:7b100d21-fde9-4fd8-bded-80f345db777d',
        timestamp: '2025-05-01T10:00:56+10:00',
        total: 7,
        offset: 0,
        parameter: [
          {
            name: 'displayLanguage',
            valueCode: 'en-US'
          },
          {
            name: 'count',
            valueInteger: 1000
          },
          {
            name: 'offset',
            valueInteger: 0
          },
          {
            name: 'excludeNested',
            valueBoolean: false
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://terminology.hl7.org/CodeSystem/condition-clinical|3.0.0'
          }
        ],
        contains: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active',
            display: 'Active',
            contains: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'recurrence',
                display: 'Recurrence'
              },
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'relapse',
                display: 'Relapse'
              }
            ]
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'inactive',
            display: 'Inactive',
            contains: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'remission',
                display: 'Remission'
              },
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'resolved',
                display: 'Resolved'
              }
            ]
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'unknown',
            display: 'Unknown'
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'clinical-condition-1',
      meta: {
        profile: [
          'http://hl7.org/fhir/StructureDefinition/shareablevalueset',
          'https://healthterminologies.gov.au/fhir/StructureDefinition/composed-value-set-4'
        ]
      },
      url: 'https://healthterminologies.gov.au/fhir/ValueSet/clinical-condition-1',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:1.2.36.1.2001.1004.201.10035'
        }
      ],
      version: '1.0.2',
      name: 'ClinicalCondition',
      title: 'Clinical Condition',
      status: 'active',
      experimental: false,
      date: '2020-05-31',
      publisher: 'Australian Digital Health Agency',
      contact: [
        {
          telecom: [
            {
              system: 'email',
              value: 'help@digitalhealth.gov.au'
            }
          ]
        }
      ],
      description:
        'The Clinical Condition value set includes values that cover a broad range of clinical concepts to support the representation of conditions, including problems, diagnoses and disorders.',
      copyright:
        'Copyright © 2018 Australian Digital Health Agency - All rights reserved. Except for the material identified below, this content is licensed under a Creative Commons Attribution 4.0 International License. See https://creativecommons.org/licenses/by/4.0/. \n\nThis resource includes SNOMED Clinical Terms™ (SNOMED CT®) which is used by permission of the International Health Terminology Standards Development Organisation (IHTSDO). All rights reserved. SNOMED CT®, was originally created by The College of American Pathologists. “SNOMED” and “SNOMED CT” are registered trademarks of the IHTSDO. \n\nThe rights to use and implement or implementation of SNOMED CT content are limited to the extent it is necessary to allow for the end use of this material.  No further rights are granted in respect of the International Release and no further use of any SNOMED CT content by any other party is permitted. \n\nAll copies of this resource must include this copyright statement and all information contained in this statement.',
      compose: {
        include: [
          {
            system: 'http://snomed.info/sct',
            filter: [
              {
                property: 'concept',
                op: 'in',
                value: '32570581000036105'
              }
            ]
          }
        ]
      }
    },
    {
      resourceType: 'Parameters',
      id: 'ConditionPatchTemplate',
      parameter: [
        {
          name: 'operation',
          part: [
            { name: 'type', valueCode: 'replace' },
            { name: 'path', valueString: 'Condition.clinicalStatus' },
            {
              name: 'value',
              valueCodeableConcept: {
                coding: [
                  {
                    extension: [
                      {
                        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                        valueString:
                          "item.where(linkId='a7e056be-fb6f-4f7f-b04d-5b809e1e18e3').answer.value.first()"
                      }
                    ]
                  }
                ],
                // @ts-ignore - TS2741: Property text is missing in type. This is a template so we can get away with no "text" field
                _text: {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                      valueString:
                        "item.where(linkId='a7e056be-fb6f-4f7f-b04d-5b809e1e18e3').answer.value.first().display"
                    }
                  ]
                }
              }
            }
          ]
        }
      ]
    }
  ],
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assemble-expectation',
      valueCode: 'assemble-child'
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
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'user'
          }
        },
        {
          url: 'type',
          valueCode: 'Practitioner'
        },
        {
          url: 'description',
          valueString: 'The practitioner user that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'encounter'
          }
        },
        {
          url: 'type',
          valueCode: 'Encounter'
        },
        {
          url: 'description',
          valueString: 'The encounter that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assembleContext',
      valueString: 'age'
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assembleContext',
      valueString: 'Condition'
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'Condition',
        language: 'application/x-fhir-query',
        expression: 'Condition?patient={{%patient.id}}'
      }
    }
  ],
  url: 'http://www.health.gov.au/assessments/mbs/715/MedicalHistoryCurrentProblems',
  name: 'MedicalHistoryCurrentProblems',
  title: 'Aboriginal and Torres Strait Islander Health Check - Medical History',
  status: 'draft',
  experimental: false,
  subjectType: ['Patient'],
  date: '2025-03-14',
  jurisdiction: [
    {
      coding: [
        {
          system: 'urn:iso:std:iso:3166',
          code: 'AU'
        }
      ]
    }
  ],
  item: [
    {
      linkId: '28d5dbe4-1e65-487c-847a-847f544a6a91',
      text: 'Medical history and current problems',
      type: 'group',
      repeats: false,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system:
                      'https://smartforms.csiro.au/ig/CodeSystem/QuestionnaireItemControlExtended',
                    code: 'context-display'
                  }
                ]
              }
            }
          ],
          linkId: 'CD-in-progress-17',
          text: 'In progress',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div title="In progress" xmlns="http://www.w3.org/1999/xhtml">\r\n\t<div style="display: flex; flex-direction: row;">\r\n\t\t<img width=\'24\' height=\'24\' src=\'data:image/svg+xml;base64,\r\n\t\tPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiM3NTc1NzUiIGQ9Im0xNS44NCAxMC4ybC0xLjAxIDEuMDFsLTIuMDctMi4wM2wxLjAxLTEuMDJjLjItLjIxLjU0LS4yMi43OCAwbDEuMjkgMS4yNWMuMjEuMjEuMjIuNTUgMCAuNzlNOCAxMy45MWw0LjE3LTQuMTlsMi4wNyAyLjA4bC00LjE2IDQuMkg4di0yLjA5TTEzIDJ2MmM0LjM5LjU0IDcuNSA0LjUzIDYuOTYgOC45MkE4LjAxNCA4LjAxNCAwIDAgMSAxMyAxOS44OHYyYzUuNS0uNiA5LjQ1LTUuNTQgOC44NS0xMS4wM0MyMS4zMyA2LjE5IDE3LjY2IDIuNSAxMyAybS0yIDBjLTEuOTYuMTgtMy44MS45NS01LjMzIDIuMkw3LjEgNS43NGMxLjEyLS45IDIuNDctMS40OCAzLjktMS42OHYtMk00LjI2IDUuNjdBOS44MSA5LjgxIDAgMCAwIDIuMDUgMTFoMmMuMTktMS40Mi43NS0yLjc3IDEuNjQtMy45TDQuMjYgNS42N00yLjA2IDEzYy4yIDEuOTYuOTcgMy44MSAyLjIxIDUuMzNsMS40Mi0xLjQzQTguMDAyIDguMDAyIDAgMCAxIDQuMDYgMTNoLTJtNSA1LjM3bC0xLjM5IDEuMzdBOS45OTQgOS45OTQgMCAwIDAgMTEgMjJ2LTJhOC4wMDIgOC4wMDIgMCAwIDEtMy45LTEuNjNoLS4wNFoiLz48L3N2Zz4=\' \r\n\t\tstyle="align-self: center;"/>\r\n\t</div>\r\n</div>'
              }
            ]
          },
          type: 'display',
          enableWhen: [
            {
              question: 'MarkComplete-17',
              operator: '!=',
              answerBoolean: true
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
                    system:
                      'https://smartforms.csiro.au/ig/CodeSystem/QuestionnaireItemControlExtended',
                    code: 'context-display'
                  }
                ]
              }
            }
          ],
          linkId: 'CD-complete-17',
          text: 'Complete',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div title="Section completed" xmlns="http://www.w3.org/1999/xhtml">\r\n\t<div style="display: flex; flex-direction: row;">\r\n\t\t<img width=\'24\' height=\'24\' src=\'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiMyZTdkMzIiIGQ9Ik0yMCAxMmE4IDggMCAwIDEtOCA4YTggOCAwIDAgMS04LThhOCA4IDAgMCAxIDgtOGMuNzYgMCAxLjUuMTEgMi4yLjMxbDEuNTctMS41N0E5LjgyMiA5LjgyMiAwIDAgMCAxMiAyQTEwIDEwIDAgMCAwIDIgMTJhMTAgMTAgMCAwIDAgMTAgMTBhMTAgMTAgMCAwIDAgMTAtMTBNNy45MSAxMC4wOEw2LjUgMTEuNUwxMSAxNkwyMSA2bC0xLjQxLTEuNDJMMTEgMTMuMTdsLTMuMDktMy4wOVoiLz48L3N2Zz4=\'\r\n\t\tstyle="align-self: center;"/>\r\n\t</div>\r\n</div>'
              }
            ]
          },
          type: 'display',
          enableWhen: [
            {
              question: 'MarkComplete-17',
              operator: '=',
              answerBoolean: true
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%age <= 5'
              }
            }
          ],
          linkId: 'b9de2b58-55e2-436d-95ab-49600508cdf7',
          text: 'Birth history',
          type: 'group',
          repeats: false,
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                  valueCoding: {
                    system: 'http://unitsofmeasure.org',
                    code: 'wk'
                  }
                }
              ],
              linkId: 'a10a7375-e9d3-4e71-a47a-282e9ba38ec1',
              text: 'Gestation at birth',
              type: 'decimal',
              repeats: false,
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                      valueCodeableConcept: {
                        coding: [
                          {
                            system: 'http://hl7.org/fhir/questionnaire-item-control',
                            code: 'unit'
                          }
                        ]
                      }
                    }
                  ],
                  linkId: 'f3899852-36c4-441f-9a7d-544ef1617f08',
                  text: 'weeks',
                  type: 'display'
                }
              ]
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                  valueCoding: {
                    system: 'http://unitsofmeasure.org',
                    code: 'kg'
                  }
                }
              ],
              linkId: '29b6d8ea-23b2-4a69-98d9-899198692de7',
              text: 'Birth weight',
              type: 'decimal',
              repeats: false,
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                      valueCodeableConcept: {
                        coding: [
                          {
                            system: 'http://hl7.org/fhir/questionnaire-item-control',
                            code: 'unit'
                          }
                        ]
                      }
                    }
                  ],
                  linkId: '87cf1ecd-6d1b-4de1-894d-58bd77dcfde1',
                  text: 'kg',
                  type: 'display'
                }
              ]
            }
          ]
        },
        {
          linkId: 'medicalhistoryinstruction',
          text: 'Medical history summary',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <p>Medical history summary</p>\r\n    <p style="font-size:0.9em; font-weight:normal"><em>This section includes a list of existing items from the patient record. To update existing items, update the patient record and repopulate this form. To enter new items, add them at the bottom.</em></p>\r\n    </div>'
              }
            ]
          },
          type: 'group',
          item: [
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
              linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
              type: 'group',
              repeats: true,
              readOnly: true,
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
                  linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                  text: 'Condition',
                  type: 'open-choice',
                  answerValueSet: '#clinical-condition-1'
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
                  linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                  text: 'Clinical Status',
                  type: 'choice',
                  answerValueSet: '#condition-clinical'
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%ConditionRepeat.onset.ofType(dateTime)'
                      }
                    }
                  ],
                  linkId: '6ae641ad-95bb-4cdc-8910-5a52077e492c',
                  text: 'Onset Date',
                  type: 'date'
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%ConditionRepeat.abatement.ofType(dateTime)'
                      }
                    }
                  ],
                  linkId: 'e4524654-f6de-4717-b288-34919394d46b',
                  text: 'Abatement Date',
                  type: 'date'
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
                },
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
                  extension: [
                    {
                      url: 'template',
                      valueReference: {
                        reference: '#ConditionPatchTemplate'
                      }
                    },
                    {
                      url: 'https://smartforms.csiro.au/ig/StructureDefinition/TemplateExtractExtensionPatchRequestUrl',
                      valueString: "'Condition/' + item.where(linkId='conditionId').answer.value"
                    }
                  ]
                }
              ],
              linkId: 'newdiagnosis',
              type: 'group',
              repeats: true,
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                      valueBoolean: true
                    },
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%ConditionRepeat.id'
                      }
                    }
                  ],
                  linkId: 'conditionId',
                  type: 'string'
                },
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
                  linkId: '2da85994-2d5e-42f1-8a81-abf44f397468',
                  text: 'Condition',
                  type: 'open-choice',
                  answerValueSet: '#clinical-condition-1'
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
                  linkId: 'a7e056be-fb6f-4f7f-b04d-5b809e1e18e3',
                  text: 'Clinical Status',
                  type: 'choice',
                  answerValueSet: '#condition-clinical'
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%ConditionRepeat.onset.ofType(dateTime)'
                      }
                    }
                  ],
                  linkId: '4d55bffb-3286-4a23-a785-3b9c346d464d',
                  text: 'Onset Date',
                  type: 'date'
                }
              ]
            }
          ]
        },
        {
          linkId: '62774152-8a6e-4449-af9f-87bdce8b9bf5',
          text: 'Health priorities, actions and follow-up',
          type: 'text',
          repeats: false
        },
        {
          linkId: 'MarkComplete-17',
          text: 'Mark section as complete',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n<head>\r\n    <style type="text/css">\r\n        .alert {\r\n            padding: 0.875rem;\r\n            margin-bottom: 1rem;\r\n            font-size: 0.875rem;\r\n            color: #2E7D32;\r\n            border-radius: 0.5rem;\r\n            background-color: #d5e5d6;\r\n            font-weight: 700;\r\n        }\r\n    </style>\r\n</head>\r\n<body>\r\n<div class="alert">Mark section as complete</div>\r\n</body>\r\n</div>'
              }
            ]
          },
          type: 'boolean',
          repeats: false
        }
      ]
    }
  ]
};
