import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export const complexTemplateQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'complex-template-sample',
  status: 'active',
  meta: {
    profile: ['http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-extr-template']
  },
  text: {
    status: 'extensions',
    div: '<div xmlns="http://www.w3.org/1999/xhtml">...</div>'
  },
  contained: [
    {
      resourceType: 'Patient',
      id: 'patTemplate',
      identifier: [{
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
          valueString: "item.where(linkId = 'ihi').answer.value"
        }],
        type: {
          text: 'National Identifier (IHI)'
        },
        system: 'http://example.org/nhio',
        _value: {
          extension: [{
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: 'first()'
          }]
        }
      }],
      name: [{
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
          valueString: "item.where(linkId = 'name')"
        }],
        _text: {
          extension: [{
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: "item.where(linkId='given' or linkId='family').answer.value.join(' ')"
          }]
        },
        _family: {
          extension: [{
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: "item.where(linkId = 'family').answer.value.first()"
          }]
        },
        _given: [{
          extension: [{
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: "item.where(linkId = 'given').answer.value"
          }]
        }]
      }],
      telecom: [{
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
          valueString: "item.where(linkId = 'mobile-phone').answer.value"
        }],
        system: 'phone',
        _value: {
          extension: [{
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: 'first()'
          }]
        },
        use: 'mobile'
      }],
      gender: 'unknown',
      _gender: {
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: "item.where(linkId = 'gender').answer.value.first().code"
        }]
      }
    },
    {
      resourceType: 'RelatedPerson',
      id: 'rpTemplate',
      patient: {
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: '%NewPatientId'
        }]
      },
      relationship: [{
        coding: [{
          extension: [{
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: "item.where(linkId = 'relationship').answer.value.first()"
          }]
        }]
      }],
      name: [{
        _text: {
          extension: [{
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: "item.where(linkId = 'contact-name').answer.value.first()"
          }]
        }
      }],
      telecom: [{
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
          valueString: "item.where(linkId = 'phone').answer.value"
        }],
        system: 'phone',
        _value: {
          extension: [{
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: 'first()'
          }]
        },
        use: 'mobile'
      }]
    },
    {
      resourceType: 'Observation',
      id: 'obsTemplateHeight',
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs'
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '8302-2',
          display: 'Body height'
        }]
      },
      subject: {
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: '%NewPatientId'
        }]
      },
      effectiveDateTime: '1900-01-01',
      _effectiveDateTime: {
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: '%resource.authored'
        }]
      },
      _issued: {
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: '%resource.authored'
        }]
      },
      performer: [{
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: '%resource.author'
        }]
      }],
      valueQuantity: {
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: 'answer.value * 100'
        }],
        value: 0,
        unit: 'cm',
        system: 'http://unitsofmeasure.org',
        code: 'cm'
      },
      derivedFrom: [{
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
          valueString: '%resource.id'
        }]
      }]
    },
    {
      resourceType: 'Observation',
      id: 'obsTemplateWeight',
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs'
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '29463-7',
          display: 'Weight'
        }]
      },
      subject: {
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: '%NewPatientId'
        }]
      },
      effectiveDateTime: '1900-01-01',
      _effectiveDateTime: {
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: '%resource.authored'
        }]
      },
      _issued: {
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: '%resource.authored'
        }]
      },
      performer: [{
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: '%resource.author'
        }]
      }],
      valueQuantity: {
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: 'answer.value'
        }],
        value: 0,
        unit: 'kg',
        system: 'http://unitsofmeasure.org',
        code: 'kg'
      },
      derivedFrom: [{
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
          valueString: '%resource.id'
        }]
      }]
    },
    {
      resourceType: 'Observation',
      id: 'obsTemplate',
      status: 'final',
      code: {
        coding: [{
          system: 'http://example.org/sdh/demo/CodeSystem/cc-screening-codes',
          code: 'sigmoidoscopy-complication'
        }]
      },
      subject: {
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: '%NewPatientId'
        }]
      },
      effectiveDateTime: '1900-01-01',
      _effectiveDateTime: {
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: '%resource.authored'
        }]
      },
      _issued: {
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: '%resource.authored'
        }]
      },
      performer: [{
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: '%resource.author'
        }]
      }],
      _valueBoolean: {
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
          valueString: 'answer.value'
        }]
      },
      derivedFrom: [{
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
          valueString: '%resource.id'
        }]
      }]
    }
  ],
  item: [
    {
      extension: [{
        extension: [{
          url: 'template',
          valueReference: {
            reference: '#patTemplate'
          }
        },
        {
          url: 'fullUrl',
          valueString: '%NewPatientId'
        }],
        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract'
      }],
      linkId: 'patient',
      text: 'Patient Information',
      type: 'group',
      item: [
        {
          linkId: 'name',
          text: 'Name',
          type: 'group',
          repeats: true,
          item: [
            {
              linkId: 'given',
              text: 'Given Name(s)',
              type: 'string',
              repeats: true
            },
            {
              linkId: 'family',
              text: 'Family/Surname',
              type: 'string'
            }
          ]
        },
        {
          linkId: 'gender',
          text: 'Gender',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender'
        },
        {
          linkId: 'dob',
          text: 'Date of Birth',
          type: 'date'
        },
        {
          linkId: 'ihi',
          text: 'National Identifier (IHI)',
          type: 'string'
        },
        {
          linkId: 'mobile-phone',
          text: 'Mobile Phone number',
          type: 'string'
        }
      ]
    },
    {
      extension: [{
        extension: [{
          url: 'template',
          valueReference: {
            reference: '#rpTemplate'
          }
        }],
        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract'
      }],
      linkId: 'contacts',
      text: 'Contacts',
      type: 'group',
      repeats: true,
      item: [
        {
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
          extension: [{
            extension: [{
              url: 'template',
              valueReference: {
                reference: '#obsTemplateHeight'
              }
            }],
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract'
          }],
          linkId: 'height',
          text: 'What is your current height (m)',
          type: 'decimal'
        },
        {
          extension: [{
            extension: [{
              url: 'template',
              valueReference: {
                reference: '#obsTemplateWeight'
              }
            }],
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract'
          }],
          linkId: 'weight',
          text: 'What is your current weight (kg)',
          type: 'decimal'
        },
        {
          extension: [{
            extension: [{
              url: 'template',
              valueReference: {
                reference: '#obsTemplate'
              }
            }],
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract'
          }],
          linkId: 'complication',
          text: 'Have you had a Sigmoidoscopy Complication (concern with invasive procedure, for example)',
          type: 'boolean'
        }
      ]
    }
  ]
};

