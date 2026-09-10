import type { QuestionnaireResponse } from 'fhir/r4';

export const QRRepeatingComplexValueMerge: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  id: 'QR-RepeatingComplexValueMerge',
  status: 'completed',
  questionnaire: 'https://smartforms.csiro.au/docs/tests/RepeatingComplexValueMerge',
  item: [
    {
      linkId: 'immunisation',
      text: 'Immunisation',
      item: [
        {
          linkId: 'doses',
          text: 'Total number of doses',
          answer: [{ valueInteger: 2 }]
        },
        {
          linkId: 'diseases',
          text: 'Diseases covered',
          answer: [
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '14189004',
                display: 'Measles'
              }
            },
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '36989005',
                display: 'Mumps'
              }
            }
          ]
        }
      ]
    }
  ]
};
