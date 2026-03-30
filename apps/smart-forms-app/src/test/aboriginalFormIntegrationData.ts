import type {
  AllergyIntolerance,
  Condition,
  FhirResource,
  Immunization,
  MedicationStatement,
  Observation,
  Patient,
  QuestionnaireResponse
} from 'fhir/r4';
import { getBirthDateForAge } from './testUtils';
import type { RequestDefinition } from './aboriginalFormUtils';

export const patient: Patient = {
  resourceType: 'Patient',
  id: 'patient-123',
  name: [
    {
      use: 'official',
      family: 'John',
      given: ['Snow']
    },
    {
      use: 'usual',
      given: ['Johnny']
    }
  ],
  birthDate: getBirthDateForAge(33),
  gender: 'male',

  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/individual-pronouns',
      extension: [
        {
          url: 'value',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://loinc.org',
                code: 'LA29518-0',
                display: 'he/him/his/his/himself'
              }
            ]
          }
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/individual-genderIdentity',
      extension: [
        {
          url: 'value',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '446151000124109',
                display: 'Identifies as male gender'
              }
            ]
          }
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/individual-recordedSexOrGender',
      extension: [
        {
          url: 'type',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '1515311000168102',
                display: 'Sex at Birth'
              }
            ]
          }
        },
        {
          url: 'value',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '248153007',
                display: 'Male'
              }
            ]
          }
        },
        {
          url: 'effectivePeriod',
          valuePeriod: {
            start: '2020-01-01'
          }
        }
      ]
    },
    {
      url: 'http://hl7.org.au/fhir/StructureDefinition/indigenous-status',
      valueCoding: {
        system: 'https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1',
        code: '1',
        display: 'Aboriginal but not Torres Strait Islander origin'
      }
    },
    {
      url: 'http://hl7.org.au/fhir/StructureDefinition/closing-the-gap-registration',
      valueBoolean: true
    }
  ],

  address: [
    {
      use: 'home',
      type: 'physical',
      line: ['123 Winter Lane'],
      city: 'Melbourne',
      state: 'VIC',
      postalCode: '3000'
    },
    {
      use: 'home',
      type: 'postal',
      line: ['123 Winter Lane'],
      city: 'Melbourne',
      state: 'VIC',
      postalCode: '3000'
    }
  ],
  telecom: [
    {
      system: 'phone',
      value: '0398765432',
      use: 'home'
    },
    {
      system: 'phone',
      value: '0412345678',
      use: 'mobile'
    }
  ],
  contact: [
    {
      relationship: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
              code: 'C',
              display: 'Emergency Contact'
            }
          ]
        }
      ],
      name: {
        family: 'Stark',
        given: ['Arya']
      },
      telecom: [
        {
          system: 'phone',
          value: '0400000000'
        }
      ]
    }
  ],

  identifier: [
    {
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MC',
            display: "Patient's Medicare number"
          }
        ]
      },
      value: '12345678901',
      period: {
        end: '2025-12-31'
      }
    },
    {
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'PEN',
            display: 'Pensioner Card Number'
          }
        ]
      },
      value: 'PEN123456'
    },
    {
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'HC',
            display: 'Health Care Card Number'
          }
        ]
      },
      value: 'HC987654'
    }
  ]
};

const onsetDateTime = '2025-10-10';
const abatementDateTime = '2026-01-01';

export const condition: Condition = {
  resourceType: 'Condition',
  id: 'active-snomed-condition',
  subject: { reference: `Patient/${patient.id}` },
  onsetDateTime,
  code: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '123456',
        display: "Parkinson's disease"
      }
    ]
  },
  clinicalStatus: {
    coding: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
        code: 'active'
      }
    ]
  },
  verificationStatus: {
    coding: [
      {
        code: 'confirmed'
      }
    ]
  },
  category: [
    {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-category',
          code: 'problem-list-item'
        }
      ]
    }
  ]
};

