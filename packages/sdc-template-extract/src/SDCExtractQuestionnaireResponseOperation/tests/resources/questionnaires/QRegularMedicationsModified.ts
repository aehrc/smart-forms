import type { Questionnaire } from 'fhir/r4';

// This questionnaire includes static template data that should be preserved in the extracted resources
// i.e. dummy-extension-coding and dummy-extension-text
export const QRegularMedicationsModified: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RegularMedications-modified',
  meta: {
    versionId: '1',
    lastUpdated: '2025-05-27T10:35:10.049+00:00',
    source: '#Rnzn6IfMZDvAGShP',
    profile: [
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-modular',
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-pop-exp',
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-render'
    ]
  },
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'YesNo',
      url: 'https://smartforms.csiro.au/ig/ValueSet/YesNo',
      name: 'YesNo',
      title: 'Yes/No',
      status: 'draft',
      experimental: false,
      description: 'Concepts for Yes and No',
      compose: {
        include: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            concept: [
              {
                code: 'Y',
                display: 'Yes'
              },
              {
                code: 'N',
                display: 'No'
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:41cccc66-fd57-4bc4-bab1-8c5c878d95f7',
        timestamp: '2025-05-01T10:00:50+10:00',
        total: 2,
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
            valueUri: 'http://terminology.hl7.org/CodeSystem/v2-0532|2.1.0'
          }
        ],
        contains: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'Y',
            display: 'Yes'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'N',
            display: 'No'
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'smarthealthchecks-medication',
      meta: {
        profile: [
          'http://hl7.org/fhir/StructureDefinition/shareablevalueset',
          'https://healthterminologies.gov.au/fhir/StructureDefinition/composed-value-set-4'
        ]
      },
      url: 'https://smartforms.csiro.au/ig/ValueSet/smarthealthchecks-medication',
      name: 'SmartHealthChecksMedication',
      title: 'Smart Health Checks Medication',
      status: 'draft',
      experimental: false,
      description:
        'The Smart Health Checks Medication value set includes Australian Medicines Terminology (AMT) product concepts that may be used for the identification of a medicine with form, ingredient and unit of measure details.',
      compose: {
        include: [
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107',
            filter: [
              {
                property: 'constraint',
                op: '=',
                value:
                  '^ 929360081000036101|Medicinal product pack reference set| OR ^ 929360071000036103|Medicinal product unit of use reference set| OR ^ 929360041000036105|Trade product pack reference set| OR ^ 929360031000036100|Trade product unit of use reference set| OR ^ 929360051000036108|Containered trade product pack reference set|'
              }
            ]
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'medication-reason-taken-1',
      meta: {
        profile: [
          'http://hl7.org/fhir/StructureDefinition/shareablevalueset',
          'https://healthterminologies.gov.au/fhir/StructureDefinition/composed-value-set-4'
        ]
      },
      url: 'https://healthterminologies.gov.au/fhir/ValueSet/medication-reason-taken-1',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:1.2.36.1.2001.1004.201.10048'
        }
      ],
      version: '1.1.0',
      name: 'MedicationReasonTaken',
      title: 'Medication Reason Taken',
      status: 'active',
      experimental: false,
      date: '2020-07-31',
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
        'The Medication Reason Taken value set includes values that identify a reason why a medication has been or is being taken.',
      copyright:
        'Copyright © 2020 Australian Digital Health Agency - All rights reserved. Except for the material identified below, this content is licensed under a Creative Commons Attribution 4.0 International License. See https://creativecommons.org/licenses/by/4.0/. \n\nThis resource includes SNOMED Clinical Terms™ (SNOMED CT®) which is used by permission of the International Health Terminology Standards Development Organisation (IHTSDO). All rights reserved. SNOMED CT®, was originally created by The College of American Pathologists. “SNOMED” and “SNOMED CT” are registered trademarks of the IHTSDO. \n\nThe rights to use and implement or implementation of SNOMED CT content are limited to the extent it is necessary to allow for the end use of this material.  No further rights are granted in respect of the International Release and no further use of any SNOMED CT content by any other party is permitted.\n\nAll copies of this resource must include this copyright statement and all information contained in this statement.',
      compose: {
        include: [
          {
            system: 'http://snomed.info/sct',
            filter: [
              {
                property: 'constraint',
                op: '=',
                value:
                  '^ 32570581000036105|Problem/Diagnosis reference set| OR ^ 1184831000168105|Drug prophylaxis reference set| OR << 399097000|Administration of anaesthesia| OR 169443000|Preventive procedure|'
              }
            ]
          }
        ]
      }
    },
    {
      resourceType: 'MedicationStatement',
      id: 'MedicationStatementTemplate',
      meta: {
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-medicationstatement']
      },
      status: 'active',
      medicationCodeableConcept: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
            valueString:
              "item.where(linkId='regularmedications-summary-new-medication').answer.value"
          }
        ],
        coding: [
          {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: 'ofType(Coding)'
              }
            ]
          }
        ],
        _text: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: 'ofType(string)'
            }
          ]
        }
      },
      subject: {
        _reference: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: '%resource.subject.reference'
            }
          ]
        }
      },
      _dateAsserted: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: 'now()'
          }
        ]
      },
      reasonCode: [
        {
          text: 'I am a dummy CodeableConcept'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
              valueString:
                "item.where(linkId='regularmedications-summary-new-reasoncode').answer.value.ofType(Coding)"
            },
            {
              url: 'dummy-extension-coding',
              valueString: 'I am a dummy extension for coding'
            }
          ],
          coding: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                  valueString: '$this'
                }
              ]
            }
          ]
        },
        {
          text: 'I am also a dummy CodeableConcept'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
              valueString:
                "item.where(linkId='regularmedications-summary-new-reasoncode').answer.value.ofType(string)"
            },
            {
              url: 'dummy-extension-text',
              valueString: 'I am a dummy extension for text'
            }
          ],
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: '$this'
              }
            ]
          }
        }
      ],
      note: [
        // @ts-ignore - TS2741: Property text is missing in type. This is a template so we can get away with no "text" field
        {
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString:
                  "item.where(linkId='regularmedications-summary-new-comment').answer.value"
              }
            ]
          }
        }
      ],
      dosage: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
              valueString: "item.where(linkId='regularmedications-summary-new-dosage').answer.value"
            }
          ],
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: '$this'
              }
            ]
          }
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
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'MedicationStatement',
        language: 'application/x-fhir-query',
        expression: 'MedicationStatement?patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assembleContext',
      valueString: 'age'
    }
  ],
  url: 'http://www.health.gov.au/assessments/mbs/715/RegularMedications',
  name: 'RegularMedications',
  title: 'Aboriginal and Torres Strait Islander Health Check - Regular Medications',
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
      linkId: '7dfe7c6a-ca7f-4ddf-9241-a7b918a9695a',
      text: 'Regular medications',
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
          linkId: 'CD-in-progress-23',
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
              question: 'MarkComplete-23',
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
          linkId: 'CD-complete-23',
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
              question: 'MarkComplete-23',
              operator: '=',
              answerBoolean: true
            }
          ]
        },
        {
          linkId: 'regularmedications-instruction',
          text: 'Check medications are still required, appropriate dose, understanding of medication and adherence',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n      <em>Check medications are still required, appropriate dose, understanding of medication and adherence</em>\r\n    </div>'
              }
            ]
          },
          type: 'display'
        },
        {
          linkId: 'regularmedications-summary',
          text: 'Medication summary',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n<p>Medication summary</p>\r\n<p style="font-size:0.9em; font-weight:normal"><em>This section includes a list of existing items from the patient record. To update existing items, update the patient record and repopulate this form. To enter new items, add them at the bottom.</em></p>\r\n</div>'
              }
            ]
          },
          type: 'group',
          repeats: false,
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
                  valueExpression: {
                    name: 'MedicationStatementRepeat',
                    language: 'text/fhirpath',
                    expression: '%MedicationStatement.entry.resource'
                  }
                }
              ],
              linkId: 'regularmedications-summary-current',
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
                          "%MedicationStatementRepeat.medication.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first()) | %MedicationStatementRepeat.contained.code.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())"
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-current-medication',
                  text: 'Medication',
                  type: 'open-choice',
                  repeats: false,
                  answerValueSet: '#smarthealthchecks-medication'
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%MedicationStatementRepeat.dosage.text'
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-current-dosage',
                  text: 'Dosage',
                  type: 'string',
                  repeats: true
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
                          "%MedicationStatementRepeat.reasonCode.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())"
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-current-reasoncode',
                  text: 'Clinical indication',
                  type: 'open-choice',
                  repeats: true,
                  answerValueSet: '#medication-reason-taken-1'
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%MedicationStatementRepeat.note.text'
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-current-comment',
                  text: 'Comment',
                  type: 'string',
                  repeats: true
                }
              ]
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
                  valueExpression: {
                    name: 'MedicationStatementRepeat',
                    language: 'text/fhirpath',
                    expression: '%MedicationStatement.entry.resource'
                  }
                },
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
                  extension: [
                    {
                      url: 'template',
                      valueReference: {
                        reference: '#MedicationStatementTemplate'
                      }
                    }
                  ]
                }
              ],
              linkId: 'regularmedications-summary-new',
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
                          "%MedicationStatementRepeat.medication.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first()) | %MedicationStatementRepeat.contained.code.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())"
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-new-medication',
                  text: 'Medication',
                  type: 'open-choice',
                  repeats: false,
                  answerValueSet: '#smarthealthchecks-medication'
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%MedicationStatementRepeat.dosage.text'
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-new-dosage',
                  text: 'Dosage',
                  type: 'string',
                  repeats: true
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
                          "%MedicationStatementRepeat.reasonCode.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())"
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-new-reasoncode',
                  text: 'Clinical indication',
                  type: 'open-choice',
                  repeats: true,
                  answerValueSet: '#medication-reason-taken-1'
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%MedicationStatementRepeat.note.text'
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-new-comment',
                  text: 'Comment',
                  type: 'string',
                  repeats: false
                }
              ]
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
                    code: 'radio-button'
                  }
                ]
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation',
              valueCode: 'horizontal'
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText',
              valueString: 'Does your child take any regular medications?'
            }
          ],
          linkId: '6eb59145-ed9a-4184-af83-3506d47e4d4e',
          text: 'Does your child take any regular medications (prescribed, over-the-counter, traditional, complementary and alternative)?',
          type: 'choice',
          repeats: false,
          answerValueSet: '#YesNo'
        },
        {
          extension: [
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
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation',
              valueCode: 'horizontal'
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText',
              valueString: 'Do you take any regular medications?'
            }
          ],
          linkId: '3a2d27b6-e918-4df5-aca9-b374fcf9faad',
          text: 'Do you take any regular medications (prescribed, over-the-counter, traditional, complementary and alternative)?',
          type: 'choice',
          repeats: false,
          answerValueSet: '#YesNo'
        },
        {
          linkId: '874ec8db-95c9-4cc0-95db-e45edaa3cd12',
          text: 'Check the health record is up to date',
          type: 'boolean',
          repeats: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText',
              valueString: 'Understanding and adherence checked'
            }
          ],
          linkId: '36290837-ad70-48b2-9c66-31533fec918b',
          text: 'Check medication understanding and adherence with patient',
          type: 'boolean',
          enableWhen: [
            {
              question: '6eb59145-ed9a-4184-af83-3506d47e4d4e',
              operator: '=',
              answerCoding: {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0136',
                code: 'Y'
              }
            },
            {
              question: '3a2d27b6-e918-4df5-aca9-b374fcf9faad',
              operator: '=',
              answerCoding: {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0136',
                code: 'Y'
              }
            }
          ],
          enableBehavior: 'any',
          repeats: false
        },
        {
          linkId: 'aa9ff2ed-bcd2-406d-a9ff-89c201df2605',
          text: 'Health priorities, actions and follow-up',
          type: 'text',
          repeats: false
        },
        {
          linkId: 'MarkComplete-23',
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
