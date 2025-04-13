import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

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