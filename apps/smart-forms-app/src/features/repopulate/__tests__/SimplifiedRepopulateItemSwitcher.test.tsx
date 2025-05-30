/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import SimplifiedRepopulateItemSwitcher from '../components/SimplifiedRepopulateItemSwitcher';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

describe('SimplifiedRepopulateItemSwitcher', () => {
  it('should render without infinite loops', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'test-field',
      type: 'string',
      text: 'Test Field'
    };

    const serverQRItem: QuestionnaireResponseItem = {
      linkId: 'test-field',
      answer: [{ valueString: 'server value' }]
    };

    const userQRItem: QuestionnaireResponseItem = {
      linkId: 'test-field',
      answer: [{ valueString: 'user value' }]
    };

    const mockOnValuePreferenceChange = vi.fn();
    const fieldPreferences = {};

    const { container } = render(
      <SimplifiedRepopulateItemSwitcher
        qItem={qItem}
        serverSuggestedQRItem={serverQRItem}
        currentUserFormQRItem={userQRItem}
        onValuePreferenceChange={mockOnValuePreferenceChange}
        fieldPreferences={fieldPreferences}
      />
    );

    // If we get here without hanging, the infinite loop is fixed
    expect(container).not.toBeNull();
  });

  it('should render "No changes" when values are the same', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'test-field',
      type: 'string',
      text: 'Test Field'
    };

    const qrItem: QuestionnaireResponseItem = {
      linkId: 'test-field',
      answer: [{ valueString: 'same value' }]
    };

    const mockOnValuePreferenceChange = vi.fn();
    const fieldPreferences = {};

    const { getByText } = render(
      <SimplifiedRepopulateItemSwitcher
        qItem={qItem}
        serverSuggestedQRItem={qrItem}
        currentUserFormQRItem={qrItem}
        onValuePreferenceChange={mockOnValuePreferenceChange}
        fieldPreferences={fieldPreferences}
      />
    );

    expect(getByText(/No changes in: Test Field/)).not.toBeNull();
  });

  it('should render medical history table without infinite loops', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'medical-history',
      type: 'group',
      repeats: true,
      text: 'Medical History',
      item: [
        {
          linkId: 'condition',
          type: 'string',
          text: 'Condition'
        },
        {
          linkId: 'date',
          type: 'date',
          text: 'Date'
        }
      ]
    };

    const serverQRItems: QuestionnaireResponseItem[] = [
      {
        linkId: 'medical-history',
        item: [
          { linkId: 'condition', answer: [{ valueString: 'Diabetes' }] },
          { linkId: 'date', answer: [{ valueDate: '2023-01-01' }] }
        ]
      }
    ];

    const userQRItems: QuestionnaireResponseItem[] = [
      {
        linkId: 'medical-history',
        item: [
          { linkId: 'condition', answer: [{ valueString: 'Diabetes' }] },
          { linkId: 'date', answer: [{ valueDate: '2023-02-01' }] }
        ]
      }
    ];

    const mockOnValuePreferenceChange = vi.fn();
    const fieldPreferences = {};

    const { container } = render(
      <SimplifiedRepopulateItemSwitcher
        qItem={qItem}
        serverSuggestedQRItems={serverQRItems}
        currentUserFormQRItems={userQRItems}
        onValuePreferenceChange={mockOnValuePreferenceChange}
        fieldPreferences={fieldPreferences}
      />
    );

    // If we get here without hanging, the infinite loop is fixed
    expect(container).not.toBeNull();
  });
}); 