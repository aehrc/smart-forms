import { render, waitFor } from '@testing-library/react';
import { vi, beforeAll } from 'vitest';

import { AboriginalForm, RequestDefinition } from './aboriginalFormUtils.tsx';
import { Condition, FhirResource, Patient } from 'fhir/r4';
import { getBirthDateForAge, getInputText, selectTab } from './testUtils.ts';

const patient: Patient = {
  resourceType: 'Patient',
  id: 'patient-123',
  name: [
    {
      use: 'official',
      family: 'John',
      given: ['Snow']
    }
  ],
  birthDate: getBirthDateForAge(19),
  gender: 'male'
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
        display: 'Example condition'
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
        code: 'resolved'
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

const requestDefinitions: RequestDefinition[] = [
  {
    urlPrefix: 'Condition',
    params: {},
    responseBody: makeSearchSetBundle([condition, nonSnomedCondition, resolvedCondition])
  }

  // For ObsHeartRate
  // {
  //   urlPrefix: 'Observation',
  //   params: {code: '8867-4'},
  //   responseBody: makeSearchSetBundle([obsHeartRate])
  // },
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
    observe() {
      // do nothing
    }
    unobserve() {
      // do nothing
    }
    disconnect() {
      // do nothing
    }
  };
});

describe('Dummy integration test', () => {
  test('Patient details', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    // Timeout is increased to 5 seconds to allow the form to be populated
    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Patient Details');

    const patientAge = await getInputText(container, 'Age');
    expect(patientAge).toBe('19');

    const patientName = await getInputText(container, 'Name');
    expect(patientName).toBe('John, Snow');
  
  });

  test('Medical conditions', async () => {
    const { container } = render(
      <AboriginalForm patient={patient} requestDefinitions={requestDefinitions} />
    );

    await waitFor(() => expect(container.innerHTML).toContain('Patient Details'), {
      timeout: 5000
    });
    await selectTab(container, 'Medical history and current problems');
    // const condition = await getInputText(container, 'Condition');
    // console.log(condition);
  });
});
