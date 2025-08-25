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
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';

import { questionnaireFactory } from '../testUtils';
import { inputFile } from '@aehrc/testing-toolkit';
import { expect, fireEvent, within, screen } from 'storybook/test';
import { waitFor } from 'storybook/internal/test';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'ItemType/Attachment',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
const targetlinkId = 'file-attachment'
const targetText = 'File Attachment'

const qAttachmentBasic = questionnaireFactory([{
  linkId: targetlinkId,
  type: 'attachment',
  repeats: false,
  text: targetText
}])

const url = 'hhtp://world_of_warcraft.com'
const name = 'Vladimir'
const fileName = 'foo.png'


export const AttachmentBasic: Story = {
  args: {
    questionnaire: qAttachmentBasic
  },
  play: async ({ canvasElement }) => {
    await inputFile(
      canvasElement,
      targetlinkId,
      [new File(['foo'], fileName, { type: "image/png" })],
      [url, name]
    );

    const canvas = within(canvasElement);
    expect(canvas.getByText(fileName)).toBeDefined();
    expect(canvas.getByText(url)).toBeDefined();
    expect(canvas.getByText(name)).toBeDefined();

    const button = canvasElement.querySelector('button');
    fireEvent.click(button as HTMLElement);

    await waitFor(() =>
      expect(screen.queryByText(fileName)).not.toBeInTheDocument()
    );
  }
};