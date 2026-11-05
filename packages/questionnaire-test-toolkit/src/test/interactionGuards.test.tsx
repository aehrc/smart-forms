import { describe, expect, test } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { getResponse, questionnaireResponseStore } from '@aehrc/smart-forms-renderer';
import {
  BehavioralTestWrapper,
  checkCheckBox,
  checkCheckboxOption,
  checkRadioOption,
  chooseSelectOption,
  getInputText,
  inputDateTime,
  inputText
} from '@aehrc/questionnaire-test-toolkit';
import { interactionQuestionnaire } from './fixtures/interactionQuestionnaire';

function renderForm() {
  return render(<BehavioralTestWrapper questionnaire={interactionQuestionnaire} />);
}

describe('interaction guards', () => {
  test('writable controls accept input', async () => {
    const { container } = renderForm();

    await inputText(container, 'Plain text', 'hello');
    expect(await getInputText(container, 'Plain text')).toBe('hello');

    await checkCheckBox(container, 'Plain check');
    expect(
      container.querySelector<HTMLInputElement>('[data-linkid="plain-check"] input')?.checked
    ).toBe(true);

    await checkRadioOption(container, 'Plain pet', 'Cat');
    expect(
      container.querySelector<HTMLInputElement>('[data-linkid="plain-pet"] input:checked')
    ).not.toBeNull();

    await checkCheckboxOption(container, 'Plain toppings', 'Cheese');
    expect(
      container.querySelector<HTMLInputElement>(
        '[data-linkid="plain-toppings"] span[data-test="checkbox-single-Cheese"] input'
      )?.checked
    ).toBe(true);
  });

  test('rejects writes to a read-only text field with the question identifier', async () => {
    const { container } = renderForm();
    await waitFor(() => {
      expect(container.querySelector('[data-linkid="locked-text"]')).not.toBeNull();
    });

    await expect(inputText(container, 'Locked text', 'nope')).rejects.toThrow(
      'Question "Locked text" cannot be interacted with'
    );
  });

  test('rejects writes to a field under a read-only ancestor', async () => {
    const { container } = renderForm();
    await waitFor(() => {
      expect(container.querySelector('[data-linkid="nested-text"]')).not.toBeNull();
    });

    await expect(inputText(container, 'Nested text', 'nope')).rejects.toThrow(
      'Question "Nested text" cannot be interacted with'
    );
  });

  test('rejects checking a read-only checkbox', async () => {
    const { container } = renderForm();
    await waitFor(() => {
      expect(container.querySelector('[data-linkid="locked-check"]')).not.toBeNull();
    });

    await expect(checkCheckBox(container, 'Locked check')).rejects.toThrow(
      'Question "Locked check" cannot be interacted with'
    );
  });

  test('rejects selecting a read-only radio option', async () => {
    const { container } = renderForm();
    await waitFor(() => {
      expect(container.querySelector('[data-linkid="locked-pet"]')).not.toBeNull();
    });

    await expect(checkRadioOption(container, 'Locked pet', 'Cat')).rejects.toThrow(
      'Question "Locked pet" cannot be interacted with'
    );
  });

  test('rejects choosing a read-only select option', async () => {
    const { container } = renderForm();
    await waitFor(() => {
      expect(container.querySelector('[data-linkid="locked-colour"]')).not.toBeNull();
    });

    await expect(chooseSelectOption(container, 'Locked colour', 'Red')).rejects.toThrow(
      'Question "Locked colour" cannot be interacted with'
    );
  });

  test('rejected edits leave the response unchanged', async () => {
    const { container } = renderForm();
    await waitFor(() => {
      expect(container.querySelector('[data-linkid="locked-text"]')).not.toBeNull();
    });

    await expect(inputText(container, 'Locked text', 'nope')).rejects.toThrow();
    await expect(checkCheckBox(container, 'Locked check')).rejects.toThrow();

    const qr = questionnaireResponseStore.getState().updatableResponse;
    const hasLockedAnswers = qr?.item?.some(
      (item) => (item.linkId === 'locked-text' || item.linkId === 'locked-check') && item.answer
    );
    expect(hasLockedAnswers).toBe(false);
  });

  test('selecting a writable option records the answer', async () => {
    const { container } = renderForm();
    await waitFor(() => {
      expect(container.querySelector('[data-linkid="plain-colour"]')).not.toBeNull();
    });

    await chooseSelectOption(container, 'Plain colour', 'Green');

    await waitFor(() => {
      const qr = questionnaireResponseStore.getState().updatableResponse;
      const colour = qr?.item?.find((item) => item.linkId === 'plain-colour');
      expect(colour?.answer?.[0].valueCoding?.display).toBe('Green');
    });
  });

  test('inputDateTime accepts a 12-hour time after a 24-hour time disabled AM/PM', async () => {
    const { container } = render(
      <BehavioralTestWrapper
        questionnaire={{
          resourceType: 'Questionnaire',
          status: 'draft',
          item: [{ linkId: 'when', text: 'When', type: 'dateTime' }]
        }}
      />
    );

    await inputDateTime(container, 'when', '01/02/2026', '14:30', '');
    await inputDateTime(container, 'when', '01/02/2026', '09:30', 'AM');

    const answer = getResponse().item?.find((item) => item.linkId === 'when')?.answer?.[0];
    expect(answer?.valueDateTime).toMatch(/^2026-02-01T09:30/);
  });
});
