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
  qChoiceOrientation,
  qCollapsibleGroupDefaultClosed,
  qCollapsibleGroupDefaultOpen,
  qCollapsibleGroupNested,
  qCollapsibleSingleDefaultClosed,
  qCollapsibleSingleDefaultOpen,
  qItemControl,
  qSliderStepValue,
  qWidthGrid,
  qWidthGTable
} from '../assets/questionnaires';
import { createStory } from '../storybookWrappers/createStory';
import {
  chooseSliderValue,
  findByLinkIdOrLabel,
  getAnswers,
  queryByLinkIdOrLabel
} from '../testUtils';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/9.1.2 Rendering > Control Appearance',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const ItemControl: Story = createStory({
  args: {
    questionnaire: qItemControl
  }
}) as Story;

export const ChoiceOrientation: Story = createStory({
  args: {
    questionnaire: qChoiceOrientation
  }
}) as Story;

export const SliderStepValue: Story = createStory({
  args: {
    questionnaire: qSliderStepValue
  },
  play: async ({ canvasElement }) => {
    await chooseSliderValue(canvasElement, 'pain-measure', 5);

    const answers = await getAnswers('pain-measure');
    expect(answers).toEqual([expect.objectContaining({ valueInteger: 5 })]);
  }
}) as Story;

export const WidthGTable: Story = createStory({
  args: {
    questionnaire: qWidthGTable
  }
}) as Story;

export const WidthGrid: Story = createStory({
  args: {
    questionnaire: qWidthGrid
  }
}) as Story;

export const CollapsibleSingleDefaultOpen: Story = createStory({
  args: {
    questionnaire: qCollapsibleSingleDefaultOpen
  },
  play: async ({ canvasElement }) => {
    const detailsLinkId = 'details-working';

    const page = within(canvasElement);
    const toggle = await waitFor(() => {
      const buttons = page.queryAllByRole('button');
      const collapsibleToggle = buttons.find((button) => button.hasAttribute('aria-expanded'));
      if (!collapsibleToggle) {
        throw new Error('Collapsible toggle button not found on page');
      }
      return collapsibleToggle;
    });
    await findByLinkIdOrLabel(canvasElement, detailsLinkId);

    fireEvent.click(toggle);
    await waitFor(() => {
      expect(queryByLinkIdOrLabel(canvasElement, detailsLinkId)).toBeNull();
    });

    fireEvent.click(toggle);
    await findByLinkIdOrLabel(canvasElement, detailsLinkId);
  }
}) as Story;

export const CollapsibleSingleDefaultClosed: Story = createStory({
  args: {
    questionnaire: qCollapsibleSingleDefaultClosed
  },
  play: async ({ canvasElement }) => {
    const detailsLinkId = 'details-working';

    const page = within(canvasElement);
    const toggle = await waitFor(() => {
      const buttons = page.queryAllByRole('button');
      const collapsibleToggle = buttons.find((button) => button.hasAttribute('aria-expanded'));
      if (!collapsibleToggle) {
        throw new Error('Collapsible toggle button not found on page');
      }
      return collapsibleToggle;
    });
    expect(queryByLinkIdOrLabel(canvasElement, detailsLinkId)).toBeNull();

    fireEvent.click(toggle);
    await findByLinkIdOrLabel(canvasElement, detailsLinkId);

    fireEvent.click(toggle);
    await waitFor(() => {
      expect(queryByLinkIdOrLabel(canvasElement, detailsLinkId)).toBeNull();
    });
  }
}) as Story;

export const CollapsibleGroupDefaultOpen: Story = createStory({
  args: {
    questionnaire: qCollapsibleGroupDefaultOpen
  },
  play: async ({ canvasElement }) => {
    const heightLinkId = 'patient-height';

    const groupBlock = await findByLinkIdOrLabel(canvasElement, 'bmi-collapsible');
    const toggle = within(groupBlock).getByRole('button');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await findByLinkIdOrLabel(canvasElement, heightLinkId);

    fireEvent.click(toggle);
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
    await waitFor(() => {
      expect(queryByLinkIdOrLabel(canvasElement, heightLinkId)).toBeNull();
    });

    fireEvent.click(toggle);
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });
    await findByLinkIdOrLabel(canvasElement, heightLinkId);
  }
}) as Story;

export const CollapsibleGroupDefaultClosed: Story = createStory({
  args: {
    questionnaire: qCollapsibleGroupDefaultClosed
  },
  play: async ({ canvasElement }) => {
    const heightLinkId = 'patient-height';

    const groupBlock = await findByLinkIdOrLabel(canvasElement, 'bmi-collapsible');
    const toggle = within(groupBlock).getByRole('button');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(queryByLinkIdOrLabel(canvasElement, heightLinkId)).toBeNull();

    fireEvent.click(toggle);
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });
    await findByLinkIdOrLabel(canvasElement, heightLinkId);

    fireEvent.click(toggle);
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
    await waitFor(() => {
      expect(queryByLinkIdOrLabel(canvasElement, heightLinkId)).toBeNull();
    });
  }
}) as Story;

export const CollapsibleGroupNested: Story = createStory({
  args: {
    questionnaire: qCollapsibleGroupNested
  },
  play: async ({ canvasElement }) => {
    const streetLinkId = '2fee2d51-7828-4178-b8c1-35edd32ba338';

    const page = within(canvasElement);
    const toggle = await waitFor(() => {
      const buttons = page
        .queryAllByRole('button')
        .filter((button) => button.hasAttribute('aria-expanded'));
      const secondToggle = buttons[1];
      if (!secondToggle) {
        throw new Error('Second collapsible toggle button not found on page');
      }
      return secondToggle;
    });

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await findByLinkIdOrLabel(canvasElement, streetLinkId);

    fireEvent.click(toggle);
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
    await waitFor(() => {
      expect(queryByLinkIdOrLabel(canvasElement, streetLinkId)).toBeNull();
    });

    fireEvent.click(toggle);
    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });
    await findByLinkIdOrLabel(canvasElement, streetLinkId);
  }
}) as Story;
