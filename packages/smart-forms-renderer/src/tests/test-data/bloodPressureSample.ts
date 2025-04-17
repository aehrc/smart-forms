import type { Questionnaire, QuestionnaireResponse, StructureMap } from 'fhir/r4';

export const bloodPressureQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'blood-pressure-questionnaire',
  identifier: [
    {
      system: 'http://example.org/questionnaire-identifier',
      value: 'blood-pressure-questionnaire'
    }
  ],
  status: 'active',
  title: 'Blood Pressure Measurement',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
      valueBoolean: true
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
  contained: [
    {
      resourceType: 'Observation',
      id: 'systolic-bp-template',
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
            code: '8480-6',
            display: 'Systolic blood pressure'
          }
        ]
      },
      subject: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: '%QuestionnaireResponse.subject'
          }
        ]
      },
      effectiveDateTime: '1900-01-01',
      _effectiveDateTime: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: 'now()'
          }
        ]
      },
      valueQuantity: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: "item.where(linkId = 'systolic').answer.valueQuantity.value"
          }
        ],
        unit: 'mmHg',
        system: 'http://unitsofmeasure.org',
        code: 'mm[Hg]'
      }
    },
    {
      resourceType: 'Observation',
      id: 'diastolic-bp-template',
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
            code: '8462-4',
            display: 'Diastolic blood pressure'
          }
        ]
      },
      subject: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: '%QuestionnaireResponse.subject'
          }
        ]
      },
      effectiveDateTime: '1900-01-01',
      _effectiveDateTime: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: 'now()'
          }
        ]
      },
      valueQuantity: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: "item.where(linkId = 'diastolic').answer.valueQuantity.value"
          }
        ],
        unit: 'mmHg',
        system: 'http://unitsofmeasure.org',
        code: 'mm[Hg]'
      }
    }
  ],
  item: [
    {
      linkId: 'systolic',
      text: 'Systolic Blood Pressure',
      type: 'quantity',
      required: true,
      code: [
        {
          system: 'http://loinc.org',
          code: '8480-6',
          display: 'Systolic blood pressure'
        }
      ],
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'mm[Hg]',
            display: 'mmHg'
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
          extension: [
            {
              url: 'template',
              valueReference: {
                reference: '#systolic-bp-template'
              }
            }
          ]
        }
      ]
    },
    {
      linkId: 'diastolic',
      text: 'Diastolic Blood Pressure',
      type: 'quantity',
      required: true,
      code: [
        {
          system: 'http://loinc.org',
          code: '8462-4',
          display: 'Diastolic blood pressure'
        }
      ],
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
          valueCoding: {
            system: 'http://unitsofmeasure.org',
            code: 'mm[Hg]',
            display: 'mmHg'
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
          extension: [
            {
              url: 'template',
              valueReference: {
                reference: '#diastolic-bp-template'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const bloodPressureResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'completed',
  subject: {
    reference: 'Patient/123'
  },
  item: [
    {
      linkId: 'systolic',
      answer: [
        {
          valueQuantity: {
            value: 120,
            unit: 'mmHg',
            system: 'http://unitsofmeasure.org',
            code: 'mm[Hg]'
          }
        }
      ]
    },
    {
      linkId: 'diastolic',
      answer: [
        {
          valueQuantity: {
            value: 80,
            unit: 'mmHg',
            system: 'http://unitsofmeasure.org',
            code: 'mm[Hg]'
          }
        }
      ]
    }
  ]
}; 