import type { QuestionnaireResponse } from 'fhir/r4';

export const QRRegularMedications: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  questionnaire: 'http://www.health.gov.au/assessments/mbs/715/RegularMedications',
  item: [
    {
      linkId: '7dfe7c6a-ca7f-4ddf-9241-a7b918a9695a',
      text: 'Regular medications',
      item: [
        {
          linkId: 'regularmedications-summary',
          text: 'Medication summary',
          item: [
            {
              linkId: 'regularmedications-summary-current',
              item: [
                {
                  linkId: 'regularmedications-summary-current-medication',
                  text: 'Medication',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '3738011000036101',
                        display: 'Amoxil'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-reasoncode',
                  text: 'Clinical indication',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '444780001',
                        display: 'Glucose in blood specimen above reference range'
                      }
                    },
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '444780001',
                        display: 'Glucose in blood specimen above reference range'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-comment',
                  text: 'Comment',
                  answer: [
                    {
                      valueString: 'comment'
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'regularmedications-summary-current',
              item: [
                {
                  linkId: 'regularmedications-summary-current-medication',
                  text: 'Medication',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '3738011000036101',
                        display: 'Amoxil'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-reasoncode',
                  text: 'Clinical indication',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '271807003',
                        display: 'Rash'
                      }
                    },
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '386661006',
                        display: 'Fever'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-comment',
                  text: 'Comment',
                  answer: [
                    {
                      valueString: 'hope it works'
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'regularmedications-summary-new',
              item: [
                {
                  linkId: 'regularmedications-summary-new-medication',
                  text: 'Medication',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '3738011000036101',
                        display: 'Amoxil'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-new-reasoncode',
                  text: 'Clinical indication',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '444780001',
                        display: 'Glucose in blood specimen above reference range'
                      }
                    },
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '444780001',
                        display: 'Glucose in blood specimen above reference range'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-new-comment',
                  text: 'Comment',
                  answer: [
                    {
                      valueString: 'comment'
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'regularmedications-summary-new',
              item: [
                {
                  linkId: 'regularmedications-summary-new-medication',
                  text: 'Medication',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '3738011000036101',
                        display: 'Amoxil'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-new-reasoncode',
                  text: 'Clinical indication',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '271807003',
                        display: 'Rash'
                      }
                    },
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '386661006',
                        display: 'Fever'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-new-comment',
                  text: 'Comment',
                  answer: [
                    {
                      valueString: 'hope it works'
                    }
                  ]
                }
              ]
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
  meta: {
    source: 'https://smartforms.csiro.au'
  }
};
