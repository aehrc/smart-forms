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
import { configure, render, waitFor } from '@testing-library/react';
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

import SmartFormsRenderer from '../components/Renderer/SmartFormsRenderer';

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

function buildQuestionnaire(collapsible: boolean): Questionnaire {
  return {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      {
        linkId: 'contact',
        text: 'Contact',
        type: 'group',
        repeats: true,
        ...(collapsible && {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
              valueCode: 'default-open'
            }
          ]
        }),
        item: [{ linkId: 'name', text: 'Name', type: 'string' }]
      }
    ]
  };
}

describe('RepeatGroupView', () => {
  test.each([
    ['card', false],
    ['collapsible', true]
  ])('marks the %s repeat group collection for scoped queries', async (_, collapsible) => {
    render(<SmartFormsRenderer questionnaire={buildQuestionnaire(collapsible)} />);

    await waitFor(() =>
      expect(document.querySelector('[data-test="q-group-repeat-box"]')).not.toBeNull()
    );
    const collections = document.querySelectorAll('[data-test="q-group-repeat-box"]');
    expect(collections).toHaveLength(1);
    expect(collections[0].querySelector('[data-linkid="contact"]')).not.toBeNull();
    expect(collections[0].querySelector('[data-test="button-add-repeat-item"]')).not.toBeNull();
  });
});
