/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, waitFor, within } from 'storybook/test';
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import {
  qGTableWithRequiredColumn,
  qRepeatGroupWithRequiredChild,
  qrGTableThirdRowInvalid,
  qrRepeatGroupSecondInstanceInvalid
} from '../assets/questionnaires/QRepeatInstanceValidationTester';
import { questionnaireResponseStore } from '../../stores';

const REQUIRED_FEEDBACK = 'This field is required';

/**
 * Rendered-layer coverage for issue #1985. The unit tests around `validateForm` only prove that
 * errors are *stored* per instance — these stories prove the right instance actually *displays* the
 * error, which additionally requires the rendered instance index and the QuestionnaireResponse
 * instance index to agree.
 */
const meta = {
  title: 'Testing/Repeat Instance Validation',
  component: BuildFormWrapperForStorybook,
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Indices of rendered elements whose text contains the required-field message */
function indicesShowingRequiredFeedback(elements: Element[]): number[] {
  return elements.flatMap((element, index) =>
    element.textContent?.includes(REQUIRED_FEEDBACK) ? [index] : []
  );
}

export const RepeatGroupOnlyInvalidInstanceShowsError: Story = {
  args: {
    questionnaire: qRepeatGroupWithRequiredChild,
    questionnaireResponse: qrRepeatGroupSecondInstanceInvalid
  },
  play: async ({ canvasElement }) => {
    // Both instances render a `contact-name` field, in instance order
    await waitFor(() => {
      expect(
        canvasElement.querySelectorAll(
          '[data-test="q-item-string-box"][data-linkid="contact-name"]'
        )
      ).toHaveLength(2);
    });

    questionnaireResponseStore.getState().highlightRequiredItems();

    await waitFor(() => {
      const nameFields = Array.from(
        canvasElement.querySelectorAll(
          '[data-test="q-item-string-box"][data-linkid="contact-name"]'
        )
      );

      // Only the second instance is missing its required answer
      expect(indicesShowingRequiredFeedback(nameFields)).toEqual([1]);
    });
  }
};

export const GTableRowIndexShiftsWhenARowIsDeselected: Story = {
  args: {
    questionnaire: qGTableWithRequiredColumn,
    questionnaireResponse: qrGTableThirdRowInvalid
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvasElement.querySelectorAll('tbody tr')).toHaveLength(3);
    });

    // Deselecting the first row drops it from the QuestionnaireResponse, so the third rendered row
    // becomes instance 1 in the QR even though it is still rendered at row index 2
    const rowCheckboxes = await canvas.findAllByLabelText(/^select row/i);
    fireEvent.click(rowCheckboxes[0]);

    await waitFor(() => {
      const peopleItems = questionnaireResponseStore
        .getState()
        .updatableResponse.item?.filter((item) => item.linkId === 'people');
      expect(peopleItems).toHaveLength(2);
    });

    questionnaireResponseStore.getState().highlightRequiredItems();

    await waitFor(() => {
      const rows = Array.from(canvasElement.querySelectorAll('tbody tr'));

      // The error must stay on the row that is actually missing its required answer, not shift to
      // the row that now occupies its old QuestionnaireResponse index
      expect(indicesShowingRequiredFeedback(rows)).toEqual([2]);
    });
  }
};
