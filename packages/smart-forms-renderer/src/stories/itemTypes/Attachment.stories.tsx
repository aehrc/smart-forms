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

import { getAnswers, inputFile, questionnaireFactory } from '../testUtils';
import { expect, fireEvent, screen } from 'storybook/test';

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
const targetLinkId = 'file-attachment';
const targetText = 'File Attachment';

const qAttachmentBasic = questionnaireFactory([
  {
    linkId: targetLinkId,
    type: 'attachment',
    repeats: false,
    text: targetText
  }
]);

const url = 'http://example.com';
const name = 'Vladimir';
const fileName = 'foo.png';
const type = 'image/png';

export const AttachmentBasic: Story = {
  args: {
    questionnaire: qAttachmentBasic
  },
  play: async ({ canvasElement }) => {
    await inputFile(
      canvasElement,
      targetLinkId,
      [new File(['foo'], fileName, { type: type })],
      url,
      name
    );

    const result = await getAnswers(targetLinkId);
    expect(result).toHaveLength(1);
    expect(result[0].valueAttachment).toEqual(
      expect.objectContaining({ contentType: type, title: name, url: url })
    );

    // Clear value
    const clearButton = canvasElement.querySelector('span[aria-label="Remove file"] button');
    fireEvent.click(clearButton as HTMLElement);

    // Here we await for debounced store update
    await new Promise((resolve) => setTimeout(resolve, 500));
    const resultAfterClear = await getAnswers(targetLinkId);
    expect(resultAfterClear).toHaveLength(0);

    const elementAfterClear = await screen.findByText('No file selected');
    expect(elementAfterClear).toBeDefined();
  }
};
