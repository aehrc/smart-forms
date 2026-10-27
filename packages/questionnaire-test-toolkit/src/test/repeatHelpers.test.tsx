import { describe, expect, test } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import {
  BehavioralTestWrapper,
  addRepeatGroup,
  getInputText,
  inputText,
  removeRepeatGroup
} from '@aehrc/questionnaire-test-toolkit';
import { repeatQuestionnaire, savedResponseA } from './fixtures/repeatQuestionnaire';

function fieldValues(container: HTMLElement, linkId: string): string[] {
  return Array.from(
    container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      `[data-linkid="${linkId}"] input, [data-linkid="${linkId}"] textarea`
    )
  )
    .filter((field) => !field.hasAttribute('aria-hidden'))
    .map((field) => field.value);
}

describe('repeat group helpers', () => {
  test('adds an instance and fills it through the returned container', async () => {
    const { container } = render(
      <BehavioralTestWrapper questionnaire={repeatQuestionnaire} questionnaireResponse={savedResponseA} />
    );

    await waitFor(async () => {
      expect(await getInputText(container, 'Notes')).toBe('Baseline notes');
    });
    expect(fieldValues(container, 'med-name')).toHaveLength(2);

    const newInstance = await addRepeatGroup(container, 'Medications');
    expect(fieldValues(container, 'med-name')).toHaveLength(3);

    await inputText(newInstance, 'Medication name', 'Codeine');
    await inputText(newInstance, 'Dose', '30mg');

    expect(fieldValues(container, 'med-name')).toEqual(['Paracetamol', 'Ibuprofen', 'Codeine']);
    expect(fieldValues(container, 'med-dose')).toEqual(['500mg', '200mg', '30mg']);
  });

  test('rejects adding when the final row is empty', async () => {
    const { container } = render(<BehavioralTestWrapper questionnaire={repeatQuestionnaire} />);

    await waitFor(() => {
      expect(container.querySelector('[data-linkid="med-name"]')).not.toBeNull();
    });

    await expect(addRepeatGroup(container, 'Medications')).rejects.toThrow(
      'Question "Medications" cannot be interacted with'
    );
  });

  test('adds again after the first instance has been filled', async () => {
    const { container } = render(<BehavioralTestWrapper questionnaire={repeatQuestionnaire} />);

    await waitFor(() => {
      expect(container.querySelector('[data-linkid="med-name"]')).not.toBeNull();
    });

    const firstInstance = container.querySelector('[data-linkid="medications"]') as HTMLElement;
    await inputText(firstInstance, 'Medication name', 'Paracetamol');

    const secondInstance = await addRepeatGroup(container, 'Medications');
    await inputText(secondInstance, 'Medication name', 'Ibuprofen');

    expect(fieldValues(container, 'med-name')).toEqual(['Paracetamol', 'Ibuprofen']);
  });

  test('removes a selected instance and keeps the other instance values associated', async () => {
    const { container } = render(
      <BehavioralTestWrapper questionnaire={repeatQuestionnaire} questionnaireResponse={savedResponseA} />
    );

    await waitFor(async () => {
      expect(await getInputText(container, 'Notes')).toBe('Baseline notes');
    });

    const instances = Array.from(
      container.querySelectorAll<HTMLElement>('[data-linkid="medications"]')
    );
    expect(instances).toHaveLength(2);

    await removeRepeatGroup(instances[0]!);

    await waitFor(() => {
      expect(fieldValues(container, 'med-name')).toEqual(['Ibuprofen']);
    });
    expect(fieldValues(container, 'med-dose')).toEqual(['200mg']);
  });

  test('rejects removing the remaining empty placeholder', async () => {
    const { container } = render(<BehavioralTestWrapper questionnaire={repeatQuestionnaire} />);

    await waitFor(() => {
      expect(container.querySelector('[data-linkid="medications"]')).not.toBeNull();
    });

    const placeholder = container.querySelector(
      '[data-linkid="medications"]'
    ) as HTMLElement;

    await expect(removeRepeatGroup(placeholder)).rejects.toThrow(
      'Question "medications" cannot be interacted with'
    );
  });
});
