import type { Questionnaire } from 'fhir/r4';
import type { BehavioralTestWrapperProps } from '../behavioralTestUtils';
import { BehavioralTestWrapper } from '../behavioralTestUtils';
import gpccmpForm from './data/resources/Questionnaire/Questionnaire-GPChronicConditionManagementPlanAssembled.json';
import { vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { inputInteger, checkRadioOption, findByLinkIdOrLabel, inputText } from '../testUtils';

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

describe('My Aged Care question', () => {
  test('for yes', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'));
    await inputInteger(container, 'Age', 51);

    await checkRadioOption(container, 'Registered for My Aged Care', 'Yes');
    await inputInteger(container, 'My Aged Care Number', 1234567890);
    await inputText(container, 'Comment', 'This is a comment');
  });

  test('for no', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'));
    await inputInteger(container, 'Age', 51);
    await checkRadioOption(container, 'Registered for My Aged Care', 'No');
    await expect(
      async () => await findByLinkIdOrLabel(container, 'My Aged Care Number')
    ).rejects.toThrow();
    await inputText(container, 'Comment', 'This is a comment');
  });

  test('for Pending', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'));
    await inputInteger(container, 'Age', 51);
    await checkRadioOption(container, 'Registered for My Aged Care', 'Pending');
    await expect(
      async () => await findByLinkIdOrLabel(container, 'My Aged Care Number')
    ).rejects.toThrow();
    await inputText(container, 'Comment', 'This is a comment');
  });
});

describe('National Disability Insurance Scheme question', () => {
  test('for yes', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'));

    await inputInteger(container, 'Age', 24);
    await checkRadioOption(container, 'Registered for NDIS', 'Yes');

    await inputInteger(container, 'NDIS Number', 1234567890);
    await inputText(container, 'Comment', 'This is a comment');
  });

  test('for no', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'));

    await inputInteger(container, 'Age', 24);
    await checkRadioOption(container, 'Registered for NDIS', 'No');

    await expect(async () => await findByLinkIdOrLabel(container, 'NDIS Number')).rejects.toThrow();
    await inputText(container, 'Comment', 'This is a comment');
  });

  test('for Pending', async () => {
    const { container } = render(<GpccmpForm />);
    await waitFor(() => expect(container.innerHTML).toContain('Patient details'));

    await inputInteger(container, 'Age', 24);
    await checkRadioOption(container, 'Registered for NDIS', 'Pending');

    await expect(async () => await findByLinkIdOrLabel(container, 'NDIS Number')).rejects.toThrow();
    await inputText(container, 'Comment', 'This is a comment');
  });
});
