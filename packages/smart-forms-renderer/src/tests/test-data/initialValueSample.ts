import type { Questionnaire } from 'fhir/r4';

export const qInitialValueSample: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RadiologyTerminologyPOCTesting5',
  meta: {
    versionId: '4',
    lastUpdated: '2024-08-27T05:59:51.989+00:00',
    source: '#q1g1OHfA2KYNPtmK',
    profile: [
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-pop-exp',
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-render'
    ]
  },
  extension: [
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
        name: 'PractitionerRole',
        language: 'application/x-fhir-query',
        expression: 'PractitionerRole?practitioner={{%user.id}}'
      }
    }
  ],
  url: 'https://smartforms.csiro.au/ig/Questionnaire/RadiologyTerminologyPOCTesting5',
  name: 'RadiologyTerminologyPOCTesting5',
  title: 'Radiology Terminology POC Testing 5',
  status: 'draft',
  experimental: true,
  subjectType: ['Patient'],
  date: '2024-08-16',
  description: 'Radiology Terminology POC Testing 5.',
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
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
          valueExpression: {
            name: 'PractitionerRoleRepeat',
            language: 'text/fhirpath',
            expression: '%PractitionerRole.entry.resource'
          }
        }
      ],
      linkId: 'radiology-order',
      text: 'Order details',
      type: 'group',
      required: true,
      repeats: false,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: 'now().toString()'
              }
            }
          ],
          linkId: 'radiology-order-number',
          text: 'Order number',
          type: 'string',
          required: true,
          repeats: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: "'PractitionerRole/' + %PractitionerRoleRepeat.id"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
              valueBoolean: true
            }
          ],
          linkId: 'radiology-order-requesterreference',
          text: 'Requester reference',
          type: 'string',
          repeats: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%PractitionerRoleRepeat.identifier.where(system='http://ns.electronichealth.net.au/id/medicare-provider-number').value"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
              valueBoolean: true
            }
          ],
          linkId: 'radiology-order-requesterdisplay',
          text: 'Requester display',
          type: 'string',
          repeats: false
        }
      ]
    },
    {
      linkId: 'radiology-service',
      text: 'Service details',
      type: 'group',
      required: true,
      repeats: true,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'procedureFocus',
                language: 'text/fhirpath',
                expression:
                  "item.repeat(item).where(linkId='radiology-service-examination-components-modality').answer.value"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'procedureFocusCode',
                language: 'text/fhirpath',
                expression: '%procedureFocus.code'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'procedureFocusDisplay',
                language: 'text/fhirpath',
                expression: '%procedureFocus.display'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'bodySite',
                language: 'text/fhirpath',
                expression:
                  "item.repeat(item).where(linkId='radiology-service-examination-components-bodysite').answer.value"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'bodySiteCode',
                language: 'text/fhirpath',
                expression: '%bodySite.code'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'bodySiteDisplay',
                language: 'text/fhirpath',
                expression: '%bodySite.display'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'laterality',
                language: 'text/fhirpath',
                expression:
                  "item.repeat(item).where(linkId='radiology-service-examination-components-laterality').answer.value"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'lateralityCode',
                language: 'text/fhirpath',
                expression: '%laterality.code'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'lateralityDisplay',
                language: 'text/fhirpath',
                expression: '%laterality.display'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'contrast',
                language: 'text/fhirpath',
                expression:
                  "item.repeat(item).where(linkId='radiology-service-examination-components-contrast').answer.value"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'contrastCode',
                language: 'text/fhirpath',
                expression: '%contrast.code'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'contrastDisplay',
                language: 'text/fhirpath',
                expression: '%contrast.display'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'lateralityEnabled',
                language: 'text/fhirpath',
                expression:
                  "iif(%bodySiteCode.exists(), %bodySiteCode.memberOf('http://snomed.info/sct?fhir_vs=refset/723264001'), false )"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'bodySiteDependency',
                language: 'text/fhirpath',
                expression:
                  "iif(%bodySiteCode.exists(), 'dependency.element=BodySite&dependency.concept.coding.system=http://snomed.info/sct&dependency.concept.coding.code=' + %bodySiteCode + '&', 'dependency.element=BodySite&dependency.concept.coding.system=http://terminology.hl7.org/CodeSystem/data-absent-reason&dependency.concept.coding.code=unknown&')"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'lateralityDependency',
                language: 'text/fhirpath',
                expression:
                  "iif(%lateralityCode.exists(), 'dependency.element=Laterality&dependency.concept.coding.system=http://snomed.info/sct&dependency.concept.coding.code=' + %lateralityCode + '&', 'dependency.element=Laterality&dependency.concept.coding.system=http://terminology.hl7.org/CodeSystem/data-absent-reason&dependency.concept.coding.code=unknown&')"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'contrastDependency',
                language: 'text/fhirpath',
                expression:
                  "iif(%contrastCode.empty() and %procedureFocusCode='27483000', 'dependency.element=Contrast&dependency.concept.coding.system=http://snomed.info/sct&dependency.concept.coding.code=373066001&', iif(%contrastCode.exists() and %procedureFocusCode!='27483000', 'dependency.element=Contrast&dependency.concept.coding.system=http://snomed.info/sct&dependency.concept.coding.code=' + %contrastCode + '&', 'dependency.element=Contrast&dependency.concept.coding.system=http://terminology.hl7.org/CodeSystem/data-absent-reason&dependency.concept.coding.code=unknown&'))"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'translateAdditionalParams',
                language: 'text/fhirpath',
                expression: '%bodySiteDependency+%lateralityDependency+%contrastDependency'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'procedureRequest',
                language: 'text/fhirpath',
                expression:
                  "iif(%procedureFocus.exists(), %terminologies.translate('http://erequestingexample.org.au/ConceptMap/radiology-services-map-1', %procedureFocus, %translateAdditionalParams).parameter.where(exists(name='match' and part.where(exists(name='equivalence' and value='equivalent')))).part.where(name='concept').value, {})"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'bodySitesXray',
                language: 'text/fhirpath',
                expression:
                  "%terminologies.expand('https://smartforms.csiro.au/ig/ValueSet/radiologypoc-bodysite-xray-1').expansion.contains"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'bodySitesPlainXray',
                language: 'text/fhirpath',
                expression:
                  "%terminologies.expand('https://smartforms.csiro.au/ig/ValueSet/radiologypoc-bodysite-plainxray-1').expansion.contains"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'bodySitesUS',
                language: 'text/fhirpath',
                expression:
                  "%terminologies.expand('https://smartforms.csiro.au/ig/ValueSet/radiologypoc-bodysite-us-1').expansion.contains"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'bodySitesDiagRad',
                language: 'text/fhirpath',
                expression:
                  "%terminologies.expand('https://smartforms.csiro.au/ig/ValueSet/radiologypoc-bodysite-diagrad-1').expansion.contains"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'bodySitesAngio',
                language: 'text/fhirpath',
                expression:
                  "%terminologies.expand('https://smartforms.csiro.au/ig/ValueSet/radiologypoc-bodysite-angio-1').expansion.contains"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'bodySitesFluoro',
                language: 'text/fhirpath',
                expression:
                  "%terminologies.expand('https://smartforms.csiro.au/ig/ValueSet/radiologypoc-bodysite-fluoro-1').expansion.contains"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'bodySitesAll',
                language: 'text/fhirpath',
                expression:
                  "%terminologies.expand('http://erequestingexample.org.au/fhir/ValueSet/radiology-body-structure-1').expansion.contains"
              }
            }
          ],
          linkId: 'radiology-service-examination',
          text: 'Examination',
          type: 'group',
          required: true,
          repeats: false,
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/variable',
                  valueExpression: {
                    name: 'bodySiteOptions',
                    language: 'text/fhirpath',
                    expression:
                      "iif(%procedureFocusCode='363680008', %bodySitesXray, iif(%procedureFocusCode='168537006', %bodySitesPlainXray, iif(%procedureFocusCode='16310003', %bodySitesUS, iif(%procedureFocusCode='27483000', %bodySitesDiagRad, iif(%procedureFocusCode='77343006', %bodySitesAngio, iif(%procedureFocusCode='44491008', %bodySitesFluoro, %bodySitesAll))))))"
                  }
                }
              ],
              linkId: 'radiology-service-examination-components',
              text: 'Procedure components',
              type: 'group',
              required: false,
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
                            code: 'drop-down'
                          }
                        ]
                      }
                    }
                  ],
                  linkId: 'radiology-service-examination-components-modality',
                  text: 'Procedure focus',
                  type: 'choice',
                  required: true,
                  repeats: false,
                  answerValueSet:
                    'http://erequestingexample.org.au/fhir/ValueSet/radiology-procedure-1'
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
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%procedureFocus.empty()'
                      }
                    }
                  ],
                  linkId: 'radiology-service-examination-components-bodysite-all',
                  text: 'Body site',
                  type: 'choice',
                  repeats: false,
                  readOnly: true,
                  answerValueSet:
                    'http://erequestingexample.org.au/fhir/ValueSet/radiology-body-structure-1',
                  item: [
                    {
                      extension: [
                        {
                          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory',
                          valueCodeableConcept: {
                            coding: [
                              {
                                system: 'http://hl7.org/fhir/questionnaire-display-category',
                                code: 'instructions'
                              }
                            ]
                          }
                        }
                      ],
                      linkId: 'radiology-service-examination-components-bodysite-all-instructions',
                      text: 'Select procedure focus',
                      type: 'display'
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
                            code: 'drop-down'
                          }
                        ]
                      }
                    },
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%procedureFocus.exists()'
                      }
                    },
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%bodySiteOptions'
                      }
                    }
                  ],
                  linkId: 'radiology-service-examination-components-bodysite',
                  text: 'Body site',
                  type: 'choice',
                  repeats: false
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
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%lateralityEnabled'
                      }
                    }
                  ],
                  linkId: 'radiology-service-examination-components-laterality',
                  text: 'Laterality',
                  type: 'choice',
                  repeats: false,
                  answerValueSet:
                    'http://erequestingexample.org.au/fhir/ValueSet/radiology-laterality-1'
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
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: "%procedureFocusCode!='27483000'"
                      }
                    }
                  ],
                  linkId: 'radiology-service-examination-components-contrast',
                  text: 'Contrast',
                  type: 'choice',
                  repeats: false,
                  answerValueSet:
                    'http://erequestingexample.org.au/fhir/ValueSet/radiology-contrast-1'
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
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: "%procedureFocusCode='27483000'"
                      }
                    }
                  ],
                  linkId: 'radiology-service-examination-components-contrast-yes',
                  text: 'Contrast',
                  type: 'choice',
                  repeats: false,
                  readOnly: true,
                  answerOption: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '373066001'
                      },
                      initialSelected: true
                    },
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '373067005'
                      }
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
                        code: 'autocomplete'
                      }
                    ]
                  }
                },
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%procedureFocus.empty()'
                  }
                }
              ],
              linkId: 'radiology-service-examination-procedure-all',
              text: 'Procedure for request',
              type: 'choice',
              required: false,
              repeats: false,
              answerValueSet: 'http://erequestingexample.org.au/fhir/ValueSet/radiology-services-1'
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
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%procedureFocus.exists() and %procedureRequest.exists()'
                  }
                },
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%procedureRequest'
                  }
                }
              ],
              linkId: 'radiology-service-examination-procedure',
              text: 'Procedure for request',
              type: 'choice',
              required: false,
              repeats: false
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%procedureFocus.exists() and %procedureRequest.empty()'
                  }
                },
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "(%procedureFocusDisplay)&(iif(%bodySiteDisplay.exists(), ', '&%bodySiteDisplay, ''))&(iif(%lateralityDisplay.exists(), ' ('&%lateralityDisplay&')', ''))&(iif(%contrastCode='373066001', ', with contrast', iif(%contrastCode='373067005', ', without contrast', '')))"
                  }
                }
              ],
              linkId: 'radiology-service-examination-procedure-text',
              text: 'Procedure for request',
              type: 'text',
              required: false,
              repeats: false,
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory',
                      valueCodeableConcept: {
                        coding: [
                          {
                            system: 'http://hl7.org/fhir/questionnaire-display-category',
                            code: 'instructions'
                          }
                        ]
                      }
                    }
                  ],
                  linkId: 'radiology-service-examination-procedure-text-instructions',
                  text: 'No matching catalogue request item. This is free text.',
                  type: 'display'
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
                        code: 'drop-down'
                      }
                    ]
                  }
                }
              ],
              linkId: 'radiology-service-examination-priority',
              text: 'Urgency',
              type: 'choice',
              repeats: false,
              answerOption: [
                {
                  valueCoding: {
                    system: 'http://hl7.org/fhir/request-priority',
                    version: '4.0.1',
                    code: 'stat',
                    display: 'Emergency'
                  }
                },
                {
                  valueCoding: {
                    system: 'http://hl7.org/fhir/request-priority',
                    version: '4.0.1',
                    code: 'urgent',
                    display: 'Urgent'
                  }
                },
                {
                  valueCoding: {
                    system: 'http://hl7.org/fhir/request-priority',
                    version: '4.0.1',
                    code: 'routine',
                    display: 'Routine'
                  }
                }
              ]
            },
            {
              linkId: 'radiology-service-examination-timing',
              text: 'Service due',
              type: 'dateTime',
              repeats: false
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
                    code: 'autocomplete'
                  }
                ]
              }
            }
          ],
          linkId: 'radiology-service-clinicalindication',
          text: 'Clinical indication',
          type: 'open-choice',
          repeats: true,
          answerValueSet: 'https://healthterminologies.gov.au/fhir/ValueSet/reason-for-request-1'
        },
        {
          linkId: 'radiology-service-clinicalnotes',
          text: 'Clinical context',
          type: 'text',
          repeats: false
        },
        {
          linkId: 'radiology-service-comment',
          text: 'Comment',
          type: 'text',
          repeats: false
        }
      ]
    }
  ]
};