export const nonSnomedCondition: Condition = {
  resourceType: 'Condition',
  id: 'active-non-snomed-condition',
  subject: { reference: `Patient/${patient.id}` },
  onsetDateTime,
  code: {
    text: 'Non-SNOMED condition'
  },
  clinicalStatus: {
    coding: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
        code: 'active'
      }
    ]
  },
  verificationStatus: {
    coding: [
      {
        code: 'confirmed'
      }
    ]
  },
  category: [
    {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-category',
          code: 'problem-list-item'
        }
      ]
    }
  ],
  note: [
    {
      text: 'Test comment'
    }
  ]
};

export const resolvedCondition: Condition = {
  resourceType: 'Condition',
  id: 'resolved-condition',
  subject: { reference: `Patient/${patient.id}` },
  onsetDateTime,
  abatementDateTime,
  code: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '654321',
        display: 'Resolved condition'
      }
    ]
  },
  clinicalStatus: {
    coding: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
        code: 'inactive'
      }
    ]
  },
  verificationStatus: {
    coding: [
      {
        code: 'confirmed'
      }
    ]
  },
  category: [
    {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-category',
          code: 'problem-list-item'
        }
      ]
    }
  ]
};

const aboutTheHealthCheckQuestionnaireResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  id: 'qr-about-the-health-check',
  status: 'completed',
  questionnaire: 'http://www.health.gov.au/assessments/mbs/715',
  subject: { reference: `Patient/${patient.id}` },
  authored: '2026-03-01'
};

export const currentMedication: MedicationStatement = {
  resourceType: 'MedicationStatement',
  id: 'current-medication',
  subject: { reference: `Patient/${patient.id}` },
  effectiveDateTime: '2026-03-01',
  medicationCodeableConcept: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '123456',
        display: 'Paracetamol 500mg tablet'
      }
    ]
  },
  status: 'active',
  dosage: [
    {
      text: 'Once daily, 10mg'
    }
  ],
  reasonCode: [
    {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '271807003',
          display: 'Clinical indication for medication'
        }
      ]
    }
  ],
  note: [
    {
      text: 'Patient should take with food'
    }
  ]
};

const nonSnomedMedication: MedicationStatement = {
  resourceType: 'MedicationStatement',
  id: 'current-non-snomed-medication',
  subject: { reference: `Patient/${patient.id}` },
  effectiveDateTime: '2026-03-01',
  medicationCodeableConcept: {
    coding: [
      {
        system: 'http://loinc.org',
        code: '98765-4',
        display: 'Non-SNOMED medication'
      }
    ],
    text: 'Non-SNOMED medication'
  },
  status: 'active',
  dosage: [
    {
      text: 'Once daily, 5mg'
    }
  ],
  reasonCode: [
    {
      coding: [
        {
          system: 'http://loinc.org',
          code: '13579-2',
          display: 'Non-SNOMED clinical indication for medication'
        }
      ],
      text: 'Non-SNOMED clinical indication for medication'
    }
  ],
  note: [
    {
      text: 'Non-SNOMED medication note'
    }
  ]
};

const aboutTheHealthCheckInProgressQuestionnaireResponse: QuestionnaireResponse = {
  ...aboutTheHealthCheckQuestionnaireResponse,
  id: 'qr-about-the-health-check-in-progress',
  status: 'in-progress',
  authored: '2025-07-31T10:00:00+09:30'
};

const allergy: AllergyIntolerance = {
  resourceType: 'AllergyIntolerance',
  id: 'allergy',
  patient: { reference: `Patient/${patient.id}` },
  code: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '227493005',
        display: 'Cashew nuts'
      }
    ]
  },
  clinicalStatus: {
    coding: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
        code: 'active'
      }
    ]
  },
  reaction: [
    {
      manifestation: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '271807003',
              display: 'Rash'
            }
          ]
        }
      ]
    }
  ],
  note: [
    {
      text: 'Patient experiences rash and swelling'
    }
  ]
};

