import { describe, expect, test, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import type { FetchResourceCallback } from '@aehrc/sdc-populate';
import type { Patient, Practitioner } from 'fhir/r4';
import { BehavioralTestWrapper, getInputText } from '@aehrc/questionnaire-test-toolkit';
import type { BehavioralTestWrapperProps, RequestDefinition } from '@aehrc/questionnaire-test-toolkit';
import { contextQuestionnaire } from './fixtures/contextQuestionnaire';

const patient: Patient = { resourceType: 'Patient', id: 'patient-1' };
const jane: Practitioner = {
  resourceType: 'Practitioner',
  id: 'practitioner-1',
  name: [{ family: 'Smith' }]
};
const fhirContext: BehavioralTestWrapperProps['fhirContext'] = [
  { type: 'PractitionerRole', reference: 'PractitionerRole/role-1' }
];
const roleOne = {
  resourceType: 'PractitionerRole',
  id: 'role-1',
  location: [{ reference: 'Location/clinic-1' }]
};

describe('fetchResourceCallback seam', () => {
  test('observes the population queries and resolves launch context from the callback', async () => {
    const queries: string[] = [];
    const callback: FetchResourceCallback = async (query, requestConfig) => {
      queries.push(query);
      expect(requestConfig.sourceServerUrl).toBe('http://mock.example');
      if (query === 'PractitionerRole/role-1') {
        return roleOne;
      }
      throw new Error(`Unexpected population query: ${query}`);
    };

    const { container } = render(
      <BehavioralTestWrapper
        questionnaire={contextQuestionnaire}
        patient={patient}
        user={jane}
        fhirContext={fhirContext}
        fetchResourceCallback={callback}
      />
    );

    await waitFor(async () => {
      expect(await getInputText(container, 'User calc')).toBe('Smith');
    });
    await waitFor(async () => {
      expect(await getInputText(container, 'Role calc')).toBe('Location/clinic-1');
    });

    expect(queries).toContain('PractitionerRole/role-1');
  });

  test('an unexpected or rejected population request fails the harness visibly', async () => {
    const callback: FetchResourceCallback = async (query) => {
      throw new Error(`Unexpected population query: ${query}`);
    };

    const { container } = render(
      <BehavioralTestWrapper
        questionnaire={contextQuestionnaire}
        patient={patient}
        fhirContext={fhirContext}
        fetchResourceCallback={callback}
      />
    );

    const errorElement = await waitFor(() => {
      const element = container.querySelector('[data-testid="toolkit-init-error"]');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });

    expect(errorElement.textContent).toContain('Unexpected population query');
    expect(container.querySelector('button[data-testid="save-button"]')).toBeNull();
  });

  test('changing the callback rebuilds the population context', async () => {
    const roleTwo = {
      resourceType: 'PractitionerRole',
      id: 'role-2',
      location: [{ reference: 'Location/clinic-2' }]
    };

    const callbackOne: FetchResourceCallback = async (query) => {
      if (query === 'PractitionerRole/role-1') {
        return roleOne;
      }
      throw new Error(`Unexpected population query: ${query}`);
    };
    const callbackTwo: FetchResourceCallback = async (query) => {
      if (query === 'PractitionerRole/role-1') {
        return roleTwo;
      }
      throw new Error(`Unexpected population query: ${query}`);
    };

    const { container, rerender } = render(
      <BehavioralTestWrapper
        questionnaire={contextQuestionnaire}
        patient={patient}
        user={jane}
        fhirContext={fhirContext}
        fetchResourceCallback={callbackOne}
      />
    );

    await waitFor(async () => {
      expect(await getInputText(container, 'Role calc')).toBe('Location/clinic-1');
    });

    rerender(
      <BehavioralTestWrapper
        questionnaire={contextQuestionnaire}
        patient={patient}
        user={jane}
        fhirContext={fhirContext}
        fetchResourceCallback={callbackTwo}
      />
    );

    await waitFor(async () => {
      expect(await getInputText(container, 'Role calc')).toBe('Location/clinic-2');
    });
  });

  test('rejects supplying both adapters synchronously', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() =>
        render(
          <BehavioralTestWrapper
            questionnaire={contextQuestionnaire}
            patient={patient}
            requestDefinitions={[]}
            fetchResourceCallback={async () => ({})}
          />
        )
      ).toThrow('Provide either requestDefinitions or fetchResourceCallback, not both');
    } finally {
      consoleError.mockRestore();
    }
  });

  test('rejects a callback without a patient synchronously', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() =>
        render(
          <BehavioralTestWrapper
            questionnaire={contextQuestionnaire}
            fetchResourceCallback={async () => ({})}
          />
        )
      ).toThrow('Patient must be provided when a fetchResourceCallback is provided');
    } finally {
      consoleError.mockRestore();
    }
  });

  test('request definitions remain the default adapter for existing callers', async () => {
    const requestDefinitions: RequestDefinition[] = [
      { urlPrefix: 'PractitionerRole/role-1', responseBody: roleOne }
    ];

    const { container } = render(
      <BehavioralTestWrapper
        questionnaire={contextQuestionnaire}
        patient={patient}
        user={jane}
        fhirContext={fhirContext}
        requestDefinitions={requestDefinitions}
      />
    );

    await waitFor(async () => {
      expect(await getInputText(container, 'Role calc')).toBe('Location/clinic-1');
    });
  });
});
