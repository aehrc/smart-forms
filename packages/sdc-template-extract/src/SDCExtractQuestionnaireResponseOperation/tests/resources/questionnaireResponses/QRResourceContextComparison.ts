import type { QuestionnaireResponse } from 'fhir/r4';

export const QRResourceContextComparison: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  id: 'QR-ResourceContextComparison',
  status: 'completed',
  questionnaire: 'https://smartforms.csiro.au/docs/tests/ResourceContextComparison',
  item: [
    {
      linkId: 'observation',
      text: 'Observation',
      item: [
        {
          linkId: 'resourceAnswer',
          text: 'Answer read via %resource',
          answer: [{ valueString: 'Pre-populated' }]
        },
        {
          linkId: 'relativeAnswer',
          text: 'Answer read via a relative path',
          answer: [{ valueString: 'Pre-populated' }]
        }
      ]
    }
  ]
};
