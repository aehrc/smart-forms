import { describe, expect, test, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { BehavioralTestWrapper } from '@aehrc/questionnaire-test-toolkit';
import type { Patient } from 'fhir/r4';
import { questionnaire } from './fixtures/questionnaire';

vi.mock('@aehrc/sdc-populate', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@aehrc/sdc-populate')>();
  return {
    ...actual,
    populateQuestionnaire: vi.fn(actual.populateQuestionnaire)
  };
});

const patient: Patient = { resourceType: 'Patient', id: 'patient-1' };

describe('visible initialisation failures', () => {
  test('surfaces a failed population and exposes no Save button', async () => {
    vi.mocked(populateQuestionnaire).mockReturnValueOnce(
      Promise.resolve({ populateSuccess: false, populateResult: null })
    );

    const { container } = render(<BehavioralTestWrapper questionnaire={questionnaire} patient={patient} />);

    const errorElement = await waitFor(() => {
      const element = container.querySelector('[data-testid="toolkit-init-error"]');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });

    expect(errorElement.textContent).toContain('Population failed');
    expect(container.querySelector('button[data-testid="save-button"]')).toBeNull();
  });

  test('surfaces a rejected population when a saved response was supplied', async () => {
    vi.mocked(populateQuestionnaire).mockRejectedValueOnce(new Error('boom'));

    const { container } = render(
      <BehavioralTestWrapper
        questionnaire={questionnaire}
        patient={patient}
        questionnaireResponse={{
          resourceType: 'QuestionnaireResponse',
          status: 'in-progress',
          item: [{ linkId: 'tabs' }]
        }}
      />
    );

    const errorElement = await waitFor(() => {
      const element = container.querySelector('[data-testid="toolkit-init-error"]');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });

    expect(errorElement.textContent).toContain('boom');
    expect(container.querySelector('button[data-testid="save-button"]')).toBeNull();
  });

  test('keeps working after a failed initialisation is replaced by valid inputs', async () => {
    vi.mocked(populateQuestionnaire)
      .mockReturnValueOnce(Promise.resolve({ populateSuccess: false, populateResult: null }))
      .mockReturnValueOnce(
        Promise.resolve({
          populateSuccess: true,
          populateResult: {
            populatedResponse: {
              resourceType: 'QuestionnaireResponse',
              status: 'in-progress'
            }
          }
        })
      );

    const { container, rerender } = render(
      <BehavioralTestWrapper questionnaire={questionnaire} patient={patient} />
    );

    await waitFor(() => {
      expect(container.querySelector('[data-testid="toolkit-init-error"]')).not.toBeNull();
    });

    rerender(<BehavioralTestWrapper questionnaire={questionnaire} />);

    await waitFor(() => {
      expect(container.querySelector('button[data-testid="save-button"]')).not.toBeNull();
    });
  });
});
