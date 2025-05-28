import type { Questionnaire } from 'fhir/r4';

export const QImmunisation: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'Immunisation-modified',
  meta: {
    versionId: '1',
    lastUpdated: '2025-05-23T05:52:04.542+00:00',
    source: '#DGR7hoTiUV0noFGA',
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
      id: 'amt-vaccine-1',
      meta: {
        profile: [
          'http://hl7.org/fhir/StructureDefinition/shareablevalueset',
          'https://healthterminologies.gov.au/fhir/StructureDefinition/composed-value-set-4'
        ]
      },
      url: 'https://healthterminologies.gov.au/fhir/ValueSet/amt-vaccine-1',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:1.2.36.1.2001.1004.201.10042'
        }
      ],
      version: '1.0.2',
      name: 'AustralianMedicinesTerminologyVaccine',
      title: 'Australian Medicines Terminology Vaccine',
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
        'The Australian Medicines Terminology (AMT) Vaccine value set includes AMT product concepts that may be used to record a vaccine product.',
      copyright:
        'Copyright © 2018 Australian Digital Health Agency - All rights reserved. Except for the material identified below, this content is licensed under a Creative Commons Attribution 4.0 International License. See https://creativecommons.org/licenses/by/4.0/. \n\n This resource includes SNOMED Clinical Terms™ (SNOMED CT®) which is used by permission of the International Health Terminology Standards Development Organisation (IHTSDO). All rights reserved. SNOMED CT®, was originally created by The College of American Pathologists. “SNOMED” and “SNOMED CT” are registered trademarks of the IHTSDO. \n\nThe rights to use and implement or implementation of SNOMED CT content are limited to the extent it is necessary to allow for the end use of this material.  No further rights are granted in respect of the International Release and no further use of any SNOMED CT content by any other party is permitted. \n\nAll copies of this resource must include this copyright statement and all information contained in this statement.',
      compose: {
        include: [
          {
            system: 'http://snomed.info/sct',
            filter: [
              {
                property: 'concept',
                op: 'in',
                value: '1156291000168106'
              }
            ]
          }
        ]
      }
    },
    {
      resourceType: 'Immunization',
      id: 'ImmunizationTemplate',
      meta: {
        profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-immunization']
      },
      status: 'completed',
      vaccineCode: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
            valueString: "item.where(linkId='vaccinestoday-vaccine').answer.value"
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
      patient: {
        _reference: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: '%resource.subject.reference'
            }
          ]
        }
      },
      _occurrenceDateTime: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: "item.where(linkId='vaccinestoday-date').answer.value.toDateTime()"
          }
        ]
      },
      _lotNumber: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: "item.where(linkId='vaccinestoday-batch').answer.value"
          }
        ]
      },
      note: [
        // @ts-ignore - TS2741: Property text is missing in type. This is a template so we can get away with no "text" field
        {
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: "item.where(linkId='vaccinestoday-comment').answer.value"
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
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assembleContext',
      valueString: 'age'
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'Immunization',
        language: 'application/x-fhir-query',
        expression: 'Immunization?patient={{%patient.id}}'
      }
    }
  ],
  url: 'http://www.health.gov.au/assessments/mbs/715/Immunisation',
  name: 'Immunisation',
  title: 'Aboriginal and Torres Strait Islander Health Check - Immunisation',
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
      linkId: '205677d6-17c7-4285-a7c4-61aa02b6c816',
      text: 'Immunisation',
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
          linkId: 'CD-in-progress-13',
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
              question: 'MarkComplete-13',
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
          linkId: 'CD-complete-13',
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
              question: 'MarkComplete-13',
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
                expression: '%age <= 12'
              }
            }
          ],
          linkId: '54de7714-b917-4426-acb4-29d48648a2d8',
          text: 'Check Child Health Record/Book and Australian Immunisation Register',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <p style="font-size:1.2em; font-weight:normal"><em>Check Child Health Record/Book and Australian Immunisation Register</em></p>\r\n    </div>'
              }
            ]
          },
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%age > 12'
              }
            }
          ],
          linkId: 'd77c527d-6fde-4ed7-97b9-c71acf817f39',
          text: 'Eligibility for funded vaccines may vary across jurisdictions',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <p style="font-size:1.2em; font-weight:normal"><em>Eligibility for funded vaccines may vary across jurisdictions</em></p>\r\n    </div>'
              }
            ]
          },
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '(%age > 12).intersect(%age <= 24)'
              }
            }
          ],
          linkId: '77d87581-d4d7-4267-9f3c-ad6541ad0f46',
          text: 'Check Australian Immunisation Register',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <p style="font-size:1.2em; font-weight:normal"><em>Check Australian Immunisation Register</em></p>\r\n    </div>'
              }
            ]
          },
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '(%age > 24).intersect(%age <= 49)'
              }
            }
          ],
          linkId: 'a2631d2c-2b5c-4147-9aca-05ae655a56a5',
          text: 'Check recommended primary vaccinations completed and provide catch-up if required',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <p style="font-size:1.2em; font-weight:normal"><em>Check recommended primary vaccinations completed and provide catch-up if required</em></p>\r\n    </div>'
              }
            ]
          },
          type: 'display'
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
                name: 'ImmunizationRepeat',
                language: 'text/fhirpath',
                expression: "%Immunization.entry.resource.where(status='completed')"
              }
            }
          ],
          linkId: 'vaccinesprevious',
          text: 'Vaccines previously given',
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
                      "%ImmunizationRepeat.vaccineCode.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())"
                  }
                }
              ],
              linkId: 'vaccinesprevious-vaccine',
              text: 'Vaccine',
              type: 'open-choice',
              answerValueSet: '#amt-vaccine-1'
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%ImmunizationRepeat.lotNumber'
                  }
                }
              ],
              linkId: 'vaccinesprevious-batch',
              text: 'Batch number',
              type: 'string'
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%ImmunizationRepeat.occurrence.ofType(dateTime)'
                  }
                }
              ],
              linkId: 'vaccinesprevious-date',
              text: 'Administration date',
              type: 'dateTime'
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%ImmunizationRepeat.note.text.first()'
                  }
                }
              ],
              linkId: 'vaccinesprevious-comment',
              text: 'Comment',
              type: 'string'
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
            }
          ],
          linkId: 'vaccinesair',
          text: 'Immunisations are up to date?',
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
                    code: 'autocomplete'
                  }
                ]
              }
            }
          ],
          linkId: 'vaccinesdue',
          text: 'Immunisations due',
          type: 'open-choice',
          repeats: true,
          answerValueSet: '#amt-vaccine-1'
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
                name: 'ImmunizationRepeatNew',
                language: 'text/fhirpath',
                expression: "%Immunization.entry.resource.where(status='completed')"
              }
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
              extension: [
                {
                  url: 'template',
                  valueReference: {
                    reference: '#ImmunizationTemplate'
                  }
                }
              ]
            }
          ],
          linkId: 'vaccinestoday',
          text: 'Vaccines given today',
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
                      "%ImmunizationRepeatNew.vaccineCode.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())"
                  }
                }
              ],
              linkId: 'vaccinestoday-vaccine',
              text: 'Vaccine',
              type: 'open-choice',
              answerValueSet: '#amt-vaccine-1'
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%ImmunizationRepeatNew.lotNumber'
                  }
                }
              ],
              linkId: 'vaccinestoday-batch',
              text: 'Batch number',
              type: 'string'
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%ImmunizationRepeatNew.occurrence.ofType(dateTime)'
                  }
                }
              ],
              linkId: 'vaccinestoday-date',
              text: 'Administration date',
              type: 'dateTime'
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%ImmunizationRepeatNew.note.text.first()'
                  }
                }
              ],
              linkId: 'vaccinestoday-comment',
              text: 'Comment',
              type: 'string'
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
            }
          ],
          linkId: 'vaccinesrecorded',
          text: 'Have all vaccines been recorded on the Australian Immunisation Register?',
          type: 'choice',
          repeats: false,
          answerValueSet: '#YesNo'
        },
        {
          linkId: 'bcd1c9f2-889e-41e5-8c2b-a70221c5cec5',
          text: 'Health priorities, actions and follow-up',
          type: 'text',
          repeats: false
        },
        {
          linkId: 'MarkComplete-13',
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
