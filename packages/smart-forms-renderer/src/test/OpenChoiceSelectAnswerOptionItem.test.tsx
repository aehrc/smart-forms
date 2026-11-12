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
import type { Questionnaire } from 'fhir/r4';
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

import SmartFormsRenderer from '../components/Renderer/SmartFormsRenderer';
import { questionnaireResponseStore } from '../stores';

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

function getAnswers(linkId: string) {
  return questionnaireResponseStore
    .getState()
    .updatableResponse.item?.find((item) => item.linkId === linkId)?.answer;
}

const questionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  item: [
    {
      linkId: 'roles',
      text: 'Roles',
      type: 'open-choice',
      repeats: true,
      answerOption: [{ valueCoding: { system: 'urn:test', code: 'beta', display: 'Beta' } }]
    }
  ]
};

describe('OpenChoiceSelectAnswerOptionItem', () => {
  test('an answer with only an ID does not reset custom text', async () => {
    // A repeated item starts with an ID-only answer, which must not be treated as a selection.
    render(<SmartFormsRenderer questionnaire={questionnaire} />);

    const input = await screen.findByRole<HTMLInputElement>('combobox', { name: 'Roles' });
    await act(async () => {
      input.focus();
      fireEvent.change(input, { target: { value: 'Custom role' } });
    });
    expect(input.value).toBe('Custom role');

    await act(async () => {
      fireEvent.blur(input);
    });
    await waitFor(() =>
      expect(getAnswers('roles')).toEqual([expect.objectContaining({ valueString: 'Custom role' })])
    );
  });
});
