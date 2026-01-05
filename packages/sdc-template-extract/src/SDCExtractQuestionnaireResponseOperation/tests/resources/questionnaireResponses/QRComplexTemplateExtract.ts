import type { QuestionnaireResponse } from 'fhir/r4';

export const QRComplexTemplateExtract: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  id: 'QR-1748412484376-1-a4eba970bccc48',
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
                  valueString: 'Smart'
                }
              ]
            },
            {
              linkId: 'family',
              text: 'Family/Surname',
              answer: [
                {
                  valueString: 'Form'
                }
              ]
            }
          ]
        },
        {
          linkId: 'name',
          text: 'Name',
          item: [
            {
              linkId: 'given',
              text: 'Given Name(s)',
              answer: [
                {
                  valueString: 'Smartie'
                },
                {
                  valueString: 'Demo'
                }
              ]
            },
            {
              linkId: 'family',
              text: 'Family/Surname',
              answer: [
                {
                  valueString: 'Forms'
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
              valueDate: '1968-10-11'
            }
          ]
        },
        {
          linkId: 'ihi',
          text: 'National Identifier (IHI)',
          answer: [
            {
              valueString: '8003608833357361'
            }
          ]
        },
        {
          linkId: 'mobile-phone',
          text: 'Mobile Phone number',
          answer: [
            {
              valueString: '0491 572 665'
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
              valueString: 'Ms Phone A Friend'
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
                code: 'C',
                display: 'Emergency Contact'
              }
            }
          ]
        },
        {
          linkId: 'phone',
          text: 'Phone',
          answer: [
            {
              valueString: '0987654321'
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
              valueDecimal: 1.63
            }
          ]
        },
        {
          linkId: 'weight',
          text: 'What is your current weight (kg)',
          answer: [
            {
              valueDecimal: 77.3
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
  ],
  subject: {
    type: 'Patient',
    reference: 'Patient/pat-sf'
  },
  authored: '2025-05-28T06:29:32.454Z',
  author: {
    reference: 'Practitioner/bobrester-bob'
  },
  meta: {
    source: 'https://smartforms.csiro.au'
  }
};
