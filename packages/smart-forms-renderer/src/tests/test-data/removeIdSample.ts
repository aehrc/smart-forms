import type { QuestionnaireResponse } from 'fhir/r4';

export const qrRemoveIdSample: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  questionnaire: 'http://canshare.co.nz/questionnaire/myPatient1',
  item: [
    {
      linkId: 'myPatient1',
      text: 'myPatient1',
      item: [
        {
          linkId: 'myPatient1.name',
          text: 'name *',
          item: [
            {
              linkId: 'myPatient1.name.first',
              text: 'firstName *',
              answer: [
                {
                  id: 'myPatient1.name.first-repeat-000000',
                  valueString: '1st firstName 1.0'
                }
              ]
            }
          ]
        },
        {
          linkId: 'myPatient1.name',
          text: 'name *',
          item: [
            {
              linkId: 'myPatient1.name.first',
              text: 'firstName *',
              answer: [
                {
                  id: 'myPatient1.name.first-repeat-000000',
                  valueString: '2nd firstName 1.0'
                },
                {
                  id: 'myPatient1.name.first-repeat-O-r6YSxx81TBFf_yiHWk6',
                  valueString: '2nd firstName 2.0'
                },
                {
                  id: 'myPatient1.name.first-repeat-ZQR77gdy6utsT_JkbuHKc'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const qrRemoveIdResult: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  questionnaire: 'http://canshare.co.nz/questionnaire/myPatient1',
  item: [
    {
      linkId: 'myPatient1',
      text: 'myPatient1',
      item: [
        {
          linkId: 'myPatient1.name',
          text: 'name *',
          item: [
            {
              linkId: 'myPatient1.name.first',
              text: 'firstName *',
              answer: [
                {
                  valueString: '1st firstName 1.0'
                }
              ]
            }
          ]
        },
        {
          linkId: 'myPatient1.name',
          text: 'name *',
          item: [
            {
              linkId: 'myPatient1.name.first',
              text: 'firstName *',
              answer: [
                {
                  valueString: '2nd firstName 1.0'
                },
                {
                  valueString: '2nd firstName 2.0'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
