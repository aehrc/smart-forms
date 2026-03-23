import { render, waitFor } from '@testing-library/react';
import { vi, beforeAll } from 'vitest';

import { AboriginalForm, RequestDefinition } from './aboriginalFormUtils.tsx';
import {
  AllergyIntolerance,
  Condition,
  FhirResource,
  Immunization,
  MedicationStatement,
  Observation,
  Patient,
  QuestionnaireResponse
} from 'fhir/r4';
import {
  getBirthDateForAge,
  getInputText,
  getCqfText,
  selectTab,
  findByLinkIdOrLabel,
  findAllByLinkIdOrLabel,
  getSelectText
} from './testUtils.ts';

const patient: Patient = {
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

const onsetDateTime = '2025-10-10T00:00:00.000Z';
const abatementDateTime = '2026-01-01T00:00:00.000Z';

const condition: Condition = {
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

const nonSnomedCondition: Condition = {
  resourceType: 'Condition',
  id: 'active-non-snomed-condition',
  subject: { reference: `Patient/${patient.id}` },
  onsetDateTime,
  code: {
    coding: [
      {
        system: 'http://loinc.org',
        code: '78910',
        display: 'Non-SNOMED condition'
      }
    ],
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
  ]
};

const resolvedCondition: Condition = {
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

const currentMedication: MedicationStatement = {
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

const nonSnomedAllergy: AllergyIntolerance = {
  resourceType: 'AllergyIntolerance',
  id: 'non-snomed-allergy',
  patient: { reference: `Patient/${patient.id}` },
  code: {
    coding: [
      {
        system: 'http://loinc.org',
        code: '1234-5',
        display: 'Non-SNOMED allergen'
      }
    ],
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

const nonSnomedImmunization: Immunization = {
  resourceType: 'Immunization',
  id: 'non-snomed-immunization',
  status: 'completed',
  patient: { reference: `Patient/${patient.id}` },
  vaccineCode: {
    coding: [
      {
        system: 'http://loinc.org',
        code: '2468-0',
        display: 'Non-SNOMED vaccine'
      }
    ],
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

const obsTobaccoSmokingStatus: Observation = {
  resourceType: 'Observation',
  id: 'obs-tobacco-smoking-status',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  code: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '1747861000168109',
        display: 'Tobacco smoking status'
      }
    ]
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

const obsBodyHeight: Observation = {
  resourceType: 'Observation',
  id: 'obs-body-height',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  code: {
    coding: [
      { system: 'http://loinc.org', code: '8302-2', display: 'Height' },
      { system: 'http://snomed.info/sct', code: '50373000', display: 'Height' }
    ]
  },
  effectiveDateTime: '2025-11-20',
  valueQuantity: {
    value: 170,
    unit: 'cm',
    system: 'http://unitsofmeasure.org',
    code: 'cm'
  }
};

const obsBodyWeight: Observation = {
  resourceType: 'Observation',
  id: 'obs-body-weight',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  code: {
    coding: [
      { system: 'http://loinc.org', code: '29463-7', display: 'Weight' },
      { system: 'http://snomed.info/sct', code: '27113001', display: 'Weight' }
    ]
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

const obsWaistCircumference: Observation = {
  resourceType: 'Observation',
  id: 'obs-waist-circumference',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  code: {
    coding: [
      { system: 'http://loinc.org', code: '8280-0', display: 'Waist circumference' },
      { system: 'http://snomed.info/sct', code: '276361009', display: 'Waist circumference' }
    ]
  },
  effectiveDateTime: '2025-11-23',
  valueQuantity: {
    value: 90,
    unit: 'cm',
    system: 'http://unitsofmeasure.org',
    code: 'cm'
  }
};

const obsHeartRate: Observation = {
  resourceType: 'Observation',
  id: 'obs-heart-rate',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  code: {
    coding: [
      { system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' },
      { system: 'http://snomed.info/sct', code: '364075005', display: 'Heart rate' }
    ]
  },
  effectiveDateTime: '2025-12-04',
  valueQuantity: {
    value: 72,
    unit: '/min',
    system: 'http://unitsofmeasure.org',
    code: '/min'
  }
};

const obsHeartRhythm: Observation = {
  resourceType: 'Observation',
  id: 'obs-heart-rhythm',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  code: {
    coding: [
      { system: 'http://loinc.org', code: '8884-9', display: 'Heart rhythm' },
      { system: 'http://snomed.info/sct', code: '364074009', display: 'Heart rhythm' }
    ]
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

const obsBloodPressure: Observation = {
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

const requestDefinitions: RequestDefinition[] = [
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

vi.mock('fhirclient', () => ({
  client: () => ({})
}));

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('Dummy integration test', () => {
  test('Patient details', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Patient Details');

    const patientAge = await getInputText(container, 'Age');
    expect(patientAge).toBe('33');

    const patientName = await getInputText(container, 'Name');
    expect(patientName).toBe('John, Snow');

    const preferredName = await getInputText(container, 'Preferred name');
    expect(preferredName).toBe('Johnny');

    const preferredPronouns = await getInputText(container, 'Preferred pronouns');
    expect(preferredPronouns).toBe('he/him/his/his/himself');

    const genderIdentity = await getInputText(container, 'Gender identity');
    expect(genderIdentity).toBe('Identifies as male gender');

    const sexAssignedAtBirth = await getInputText(container, 'Sex assigned at birth');
    expect(sexAssignedAtBirth).toBe('Male');

    const dateOfBirth = await getInputText(container, 'Date of birth');
    const birthDateIso = getBirthDateForAge(33);
    const [year, month, day] = birthDateIso.split('-');
    const expectedDateOfBirth = `${day}/${month}/${year}`;
    expect(dateOfBirth).toBe(expectedDateOfBirth);

    const aboriginalAndTorresStraitIslanderStatus = await getInputText(
      container,
      'Aboriginal and/or Torres Strait Islander status'
    );
    expect(aboriginalAndTorresStraitIslanderStatus).toBe('1');

    // Home address
    const homeAddress = await findByLinkIdOrLabel(container, 'Home address');
    const streetAddress = await getInputText(homeAddress, 'Street address');
    expect(streetAddress).toBe('123 Winter Lane');
    const city = await getInputText(homeAddress, 'City');
    expect(city).toBe('Melbourne');
    const state = await getInputText(homeAddress, 'State');
    expect(state).toBe('Victoria');
    const postalCode = await getInputText(homeAddress, 'Postcode');
    expect(postalCode).toBe('3000');

    // Postal address
    const postalAddress = await findByLinkIdOrLabel(container, 'Postal address');
    const postalStreetAddress = await getInputText(postalAddress, 'Street address');
    expect(postalStreetAddress).toBe('123 Winter Lane');
    const postalCity = await getInputText(postalAddress, 'City');
    expect(postalCity).toBe('Melbourne');
    const postalState = await getInputText(postalAddress, 'State');
    expect(postalState).toBe('Victoria');
    const postalPostcode = await getInputText(postalAddress, 'Postcode');
    expect(postalPostcode).toBe('3000');

    const homePhone = await getInputText(container, 'Home phone');
    expect(homePhone).toBe('0398765432');
    const mobilePhone = await getInputText(container, 'Mobile phone');
    expect(mobilePhone).toBe('0412345678');

    const emergencyContact = await findByLinkIdOrLabel(container, 'Emergency contact');
    const emergencyContactName = await getInputText(emergencyContact, 'Name');
    expect(emergencyContactName).toBe('Stark, Arya');
    const emergencyContactPhone = await getInputText(emergencyContact, 'Phone');
    expect(emergencyContactPhone).toBe('0400000000');

    const medicareNumber = await findByLinkIdOrLabel(container, 'Medicare number');
    const medicareNumberNumber = await getInputText(medicareNumber, 'Number');
    expect(medicareNumberNumber).toBe('1234567890');
    const medicareNumberReferenceNumber = await getInputText(medicareNumber, 'Reference number');
    expect(medicareNumberReferenceNumber).toBe('1');
    const medicareNumberExpiry = await getInputText(medicareNumber, 'Expiry');
    expect(medicareNumberExpiry).toBe('2025-12-31');

    const pensionerCardNumber = await getInputText(container, 'Pensioner Card Number');
    expect(pensionerCardNumber).toBe('PEN123456');

    const healthcareCardNumber = await getInputText(container, 'Health Care Card Number');
    expect(healthcareCardNumber).toBe('HC987654');

    const closingTheGapRegistration = await getInputText(
      container,
      'Registered for Closing the Gap PBS Co-payment Measure (CTG)'
    );
    expect(closingTheGapRegistration).toBe('true');
  });

  test('Patient with no fixed address', async () => {
    const patientNoFixedAddress: Patient = {
      ...patient,
      address: [
        {
          use: 'home',
          type: 'physical',
          extension: [
            {
              url: 'http://hl7.org.au/fhir/StructureDefinition/no-fixed-address',
              valueBoolean: true
            }
          ]
        },
        ...(patient.address ?? []).filter((a) => a.use === 'home' && a.type === 'postal')
      ]
    };
    const { container } = render(
      <AboriginalForm patient={patientNoFixedAddress} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Patient Details');

    const homeAddress = await findByLinkIdOrLabel(container, 'Home address');
    await expect(
      async () => await findByLinkIdOrLabel(homeAddress, 'Street address')
    ).rejects.toThrow();
  });

  test('Medical conditions', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Medical history and current problems');

    const medicalHistorySummary = await findByLinkIdOrLabel(container, 'Medical history summary');
    const mhRow1: HTMLElement = medicalHistorySummary.querySelector('tbody tr:nth-child(1)')!;
    expect(mhRow1).toBeTruthy();

    const medicalHistory = await getInputText(mhRow1, 'Condition');
    expect(medicalHistory).toBe("Parkinson's disease");
    const medicalHistoryClinicalStatus = await getInputText(mhRow1, 'Clinical status');
    expect(medicalHistoryClinicalStatus).toBe('Active');
    const medicalHistoryOnsetDate = await getInputText(mhRow1, 'Onset date');
    expect(medicalHistoryOnsetDate).toBe('10/10/2025');

    const mhRow2: HTMLElement = medicalHistorySummary.querySelector('tbody tr:nth-child(2)')!;
    expect(mhRow2).toBeTruthy();
    const medicalHistory2 = await getInputText(mhRow2, 'Condition');
    expect(medicalHistory2).toBe('Non-SNOMED condition');
    const medicalHistoryClinicalStatus2 = await getInputText(mhRow2, 'Clinical status');
    expect(medicalHistoryClinicalStatus2).toBe('Active');
    const medicalHistoryOnsetDate2 = await getInputText(mhRow2, 'Onset date');
    expect(medicalHistoryOnsetDate2).toBe('10/10/2025');

    const mhRow3: HTMLElement = medicalHistorySummary.querySelector('tbody tr:nth-child(3)')!;
    expect(mhRow3).toBeTruthy();
    const medicalHistory3 = await getInputText(mhRow3, 'Condition');
    expect(medicalHistory3).toBe('Resolved condition');
    const medicalHistoryClinicalStatus3 = await getInputText(mhRow3, 'Clinical status');
    expect(medicalHistoryClinicalStatus3).toBe('Inactive');
    const medicalHistoryOnsetDate3 = await getInputText(mhRow3, 'Onset date');
    expect(medicalHistoryOnsetDate3).toBe('10/10/2025');
    const medicalHistoryAbatementDate3 = await getInputText(mhRow3, 'Abatement date');
    expect(medicalHistoryAbatementDate3).toBe('01/01/2026');
  });

  test('About the health check', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'About the health check');

    const healthCheckAlreadyInProgress = await getInputText(
      container,
      'Health check already in progress?'
    );
    expect(healthCheckAlreadyInProgress).toBe('true');

    const dateOfLastCompletedHealthCheck = await getInputText(
      container,
      'Date of last completed health check'
    );
    expect(dateOfLastCompletedHealthCheck).toBe('01/03/2026');

    const dateOfHealthCheckCommenced = await getInputText(
      container,
      'Date this health check commenced'
    );

    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedToday = `${day}/${month}/${year}`;

    expect(dateOfHealthCheckCommenced).toBe(formattedToday);
  });

  test('Consent', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Consent');

    const consentDate = await getInputText(container, 'Date');

    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedToday = `${day}/${month}/${year}`;

    expect(consentDate).toBe(formattedToday);
  });
  test('Regular medications', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Regular medications');

    const medicationRows = await findAllByLinkIdOrLabel(
      container,
      'regularmedications-summary-current'
    );
    expect(medicationRows.length).toBe(2);

    const medRow1 = medicationRows[0]!;
    const currentMedication = await getInputText(medRow1, 'Medication');
    expect(currentMedication).toBe('Paracetamol 500mg tablet');
    const currentMedicationStatus = await getInputText(medRow1, 'Status');
    expect(currentMedicationStatus).toBe('Active');
    const currentMedicationDosage = await getInputText(medRow1, 'Dosage');
    expect(currentMedicationDosage).toBe('Once daily, 10mg');
    const currentMedicationReasonCode = await getInputText(medRow1, 'Clinical indication');
    expect(currentMedicationReasonCode).toBe('Clinical indication for medication');
    const currentMedicationComment = await getInputText(medRow1, 'Comment');
    expect(currentMedicationComment).toBe('Patient should take with food');

    const medRow2 = medicationRows[1]!;
    const currentMedication2 = await getInputText(medRow2, 'Medication');
    expect(currentMedication2).toBe('Non-SNOMED medication');
    const currentMedicationStatus2 = await getInputText(medRow2, 'Status');
    expect(currentMedicationStatus2).toBe('Active');
    const currentMedicationDosage2 = await getInputText(medRow2, 'Dosage');
    expect(currentMedicationDosage2).toBe('Once daily, 5mg');
    const currentMedicationReasonCode2 = await getInputText(medRow2, 'Clinical indication');
    expect(currentMedicationReasonCode2).toBe('Non-SNOMED clinical indication for medication');
    const currentMedicationComment2 = await getInputText(medRow2, 'Comment');
    expect(currentMedicationComment2).toBe('Non-SNOMED medication note');
  });

  test('Allergies', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Allergies/adverse reactions');

    const allergiesRows = container.querySelectorAll<HTMLElement>('[data-linkid="allergysummary"]');
    expect(allergiesRows.length).toBe(2);
    const allergyRow1 = allergiesRows[0]!;
    const allergySubstance = await getInputText(allergyRow1, 'Substance');
    expect(allergySubstance).toBe('Cashew nuts');
    const allergyStatus = await getInputText(allergyRow1, 'Status');
    expect(allergyStatus).toBe('Active');
    const allergyManifestation = await getInputText(allergyRow1, 'Manifestation');
    expect(allergyManifestation).toBe('Rash');
    const allergyComment = await getInputText(allergyRow1, 'Comment');
    expect(allergyComment).toBe('Patient experiences rash and swelling');

    const allergyRow2 = allergiesRows[1]!;
    const allergySubstance2 = await getInputText(allergyRow2, 'Substance');
    expect(allergySubstance2).toBe('Non-SNOMED allergen');
    const allergyStatus2 = await getInputText(allergyRow2, 'Status');
    expect(allergyStatus2).toBe('Active');
    const allergyManifestation2 = await getInputText(allergyRow2, 'Manifestation');
    expect(allergyManifestation2).toBe('Non-SNOMED reaction');
    const allergyComment2 = await getInputText(allergyRow2, 'Comment');
    expect(allergyComment2).toBe('Non-SNOMED allergy note');
  });

  test('Substance use, including tobacco', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Substance use, including tobacco');

    const smokingStatusStringContainer = await findByLinkIdOrLabel(container, 'Smoking status');
    const lastResultSmokingStatus = await getCqfText(smokingStatusStringContainer, 'Last status');
    expect(lastResultSmokingStatus).toBe('Current smoker ( 1 Dec 2025 )');
  });

  test('Immunizations', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Immunisation');

    const vaccinesPreviouslyGiven = await findByLinkIdOrLabel(
      container,
      'Vaccines previously given'
    );
    const vaccinesRow1: HTMLElement =
      vaccinesPreviouslyGiven.querySelector('tbody tr:nth-child(1)')!;
    expect(vaccinesRow1).toBeTruthy();
    const vaccine1 = await getInputText(vaccinesRow1, 'Vaccine');
    expect(vaccine1).toBe('Vaccine');
    const vaccineBatchNumber1 = await getInputText(vaccinesRow1, 'Batch number');
    expect(vaccineBatchNumber1).toBe('BATCH-123');
    const vaccineDate1 = await getInputText(vaccinesRow1, 'Administration date');
    expect(vaccineDate1).toBe('01/03/2026');
    const vaccineComment1 = await getInputText(vaccinesRow1, 'Comment');
    expect(vaccineComment1).toBe('Routine immunisation comment');

    const vaccinesRow2: HTMLElement =
      vaccinesPreviouslyGiven.querySelector('tbody tr:nth-child(2)')!;
    expect(vaccinesRow2).toBeTruthy();
    const vaccine2 = await getInputText(vaccinesRow2, 'Vaccine');
    expect(vaccine2).toBe('Non-SNOMED vaccine');
    const vaccineBatchNumber2 = await getInputText(vaccinesRow2, 'Batch number');
    expect(vaccineBatchNumber2).toBe('BATCH-456');
    const vaccineDate2 = await getInputText(vaccinesRow2, 'Administration date');
    expect(vaccineDate2).toBe('02/03/2026');
    const vaccineComment2 = await getInputText(vaccinesRow2, 'Comment');
    expect(vaccineComment2).toBe('Non-SNOMED immunisation comment');
  });

  test('Examination', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Examination');

    const heightStringContainer = await findByLinkIdOrLabel(container, 'Height');
    const lastResultHeight = await getCqfText(heightStringContainer, 'Last result');
    expect(lastResultHeight).toBe('170 cm ( 20 Nov 2025 )');
    const weightStringContainer = await findByLinkIdOrLabel(container, 'Weight');
    const lastResultWeight = await getCqfText(weightStringContainer, 'Last result');
    expect(lastResultWeight).toBe('70 kg ( 21 Nov 2025 )');
    const bmiStringContainer = await findByLinkIdOrLabel(container, 'BMI (calculated)');
    const lastResultBmi = await getCqfText(bmiStringContainer, 'Last result');
    expect(lastResultBmi).toBe('24.2 kg/m2');
    const waistCircumferenceStringContainer = await findByLinkIdOrLabel(
      container,
      'Waist circumference'
    );
    const lastResultWaistCircumference = await getCqfText(
      waistCircumferenceStringContainer,
      'Last result'
    );
    expect(lastResultWaistCircumference).toBe('90 cm ( 23 Nov 2025 )');
    const heartRateStringContainer = await findByLinkIdOrLabel(container, 'Heart rate');
    const lastResultHeartRate = await getCqfText(heartRateStringContainer, 'Last result');
    expect(lastResultHeartRate).toBe('72 /min ( 4 Dec 2025 )');
    const heartRhythmStringContainer = await findByLinkIdOrLabel(container, 'Heart rhythm');
    const lastResultHeartRhythm = await getCqfText(heartRhythmStringContainer, 'Last result');
    expect(lastResultHeartRhythm).toBe('Regular heart rhythm ( 3 Dec 2025 )');
  });

  test('CVD risk', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Absolute cardiovascular disease risk calculation');

    const cvdRiskResult = await findByLinkIdOrLabel(container, 'CVD risk result');
    const cvdRiskResultValue = await getInputText(cvdRiskResult, 'Latest available result');
    expect(cvdRiskResultValue).toBe('10% Low risk ( 5 Dec 2025 )');
    const smokingStatus = await findByLinkIdOrLabel(container, 'Smoking status');
    const smokingStatusValue = await getSelectText(smokingStatus, 'Value');
    expect(smokingStatusValue).toBe('Current smoker');
    const smokingStatusDatePerformed = await getInputText(smokingStatus, 'Date performed');
    expect(smokingStatusDatePerformed).toBe('01/12/2025');
    const bloodPressure = await findByLinkIdOrLabel(container, 'Systolic Blood Pressure');
    const bloodPressureValue = await getInputText(bloodPressure, 'Value');
    expect(bloodPressureValue).toBe('120');
    const bloodPressureDatePerformed = await getInputText(bloodPressure, 'Date performed');
    expect(bloodPressureDatePerformed).toBe('02/12/2025');
    const totalCholesterol = await findByLinkIdOrLabel(container, 'Total Cholesterol');
    const totalCholesterolValue = await getInputText(totalCholesterol, 'Value');
    expect(totalCholesterolValue).toBe('5.2');
    const totalCholesterolDatePerformed = await getInputText(totalCholesterol, 'Date performed');
    expect(totalCholesterolDatePerformed).toBe('15/11/2025');
    const hdlCholesterol = await findByLinkIdOrLabel(container, 'HDL Cholesterol');
    const hdlCholesterolValue = await getInputText(hdlCholesterol, 'Value');
    expect(hdlCholesterolValue).toBe('1.3');
    const hdlCholesterolDatePerformed = await getInputText(hdlCholesterol, 'Date performed');
    expect(hdlCholesterolDatePerformed).toBe('16/11/2025');
    const type2Diabetes = await getInputText(container, 'Type 2 diabetes mellitus');
    expect(type2Diabetes).toBe('true');
  });
});
