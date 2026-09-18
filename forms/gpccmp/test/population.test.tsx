import type {
  Bundle,
  Location,
  Patient,
  Practitioner,
  PractitionerRole,
  Questionnaire,
  Condition,
  FhirResource,
  AllergyIntolerance,
  MedicationStatement,
  Observation,
  QuestionnaireResponse
} from 'fhir/r4';
import type { BehavioralTestWrapperProps } from '@aehrc/questionnaire-test-toolkit';
import { BehavioralTestWrapper } from '@aehrc/questionnaire-test-toolkit';
import gpccmpForm from '../questionnaire/Questionnaire-GPChronicConditionManagementPlanAssembled.json';
import { render, waitFor } from '@testing-library/react';
import {
  findByLinkIdOrLabel,
  getBirthDateForAge,
  getInputText,
  getRadioValue,
  selectTab,
  getCqfText
} from '@aehrc/questionnaire-test-toolkit';

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
    },
    {
      system: 'email',
      value: 'john.snow@example.com',
      use: 'home'
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
        },
        {
          system: 'email',
          value: 'arya.stark@example.com'
        }
      ]
    }
  ]
};

export const practitioner: Practitioner = {
  resourceType: 'Practitioner',
  id: 'practitioner-456',
  name: [
    {
      use: 'official',
      family: 'Smith',
      given: ['Jane']
    }
  ],
  address: [
    {
      use: 'work',
      type: 'both',
      line: ['1 Clinic Road'],
      city: 'Melbourne',
      state: 'VIC',
      postalCode: '3000'
    }
  ]
};

const clinicLocation: Location = {
  resourceType: 'Location',
  id: 'clinic-location-1',
  name: 'Clinic Location',
  address: practitioner.address?.[0]
};

const practitionerRole: PractitionerRole = {
  resourceType: 'PractitionerRole',
  id: 'practitioner-role-1',
  practitioner: {
    reference: `Practitioner/${practitioner.id}`
  },
  location: [
    {
      reference: `Location/${clinicLocation.id}`
    }
  ]
};

const practitionerRoleLocationBundle: Bundle = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: [{ resource: practitionerRole }, { resource: clinicLocation }]
};

