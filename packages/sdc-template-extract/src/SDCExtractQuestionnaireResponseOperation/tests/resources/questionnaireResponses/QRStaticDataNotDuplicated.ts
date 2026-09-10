import type { QuestionnaireResponse } from 'fhir/r4';

export const QRStaticDataNotDuplicated: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  id: 'QR-StaticDataNotDuplicated',
  status: 'completed',
  questionnaire: 'https://smartforms.csiro.au/docs/tests/StaticDataNotDuplicated',
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
              linkId: 'family',
              text: 'Family/Surname',
              answer: [{ valueString: 'Citizen' }]
            },
            {
              linkId: 'use',
              text: 'Name use',
              answer: [{ valueString: 'official' }]
            },
            {
              linkId: 'given',
              text: 'Given Name(s)',
              answer: [{ valueString: 'Alex' }, { valueString: 'Chris' }]
            }
          ]
        }
      ]
    }
  ]
};
