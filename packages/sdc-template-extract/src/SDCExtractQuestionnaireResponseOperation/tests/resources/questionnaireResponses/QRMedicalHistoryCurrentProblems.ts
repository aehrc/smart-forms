import type { QuestionnaireResponse } from 'fhir/r4';

export const QRMedicalHistoryCurrentProblems: QuestionnaireResponse = {
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
          linkId: 'medicalhistoryinstruction',
          text: 'Medical history summary',
          item: [
            {
              linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
              item: [
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
                  text: 'Clinical Status',
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
                  text: 'Clinical Status',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                        code: 'active',
                        display: 'Active'
                      }
                    }
                  ]
                },
                {
                  linkId: '6ae641ad-95bb-4cdc-8910-5a52077e492c',
                  text: 'Onset Date',
                  answer: [
                    {
                      valueDate: '2015-02-12'
                    }
                  ]
                }
              ]
            },
            {
              linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
              item: [
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
                  text: 'Clinical Status',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                        code: 'active',
                        display: 'Active'
                      }
                    }
                  ]
                },
                {
                  linkId: '6ae641ad-95bb-4cdc-8910-5a52077e492c',
                  text: 'Onset Date',
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
                  text: 'Clinical Status',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                        code: 'active',
                        display: 'Active'
                      }
                    }
                  ]
                },
                {
                  linkId: '6ae641ad-95bb-4cdc-8910-5a52077e492c',
                  text: 'Onset Date',
                  answer: [
                    {
                      valueDate: '2015-02-12'
                    }
                  ]
                }
              ]
            },
            {
              linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
              item: [
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
                },
                {
                  linkId: '6ae641ad-95bb-4cdc-8910-5a52077e492c',
                  text: 'Onset Date',
                  answer: [
                    {
                      valueDate: '2015-02-11'
                    }
                  ]
                },
                {
                  linkId: 'e4524654-f6de-4717-b288-34919394d46b',
                  text: 'Abatement Date',
                  answer: [
                    {
                      valueDate: '2015-02-14'
                    }
                  ]
                }
              ]
            },
            {
              linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
              item: [
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
            },
            {
              linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
              item: [
                {
                  linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                  text: 'Condition',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '195967001',
                        display: 'Asthma'
                      }
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'newdiagnosis',
              item: [
                {
                  linkId: '2da85994-2d5e-42f1-8a81-abf44f397468',
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
                  linkId: 'a7e056be-fb6f-4f7f-b04d-5b809e1e18e3',
                  text: 'Clinical Status',
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
              linkId: 'newdiagnosis',
              item: [
                {
                  linkId: '2da85994-2d5e-42f1-8a81-abf44f397468',
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
                  linkId: 'a7e056be-fb6f-4f7f-b04d-5b809e1e18e3',
                  text: 'Clinical Status',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                        code: 'active',
                        display: 'Active'
                      }
                    }
                  ]
                },
                {
                  linkId: '4d55bffb-3286-4a23-a785-3b9c346d464d',
                  text: 'Onset Date',
                  answer: [
                    {
                      valueDate: '2015-02-12'
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'newdiagnosis',
              item: [
                {
                  linkId: '2da85994-2d5e-42f1-8a81-abf44f397468',
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
                  linkId: 'a7e056be-fb6f-4f7f-b04d-5b809e1e18e3',
                  text: 'Clinical Status',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                        code: 'active',
                        display: 'Active'
                      }
                    }
                  ]
                },
                {
                  linkId: '4d55bffb-3286-4a23-a785-3b9c346d464d',
                  text: 'Onset Date',
                  answer: [
                    {
                      valueDate: '2020-05-10'
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'newdiagnosis',
              item: [
                {
                  linkId: '2da85994-2d5e-42f1-8a81-abf44f397468',
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
                  linkId: 'a7e056be-fb6f-4f7f-b04d-5b809e1e18e3',
                  text: 'Clinical Status',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                        code: 'active',
                        display: 'Active'
                      }
                    }
                  ]
                },
                {
                  linkId: '4d55bffb-3286-4a23-a785-3b9c346d464d',
                  text: 'Onset Date',
                  answer: [
                    {
                      valueDate: '2015-02-12'
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'newdiagnosis',
              item: [
                {
                  linkId: '2da85994-2d5e-42f1-8a81-abf44f397468',
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
                },
                {
                  linkId: '4d55bffb-3286-4a23-a785-3b9c346d464d',
                  text: 'Onset Date',
                  answer: [
                    {
                      valueDate: '2015-02-11'
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'newdiagnosis',
              item: [
                {
                  linkId: '2da85994-2d5e-42f1-8a81-abf44f397468',
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
              linkId: 'newdiagnosis',
              item: [
                {
                  linkId: '2da85994-2d5e-42f1-8a81-abf44f397468',
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
            },
            {
              linkId: 'newdiagnosis',
              item: [
                {
                  linkId: '2da85994-2d5e-42f1-8a81-abf44f397468',
                  text: 'Condition',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '195967001',
                        display: 'Asthma'
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
