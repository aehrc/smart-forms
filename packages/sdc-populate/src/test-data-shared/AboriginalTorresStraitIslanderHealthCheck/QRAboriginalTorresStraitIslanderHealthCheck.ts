/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { QuestionnaireResponse } from 'fhir/r4';

export const QRAboriginalTorresStraitIslanderHealthCheck: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  questionnaire: 'http://www.health.gov.au/assessments/mbs/715|0.3.0-assembled',
  item: [
    {
      linkId: 'fd5af92e-c248-497a-8007-ee0952ccd4d9',
      item: [
        {
          linkId: '2e82032a-dc28-45f2-916e-862303d39fe5',
          text: 'About the health check',
          item: [
            {
              linkId: '5960c096-d5f7-4745-bd74-44ff2775bde9',
              text: 'Health check already in progress?',
              answer: [
                {
                  valueBoolean: true
                }
              ]
            },
            {
              linkId: '63fe14f3-2374-4382-bce7-180e2747c97f',
              text: 'Date this health check commenced',
              answer: [
                {
                  valueDate: '2025-08-07'
                }
              ]
            }
          ]
        },
        {
          linkId: '1016f79d-9756-4daf-b6ee-29add134b34f',
          text: 'Consent',
          item: [
            {
              linkId: '84162f36-f4af-4509-b178-ef2a3849d0b6',
              text: 'Date',
              answer: [
                {
                  valueDate: '2025-08-07'
                }
              ]
            }
          ]
        },
        {
          linkId: '5b224753-9365-44e3-823b-9c17e7394005',
          text: 'Patient Details',
          item: [
            {
              linkId: '17596726-34cf-4133-9960-7081e1d63558',
              text: 'Name',
              answer: [
                {
                  valueString: 'Repop, Kimberly'
                }
              ]
            },
            {
              linkId: '57093a06-62f7-4b8b-8cb4-2c9f451ac851',
              text: 'Preferred name',
              answer: [
                {
                  valueString: 'Repop, Kimberly'
                }
              ]
            },
            {
              linkId: '540b1034-7c9a-4aba-a9ef-afb77d445a58',
              text: 'Preferred pronouns',
              answer: [
                {
                  valueCoding: {
                    system: 'http://loinc.org',
                    code: 'LA29519-8',
                    display: 'she/her/her/hers/herself'
                  }
                }
              ]
            },
            {
              linkId: '418e4a02-de77-48a0-a92a-fe8fcc52b1aa',
              text: 'Administrative gender',
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
              linkId: '90ad8f16-16e4-4438-a7aa-b3189f510da2',
              text: 'Date of birth',
              answer: [
                {
                  valueDate: '1968-10-11'
                }
              ]
            },
            {
              linkId: 'e2a16e4d-2765-4b61-b286-82cfc6356b30',
              text: 'Age',
              answer: [
                {
                  valueInteger: 56
                }
              ]
            },
            {
              linkId: 'f1262ade-843c-4eba-a86d-51a9c97d134b',
              text: 'Home address',
              item: [
                {
                  linkId: '4e0dc185-f83e-4027-b7a8-ecb543d42c6d',
                  text: 'Home address',
                  item: [
                    {
                      linkId: '2fee2d51-7828-4178-b8c1-35edd32ba338',
                      text: 'Street address',
                      answer: [
                        {
                          valueString: '4 Brisbane Street'
                        }
                      ]
                    },
                    {
                      linkId: 'ddb65ed1-f4b2-4730-af2a-2f98bc73c76f',
                      text: 'City',
                      answer: [
                        {
                          valueString: 'Brisbane'
                        }
                      ]
                    },
                    {
                      linkId: 'd9a1236c-8d6e-4f20-a12a-9d5de5a1d0f6',
                      text: 'State',
                      answer: [
                        {
                          valueCoding: {
                            system:
                              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
                            code: 'QLD',
                            display: 'Queensland'
                          }
                        }
                      ]
                    },
                    {
                      linkId: '3f61a1ea-1c74-4f52-8519-432ce861a74f',
                      text: 'Postcode',
                      answer: [
                        {
                          valueString: '4112'
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              linkId: '9541f0b0-f5ba-4fe7-a8e9-ad003cef897b',
              text: 'Home phone',
              answer: [
                {
                  valueString: '0123456879'
                }
              ]
            },
            {
              linkId: '4037a02b-4a85-40e0-9be6-5b17df1aac56',
              text: 'Mobile phone',
              answer: [
                {
                  valueString: '0491 572 665'
                }
              ]
            },
            {
              linkId: 'c22390d3-1be6-4fd1-b775-6443b7239a6b',
              text: 'Emergency contact',
              item: [
                {
                  linkId: 'd7f2dd75-20c8-480f-8c22-71d604ebee8d',
                  text: 'Name',
                  answer: [
                    {
                      valueString: 'Ms Phone A Friend'
                    }
                  ]
                },
                {
                  linkId: '626e3723-6310-4b99-81c1-525676b027c8',
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
              linkId: 'df1475ea-bf7e-4bf0-a69f-7f9608c3ed3c',
              text: 'Medicare number',
              item: [
                {
                  linkId: 'eb2a59ed-9632-4df1-b5b1-1e85c3b4b7cf',
                  text: 'Number',
                  answer: [
                    {
                      valueString: '6951449677'
                    }
                  ]
                },
                {
                  linkId: 'd6253253-a124-494e-a1d8-7ce02c69ec11',
                  text: 'Reference number',
                  answer: [
                    {
                      valueString: '1'
                    }
                  ]
                },
                {
                  linkId: 'c520e213-5313-42c3-860a-d30206620290',
                  text: 'Expiry',
                  answer: [
                    {
                      valueString: '2024-08'
                    }
                  ]
                }
              ]
            },
            {
              linkId: '83814495-3a81-43f4-88df-42186cce516a',
              text: 'Registered for Closing the Gap PBS Co-payment Measure (CTG)',
              answer: [
                {
                  valueBoolean: true
                }
              ]
            }
          ]
        },
        {
          linkId: '28d5dbe4-1e65-487c-847a-847f544a6a91',
          text: 'Medical history and current problems',
          item: [
            {
              linkId: 'medicalhistorysummary',
              text: 'Medical history summary',
              item: [
                {
                  linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                  text: 'Medical history summary',
                  item: [
                    {
                      linkId: 'conditionId',
                      answer: [
                        {
                          valueString: 'ckd-pat-repop'
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
                            code: 'inactive',
                            display: 'Inactive'
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                  text: 'Medical history summary',
                  item: [
                    {
                      linkId: 'conditionId',
                      answer: [
                        {
                          valueString: 'coronary-syndrome-pat-repop'
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
                            code: 'inactive',
                            display: 'Inactive'
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                  text: 'Medical history summary',
                  item: [
                    {
                      linkId: 'conditionId',
                      answer: [
                        {
                          valueString: 'uti-pat-repop'
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
                            code: 'inactive',
                            display: 'Inactive'
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
                    },
                    {
                      linkId: 'e4524654-f6de-4717-b288-34919394d46b',
                      text: 'Abatement date',
                      answer: [
                        {
                          valueDate: '2025-06-04'
                        }
                      ]
                    }
                  ]
                },
                {
                  linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                  text: 'Medical history summary',
                  item: [
                    {
                      linkId: 'conditionId',
                      answer: [
                        {
                          valueString: 'diabetes-pat-repop'
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
                            code: 'inactive',
                            display: 'Inactive'
                          }
                        }
                      ]
                    },
                    {
                      linkId: 'e4524654-f6de-4717-b288-34919394d46b',
                      text: 'Abatement date',
                      answer: [
                        {
                          valueDate: '2025-06-30'
                        }
                      ]
                    }
                  ]
                },
                {
                  linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                  text: 'Medical history summary',
                  item: [
                    {
                      linkId: 'conditionId',
                      answer: [
                        {
                          valueString: 'fever-pat-repop'
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
                  text: 'Medical history summary',
                  item: [
                    {
                      linkId: 'conditionId',
                      answer: [
                        {
                          valueString: '584a-pat-repop'
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
                  text: 'Medical history summary',
                  item: [
                    {
                      linkId: 'conditionId',
                      answer: [
                        {
                          valueString: '613a-pat-repop'
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
        },
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
                          valueString: 'Apply 1 drop to each eye every 2 hours for 7 days'
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
                          valueString:
                            'Review regularly for blood pressure control and side effects.'
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
                    },
                    {
                      linkId: 'regularmedications-summary-current-dosage',
                      text: 'Dosage',
                      answer: [
                        {
                          valueString: '1 at night'
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
                      linkId: 'regularmedications-summary-current-reasoncode',
                      text: 'Clinical indication',
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
                      linkId: 'regularmedications-summary-current-comment',
                      text: 'Comment',
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
        },
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
                  text: 'Adverse reaction risk summary',
                  item: [
                    {
                      linkId: 'allergyIntoleranceId',
                      answer: [
                        {
                          valueString: '604a-pat-repop'
                        }
                      ]
                    },
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
                      linkId: 'allergysummary-status',
                      text: 'Status',
                      answer: [
                        {
                          valueCoding: {
                            system:
                              'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                            code: 'active',
                            display: 'Active'
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
                  text: 'Adverse reaction risk summary',
                  item: [
                    {
                      linkId: 'allergyIntoleranceId',
                      answer: [
                        {
                          valueString: '614a-pat-repop'
                        }
                      ]
                    },
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
                      linkId: 'allergysummary-status',
                      text: 'Status',
                      answer: [
                        {
                          valueCoding: {
                            system:
                              'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                            code: 'active',
                            display: 'Active'
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
                  text: 'Adverse reaction risk summary',
                  item: [
                    {
                      linkId: 'allergyIntoleranceId',
                      answer: [
                        {
                          valueString: '676a-pat-repop'
                        }
                      ]
                    },
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
                      linkId: 'allergysummary-status',
                      text: 'Status',
                      answer: [
                        {
                          valueCoding: {
                            system:
                              'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                            code: 'active',
                            display: 'Active'
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
                  linkId: 'allergysummary',
                  text: 'Adverse reaction risk summary',
                  item: [
                    {
                      linkId: 'allergyIntoleranceId',
                      answer: [
                        {
                          valueString: 'allergyintolerance-aspirin-pat-repop'
                        }
                      ]
                    },
                    {
                      linkId: 'allergysummary-substance',
                      text: 'Substance',
                      answer: [
                        {
                          valueCoding: {
                            system: 'http://snomed.info/sct',
                            code: '38268001',
                            display: 'Ibuprofen'
                          }
                        }
                      ]
                    },
                    {
                      linkId: 'allergysummary-status',
                      text: 'Status',
                      answer: [
                        {
                          valueCoding: {
                            system:
                              'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                            code: 'active',
                            display: 'Active'
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
                    }
                  ]
                },
                {
                  linkId: 'allergysummary',
                  text: 'Adverse reaction risk summary',
                  item: [
                    {
                      linkId: 'allergyIntoleranceId',
                      answer: [
                        {
                          valueString: 'penicillin-pat-repop'
                        }
                      ]
                    },
                    {
                      linkId: 'allergysummary-substance',
                      text: 'Substance',
                      answer: [
                        {
                          valueCoding: {
                            system: 'http://snomed.info/sct',
                            code: '764146007',
                            display: 'Penicillin'
                          }
                        }
                      ]
                    },
                    {
                      linkId: 'allergysummary-status',
                      text: 'Status',
                      answer: [
                        {
                          valueCoding: {
                            system:
                              'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
                            code: 'active',
                            display: 'Active'
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
                            code: '247472004',
                            display: 'Hives'
                          }
                        }
                      ]
                    },
                    {
                      linkId: 'allergysummary-comment',
                      text: 'Comment',
                      answer: [
                        {
                          valueString:
                            'The criticality is high due to a documented episode of hives following penicillin administration.'
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          linkId: '205677d6-17c7-4285-a7c4-61aa02b6c816',
          text: 'Immunisation',
          item: [
            {
              linkId: 'vaccinesprevious',
              text: 'Vaccines previously given',
              item: [
                {
                  linkId: 'vaccinesprevious-vaccine',
                  text: 'Vaccine',
                  answer: [
                    {
                      valueCoding: {
                        system:
                          'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
                        code: 'COVAST',
                        display: 'AstraZeneca Vaxzevria'
                      }
                    }
                  ]
                },
                {
                  linkId: 'vaccinesprevious-date',
                  text: 'Administration date',
                  answer: [
                    {
                      valueDate: '2025-01-15'
                    }
                  ]
                },
                {
                  linkId: 'vaccinesprevious-comment',
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
              linkId: 'vaccinesprevious',
              text: 'Vaccines previously given',
              item: [
                {
                  linkId: 'vaccinesprevious-vaccine',
                  text: 'Vaccine',
                  answer: [
                    {
                      valueCoding: {
                        system:
                          'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
                        code: 'COVAST',
                        display: 'AstraZeneca Vaxzevria'
                      }
                    }
                  ]
                },
                {
                  linkId: 'vaccinesprevious-date',
                  text: 'Administration date',
                  answer: [
                    {
                      valueDate: '2020-12-15'
                    }
                  ]
                },
                {
                  linkId: 'vaccinesprevious-comment',
                  text: 'Comment',
                  answer: [
                    {
                      valueString: 'first one'
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'vaccinesprevious',
              text: 'Vaccines previously given',
              item: [
                {
                  linkId: 'vaccinesprevious-vaccine',
                  text: 'Vaccine',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '837621000168102',
                        display: 'Diphtheria + tetanus + pertussis 3 component vaccine'
                      }
                    }
                  ]
                },
                {
                  linkId: 'vaccinesprevious-comment',
                  text: 'Comment',
                  answer: [
                    {
                      valueString: 'test'
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'vaccinesprevious',
              text: 'Vaccines previously given',
              item: [
                {
                  linkId: 'vaccinesprevious-vaccine',
                  text: 'Vaccine',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '1525011000168107',
                        display: 'Comirnaty'
                      }
                    }
                  ]
                },
                {
                  linkId: 'vaccinesprevious-batch',
                  text: 'Batch number',
                  answer: [
                    {
                      valueString: '300000000P'
                    }
                  ]
                },
                {
                  linkId: 'vaccinesprevious-date',
                  text: 'Administration date',
                  answer: [
                    {
                      valueDate: '2021-07-15'
                    }
                  ]
                },
                {
                  linkId: 'vaccinesprevious-comment',
                  text: 'Comment',
                  answer: [
                    {
                      valueString: 'Second dose of Comirnaty vaccine administered.'
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'vaccinesprevious',
              text: 'Vaccines previously given',
              item: [
                {
                  linkId: 'vaccinesprevious-vaccine',
                  text: 'Vaccine',
                  answer: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '1525011000168107',
                        display: 'Comirnaty'
                      }
                    }
                  ]
                },
                {
                  linkId: 'vaccinesprevious-batch',
                  text: 'Batch number',
                  answer: [
                    {
                      valueString: '200000000P'
                    }
                  ]
                },
                {
                  linkId: 'vaccinesprevious-date',
                  text: 'Administration date',
                  answer: [
                    {
                      valueDate: '2021-06-17'
                    }
                  ]
                },
                {
                  linkId: 'vaccinesprevious-comment',
                  text: 'Comment',
                  answer: [
                    {
                      valueString: 'First dose of Comirnaty vaccine administered.'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          linkId: 'd95abe99-8ef2-4b97-bc88-a2901e2ebc9c',
          text: 'Absolute cardiovascular disease risk calculation',
          item: [
            {
              linkId: 'dabdc7b4-51db-44a0-9d59-77a88587cbe9',
              text: 'CVD risk result',
              item: [
                {
                  linkId: 'cvdrisk-latestresult',
                  text: 'Latest available result',
                  answer: [
                    {
                      valueString: 'Not available'
                    }
                  ]
                }
              ]
            },
            {
              linkId: 'f8022f3f-21fe-42c0-8abd-95f24e2e37e5',
              text: 'Health priorities, actions and follow-up',
              item: [
                {
                  linkId: 'fe9feec6-593a-4106-8a7d-f9965a632ea2',
                  text: 'Observation values',
                  item: [
                    {
                      linkId: 'bac0f824-3784-400e-80f9-ad18d46bd8cb',
                      text: 'Smoking status',
                      item: [
                        {
                          linkId: '333007c7-47a9-482b-af11-e55484abf2ae',
                          text: 'Value',
                          answer: [
                            {
                              valueCoding: {
                                system: 'http://snomed.info/sct',
                                code: '77176002',
                                display: 'Current smoker'
                              }
                            }
                          ]
                        },
                        {
                          linkId: 'cvdrisk-smokingstatus-date',
                          text: 'Date performed',
                          answer: [
                            {
                              valueDate: '2016-07-02'
                            }
                          ]
                        }
                      ]
                    },
                    {
                      linkId: 'fa4f73a3-7633-410c-9177-8aa43b117122',
                      text: 'Systolic Blood Pressure',
                      item: [
                        {
                          linkId: '818ce640-c8dd-457d-b607-3aaa8da38524',
                          text: 'Value',
                          answer: [
                            {
                              valueInteger: 165
                            }
                          ]
                        },
                        {
                          linkId: '85d8faf7-ddb0-446c-b489-28d786d6de50',
                          text: 'Date performed',
                          answer: [
                            {
                              valueDate: '2023-09-13'
                            }
                          ]
                        }
                      ]
                    },
                    {
                      linkId: 'e693c7d2-be69-4f1f-b72d-7ff2ea3cd536',
                      text: 'Total Cholesterol',
                      item: [
                        {
                          linkId: '99932a93-8135-47b2-933b-fd751b34b7af',
                          text: 'Value',
                          answer: [
                            {
                              valueDecimal: 5.9
                            }
                          ]
                        },
                        {
                          linkId: '16cbe87b-5c8d-4385-b7d9-da3f07f63f8a',
                          text: 'Date performed',
                          answer: [
                            {
                              valueDate: '2023-01-17'
                            }
                          ]
                        }
                      ]
                    },
                    {
                      linkId: '87eefaf6-010f-4b0d-9f51-2c33e46e6c69',
                      text: 'HDL Cholesterol',
                      item: [
                        {
                          linkId: 'c14b4513-1e20-461d-97f4-4631711adc65',
                          text: 'Value',
                          answer: [
                            {
                              valueDecimal: 1.5
                            }
                          ]
                        },
                        {
                          linkId: '6407e0a7-c416-4a75-933b-904c0dcf88ca',
                          text: 'Date performed',
                          answer: [
                            {
                              valueDate: '2023-01-17'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  linkId: '1c1eea28-6c82-4b7b-aaa3-8655ce70f2fd',
                  text: 'Type 2 diabetes mellitus',
                  answer: [
                    {
                      valueBoolean: true
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
    display: 'Dr Peter Primary',
    reference: 'Practitioner/primary-peter'
  },
  authored: '2025-08-07T07:38:03.107Z',
  meta: {
    source: 'https://smartforms.csiro.au'
  }
};
