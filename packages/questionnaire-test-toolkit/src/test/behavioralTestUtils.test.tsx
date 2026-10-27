import { describe, expect, test, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import type { Patient, Practitioner, PractitionerRole } from 'fhir/r4';
import { terminologyServerStore } from '@aehrc/smart-forms-renderer';
import {
  BehavioralTestWrapper,
  getInputText,
  inputText,
  invokeExtract,
  selectTab
} from '@aehrc/questionnaire-test-toolkit';
import type {
  BehavioralTestWrapperProps,
  RequestDefinition
} from '@aehrc/questionnaire-test-toolkit';
import { questionnaire } from './fixtures/questionnaire';

const patient: Patient = { resourceType: 'Patient', id: 'patient-1' };
const jane: Practitioner = {
  resourceType: 'Practitioner',
  id: 'practitioner-1',
  name: [{ family: 'Smith' }]
};
const john: Practitioner = {
  resourceType: 'Practitioner',
  id: 'practitioner-2',
  name: [{ family: 'Doe' }]
};
const roleOne: PractitionerRole = {
  resourceType: 'PractitionerRole',
  id: 'role-1',
  location: [{ reference: 'Location/clinic-1' }]
};
const roleTwo: PractitionerRole = {
  resourceType: 'PractitionerRole',
  id: 'role-2',
  location: [{ reference: 'Location/clinic-2' }]
};
const requestDefinitions: RequestDefinition[] = [
  { urlPrefix: 'PractitionerRole/role-1', responseBody: roleOne },
  { urlPrefix: 'PractitionerRole/role-2', responseBody: roleTwo }
];
const firstContext: BehavioralTestWrapperProps['fhirContext'] = [
  { type: 'PractitionerRole', reference: 'PractitionerRole/role-1' }
];
const secondContext: BehavioralTestWrapperProps['fhirContext'] = [
  { type: 'PractitionerRole', reference: 'PractitionerRole/role-2' }
];

function Form(props: Omit<BehavioralTestWrapperProps, 'questionnaire'>) {
  return <BehavioralTestWrapper questionnaire={questionnaire} {...props} />;
}

describe('BehavioralTestWrapper', () => {
  test('populates the practitioner and repopulates when only user changes', async () => {
    const { container, rerender } = render(<Form patient={patient} user={jane} />);

    await waitFor(async () => {
      expect(await getInputText(container, 'Practitioner name')).toBe('Smith');
    });

    rerender(<Form patient={patient} user={john} />);

    await waitFor(async () => {
      expect(await getInputText(container, 'Practitioner name')).toBe('Doe');
    });
  });

  test('resolves a role and repopulates when only fhirContext changes', async () => {
    const { container, rerender } = render(
      <Form
        patient={patient}
        user={jane}
        fhirContext={firstContext}
        requestDefinitions={requestDefinitions}
      />
    );

    await selectTab(container, 'Context tab');
    await waitFor(async () => {
      expect(await getInputText(container, 'Role location')).toBe('Location/clinic-1');
    });

    // Every other prop, including both callback fixtures, retains the same reference.
    rerender(
      <Form
        patient={patient}
        user={jane}
        fhirContext={secondContext}
        requestDefinitions={requestDefinitions}
      />
    );

    await selectTab(container, 'Context tab');
    await waitFor(async () => {
      expect(await getInputText(container, 'Role location')).toBe('Location/clinic-2');
    });
  });

  test('does not retain a previous practitioner or role in a new form', async () => {
    const first = render(
      <Form
        patient={patient}
        user={jane}
        fhirContext={firstContext}
        requestDefinitions={requestDefinitions}
      />
    );

    await waitFor(async () => {
      expect(await getInputText(first.container, 'Practitioner name')).toBe('Smith');
    });
    await selectTab(first.container, 'Context tab');
    expect(await getInputText(first.container, 'Role location')).toBe('Location/clinic-1');
    first.unmount();

    const second = render(<Form patient={patient} />);

    await waitFor(async () => {
      expect(await getInputText(second.container, 'Practitioner name')).toBe('');
    });
    await selectTab(second.container, 'Context tab');
    expect(await getInputText(second.container, 'Role location')).toBe('');
  });

  test('rejects request definitions without a patient synchronously', () => {
    // React reports a caught render error to the console as well as throwing it to the caller.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<Form requestDefinitions={requestDefinitions} />)).toThrow(
        'Patient must be provided when request definitions are provided'
      );
    } finally {
      consoleError.mockRestore();
    }
  });

  test('uses the supplied terminology server', async () => {
    const { container } = render(
      <Form patient={patient} terminologyServerUrl="http://127.0.0.1:1/fhir" />
    );

    await getInputText(container, 'Practitioner name');
    expect(terminologyServerStore.getState().url).toBe('http://127.0.0.1:1/fhir');
  });

  test('extracts an entered answer with an untyped result spy', async () => {
    const onExtractResult = vi.fn();
    const { container } = render(<Form patient={patient} onExtractResult={onExtractResult} />);

    await inputText(container, 'Practitioner name', 'Test Name');

    const bundle = await invokeExtract(container, onExtractResult);
    expect(bundle.entry).toHaveLength(1);
    expect(bundle.entry?.[0].resource).toMatchObject({
      resourceType: 'Observation',
      valueString: 'Test Name'
    });
  });
});
