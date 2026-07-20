import type { Patient, Questionnaire } from 'fhir/r4';
import type { BehavioralTestWrapperProps } from '../behavioralTestUtils';
import { BehavioralTestWrapper } from '../behavioralTestUtils';
import gpccmpForm from './data/resources/Questionnaire/Questionnaire-GPChronicConditionManagementPlanAssembled.json';
import { vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { getBirthDateForAge, getInputText, selectTab } from '../testUtils';

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
  gender: 'male'
};

function GpccmpForm(props: Omit<BehavioralTestWrapperProps, 'questionnaire'>) {
  return <BehavioralTestWrapper questionnaire={gpccmpForm as Questionnaire} {...props} />;
}

vi.mock('fhirclient', () => ({
  client: () => ({
    request: vi.fn(() => Promise.resolve({}))
  })
}));

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('Population workflow for', () => {
  test('Patient details', async () => {
    const { container } = render(<GpccmpForm patient={patient} />);

    await waitFor(() => expect(container.innerHTML).toContain('Patient details'), {
      timeout: 10000
    });
    await selectTab(container, 'Patient details');

    const patientAge = await getInputText(container, 'Age');
    expect(patientAge).toBe('33');
  });
});
