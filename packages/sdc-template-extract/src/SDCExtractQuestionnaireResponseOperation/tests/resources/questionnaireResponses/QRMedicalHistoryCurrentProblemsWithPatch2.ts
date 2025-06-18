import type { QuestionnaireResponse } from 'fhir/r4';

export const QRMedicalHistoryCurrentProblemsWithPatch2: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  questionnaire: 'http://www.health.gov.au/assessments/mbs/715/MedicalHistoryCurrentProblems',
  item: [
    {
      linkId: '28d5dbe4-1e65-487c-847a-847f544a6a91',
      text: 'Medical history and current problems',
      item: [
        {
          linkId: 'b9de2b58-55e2-436d-95ab-49600508cdf7',
          text: 'Birth history',
          item: []
        },
        {
          linkId: 'medicalhistorysummary',
          text: 'Medical history summary',
          item: [
            {
              linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
              item: [
                {
                  linkId: 'conditionId',
                  answer: [
                    {
                      valueString: 'ckd-pat-sf'
                    }
                  ]
                },
                {
                  linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                  text: 'Condition',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '700379002',
                        display: 'Chronic kidney disease stage 3B (disorder)'
                      }
                    }
                  ]
                },
                {
                  linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                  text: 'Clinical status',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                        code: 'active',
                        display: 'Active'
                      }
                    }
                  ]
                }
              ]
            },
            {
              linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
              item: [
                {
                  linkId: 'conditionId',
                  answer: [
                    {
                      valueString: 'coronary-syndrome-pat-sf'
                    }
                  ]
                },
                {
                  linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                  text: 'Condition',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '394659003',
                        display: 'Acute coronary syndrome'
                      }
                    }
                  ]
                },
                {
                  linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                  text: 'Clinical status',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                        code: 'active',
                        display: 'Active'
                      }
                    }
                  ]
                }
              ]
            },
            {
              linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
              item: [
                {
                  linkId: 'conditionId',
                  answer: [
                    {
                      valueString: 'uti-pat-sf'
                    }
                  ]
                },
                {
                  linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                  text: 'Condition',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '68566005',
                        display: 'Urinary tract infection'
                      }
                    }
                  ]
                },
                {
                  linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                  text: 'Clinical status',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                        code: 'unknown',
                        display: 'Unknown'
                      }
                    }
                  ]
                },
                {
                  linkId: '6ae641ad-95bb-4cdc-8910-5a52077e492c',
                  text: 'Onset date',
                  answer: [
                    {
                      valueDate: '2020-05-10'
                    }
                  ]
                }
              ]
            },
            {
              linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
              item: [
                {
                  linkId: 'conditionId',
                  answer: [
                    {
                      valueString: 'diabetes-pat-sf'
                    }
                  ]
                },
                {
                  linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                  text: 'Condition',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '44054006',
                        display: 'Type 2 diabetes mellitus'
                      }
                    }
                  ]
                },
                {
                  linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                  text: 'Clinical status',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                        code: 'active',
                        display: 'Active'
                      }
                    }
                  ]
                }
              ]
            },
            {
              linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
              item: [
                {
                  linkId: 'conditionId',
                  answer: [
                    {
                      valueString: 'fever-pat-sf'
                    }
                  ]
                },
                {
                  linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                  text: 'Condition',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '63993003',
                        display: 'Remittent fever'
                      }
                    }
                  ]
                }
              ]
            },
            {
              linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
              item: [
                {
                  linkId: 'conditionId',
                  answer: [
                    {
                      valueString: '584a'
                    }
                  ]
                },
                {
                  linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                  text: 'Condition',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '38341003',
                        display: 'Hypertension'
                      }
                    }
                  ]
                }
              ]
            },
            {
              linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
              item: [
                {
                  linkId: 'conditionId',
                  answer: [
                    {
                      valueString: '613a'
                    }
                  ]
                },
                {
                  linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                  text: 'Condition',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '125605004',
                        display: 'Fracture of bone'
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
  author: {
    type: 'Practitioner',
    reference: 'Practitioner/bobrester-bob'
  },
  authored: '2025-06-17T03:31:39.843Z',
  meta: {
    source: 'https://smartforms.csiro.au'
  }
};
