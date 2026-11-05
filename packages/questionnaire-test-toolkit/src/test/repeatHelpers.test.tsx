import { describe, expect, test } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import type { Questionnaire } from 'fhir/r4';
import {
  BehavioralTestWrapper,
  addRepeatInstance,
  getInputText,
  inputText,
  removeRepeatInstance
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

describe('repeat helpers with repeat groups', () => {
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

    const newInstance = await addRepeatInstance(container, 'Medications');
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
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
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

      await expect(addRepeatInstance(container, 'Target')).rejects.toThrow(
        'Add button for repeat "Target" was not found'
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
    await expect(addRepeatInstance(container, 'Outer name')).rejects.toThrow(
      '"Outer name" is not a repeat group, a gtable or a repeated question in scope'
    );
    expect(fieldValues(container, 'outer-name')).toEqual(['First']);
    const secondOuter = await addRepeatInstance(container, 'Outer');
    await inputText(secondOuter, 'Outer name', 'Second');
    await inputText(secondOuter, 'Inner name', 'Second inner');

    await expect(addRepeatInstance(container, 'Inner')).rejects.toThrow(
      'Repeat "Inner" matches multiple collections; provide an instance scope'
    );
    expect(fieldValues(container, 'inner-name')).toEqual(['First inner', 'Second inner']);

    const newInner = await addRepeatInstance(secondOuter, 'Inner');
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

    await expect(addRepeatInstance(container, 'Medications')).rejects.toThrow(
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

    const secondInstance = await addRepeatInstance(container, 'Medications');
    await inputText(secondInstance, 'Medication name', 'Ibuprofen');

    expect(fieldValues(container, 'med-name')).toEqual(['Paracetamol', 'Ibuprofen']);
  });

  test('rejects removing an element nested inside an instance without removing anything', async () => {
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

    const nestedQuestion = container.querySelector<HTMLElement>('[data-linkid="med-name"]')!;
    await expect(removeRepeatInstance(nestedQuestion)).rejects.toThrow(
      'Provide a repeat instance: a repeat group instance, a gtable body row or a repeated answer'
    );
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

    await removeRepeatInstance(instances[0]!);

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

    await expect(removeRepeatInstance(placeholder)).rejects.toThrow(
      'Question "medications" cannot be interacted with'
    );
  });
});

describe('repeat helpers with gtable rows and repeated questions', () => {
  test('adds and removes a scoped table row without changing its sibling fields', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        {
          linkId: 'table',
          text: 'Table',
          type: 'group',
          repeats: true,
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: { coding: [{ code: 'gtable' }] }
            }
          ],
          item: [
            { linkId: 'name', type: 'string', text: 'Name' },
            { linkId: 'dose', type: 'string', text: 'Dose' }
          ]
        }
      ]
    };
    const { container } = render(<BehavioralTestWrapper questionnaire={questionnaire} />);
    await inputText(container, 'name', 'Alpha');
    await inputText(container, 'dose', '10');
    const second = await addRepeatInstance(container, 'table');
    await inputText(second, 'name', 'Beta');
    await inputText(second, 'dose', '20');
    expect(fieldValues(container, 'name')).toEqual(['Alpha', 'Beta']);
    expect(fieldValues(container, 'dose')).toEqual(['10', '20']);
    const first = container.querySelector('tbody tr') as HTMLElement;
    await removeRepeatInstance(first);
    expect(fieldValues(container, 'name')).toEqual(['Beta']);
    expect(fieldValues(container, 'dose')).toEqual(['20']);
  });

  test('repeated answers return their own scope and reject protected additions/removals', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        { linkId: 'phones', type: 'string', text: 'Phones', repeats: true },
        {
          linkId: 'locked',
          type: 'string',
          text: 'Locked',
          repeats: true,
          readOnly: true,
          initial: [{ valueString: 'Protected' }, { valueString: 'Retained' }]
        }
      ]
    };
    const { container } = render(<BehavioralTestWrapper questionnaire={questionnaire} />);
    await inputText(container, 'phones', '111');
    const second = await addRepeatInstance(container, 'phones');
    await inputText(second, 'phones', '222');
    expect(fieldValues(container, 'phones')).toEqual(['111', '222']);
    const first = container.querySelector(
      '[data-linkid="phones"] .MuiCollapse-root'
    ) as HTMLElement;
    await removeRepeatInstance(first);
    expect(fieldValues(container, 'phones')).toEqual(['222']);
    await expect(addRepeatInstance(container, 'locked')).rejects.toThrow(
      'Question "locked" cannot be interacted with: the control is disabled'
    );
    const locked = container.querySelector(
      '[data-linkid="locked"] .MuiCollapse-root'
    ) as HTMLElement;
    await expect(removeRepeatInstance(locked)).rejects.toThrow(
      'Question "locked" cannot be interacted with: the control is disabled'
    );
    expect(fieldValues(container, 'locked')).toEqual(['Protected', 'Retained']);
  });
});
