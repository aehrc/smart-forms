import type { QuestionnaireResponse } from 'fhir/r4';

export const QRAllergiesAdverseReactions: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  questionnaire: 'http://www.health.gov.au/assessments/mbs/715/AllergiesAdverseReactions',
  item: [
    {
      linkId: 'allergy',
      text: 'Allergies/adverse reactions',
      item: [
        {
          linkId: 'allergyinstruction',
          text: 'Adverse reaction risk summary',
          item: [
            {
              linkId: 'allergysummary',
              item: [
                {
                  linkId: 'allergysummary-substance',
                  text: 'Substance',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '412583005',
                        display: 'Bee pollen'
                      }
                    }
                  ]
                },
                {
                  linkId: 'allergysummary-manifestation',
                  text: 'Manifestation',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '271807003',
                        display: 'Rash'
                      }
                    }
                  ]
                },
                {
                  linkId: 'allergysummary-comment',
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
              linkId: 'allergysummary',
              item: [
                {
                  linkId: 'allergysummary-substance',
                  text: 'Substance',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '228659004',
                        display: 'Dried flowers'
                      }
                    }
                  ]
                },
                {
                  linkId: 'allergysummary-manifestation',
                  text: 'Manifestation',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '76067001',
                        display: 'Sneezing'
                      }
                    }
                  ]
                },
                {
                  linkId: 'allergysummary-comment',
                  text: 'Comment',
                  answer: [
                    {
                      valueString: 'Hayfever'
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'allergysummary',
              item: [
                {
                  linkId: 'allergysummary-substance',
                  text: 'Substance',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '256259004',
                        display: 'Pollen'
                      }
                    }
                  ]
                },
                {
                  linkId: 'allergysummary-manifestation',
                  text: 'Manifestation',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '76067001',
                        display: 'Sneezing'
                      }
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'allergynew',
              item: [
                {
                  linkId: 'allergynew-substance',
                  text: 'Substance',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '412583005',
                        display: 'Bee pollen'
                      }
                    }
                  ]
                },
                {
                  linkId: 'allergynew-manifestation',
                  text: 'Manifestation',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '271807003',
                        display: 'Rash'
                      }
                    }
                  ]
                },
                {
                  linkId: 'allergynew-comment',
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
              linkId: 'allergynew',
              item: [
                {
                  linkId: 'allergynew-substance',
                  text: 'Substance',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '228659004',
                        display: 'Dried flowers'
                      }
                    }
                  ]
                },
                {
                  linkId: 'allergynew-manifestation',
                  text: 'Manifestation',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '76067001',
                        display: 'Sneezing'
                      }
                    }
                  ]
                },
                {
                  linkId: 'allergynew-comment',
                  text: 'Comment',
                  answer: [
                    {
                      valueString: 'Hayfever'
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'allergynew',
              item: [
                {
                  linkId: 'allergynew-substance',
                  text: 'Substance',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '256259004',
                        display: 'Pollen'
                      }
                    }
                  ]
                },
                {
                  linkId: 'allergynew-manifestation',
                  text: 'Manifestation',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '76067001',
                        display: 'Sneezing'
                      }
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
