import type { QuestionnaireResponse } from 'fhir/r4';

export const QRRegularMedicationsWithPatchAdd: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  questionnaire: 'http://www.health.gov.au/assessments/mbs/715/RegularMedications|0.3.0',
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
              text: 'Current medications',
              item: [
                {
                  linkId: 'medicationStatementId',
                  answer: [
                    {
                      valueString: 'chloramphenicol-pat-repop'
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-medication',
                  text: 'Medication',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '22717011000036101',
                        display: 'Chloramphenicol 1% eye ointment'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-status',
                  text: 'Status',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                        code: 'active',
                        display: 'Active'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-dosage',
                  text: 'Dosage',
                  answer: [
                    {
                      valueString: 'Apply 1 drop to each eye every 2 hours for 7 days.'
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-dosage-hidden',
                  answer: [
                    {
                      valueString: 'Apply 1 drop to each eye every 2 hours for 7 days.'
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
                        code: '128350005',
                        display: 'Bacterial conjunctivitis'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-comment',
                  text: 'Comment',
                  answer: [
                    {
                      valueString: 'Comment2'
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-comment-hidden',
                  answer: [
                    {
                      valueString: 'Comment2'
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'regularmedications-summary-current',
              text: 'Current medications',
              item: [
                {
                  linkId: 'medicationStatementId',
                  answer: [
                    {
                      valueString: 'karvezide-pat-repop'
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-medication',
                  text: 'Medication',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '6554011000036100',
                        display: 'Karvezide 300/12.5 tablet'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-status',
                  text: 'Status',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                        code: 'active',
                        display: 'Active'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-dosage',
                  text: 'Dosage',
                  answer: [
                    {
                      valueString: 'Take one tablet per day.'
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-dosage-hidden',
                  answer: [
                    {
                      valueString: 'Take one tablet per day.'
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
                        code: '38341003',
                        display: 'Hypertension'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-comment',
                  text: 'Comment',
                  answer: [
                    {
                      valueString: 'Review regularly for blood pressure control and side effects.'
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-comment-hidden',
                  answer: [
                    {
                      valueString: 'Review regularly for blood pressure control and side effects.'
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'regularmedications-summary-current',
              text: 'Current medications',
              item: [
                {
                  linkId: 'medicationStatementId',
                  answer: [
                    {
                      valueString: 'intended-coq10-pat-repop'
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-medication',
                  text: 'Medication',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '920941011000036100',
                        display: 'CoQ10 (Blackmores)'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-status',
                  text: 'Status',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                        code: 'active',
                        display: 'Active'
                      }
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'regularmedications-summary-current',
              text: 'Current medications',
              item: [
                {
                  linkId: 'medicationStatementId',
                  answer: [
                    {
                      valueString: 'active-bisoprolol-pat-repop'
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-medication',
                  text: 'Medication',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '23281011000036106',
                        display: 'Bisoprolol fumarate 2.5 mg tablet'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-status',
                  text: 'Status',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                        code: 'active',
                        display: 'Active'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-dosage',
                  text: 'Dosage',
                  answer: [
                    {
                      valueString: '1/2 tablet in the morning'
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-dosage-hidden',
                  answer: [
                    {
                      valueString: '1/2 tablet in the morning'
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'regularmedications-summary-current',
              text: 'Current medications',
              item: [
                {
                  linkId: 'medicationStatementId',
                  answer: [
                    {
                      valueString: 'hc-ms-pat-repop'
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-medication',
                  text: 'Medication',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '22015011000036108',
                        display: 'Hydrocortisone 1% Topical Cream'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-status',
                  text: 'Status',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                        code: 'active',
                        display: 'Active'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-dosage',
                  text: 'Dosage',
                  answer: [
                    {
                      valueString: 'Apply a thin layer to affected area twice daily'
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-dosage-hidden',
                  answer: [
                    {
                      valueString: 'Apply a thin layer to affected area twice daily'
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
                        display: 'Dermatitis'
                      }
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-comment',
                  text: 'Comment',
                  answer: [
                    {
                      valueString: 'Patient instructed to avoid contact with eyes.'
                    }
                  ]
                },
                {
                  linkId: 'regularmedications-summary-current-comment-hidden',
                  answer: [
                    {
                      valueString: 'Patient instructed to avoid contact with eyes.'
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
    reference: 'Patient/pat-repop',
    display: 'Kimberly Repop'
  },
  author: {
    type: 'Practitioner',
    reference: 'Practitioner/bobrester-bob',
    display: 'Dr. Bob Bobrester'
  },
  authored: '2025-09-23T10:02:04.470Z',
  meta: {
    source: 'https://smartforms.csiro.au'
  }
};
