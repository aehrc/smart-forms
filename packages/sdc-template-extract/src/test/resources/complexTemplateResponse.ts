import type { QuestionnaireResponse } from 'fhir/r4';

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
                  id: 'given-repeat-2t7L3RYrA-y3o06jZNoml',
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
              valueDate: '2025-04-03'
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
              valueString: '0411223344'
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
                code: 'CP',
                display: 'Contact person',
                extension: [
                  {
                    url: 'http://ontoserver.csiro.au/profiles/expansion',
                    extension: [
                      {
                        url: 'inactive',
                        valueBoolean: true
                      }
                    ]
                  }
                ]
              }
            }
          ]
        },
        {
          linkId: 'phone',
          text: 'Phone',
          answer: [
            {
              valueString: '0988776655'
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
              valueBoolean: false
            }
          ]
        }
      ]
    }
  ]
};
