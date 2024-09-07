import type { Observation, Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export const qObservationSample: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'phq-2-questionnaire',
  meta: {
    versionId: '1',
    lastUpdated: '2024-08-29T12:00:00Z'
  },
  title: 'PHQ-2 Depression Screening',
  status: 'active',
  date: '2024-08-29T12:00:00Z',
  publisher: 'Konsulin',
  description: 'Patient Health Questionnaire-2 (PHQ-2) for depression screening.',
  subjectType: ['Patient'],
  item: [
    {
      linkId: 'phq2-1',
      text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
      type: 'choice',
      code: [
        {
          system: 'http://snomed.info/sct',
          code: '28669007',
          display: 'Anhedonia'
        }
      ],
      answerOption: [
        {
          valueCoding: {
            code: '0',
            display: 'Not at all'
          }
        },
        {
          valueCoding: {
            code: '1',
            display: 'Several days'
          }
        },
        {
          valueCoding: {
            code: '2',
            display: 'More than half the days'
          }
        },
        {
          valueCoding: {
            code: '3',
            display: 'Nearly every day'
          }
        }
      ]
    },
    {
      linkId: 'phq2-2',
      text: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
      type: 'choice',
      code: [
        {
          system: 'http://snomed.info/sct',
          code: '307077003',
          display: 'Feeling hopeless'
        }
      ],
      answerOption: [
        {
          valueCoding: {
            code: '0',
            display: 'Not at all'
          }
        },
        {
          valueCoding: {
            code: '1',
            display: 'Several days'
          }
        },
        {
          valueCoding: {
            code: '2',
            display: 'More than half the days'
          }
        },
        {
          valueCoding: {
            code: '3',
            display: 'Nearly every day'
          }
        }
      ]
    }
  ]
};