export const resolvedCondition: Condition = {
  resourceType: 'Condition',
  id: 'resolved-condition',
  subject: { reference: `Patient/${patient.id}` },
  onsetDateTime: '2025-10-10',
  abatementDateTime: '2026-10-10',
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

export const allergy: AllergyIntolerance = {
  resourceType: 'AllergyIntolerance',
  id: 'allergy',
  patient: { reference: `Patient/${patient.id}` },
  code: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '388050007',
        display: 'Cashew nut specific IgE'
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

export const currentMedication: MedicationStatement = {
  resourceType: 'MedicationStatement',
  id: 'current-medication',
  subject: { reference: `Patient/${patient.id}` },
  dateAsserted: '2026-03-01',
  medicationCodeableConcept: {
    coding: [
      {
        code: '23628011000036109',
        display: 'Paracetamol 500 mg tablet',
        system: 'http://snomed.info/sct'
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
          code: '418022001',
          display: 'Iris tuck'
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

export const obsBodyHeight: Observation = {
  resourceType: 'Observation',
  id: 'obs-body-height',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  category: [
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
  category: [
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

export const obsWaistCircumference: Observation = {
  resourceType: 'Observation',
  id: 'obs-waist-circumference',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  category: [
    {
      coding: [
        {
          code: 'vital-signs',
          system: 'http://terminology.hl7.org/CodeSystem/observation-category'
        }
      ]
    }
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
  category: [
    {
      coding: [
        {
          code: 'vital-signs',
          system: 'http://terminology.hl7.org/CodeSystem/observation-category'
        }
      ]
    }
  ],
  code: {
    coding: [
      { system: 'http://loinc.org', code: '78564009' },
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
  category: [
    {
      coding: [
        {
          code: 'vital-signs',
          system: 'http://terminology.hl7.org/CodeSystem/observation-category'
        }
      ]
    }
  ],
  code: {
    coding: [
      { system: 'http://loinc.org', code: '364095004' },
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

export const obsOxygenSaturation: Observation = {
  resourceType: 'Observation',
  id: 'obs-oxygen-saturation',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  category: [
    {
      coding: [
        {
          code: 'vital-signs',
          system: 'http://terminology.hl7.org/CodeSystem/observation-category'
        }
      ]
    }
  ],
  code: {
    coding: [
      {
        system: 'http://loinc.org',
        code: '2708-6',
        display: 'Oxygen saturation in Arterial blood'
      },
      {
        system: 'http://loinc.org',
        code: '59408-5',
        display: 'Oxygen saturation in Arterial blood by Pulse oximetry'
      },
      { system: 'http://snomed.info/sct', code: '103228002', display: 'Oxygen saturation' }
    ],
    text: 'Oxygen saturation'
  },
  effectiveDateTime: '2025-12-04',
  valueQuantity: {
    value: 98,
    unit: '%',
    system: 'http://unitsofmeasure.org',
    code: '%'
  }
};

export const obsBloodPressure: Observation = {
  resourceType: 'Observation',
  id: 'obs-blood-pressure',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  category: [
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
      {
        system: 'http://loinc.org',
        code: '85354-9'
      },
      {
        code: '75367002',
        system: 'http://snomed.info/sct'
      }
    ],
    text: 'Blood pressure'
  },
  effectiveDateTime: '2025-12-02',
  component: [
    {
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '8480-6'
          },
          {
            code: '271649006',
            system: 'http://snomed.info/sct'
          }
        ],
        text: 'Systolic'
      },
      valueQuantity: {
        value: 120,
        unit: 'mm[Hg]',
        system: 'http://unitsofmeasure.org',
        code: 'mm[Hg]'
      }
    },
    {
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '8462-4'
          },
          {
            code: '271650006',
            system: 'http://snomed.info/sct'
          }
        ],
        text: 'Diastolic'
      },
      valueQuantity: {
        value: 80,
        unit: 'mm[Hg]',
        system: 'http://unitsofmeasure.org',
        code: 'mm[Hg]'
      }
    }
  ]
};

export const obsTobaccoSmokingStatus: Observation = {
  resourceType: 'Observation',
  id: 'obs-tobacco-smoking-status',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  category: [
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
        system: 'http://loinc.org'
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

export const obsAlcoholConsumption: Observation = {
  resourceType: 'Observation',
  id: 'obs-alcohol-consumption',
  status: 'final',
  subject: { reference: `Patient/${patient.id}` },
  category: [
    {
      coding: [
        {
          code: 'social-history',
          system: 'http://terminology.hl7.org/CodeSystem/observation-category'
        }
      ]
    }
  ],
  code: {
    coding: [
      { system: 'http://loinc.org', code: '897148007', display: 'History of Alcohol use' },
      {
        system: 'http://snomed.info/sct',
        code: '228273003',
        display: 'Finding relating to alcohol drinking behavior'
      }
    ],
    text: 'Alcohol consumption status'
  },
  effectiveDateTime: '2025-12-04',
  valueCodeableConcept: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '219006',
        display: 'Current drinker of alcohol'
      }
    ],
    text: 'Current drinker'
  }
};

export const questionnaireResponsePlan: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  id: 'questionnaire-response-plan',
  questionnaire: 'http://www.health.gov.au/assessments/GPChronicConditionManagementPlan',
  status: 'completed',
  subject: { reference: `Patient/${patient.id}` },
  authored: '2025-12-04T10:00:00Z',
  item: [
    {
      linkId: 'plan-type',
      text: 'New plan or a review of an existing plan?',
      answer: [{ valueCoding: { code: 'review', display: 'Review' } }]
    }
  ]
};

export const questionnaireResponsePlanDraft: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  id: 'questionnaire-response-plan-draft',
  questionnaire: 'http://www.health.gov.au/assessments/GPChronicConditionManagementPlan',
  status: 'in-progress',
  subject: { reference: `Patient/${patient.id}` },
  authored: '2026-01-10T10:00:00Z'
};

export function makeSearchSetBundle(resources: FhirResource[]) {
  return {
    resourceType: 'Bundle',
    type: 'searchset',
    entry: resources.map((resource) => ({
      resource: resource
    }))
  };
}

function GpccmpForm(props: Omit<BehavioralTestWrapperProps, 'questionnaire'>) {
  return <BehavioralTestWrapper questionnaire={gpccmpForm as Questionnaire} {...props} />;
}

describe('Population workflow for', () => {
  test('Patient details', async () => {
    const { container } = render(<GpccmpForm patient={patient} />);

    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });
    await selectTab(container, 'Patient details');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const patientAge = await getInputText(container, 'Age');
    expect(patientAge).toBe('33');

    const patientName = await getInputText(container, 'Name');
    expect(patientName).toBe('Snow John');

    const preferredName = await getInputText(container, 'Preferred name');
    expect(preferredName).toBe('Johnny');

    const preferredPronouns = await getInputText(container, 'Preferred pronouns');
    expect(preferredPronouns).toBe('he/him/his/his/himself');

    const dateOfBirth = await getInputText(container, 'Date of birth');
    const birthDateIso = getBirthDateForAge(33);
    const [year, month, day] = birthDateIso.split('-');
    const expectedDateOfBirth = `${day}/${month}/${year}`;
    expect(dateOfBirth).toBe(expectedDateOfBirth);

    const sexAssignedAtBirth = await getInputText(container, 'Sex assigned at birth');
    expect(sexAssignedAtBirth).toBe('Male');

    const genderIdentity = await getInputText(container, 'Gender identity');
    expect(genderIdentity).toBe('Identifies as male gender');

    const aboriginalAndTorresStraitIslanderStatus = await getInputText(
      container,
      'Aboriginal and/or Torres Strait Islander status'
    );
    expect(aboriginalAndTorresStraitIslanderStatus).toBe(
      'Aboriginal but not Torres Strait Islander origin'
    );

    const closingTheGapRegistration = await getInputText(
      container,
      'Registered for Closing the Gap PBS Co-payment Measure (CTG)'
    );
    expect(closingTheGapRegistration).toBe('true');

    const medicareNumber = await findByLinkIdOrLabel(container, 'Medicare card number');
    const medicareNumberNumber = await getInputText(medicareNumber, 'Number');
    expect(medicareNumberNumber).toBe('1234567890');
    const medicareNumberReferenceNumber = await getInputText(medicareNumber, 'Reference number');
    expect(medicareNumberReferenceNumber).toBe('1');
    const medicareNumberExpiry = await getInputText(medicareNumber, 'Expiry');
    expect(medicareNumberExpiry).toBe('2025-12-31');

    const homePhoneNumber = await getInputText(container, 'Home phone');
    expect(homePhoneNumber).toBe('0398765432');

    const mobilePhoneNumber = await getInputText(container, 'Mobile phone');
    expect(mobilePhoneNumber).toBe('0412345678');

    const emailAddress = await getInputText(container, 'Email');
    expect(emailAddress).toBe('john.snow@example.com');

    const homeAddress = await findByLinkIdOrLabel(container, 'Home address');
    const streetAddress = await getInputText(homeAddress, 'Street address');
    expect(streetAddress).toBe('123 Winter Lane');
    const city = await getInputText(homeAddress, 'City');
    expect(city).toBe('Melbourne');
    const state = await getInputText(homeAddress, 'State');
    expect(state).toBe('Victoria');
    const postalCode = await getInputText(homeAddress, 'Postcode');
    expect(postalCode).toBe('3000');

    const postalAddress = await findByLinkIdOrLabel(container, 'Postal address');
    const postalPurpose = await getInputText(postalAddress, 'Purpose of use');
    expect(postalPurpose).toBe('home');
    const postalStreetAddress = await getInputText(postalAddress, 'Street address');
    expect(postalStreetAddress).toBe('123 Winter Lane');
    const postalCity = await getInputText(postalAddress, 'City');
    expect(postalCity).toBe('Melbourne');
    const postalState = await getInputText(postalAddress, 'State');
    expect(postalState).toBe('Victoria');
    const postalPostcode = await getInputText(postalAddress, 'Postcode');
    expect(postalPostcode).toBe('3000');

    const carersAndKeyContacts = await findByLinkIdOrLabel(container, 'Carers and key contacts');
    const carersAndKeyContactsName = await getInputText(carersAndKeyContacts, 'Name');
    expect(carersAndKeyContactsName).toBe('Arya Stark');
    const carersAndKeyContactsPhone = await getInputText(carersAndKeyContacts, 'Phone');
    expect(carersAndKeyContactsPhone).toBe('0400000000');
    const carersAndKeyContactsEmail = await getInputText(carersAndKeyContacts, 'Email');
    expect(carersAndKeyContactsEmail).toBe('arya.stark@example.com');
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
        ...(patient.address ?? []).filter(
          (address) => address.use === 'home' && address.type === 'postal'
        )
      ]
    };
    const { container } = render(<GpccmpForm patient={patientNoFixedAddress} />);

    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });
    await selectTab(container, 'Patient details');

    const homeAddress = await findByLinkIdOrLabel(container, 'Home address');
    await expect(
      async () => await findByLinkIdOrLabel(homeAddress, 'Street address')
    ).rejects.toThrow();
  });

  test('Practitioner details', async () => {
    const { container } = render(
      <GpccmpForm
        patient={patient}
        user={practitioner}
        fhirContext={[
          {
            type: 'PractitionerRole',
            reference: `PractitionerRole/${practitionerRole.id}`
          }
        ]}
        requestDefinitions={[
          {
            urlPrefix: 'PractitionerRole/',
            responseBody: practitionerRole
          },
          {
            urlPrefix: 'PractitionerRole',
            params: { _id: practitionerRole.id ?? '' },
            responseBody: practitionerRoleLocationBundle
          }
        ]}
      />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Practitioner details'), {
      timeout: 10000
    });
    await selectTab(container, 'Practitioner details');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const practitionerName = await getInputText(container, 'Name');
    expect(practitionerName).toBe('Jane Smith');

    const streetAddress = await getInputText(container, 'Street address');
    expect(streetAddress).toBe('1 Clinic Road');
    const city = await getInputText(container, 'City');
    expect(city).toBe('Melbourne');
    const state = await getInputText(container, 'State');
    expect(state).toBe('Victoria');
    const postalCode = await getInputText(container, 'Postcode');
    expect(postalCode).toBe('3000');
  });

  test('Conditions', async () => {
    const { container } = render(
      <GpccmpForm
        patient={patient}
        user={practitioner}
        requestDefinitions={[
          {
            urlPrefix: 'Condition',
            params: {},
            responseBody: makeSearchSetBundle([resolvedCondition])
          }
        ]}
      />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Clinical details'), {
      timeout: 10000
    });
    await selectTab(container, 'Clinical details');

    const recorderDiagnosis = await findByLinkIdOrLabel(container, 'Recorded problems/diagnoses');
    const recorderDiagnosisName = await getInputText(recorderDiagnosis, 'Condition');
    expect(recorderDiagnosisName).toBe('Resolved condition');
    const recorderDiagnosisClinicalStatus = await getInputText(
      recorderDiagnosis,
      'Clinical status'
    );
    expect(recorderDiagnosisClinicalStatus).toBe('Inactive');
    const recorderDiagnosisOnset = await getInputText(recorderDiagnosis, 'Onset date');
    expect(recorderDiagnosisOnset).toBe('10/10/2025');
    const recorderDiagnosisAbatement = await getInputText(recorderDiagnosis, 'Abatement date');
    expect(recorderDiagnosisAbatement).toBe('10/10/2026');
  });

  test('Allergies', async () => {
    const { container } = render(
      <GpccmpForm
        patient={patient}
        user={practitioner}
        requestDefinitions={[
          {
            urlPrefix: 'AllergyIntolerance',
            params: {},
            responseBody: makeSearchSetBundle([allergy])
          }
        ]}
      />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Clinical details'), {
      timeout: 10000
    });
    await selectTab(container, 'Clinical details');

    const allergies = await findByLinkIdOrLabel(container, 'Recorded adverse reaction risks');
    const allergiesName = await getInputText(allergies, 'Substance');
    expect(allergiesName).toBe('Cashew nut specific IgE');
    const allergiesClinicalStatus = await getInputText(allergies, 'Status');
    expect(allergiesClinicalStatus).toBe('Active');
    const allergiesReaction = await getInputText(allergies, 'Manifestation');
    expect(allergiesReaction).toBe('Rash');
    const allergiesNote = await getInputText(allergies, 'Comment');
    expect(allergiesNote).toBe('Patient experiences rash and swelling');
  });

  test('Medications', async () => {
    const { container } = render(
      <GpccmpForm
        patient={patient}
        user={practitioner}
        requestDefinitions={[
          {
            urlPrefix: 'MedicationStatement',
            params: {},
            responseBody: makeSearchSetBundle([currentMedication])
          }
        ]}
      />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Clinical details'), {
      timeout: 10000
    });
    await selectTab(container, 'Clinical details');

    const medications = await findByLinkIdOrLabel(container, 'Recorded medications');
    const medicationsName = await getInputText(medications, 'Medication');
    expect(medicationsName).toBe('Paracetamol 500 mg tablet');
    const medicationsStatus = await getInputText(medications, 'Status');
    expect(medicationsStatus).toBe('Active');
    const medicationsDosage = await getInputText(medications, 'Dosage');
    expect(medicationsDosage).toBe('Once daily, 10mg');
    const medicationsReason = await getInputText(medications, 'Indication');
    expect(medicationsReason).toBe('Iris tuck');
    const medicationsNote = await getInputText(medications, 'Comment');
    expect(medicationsNote).toBe('Patient should take with food');
  });

  test('Height last result', async () => {
    const { container } = render(
      <GpccmpForm
        patient={patient}
        user={practitioner}
        requestDefinitions={[
          {
            urlPrefix: 'Observation',
            params: { code: '8302-2' },
            responseBody: makeSearchSetBundle([obsBodyHeight])
          }
        ]}
      />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Clinical details'), {
      timeout: 10000
    });
    await selectTab(container, 'Clinical details');
    const heightStringContainer = await findByLinkIdOrLabel(container, 'Height');
    const lastResultHeight = await getCqfText(heightStringContainer, 'Last result');
    expect(lastResultHeight).toBe('170 cm ( 20 Nov 2025 )');
  });

  test('Weight last result', async () => {
    const { container } = render(
      <GpccmpForm
        patient={patient}
        user={practitioner}
        requestDefinitions={[
          {
            urlPrefix: 'Observation',
            params: { code: '29463-7' },
            responseBody: makeSearchSetBundle([obsBodyWeight])
          }
        ]}
      />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Clinical details'), {
      timeout: 10000
    });
    await selectTab(container, 'Clinical details');
    const weightStringContainer = await findByLinkIdOrLabel(container, 'Weight');
    const lastResultWeight = await getCqfText(weightStringContainer, 'Last result');
    expect(lastResultWeight).toBe('70 kg ( 21 Nov 2025 )');
  });

  test('BMI last result', async () => {
    const { container } = render(
      <GpccmpForm
        patient={patient}
        user={practitioner}
        requestDefinitions={[
          {
            urlPrefix: 'Observation',
            params: { code: '8302-2' },
            responseBody: makeSearchSetBundle([obsBodyHeight])
          },
          {
            urlPrefix: 'Observation',
            params: { code: '29463-7' },
            responseBody: makeSearchSetBundle([obsBodyWeight])
          }
        ]}
      />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Clinical details'), {
      timeout: 10000
    });
    await selectTab(container, 'Clinical details');
    const bmiStringContainer = await findByLinkIdOrLabel(container, 'BMI (calculated)');
    const lastResultBmi = await getCqfText(bmiStringContainer, 'Last result');
    expect(lastResultBmi).toBe('24.2 kg/m2');
  });

  test('Waist circumference last result', async () => {
    const { container } = render(
      <GpccmpForm
        patient={patient}
        user={practitioner}
        requestDefinitions={[
          {
            urlPrefix: 'Observation',
            params: { code: '8280-0' },
            responseBody: makeSearchSetBundle([obsWaistCircumference])
          }
        ]}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Clinical details'), {
      timeout: 10000
    });
    await selectTab(container, 'Clinical details');
    const waistCircumferenceStringContainer = await findByLinkIdOrLabel(
      container,
      'Waist circumference'
    );
    const lastResultWaistCircumference = await getCqfText(
      waistCircumferenceStringContainer,
      'Last result'
    );
    expect(lastResultWaistCircumference).toBe('90 cm ( 23 Nov 2025 )');
  });

  test('Pulse rate last result', async () => {
    const { container } = render(
      <GpccmpForm
        patient={patient}
        user={practitioner}
        requestDefinitions={[
          {
            urlPrefix: 'Observation',
            params: { code: '78564009' },
            responseBody: makeSearchSetBundle([obsHeartRate])
          }
        ]}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Clinical details'), {
      timeout: 10000
    });
    await selectTab(container, 'Clinical details');
    const pulseRateStringContainer = await findByLinkIdOrLabel(container, 'Pulse rate');
    const lastResultPulseRate = await getCqfText(pulseRateStringContainer, 'Last result');
    expect(lastResultPulseRate).toBe('72 /min ( 4 Dec 2025 )');
  });

  test('Pulse rhythm last result', async () => {
    const { container } = render(
      <GpccmpForm
        patient={patient}
        user={practitioner}
        requestDefinitions={[
          {
            urlPrefix: 'Observation',
            params: { code: '364095004' },
            responseBody: makeSearchSetBundle([obsHeartRhythm])
          }
        ]}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Clinical details'), {
      timeout: 10000
    });
    await selectTab(container, 'Clinical details');
    const pulseRhythmStringContainer = await findByLinkIdOrLabel(container, 'Pulse rhythm');
    const lastResultPulseRhythm = await getCqfText(pulseRhythmStringContainer, 'Last result');
    expect(lastResultPulseRhythm).toBe('Regular heart rhythm ( 3 Dec 2025 )');
  });

  test('Oxygen saturation last result', async () => {
    const { container } = render(
      <GpccmpForm
        patient={patient}
        user={practitioner}
        requestDefinitions={[
          {
            urlPrefix: 'Observation',
            params: { code: '2708-6' },
            responseBody: makeSearchSetBundle([obsOxygenSaturation])
          }
        ]}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Clinical details'), {
      timeout: 10000
    });
    await selectTab(container, 'Clinical details');
    const oxygenSaturationStringContainer = await findByLinkIdOrLabel(
      container,
      'Oxygen saturation'
    );
    const lastResultOxygenSaturation = await getCqfText(
      oxygenSaturationStringContainer,
      'Last result'
    );
    expect(lastResultOxygenSaturation).toBe('98 % ( 4 Dec 2025 )');
  });

  test('Blood pressure last result', async () => {
    const { container } = render(
      <GpccmpForm
        patient={patient}
        user={practitioner}
        requestDefinitions={[
          {
            urlPrefix: 'Observation',
            params: { code: '85354-9' },
            responseBody: makeSearchSetBundle([obsBloodPressure])
          }
        ]}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Clinical details'), {
      timeout: 10000
    });
    await selectTab(container, 'Clinical details');
    const bloodPressureStringContainer = await findByLinkIdOrLabel(container, 'Blood pressure');
    const lastResultBloodPressure = await getCqfText(bloodPressureStringContainer, 'Last result');
    expect(lastResultBloodPressure).toBe('120 / 80 mm Hg ( 2 Dec 2025 )');
  });

  test('Smoking status last result', async () => {
    const { container } = render(
      <GpccmpForm
        patient={patient}
        user={practitioner}
        requestDefinitions={[
          {
            urlPrefix: 'Observation',
            params: { code: '1747861000168109' },
            responseBody: makeSearchSetBundle([obsTobaccoSmokingStatus])
          }
        ]}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Clinical details'), {
      timeout: 10000
    });
    await selectTab(container, 'Clinical details');
    const smokingStatusStringContainer = await findByLinkIdOrLabel(container, 'Smoking status');
    const lastResultSmokingStatus = await getCqfText(smokingStatusStringContainer, 'Last status');
    expect(lastResultSmokingStatus).toBe('Current smoker ( 1 Dec 2025 )');
  });

  test('Alcohol consumption status last result', async () => {
    const { container } = render(
      <GpccmpForm
        patient={patient}
        user={practitioner}
        requestDefinitions={[
          {
            urlPrefix: 'Observation',
            params: { code: '897148007' },
            responseBody: makeSearchSetBundle([obsAlcoholConsumption])
          }
        ]}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Clinical details'), {
      timeout: 10000
    });
    await selectTab(container, 'Clinical details');
    const alcoholConsumptionStringContainer = await findByLinkIdOrLabel(
      container,
      'Alcohol consumption status'
    );
    const lastResultAlcoholConsumption = await getCqfText(
      alcoholConsumptionStringContainer,
      'Last status'
    );
    expect(lastResultAlcoholConsumption).toBe('Current drinker of alcohol ( 4 Dec 2025 )');
  });

  test('Plan type', async () => {
    const { container } = render(
      <GpccmpForm
        patient={patient}
        user={practitioner}
        requestDefinitions={[
          {
            urlPrefix: 'QuestionnaireResponse',
            params: { status: 'completed,amended' },
            responseBody: makeSearchSetBundle([questionnaireResponsePlan])
          },
          {
            urlPrefix: 'QuestionnaireResponse',
            responseBody: makeSearchSetBundle([questionnaireResponsePlanDraft])
          }
        ]}
      />
    );
    await waitFor(() => expect(container.innerHTML).toContain('Plan'), {
      timeout: 10000
    });
    await selectTab(container, 'Plan');

    const planType = await getRadioValue(container, 'New plan or a review of an existing plan?');
    expect(planType).toBe('Review');

    const lastCompletedDate = await getInputText(container, 'Date of most recent plan or review');
    expect(lastCompletedDate).toBe('04/12/2025');

    const inProgress = await getRadioValue(container, 'Incomplete draft plan already exists?');
    expect(inProgress).toBe('true');
  });
});
