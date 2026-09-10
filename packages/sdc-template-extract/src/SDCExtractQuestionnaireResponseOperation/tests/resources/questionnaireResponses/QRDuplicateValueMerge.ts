import type { QuestionnaireResponse } from 'fhir/r4';

export const QRDuplicateValueMerge: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  id: 'QR-DuplicateValueMerge',
  status: 'completed',
  questionnaire: 'https://smartforms.csiro.au/docs/tests/DuplicateValueMerge',
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
              answer: [{ valueString: 'Alex' }, { valueString: 'Alex' }]
            },
            {
              linkId: 'family',
              text: 'Family/Surname',
              answer: [{ valueString: 'Citizen' }]
            }
          ]
        }
      ]
    }
  ]
};
