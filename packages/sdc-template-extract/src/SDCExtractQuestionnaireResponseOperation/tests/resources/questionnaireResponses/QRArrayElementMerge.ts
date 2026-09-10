import type { QuestionnaireResponse } from 'fhir/r4';

export const QRArrayElementMerge: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  id: 'QR-ArrayElementMerge',
  status: 'completed',
  questionnaire: 'https://smartforms.csiro.au/docs/tests/ArrayElementMerge',
  item: [
    {
      linkId: 'immunisation',
      text: 'Immunisation',
      item: [
        {
          linkId: 'doses',
          text: 'Total number of doses',
          answer: [
            {
              valueInteger: 2
            }
          ]
        }
      ]
    }
  ]
};