export const nonSnomedAllergy: AllergyIntolerance = {
  resourceType: 'AllergyIntolerance',
  id: 'non-snomed-allergy',
  patient: { reference: `Patient/${patient.id}` },
  code: {
    text: 'Non-SNOMED allergen'
  },
  clinicalStatus: {
    coding: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
        code: 'active'
      }
    ]
  },
  reaction: [
    {
      manifestation: [
        {
          coding: [
            {
              system: 'http://loinc.org',
              code: '5678-9',
              display: 'Non-SNOMED reaction'
            }
          ],
          text: 'Non-SNOMED reaction'
        }
      ]
    }
  ],
  note: [
    {
      text: 'Non-SNOMED allergy note'
    }
  ]
};

const immunization: Immunization = {
  resourceType: 'Immunization',
  id: 'immunization',
  status: 'completed',
  patient: { reference: `Patient/${patient.id}` },

  vaccineCode: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '123456',
        display: 'Vaccine'
      }
    ]
  },

  occurrenceDateTime: '2026-03-01',

  lotNumber: 'BATCH-123',

  note: [
    {
      text: 'Routine immunisation comment'
    }
  ]
};

export const nonSnomedImmunization: Immunization = {
  resourceType: 'Immunization',
  id: 'non-snomed-immunization',
  status: 'completed',
  patient: { reference: `Patient/${patient.id}` },
  vaccineCode: {
    text: 'Non-SNOMED vaccine'
  },
  occurrenceDateTime: '2026-03-02',
  lotNumber: 'BATCH-456',
  note: [
    {
      text: 'Non-SNOMED immunisation comment'
    }
  ]
};

export const obsTobaccoSmokingStatus: Observation = {
  resourceType: 'Observation',
  id: 'obs-tobacco-smoking-status',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  "category": [
    {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'social-history'
        }
      ]
    }
  ],
  code: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '1747861000168109'
      },
      {
        code: '72166-2',
        system: 'http://loinc.org',
      }
    ],
    text: 'Smoking status'
  },
  effectiveDateTime: '2025-12-01',
  valueCodeableConcept: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '77176002',
        display: 'Current smoker'
      }
    ]
  }
};

export const obsBodyHeight: Observation = {
  resourceType: 'Observation',
  id: 'obs-body-height',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  "category": [
     {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs'
        }
      ]
    }
  ],
  code: {
    coding: [
      { system: 'http://loinc.org', code: '8302-2' },
      { system: 'http://snomed.info/sct', code: '50373000' }
    ],
    text: 'Height'
  },
  effectiveDateTime: '2025-11-20',
  valueQuantity: {
    value: 170,
    unit: 'cm',
    system: 'http://unitsofmeasure.org',
    code: 'cm'
  }
};

export const obsBodyWeight: Observation = {
  resourceType: 'Observation',
  id: 'obs-body-weight',
  status: 'final',
  "category": [
     {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs'
        }
      ]
    }
  ],
  subject: { reference: `Patient/${patient.id}` },
  code: {
    coding: [
      { system: 'http://loinc.org', code: '29463-7' },
      { system: 'http://snomed.info/sct', code: '27113001' }
    ],
    text: 'Weight'
  },
  effectiveDateTime: '2025-11-21',
  valueQuantity: {
    value: 70,
    unit: 'kg',
    system: 'http://unitsofmeasure.org',
    code: 'kg'
  }
};

const obsHeadCircumference: Observation = {
  resourceType: 'Observation',
  id: 'obs-head-circumference',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  code: {
    coding: [
      { system: 'http://loinc.org', code: '9843-4', display: 'Head circumference' },
      { system: 'http://snomed.info/sct', code: '363812007', display: 'Head circumference' }
    ]
  },
  effectiveDateTime: '2025-11-22',
  valueQuantity: {
    value: 55,
    unit: 'cm',
    system: 'http://unitsofmeasure.org',
    code: 'cm'
  }
};