export const complexTemplateResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  questionnaire: 'http://hl7.org/fhir/uv/sdc/Questionnaire/extract-complex-template|4.0.0-ballot',
  item: [
    {
      linkId: 'patient',
      text: 'Patient Information',
      item: [
        {
          linkId: 'name',
          text: 'Name',
          item: [
            {
              linkId: 'given',
              text: 'Given Name(s)',
              answer: [
                {
                  id: 'given-repeat-HlH6ZGGcUBn3nbrMTbx7P',
                  valueString: 'Peppa'
                }
              ]
            },
            {
              linkId: 'family',
              text: 'Family/Surname',
              answer: [
                {
                  valueString: 'Pig'
                }
              ]
            }
          ]
        },
        {
          linkId: 'gender',
          text: 'Gender',
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
          linkId: 'dob',
          text: 'Date of Birth',
          answer: [
            {
              valueDate: '2025-04-02'
            }
          ]
        },
        {
          linkId: 'ihi',
          text: 'National Identifier (IHI)',
          answer: [
            {
              valueString: '123'
            }
          ]
        },
        {
          linkId: 'mobile-phone',
          text: 'Mobile Phone number',
          answer: [
            {
              valueString: '0411223456'
            }
          ]
        }
      ]
    },
    {
      linkId: 'contacts',
      text: 'Contacts',
      item: [
        {
          linkId: 'contact-name',
          text: 'Name',
          answer: [
            {
              valueString: 'Daddy Pig'
            }
          ]
        },
        {
          linkId: 'relationship',
          text: 'Relationship',
          answer: [
            {
              valueCoding: {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                code: 'U',
                display: 'Unknown'
              }
            }
          ]
        },
        {
          linkId: 'phone',
          text: 'Phone',
          answer: [
            {
              valueString: '0499887654'
            }
          ]
        }
      ]
    },
    {
      linkId: 'obs',
      text: 'Observations',
      item: [
        {
          linkId: 'height',
          text: 'What is your current height (m)',
          answer: [
            {
              valueDecimal: 159
            }
          ]
        },
        {
          linkId: 'weight',
          text: 'What is your current weight (kg)',
          answer: [
            {
              valueDecimal: 75
            }
          ]
        },
        {
          linkId: 'complication',
          text: 'Have you had a Sigmoidoscopy Complication (concern with invasive procedure, for example)',
          answer: [
            {
              valueBoolean: true
            }
          ]
        }
      ]
    }
  ]
}; 