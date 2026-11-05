import { expect, test, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Questionnaire } from 'fhir/r4';
import { getResponse } from '@aehrc/smart-forms-renderer';
import { BehavioralTestWrapper, inputText } from '@aehrc/questionnaire-test-toolkit';

import Client from 'fhirclient/lib/Client';

const control = (code: string) => [
  {
    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
    valueCodeableConcept: { coding: [{ code }] }
  }
];
const coding = { system: 'urn:keyboard-test', code: 'beta', display: 'Beta' };
const questionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'options',
      status: 'active',
      expansion: {
        timestamp: '2026-01-01',
        contains: [{ system: 'urn:keyboard-test', code: 'alpha', display: 'Alpha' }, coding]
      }
    }
  ],
  item: [
    {
      linkId: 'closed',
      type: 'choice',
      text: 'Closed',
      answerValueSet: '#options',
      extension: control('drop-down')
    },
    {
      linkId: 'open',
      type: 'open-choice',
      text: 'Open',
      answerOption: [{ valueCoding: coding }],
      extension: control('drop-down')
    },
    {
      linkId: 'open-values',
      type: 'open-choice',
      text: 'Open values',
      answerValueSet: '#options',
      extension: control('drop-down')
    },
    {
      linkId: 'closed-search',
      type: 'choice',
      text: 'Closed search',
      answerValueSet: '#options',
      extension: control('autocomplete')
    },
    {
      linkId: 'open-search',
      type: 'open-choice',
      text: 'Open search',
      answerValueSet: '#options',
      extension: control('autocomplete')
    },
    { linkId: 'notes', type: 'text', text: 'Notes' }
  ]
};

test('Arrow/Enter selects an autocomplete option; text answers retain newlines', async () => {
  const warning = vi.spyOn(console, 'warn');
  try {
    const { container } = render(<BehavioralTestWrapper questionnaire={questionnaire} />);
    await waitFor(() => expect(container.querySelector('[data-linkid="closed"]')).not.toBeNull());
    const root = container.querySelector('[data-linkid="closed"]')!;
    const input = root.querySelector<HTMLInputElement>('[role="combobox"]')!;
    await act(async () => {
      input.focus();
      fireEvent.change(input, { target: { value: 'Beta' } });
    });
    await screen.findByRole('option', { name: 'Beta' });
    await act(async () => {
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    await waitFor(() =>
      expect(getResponse().item?.find((i) => i.linkId === 'closed')?.answer).toEqual([
        { valueCoding: coding }
      ])
    );
    await inputText(container, 'notes', 'First line\nSecond line');
    expect(getResponse().item?.find((i) => i.linkId === 'notes')?.answer).toEqual([
      { valueString: 'First line\nSecond line' }
    ]);
    expect(
      warning.mock.calls
        .flat()
        .map(String)
        .filter((s) => s.includes('textarea element was provided'))
    ).toEqual([]);
  } finally {
    warning.mockRestore();
  }
});

test('a repeated open choice accepts custom text before adding its next answer', async () => {
  const { addRepeatInstance } = await import('@aehrc/questionnaire-test-toolkit');
  const { container } = render(
    <BehavioralTestWrapper
      questionnaire={{
        resourceType: 'Questionnaire',
        status: 'draft',
        item: [
          {
            linkId: 'roles',
            text: 'Roles',
            type: 'open-choice',
            repeats: true,
            answerOption: [{ valueCoding: coding }]
          }
        ]
      }}
    />
  );
  await waitFor(() =>
    expect(container.querySelector('[data-linkid="roles"] input')).not.toBeNull()
  );
  const input = container.querySelector<HTMLInputElement>('[data-linkid="roles"] input')!;
  await act(async () => {
    input.focus();
  });
  await inputText(container, 'roles', 'Custom role');
  expect(input.value).toBe('Custom role');
  await act(async () => {
    input.blur();
  });
  await waitFor(() =>
    expect(getResponse().item?.find((i) => i.linkId === 'roles')?.answer).toEqual([
      { valueString: 'Custom role' }
    ])
  );
  const second = await addRepeatInstance(container, 'roles');
  await inputText(second, 'roles', 'Another role');
  const secondInput = second.querySelector<HTMLInputElement>('input')!;
  await act(async () => {
    fireEvent.blur(secondInput);
  });
  await waitFor(() =>
    expect(getResponse().item?.find((i) => i.linkId === 'roles')?.answer).toEqual([
      { valueString: 'Custom role' },
      { valueString: 'Another role' }
    ])
  );
});

test('a pending free-text update cannot overwrite a selected coding in a second repeated answer', async () => {
  const { addRepeatInstance, chooseSelectOption } = await import(
    '@aehrc/questionnaire-test-toolkit'
  );
  // Replace the external FHIR SDK request boundary only in this synthetic regression.
  const request = vi.spyOn(Client.prototype, 'request').mockResolvedValue({
    resourceType: 'ValueSet',
    status: 'active',
    expansion: { timestamp: '2026-01-01', total: 1, contains: [coding] }
  });
  try {
    const { container } = render(
      <BehavioralTestWrapper
        questionnaire={{
          resourceType: 'Questionnaire',
          status: 'draft',
          item: [
            {
              linkId: 'concepts',
              text: 'Concepts',
              type: 'open-choice',
              repeats: true,
              answerValueSet: 'https://example.test/ValueSet/concepts',
              extension: control('autocomplete')
            }
          ]
        }}
      />
    );
    await waitFor(() =>
      expect(container.querySelector('[data-linkid="concepts"] input')).not.toBeNull()
    );
    await chooseSelectOption(container, 'concepts', 'Beta');
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });
    const second = await addRepeatInstance(container, 'concepts');
    await chooseSelectOption(second, 'concepts', 'Beta');
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    expect(getResponse().item?.find((i) => i.linkId === 'concepts')?.answer).toEqual([
      { valueCoding: coding },
      { valueCoding: coding }
    ]);
  } finally {
    request.mockRestore();
  }
}, 20000);