export const obsWaistCircumference: Observation = {
  resourceType: 'Observation',
  id: 'obs-waist-circumference',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  "category": [
         {
          coding: [
             {
               code: 'vital-signs',
               system: 'http://terminology.hl7.org/CodeSystem/observation-category',
             }  
           ],
         },
       ],
  code: {
    coding: [
      { system: 'http://loinc.org', code: '8280-0' },
      { system: 'http://snomed.info/sct', code: '276361009' }
    ],
    text: 'Waist circumference'
  },
  effectiveDateTime: '2025-11-23',
  valueQuantity: {
    value: 90,
    unit: 'cm',
    system: 'http://unitsofmeasure.org',
    code: 'cm'
  }
};

export const obsHeartRate: Observation = {
  resourceType: 'Observation',
  id: 'obs-heart-rate',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  "category": [
         {
           coding: [
             {
               code: 'vital-signs',
               system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            },
          ]
        }
      ],
  code: {
    coding: [
      { system: 'http://loinc.org', code: '8867-4' },
      { system: 'http://snomed.info/sct', code: '364075005' }
    ],
    text: 'Heart rate'
  },
  effectiveDateTime: '2025-12-04',
  valueQuantity: {
    value: 72,
    unit: '/min',
    system: 'http://unitsofmeasure.org',
    code: '/min'
  }
};

export const obsHeartRhythm: Observation = {
  resourceType: 'Observation',
  id: 'obs-heart-rhythm',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  "category": [
     {
      coding: [
         {
           code: 'vital-signs',
           system: 'http://terminology.hl7.org/CodeSystem/observation-category',
         }
       ]
     }
   ],
  code: {
    coding: [
      { system: 'http://loinc.org', code: '8884-9' },
      { system: 'http://snomed.info/sct', code: '364074009' }
    ],
    text: 'Heart rhythm'
  },
  effectiveDateTime: '2025-12-03',
  valueCodeableConcept: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '933506231000036108',
        display: 'Regular heart rhythm'
      }
    ]
  }
};

export const obsBloodPressure: Observation = {
  resourceType: 'Observation',
  id: 'obs-blood-pressure',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  code: {
    coding: [
      {
        system: 'http://loinc.org',
        code: '85354-9',
        display: 'Blood pressure panel with all children optional'
      }
    ]
  },
  effectiveDateTime: '2025-12-02',
  component: [
    {
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '8480-6',
            display: 'Systolic blood pressure'
          }
        ]
      },
      valueQuantity: {
        value: 120,
        unit: 'mmHg',
        system: 'http://unitsofmeasure.org',
        code: 'mm[Hg]'
      }
    },
    {
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '8462-4',
            display: 'Diastolic blood pressure'
          }
        ]
      },
      valueQuantity: {
        value: 80,
        unit: 'mmHg',
        system: 'http://unitsofmeasure.org',
        code: 'mm[Hg]'
      }
    }
  ]
};

const obsTotalCholesterol: Observation = {
  resourceType: 'Observation',
  id: 'obs-total-cholesterol',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  code: {
    coding: [
      {
        system: 'http://loinc.org',
        code: '14647-2',
        display: 'Cholesterol [Moles/volume] in Serum or Plasma'
      }
    ]
  },
  effectiveDateTime: '2025-11-15',
  valueQuantity: {
    value: 5.2,
    unit: 'mmol/L',
    system: 'http://unitsofmeasure.org',
    code: 'mmol/L'
  }
};

const obsHDLCholesterol: Observation = {
  resourceType: 'Observation',
  id: 'obs-hdl-cholesterol',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  code: {
    coding: [
      {
        system: 'http://loinc.org',
        code: '14646-4',
        display: 'Cholesterol in HDL [Moles/volume] in Serum or Plasma'
      }
    ]
  },
  effectiveDateTime: '2025-11-16',
  valueQuantity: {
    value: 1.3,
    unit: 'mmol/L',
    system: 'http://unitsofmeasure.org',
    code: 'mmol/L'
  }
};

