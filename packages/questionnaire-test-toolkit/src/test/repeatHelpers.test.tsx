import { describe, expect, test } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import type { Questionnaire } from 'fhir/r4';
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
      <BehavioralTestWrapper
        questionnaire={repeatQuestionnaire}
        questionnaireResponse={savedResponseA}
      />
    );

    await waitFor(
      async () => {
        expect(await getInputText(container, 'Notes')).toBe('Baseline notes');
      },
      { timeout: 5000 }
    );
    expect(fieldValues(container, 'med-name')).toHaveLength(2);

    const newInstance = await addRepeatGroup(container, 'Medications');
    expect(fieldValues(container, 'med-name')).toHaveLength(3);

    await inputText(newInstance, 'Medication name', 'Codeine');
    await inputText(newInstance, 'Dose', '30mg');

    expect(fieldValues(container, 'med-name')).toEqual(['Paracetamol', 'Ibuprofen', 'Codeine']);
    expect(fieldValues(container, 'med-dose')).toEqual(['500mg', '200mg', '30mg']);
  });

  test.each([false, true])(
    'a hidden Add button cannot modify a sibling collection (collapsible: %s)',
    async (collapsible) => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'draft',
        item: [
          {
            linkId: 'target',
            text: 'Target',
            type: 'group',
            repeats: true,
            extension: [
              {
                url: 'https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton',
                valueBoolean: true
              },
              ...(collapsible
                ? [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-collapsible',
                      valueCode: 'default-open'
                    }
                  ]
                : [])
            ],
            item: [{ linkId: 'target-name', text: 'Target name', type: 'string' }]
          },
          {
            linkId: 'sibling',
            text: 'Sibling',
            type: 'group',
            repeats: true,
            item: [{ linkId: 'sibling-name', text: 'Sibling name', type: 'string' }]
          }
        ]
      };
      const { container } = render(<BehavioralTestWrapper questionnaire={questionnaire} />);
      await inputText(container, 'Sibling name', 'Existing sibling');

      await expect(addRepeatGroup(container, 'Target')).rejects.toThrow(
        'Add button for repeat group "Target" was not found'
      );
      expect(fieldValues(container, 'sibling-name')).toEqual(['Existing sibling']);
      expect(fieldValues(container, 'target-name')).toHaveLength(1);
    }
  );

  test('nested collections require an instance scope and use only their own Add button', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        {
          linkId: 'outer',
          text: 'Outer',
          type: 'group',
          repeats: true,
          item: [
            { linkId: 'outer-name', text: 'Outer name', type: 'string' },
            {
              linkId: 'inner',
              text: 'Inner',
              type: 'group',
              repeats: true,
              item: [{ linkId: 'inner-name', text: 'Inner name', type: 'string' }]
            }
          ]
        }
      ]
    };
    const { container } = render(<BehavioralTestWrapper questionnaire={questionnaire} />);
    await inputText(container, 'Outer name', 'First');
    await inputText(container, 'Inner name', 'First inner');
    await expect(addRepeatGroup(container, 'Outer name')).rejects.toThrow(
      'Add button for repeat group "Outer name" was not found'
    );
    expect(fieldValues(container, 'outer-name')).toEqual(['First']);
    const secondOuter = await addRepeatGroup(container, 'Outer');
    await inputText(secondOuter, 'Outer name', 'Second');
    await inputText(secondOuter, 'Inner name', 'Second inner');

    await expect(addRepeatGroup(container, 'Inner')).rejects.toThrow(
      'Repeat group "Inner" matches multiple collections; provide an instance scope'
    );
    expect(fieldValues(container, 'inner-name')).toEqual(['First inner', 'Second inner']);

    const newInner = await addRepeatGroup(secondOuter, 'Inner');
    await inputText(newInner, 'Inner name', 'Third inner');
    expect(fieldValues(container, 'outer-name')).toEqual(['First', 'Second']);
    expect(fieldValues(container, 'inner-name')).toEqual([
      'First inner',
      'Second inner',
      'Third inner'
    ]);
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
      <BehavioralTestWrapper
        questionnaire={repeatQuestionnaire}
        questionnaireResponse={savedResponseA}
      />
    );

    await waitFor(
      async () => {
        expect(await getInputText(container, 'Notes')).toBe('Baseline notes');
      },
      { timeout: 5000 }
    );

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

    const placeholder = container.querySelector('[data-linkid="medications"]') as HTMLElement;

    await expect(removeRepeatGroup(placeholder)).rejects.toThrow(
      'Question "medications" cannot be interacted with'
    );
  });
});
