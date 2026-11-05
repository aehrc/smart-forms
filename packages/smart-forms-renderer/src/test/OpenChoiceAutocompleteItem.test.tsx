/*
 * Copyright 2026 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, expect, jest, test } from '@jest/globals';
import { act, configure, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Coding, Questionnaire, QuestionnaireResponse, ValueSet } from 'fhir/r4';
import React from 'react';

// react-markdown, react-dnd and react-dnd-html5-backend are ESM-only and cannot be transformed by ts-jest
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: (props: { children?: React.ReactNode }) => <>{props.children}</>
}));
jest.mock('react-dnd', () => ({
  __esModule: true,
  useDrop: () => [{ isOver: false, canDrop: false }, jest.fn()]
}));
jest.mock('react-dnd-html5-backend', () => ({
  __esModule: true,
  NativeTypes: { FILE: '__NATIVE_FILE__' }
}));

// Repeated answers need distinct IDs; the global setup mocks nanoid with a constant.
jest.mock('nanoid', () => {
  let count = 0;
  return { nanoid: () => `id-${++count}` };
});

import { client } from 'fhirclient';
import SmartFormsRenderer from '../components/Renderer/SmartFormsRenderer';
import { questionnaireResponseStore } from '../stores';

const mockClient = client as jest.MockedFunction<typeof client>;

// The whole form renders for each test, which is slow when the full suite runs in parallel.
configure({ asyncUtilTimeout: 5000 });
jest.setTimeout(20000);

// jsdom does not implement matchMedia, required by MUI useMediaQuery
window.matchMedia =
  window.matchMedia ||
  ((query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }) as unknown as MediaQueryList);

const autocompleteExtension = {
  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
  valueCodeableConcept: {
    coding: [{ system: 'http://hl7.org/fhir/questionnaire-item-control', code: 'autocomplete' }]
  }
};
const betaCoding = { system: 'urn:test', code: 'beta', display: 'Beta' };

function mockExpansion(contains: Coding[]) {
  const expansion: ValueSet = {
    resourceType: 'ValueSet',
    status: 'active',
    expansion: { timestamp: '2026-01-01', total: contains.length, contains }
  };
  mockClient.mockReturnValue({
    request: (jest.fn() as any).mockResolvedValue(expansion)
  } as any);
}

function getAnswers(linkId: string) {
  return questionnaireResponseStore
    .getState()
    .updatableResponse.item?.find((item) => item.linkId === linkId)?.answer;
}

async function wait(ms: number) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

// Search, type one more character, then click the option that is still listed. The partial text
// does not match an option, so its free-text update is still pending when the coding is selected.
async function typeAndSelectBeta(input: HTMLInputElement) {
  await act(async () => {
    input.focus();
    fireEvent.change(input, { target: { value: 'Be' } });
  });
  await screen.findByRole('option', { name: 'Beta' });
  await act(async () => {
    fireEvent.change(input, { target: { value: 'Bet' } });
  });
  fireEvent.click(screen.getByRole('option', { name: 'Beta' }));
}

function buildQuestionnaire(repeats: boolean): Questionnaire {
  return {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      {
        linkId: 'concept',
        text: 'Concept',
        type: 'open-choice',
        repeats,
        answerValueSet: 'https://example.test/ValueSet/concepts',
        extension: [autocompleteExtension]
      }
    ]
  };
}

describe('OpenChoiceAutocompleteItem free-text updates', () => {
  test('a pending free-text update cannot overwrite a selected coding in a repeated answer', async () => {
    mockExpansion([betaCoding]);
    render(
      <SmartFormsRenderer
        questionnaire={buildQuestionnaire(true)}
        terminologyServerUrl="http://fake-terminology-server"
      />
    );

    const [first] = await screen.findAllByRole<HTMLInputElement>('combobox', { name: 'Concept' });
    await typeAndSelectBeta(first);
    await wait(400);

    fireEvent.click(document.querySelector('[data-test="button-add-repeat-item"]')!);
    await waitFor(() =>
      expect(screen.getAllByRole('combobox', { name: 'Concept' })).toHaveLength(2)
    );
    const second = screen.getAllByRole<HTMLInputElement>('combobox', { name: 'Concept' })[1];
    await typeAndSelectBeta(second);
    await wait(500);

    expect(
      getAnswers('concept')?.map(({ valueCoding, valueString }) => ({
        valueCoding,
        valueString
      }))
    ).toEqual([
      { valueCoding: betaCoding, valueString: undefined },
      { valueCoding: betaCoding, valueString: undefined }
    ]);
  });

  test('typed free text replaces a calculated answer', async () => {
    // A calculated answer's ID makes getQRItemId return a fresh random key on every render,
    // so the pending text update must survive re-renders.
    mockExpansion([]);
    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'concept',
          text: 'Concept',
          answer: [{ id: 'concept-calculatedExpression', valueString: 'Calculated' }]
        }
      ]
    };
    render(
      <SmartFormsRenderer
        questionnaire={buildQuestionnaire(false)}
        questionnaireResponse={questionnaireResponse}
        terminologyServerUrl="http://fake-terminology-server"
      />
    );

    await waitFor(() => expect(screen.getByDisplayValue('Calculated')).toBeTruthy());
    const input = screen.getByDisplayValue<HTMLInputElement>('Calculated');
    await act(async () => {
      input.focus();
      fireEvent.change(input, { target: { value: 'Typed' } });
    });

    await waitFor(() =>
      expect(getAnswers('concept')).toEqual([expect.objectContaining({ valueString: 'Typed' })])
    );
  });
});