const obsCVDRiskResult: Observation = {
  resourceType: 'Observation',
  id: 'obs-cvd-risk-result',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  code: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '441829007',
        display: 'Cardiovascular disease risk assessment'
      }
    ]
  },
  effectiveDateTime: '2025-12-05',
  valueQuantity: {
    value: 10,
    unit: '%',
    system: 'http://unitsofmeasure.org',
    code: '%'
  },
  interpretation: [
    {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
          code: 'L',
          display: 'Low risk'
        }
      ]
    }
  ]
};

export const requestDefinitions: RequestDefinition[] = [
  {
    urlPrefix: 'Condition',
    params: {},
    responseBody: makeSearchSetBundle([condition, nonSnomedCondition, resolvedCondition])
  },

  {
    urlPrefix: 'QuestionnaireResponse',
    params: { status: 'completed' },
    responseBody: makeSearchSetBundle([aboutTheHealthCheckQuestionnaireResponse])
  },

  {
    urlPrefix: 'QuestionnaireResponse',
    params: {},
    responseBody: makeSearchSetBundle([aboutTheHealthCheckInProgressQuestionnaireResponse])
  },
  {
    urlPrefix: 'MedicationStatement',
    params: {},
    responseBody: makeSearchSetBundle([currentMedication, nonSnomedMedication])
  },
  {
    urlPrefix: 'Observation',
    params: { code: '1747861000168109' },
    responseBody: makeSearchSetBundle([obsTobaccoSmokingStatus])
  },
  {
    urlPrefix: 'Observation',
    params: { code: '8302-2' },
    responseBody: makeSearchSetBundle([obsBodyHeight])
  },
  {
    urlPrefix: 'Observation',
    params: { code: '29463-7' },
    responseBody: makeSearchSetBundle([obsBodyWeight])
  },
  {
    urlPrefix: 'Observation',
    params: { code: '9843-4' },
    responseBody: makeSearchSetBundle([obsHeadCircumference])
  },
  {
    urlPrefix: 'Observation',
    params: { code: '8280-0' },
    responseBody: makeSearchSetBundle([obsWaistCircumference])
  },
  {
    urlPrefix: 'Observation',
    params: { code: '8867-4' },
    responseBody: makeSearchSetBundle([obsHeartRate])
  },
  {
    urlPrefix: 'Observation',
    params: { code: '364074009' },
    responseBody: makeSearchSetBundle([obsHeartRhythm])
  },
  {
    urlPrefix: 'Observation',
    params: { code: '85354-9' },
    responseBody: makeSearchSetBundle([obsBloodPressure])
  },
  {
    urlPrefix: 'Observation',
    params: { code: '14647-2' },
    responseBody: makeSearchSetBundle([obsTotalCholesterol])
  },
  {
    urlPrefix: 'Observation',
    params: { code: '14646-4' },
    responseBody: makeSearchSetBundle([obsHDLCholesterol])
  },
  {
    urlPrefix: 'Observation',
    params: { code: '441829007' },
    responseBody: makeSearchSetBundle([obsCVDRiskResult])
  },
  {
    urlPrefix: 'AllergyIntolerance',
    params: {},
    responseBody: makeSearchSetBundle([allergy, nonSnomedAllergy])
  },
  {
    urlPrefix: 'Immunization',
    params: {},
    responseBody: makeSearchSetBundle([immunization, nonSnomedImmunization])
  }
];

function makeSearchSetBundle(resources: FhirResource[]) {
  return {
    resourceType: 'Bundle',
    type: 'searchset',
    entry: resources.map((resource) => ({
      resource: resource
    }))
  };
}