export const qObservationSampleWithExtractExtension: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'phq-2-questionnaire',
  meta: {
    versionId: '1',
    lastUpdated: '2024-09-06T15:33:00Z'
  },
  title: 'PHQ-2 Depression Screening',
  status: 'active',
  date: '2024-08-29T12:00:00Z',
  publisher: 'Konsulin',
  description: 'Patient Health Questionnaire-2 (PHQ-2) for depression screening.',
  subjectType: ['Patient'],
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
      valueBoolean: false
    }
  ],
  item: [
    {
      linkId: 'phq2-1',
      text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
      type: 'choice',
      code: [
        {
          system: 'http://snomed.info/sct',
          code: '28669007',
          display: 'Anhedonia'
        }
      ],
      answerOption: [
        {
          valueCoding: {
            code: '0',
            display: 'Not at all'
          }
        },
        {
          valueCoding: {
            code: '1',
            display: 'Several days'
          }
        },
        {
          valueCoding: {
            code: '2',
            display: 'More than half the days'
          }
        },
        {
          valueCoding: {
            code: '3',
            display: 'Nearly every day'
          }
        }
      ],
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
          valueBoolean: true
        }
      ],
      item: [
        {
          linkId: 'phq2-8',
          text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
          type: 'choice',
          code: [
            {
              system: 'http://snomed.info/sct',
              code: '28669007',
              display: 'Anhedonia'
            }
          ],
          answerOption: [
            {
              valueCoding: {
                code: '0',
                display: 'Not at all'
              }
            },
            {
              valueCoding: {
                code: '1',
                display: 'Several days'
              }
            },
            {
              valueCoding: {
                code: '2',
                display: 'More than half the days'
              }
            },
            {
              valueCoding: {
                code: '3',
                display: 'Nearly every day'
              }
            }
          ]
        }
      ]
    },
    {
      linkId: 'phq2-2',
      text: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
      type: 'choice',
      code: [
        {
          system: 'http://snomed.info/sct',
          code: '307077003',
          display: 'Feeling hopeless'
        }
      ],
      answerOption: [
        {
          valueCoding: {
            code: '0',
            display: 'Not at all'
          }
        },
        {
          valueCoding: {
            code: '1',
            display: 'Several days'
          }
        },
        {
          valueCoding: {
            code: '2',
            display: 'More than half the days'
          }
        },
        {
          valueCoding: {
            code: '3',
            display: 'Nearly every day'
          }
        }
      ],
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
          valueBoolean: false
        }
      ],
      item: [
        {
          linkId: 'phq2-4',
          text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
          type: 'choice',
          code: [
            {
              system: 'http://snomed.info/sct',
              code: '28669007',
              display: 'Anhedonia'
            }
          ],
          answerOption: [
            {
              valueCoding: {
                code: '0',
                display: 'Not at all'
              }
            },
            {
              valueCoding: {
                code: '1',
                display: 'Several days'
              }
            },
            {
              valueCoding: {
                code: '2',
                display: 'More than half the days'
              }
            },
            {
              valueCoding: {
                code: '3',
                display: 'Nearly every day'
              }
            }
          ],
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
              valueBoolean: true
            }
          ]
        }
      ]
    },
    {
      linkId: 'phq2-3',
      text: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
      type: 'choice',
      code: [
        {
          system: 'http://snomed.info/sct',
          code: '307077003',
          display: 'Feeling hopeless'
        }
      ],
      answerOption: [
        {
          valueCoding: {
            code: '0',
            display: 'Not at all'
          }
        },
        {
          valueCoding: {
            code: '1',
            display: 'Several days'
          }
        },
        {
          valueCoding: {
            code: '2',
            display: 'More than half the days'
          }
        },
        {
          valueCoding: {
            code: '3',
            display: 'Nearly every day'
          }
        }
      ],
      item: [
        {
          linkId: 'phq2-5',
          text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
          type: 'choice',
          code: [
            {
              system: 'http://snomed.info/sct',
              code: '28669007',
              display: 'Anhedonia'
            }
          ],
          answerOption: [
            {
              valueCoding: {
                code: '0',
                display: 'Not at all'
              }
            },
            {
              valueCoding: {
                code: '1',
                display: 'Several days'
              }
            },
            {
              valueCoding: {
                code: '2',
                display: 'More than half the days'
              }
            },
            {
              valueCoding: {
                code: '3',
                display: 'Nearly every day'
              }
            }
          ],
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
              valueBoolean: true
            }
          ]
        },
        {
          linkId: 'phq2-6',
          text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
          type: 'choice',
          code: [
            {
              system: 'http://snomed.info/sct',
              code: '28669007',
              display: 'Anhedonia'
            }
          ],
          answerOption: [
            {
              valueCoding: {
                code: '0',
                display: 'Not at all'
              }
            },
            {
              valueCoding: {
                code: '1',
                display: 'Several days'
              }
            },
            {
              valueCoding: {
                code: '2',
                display: 'More than half the days'
              }
            },
            {
              valueCoding: {
                code: '3',
                display: 'Nearly every day'
              }
            }
          ],
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
              valueBoolean: false
            }
          ]
        },
        {
          linkId: 'phq2-7',
          text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
          type: 'choice',
          code: [
            {
              system: 'http://snomed.info/sct',
              code: '28669007',
              display: 'Anhedonia'
            }
          ],
          answerOption: [
            {
              valueCoding: {
                code: '0',
                display: 'Not at all'
              }
            },
            {
              valueCoding: {
                code: '1',
                display: 'Several days'
              }
            },
            {
              valueCoding: {
                code: '2',
                display: 'More than half the days'
              }
            },
            {
              valueCoding: {
                code: '3',
                display: 'Nearly every day'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const qrObservationSample: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  id: 'phq2-response',
  questionnaire: 'https://fhir.konsulin.care/fhir/Questionnaire/phq-2-questionnaire',
  status: 'completed',
  subject: {
    reference: 'Patient/123'
  },
  authored: '2024-08-29T12:00:00Z',
  item: [
    {
      linkId: 'phq2-1',
      text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
      answer: [
        {
          valueCoding: {
            code: '2',
            display: 'More than half the days'
          }
        }
      ],
      item: [
        {
          linkId: 'phq2-8',
          text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
          answer: [
            {
              valueCoding: {
                code: '2',
                display: 'More than half the days'
              }
            }
          ]
        }
      ]
    },
    {
      linkId: 'phq2-2',
      text: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
      answer: [
        {
          valueCoding: {
            code: '1',
            display: 'Several days'
          }
        }
      ],
      item: [
        {
          linkId: 'phq2-4',
          text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
          answer: [
            {
              valueCoding: {
                code: '1',
                display: 'Several days'
              }
            }
          ]
        }
      ]
    },
    {
      linkId: 'phq2-3',
      text: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
      answer: [
        {
          valueCoding: {
            code: '1',
            display: 'Several days'
          }
        }
      ],
      item: [
        {
          linkId: 'phq2-5',
          text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
          answer: [
            {
              valueCoding: {
                code: '1',
                display: 'Several days'
              }
            }
          ]
        },
        {
          linkId: 'phq2-6',
          text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
          answer: [
            {
              valueCoding: {
                code: '1',
                display: 'Several days'
              }
            }
          ]
        },
        {
          linkId: 'phq2-7',
          text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
          answer: [
            {
              valueCoding: {
                code: '1',
                display: 'Several days'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const observationResults: Observation[] = [
  {
    resourceType: 'Observation',
    id: 'obs-phq2-1',
    status: 'final',
    code: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '28669007',
          display: 'Anhedonia'
        }
      ]
    },
    subject: {
      reference: 'Patient/123'
    },
    derivedFrom: [
      {
        reference: 'QuestionnaireResponse/phq2-response'
      }
    ],
    effectiveDateTime: '2024-08-29T12:00:00Z',
    issued: '2024-08-29T12:00:00Z',
    valueCodeableConcept: {
      coding: [
        {
          code: '2',
          display: 'More than half the days'
        }
      ]
    }
  },
  {
    resourceType: 'Observation',
    id: 'obs-phq2-2',
    status: 'final',
    code: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '307077003',
          display: 'Feeling hopeless'
        }
      ]
    },
    subject: {
      reference: 'Patient/123'
    },
    derivedFrom: [
      {
        reference: 'QuestionnaireResponse/phq2-response'
      }
    ],
    effectiveDateTime: '2024-08-29T12:00:00Z',
    issued: '2024-08-29T12:00:00Z',
    valueCodeableConcept: {
      coding: [
        {
          code: '1',
          display: 'Several days'
        }
      ]
    }
  }
];

export const qExtractSample: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'phq-2-questionnaire',
  status: 'draft',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
      valueBoolean: false
    }
  ],
  item: [
    {
      linkId: 'phq2-1',
      type: 'choice',
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
          valueBoolean: true
        }
      ],
      item: [
        {
          linkId: 'phq2-8',
          type: 'choice'
        }
      ]
    },
    {
      linkId: 'phq2-2',
      type: 'choice',
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
          valueBoolean: false
        }
      ],
      item: [
        {
          linkId: 'phq2-4',
          type: 'choice',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
              valueBoolean: true
            }
          ]
        }
      ]
    },
    {
      linkId: 'phq2-3',
      type: 'choice',
      item: [
        {
          linkId: 'phq2-5',
          type: 'choice',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
              valueBoolean: true
            }
          ]
        },
        {
          linkId: 'phq2-6',
          type: 'choice',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
              valueBoolean: false
            }
          ]
        },
        {
          linkId: 'phq2-7',
          type: 'choice'
        }
      ]
    }
  ]
};
