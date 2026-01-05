import type { Questionnaire } from 'fhir/r4';

// From https://build.fhir.org/ig/HL7/sdc/Questionnaire-extract-complex-template.json
// Added resourceId to #patTemplate, was not present in the original
export const QComplexTemplateExtract: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ComplexTemplateExtract',
  meta: {
    versionId: '1',
    lastUpdated: '2025-05-20T03:47:48.922+00:00',
    source: '#tonl46evNPX2suRn',
    profile: ['http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-extr-template']
  },
  contained: [
    {
      resourceType: 'Patient',
      id: 'patTemplate',
      identifier: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
              valueString: "item.where(linkId = 'ihi').answer.value"
            }
          ],
          type: {
            text: 'National Identifier (IHI)'
          },
          system: 'http://example.org/nhio',
          _value: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: 'first()'
              }
            ]
          }
        }
      ],
      name: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
              valueString: "item.where(linkId = 'name')"
            }
          ],
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: "item.where(linkId='given' or linkId='family').answer.value.join(' ')"
              }
            ]
          },
          _family: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: "item.where(linkId = 'family').answer.value.first()"
              }
            ]
          },
          _given: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                  valueString: "item.where(linkId = 'given').answer.value"
                }
              ]
            }
          ]
        }
      ],
      telecom: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
              valueString: "item.where(linkId = 'mobile-phone').answer.value"
            }
          ],
          system: 'phone',
          _value: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: 'first()'
              }
            ]
          },
          use: 'mobile'
        }
      ],
      gender: 'unknown',
      _gender: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: "item.where(linkId = 'gender').answer.value.first().code"
          }
        ]
      }
    },
    {
      resourceType: 'RelatedPerson',
      id: 'rpTemplate',
      patient: {
        _reference: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: "'Patient/' + %NewPatientId"
            }
          ]
        }
      },
      relationship: [
        {
          coding: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                  valueString: "item.where(linkId = 'relationship').answer.value.first()"
                }
              ]
            }
          ]
        }
      ],
      name: [
        {
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: "item.where(linkId = 'contact-name').answer.value.first()"
              }
            ]
          }
        }
      ],
      telecom: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
              valueString: "item.where(linkId = 'phone').answer.value"
            }
          ],
          system: 'phone',
          _value: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: 'first()'
              }
            ]
          },
          use: 'mobile'
        }
      ]
    },
    {
      resourceType: 'Observation',
      id: 'obsTemplateHeight',
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '8302-2',
            display: 'Body height'
          }
        ]
      },
      subject: {
        _reference: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: "'Patient/' + %NewPatientId"
            }
          ]
        }
      },
      effectiveDateTime: '1900-01-01',
      _effectiveDateTime: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: '%resource.authored'
          }
        ]
      },
      _issued: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: '%resource.authored'
          }
        ]
      },
      performer: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: '%resource.author'
            }
          ]
        }
      ],
      valueQuantity: {
        // @ts-ignore - TS2741: Property value is missing in type. This is a template so we can get away with no "value" field
        _value: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: 'answer.value * 100'
            }
          ]
        },
        unit: 'cm',
        system: 'http://unitsofmeasure.org',
        code: 'cm'
      },
      derivedFrom: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
              valueString: '%resource.id'
            }
          ]
        }
      ]
    },
    {
      resourceType: 'Observation',
      id: 'obsTemplateWeight',
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '29463-7',
            display: 'Weight'
          }
        ]
      },
      subject: {
        _reference: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: "'Patient/' + %NewPatientId"
            }
          ]
        }
      },
      effectiveDateTime: '1900-01-01',
      _effectiveDateTime: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: '%resource.authored'
          }
        ]
      },
      _issued: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: '%resource.authored'
          }
        ]
      },
      performer: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: '%resource.author'
            }
          ]
        }
      ],
      valueQuantity: {
        // @ts-ignore - TS2741: Property value is missing in type. This is a template so we can get away with no "value" field
        _value: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: 'answer.value'
            }
          ]
        },
        unit: 'kg',
        system: 'http://unitsofmeasure.org',
        code: 'kg'
      },
      derivedFrom: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
              valueString: '%resource.id'
            }
          ]
        }
      ]
    },
    {
      resourceType: 'Observation',
      id: 'obsTemplate',
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://example.org/sdh/demo/CodeSystem/cc-screening-codes',
            code: 'sigmoidoscopy-complication'
          }
        ]
      },
      subject: {
        _reference: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: "'Patient/' + %NewPatientId"
            }
          ]
        }
      },
      effectiveDateTime: '1900-01-01',
      _effectiveDateTime: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: '%resource.authored'
          }
        ]
      },
      _issued: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: '%resource.authored'
          }
        ]
      },
      performer: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: '%resource.author'
            }
          ]
        }
      ],
      _valueBoolean: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: 'answer.value'
          }
        ]
      },
      derivedFrom: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
              valueString: '%resource.id'
            }
          ]
        }
      ]
    }
  ],
  extension: [
    {
      url: 'http://hl7.org/fhir/5.0/StructureDefinition/extension-Questionnaire.versionAlgorithm[x]',
      valueCoding: {
        system: 'http://hl7.org/fhir/version-algorithm',
        code: 'semver'
      }
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-extractAllocateId',
      valueString: 'NewPatientId'
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-wg',
      valueCode: 'fhir'
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBodyHeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=8302-2&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBodyWeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=29463-7&_count=1&_sort=-date&patient={{%patient.id}}'
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
    }
  ],
  url: 'http://hl7.org/fhir/uv/sdc/Questionnaire/extract-complex-template',
  identifier: [
    {
      system: 'urn:ietf:rfc:3986',
      value: 'urn:oid:2.16.840.1.113883.4.642.40.17.35.34'
    }
  ],
  version: '4.0.0-ballot',
  name: 'ExtractComplexTemplate',
  title: 'Complex Extract Demonstration - Template',
  status: 'draft',
  experimental: true,
  date: '2025-03-11T03:15:47+00:00',
  publisher: 'HL7 International / FHIR Infrastructure',
  contact: [
    {
      name: 'HL7 International / FHIR Infrastructure',
      telecom: [
        {
          system: 'url',
          value: 'http://www.hl7.org/Special/committees/fiwg'
        }
      ]
    },
    {
      telecom: [
        {
          system: 'url',
          value: 'http://www.hl7.org/Special/committees/fiwg'
        }
      ]
    }
  ],
  description: 'Complex template-based extraction example',
  jurisdiction: [
    {
      coding: [
        {
          system: 'http://unstats.un.org/unsd/methods/m49/m49.htm',
          code: '001',
          display: 'World'
        }
      ]
    }
  ],
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
          extension: [
            {
              url: 'template',
              valueReference: {
                reference: '#patTemplate'
              }
            },
            {
              url: 'fullUrl',
              valueString: '%NewPatientId'
            },
            // Not present in the original https://build.fhir.org/ig/HL7/sdc/Questionnaire-extract-complex-template.json
            {
              url: 'resourceId',
              valueString: '%NewPatientId'
            }
          ]
        }
      ],
      linkId: 'patient',
      text: 'Patient Information',
      type: 'group',
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
              valueExpression: {
                name: 'NameRepeat',
                language: 'text/fhirpath',
                expression: '%patient.name'
              }
            }
          ],
          linkId: 'name',
          text: 'Name',
          type: 'group',
          repeats: true,
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%NameRepeat.given'
                  }
                }
              ],
              linkId: 'given',
              text: 'Given Name(s)',
              type: 'string',
              repeats: true
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%NameRepeat.family'
                  }
                }
              ],
              linkId: 'family',
              text: 'Family/Surname',
              type: 'string'
            }
          ]
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
          linkId: 'gender',
          text: 'Gender',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%patient.birthDate'
              }
            }
          ],
          linkId: 'dob',
          text: 'Date of Birth',
          type: 'date'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%patient.identifier.where(type.coding.exists(system='http://terminology.hl7.org/CodeSystem/v2-0203' and code='NI')).value"
              }
            }
          ],
          linkId: 'ihi',
          text: 'National Identifier (IHI)',
          type: 'string'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: "%patient.telecom.where(system = 'phone' and use = 'mobile').value"
              }
            }
          ],
          linkId: 'mobile-phone',
          text: 'Mobile Phone number',
          type: 'string'
        }
      ]
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
          valueExpression: {
            name: 'EmergencyContactRepeat',
            language: 'text/fhirpath',
            expression: "%patient.contact.where(relationship.coding.exists(code = 'C'))"
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
          extension: [
            {
              url: 'template',
              valueReference: {
                reference: '#rpTemplate'
              }
            }
          ]
        }
      ],
      linkId: 'contacts',
      text: 'Contacts',
      type: 'group',
      repeats: true,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%EmergencyContactRepeat.name.select((family | (given | prefix).join(' ')).join(', ').where($this != '') | text)"
              }
            }
          ],
          linkId: 'contact-name',
          text: 'Name',
          type: 'string'
        },
        {
          linkId: 'relationship',
          text: 'Relationship',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/patient-contactrelationship'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%EmergencyContactRepeat.telecom.value'
              }
            }
          ],
          linkId: 'phone',
          text: 'Phone',
          type: 'string'
        }
      ]
    },
    {
      linkId: 'obs',
      text: 'Observations',
      type: 'group',
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsBodyHeight.entry.resource.value.value'
              }
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
              extension: [
                {
                  url: 'template',
                  valueReference: {
                    reference: '#obsTemplateHeight'
                  }
                }
              ]
            }
          ],
          linkId: 'height',
          text: 'What is your current height (m)',
          type: 'decimal'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsBodyWeight.entry.resource.value.value'
              }
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
              extension: [
                {
                  url: 'template',
                  valueReference: {
                    reference: '#obsTemplateWeight'
                  }
                }
              ]
            }
          ],
          linkId: 'weight',
          text: 'What is your current weight (kg)',
          type: 'decimal'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
              extension: [
                {
                  url: 'template',
                  valueReference: {
                    reference: '#obsTemplate'
                  }
                }
              ]
            }
          ],
          linkId: 'complication',
          text: 'Have you had a Sigmoidoscopy Complication (concern with invasive procedure, for example)',
          type: 'boolean'
        }
      ]
    }
  ]
};
