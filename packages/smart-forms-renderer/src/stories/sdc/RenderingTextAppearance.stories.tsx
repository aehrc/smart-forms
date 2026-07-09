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
import { expect, within } from 'storybook/test';
import BuildFormWrapperForStorybook from '../storybookWrappers/BuildFormWrapperForStorybook';
import {
  qDisplayCategoryInstructions,
  qHidden,
  qOpenLabel,
  qPrefixOnlyNoText,
  qRenderingAnswerOptionValueString,
  qRenderingMarkdownDisplay,
  qRenderingMarkdownPrefix,
  qRenderingMarkdownTitle,
  qRenderingStyleBooleanItem,
  qRenderingStylePrefix,
  qRenderingStyleTitle,
  qRenderingXhtmlBooleanItem,
  qRenderingXhtmlDisplayBase64ImageItem,
  qRenderingXhtmlDisplayListItem,
  qRenderingXhtmlGroupPropagationClassStyles,
  qRenderingXhtmlGroupPropagationInlineStyles,
  qRenderingXhtmlGroupPropagationNested,
  qRenderingXhtmlPrefix,
  qRenderingXhtmlTitle
} from '../assets/questionnaires';
import { createStory } from '../storybookWrappers/createStory';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/9.1.1 Rendering > Text Appearance',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const RenderingStyleBoolean: Story = createStory({
  args: {
    questionnaire: qRenderingStyleBooleanItem
  }
}) as Story;

export const RenderingMarkdownDisplay: Story = createStory({
  args: {
    questionnaire: qRenderingMarkdownDisplay
  }
}) as Story;

export const RenderingXHTMLBoolean: Story = createStory({
  args: {
    questionnaire: qRenderingXhtmlBooleanItem
  }
}) as Story;

export const RenderingXHTMLDisplayList: Story = createStory({
  args: {
    questionnaire: qRenderingXhtmlDisplayListItem
  }
}) as Story;

export const RenderingXHTMLDisplayBase64Image: Story = createStory({
  args: {
    questionnaire: qRenderingXhtmlDisplayBase64ImageItem
  }
}) as Story;

export const RenderingXHTMLGroupPropagationNested: Story = createStory({
  args: {
    questionnaire: qRenderingXhtmlGroupPropagationNested
  }
}) as Story;

export const RenderingXHTMLGroupPropagationInlineStyles: Story = createStory({
  args: {
    questionnaire: qRenderingXhtmlGroupPropagationInlineStyles
  }
}) as Story;

export const RenderingXHTMLGroupPropagationClassStyles: Story = createStory({
  args: {
    questionnaire: qRenderingXhtmlGroupPropagationClassStyles
  }
}) as Story;

export const RenderingAnswerOptionValueString: Story = createStory({
  args: {
    questionnaire: qRenderingAnswerOptionValueString
  }
}) as Story;

export const DisplayCategoryInstructions: Story = createStory({
  args: {
    questionnaire: qDisplayCategoryInstructions
  },
  play: async ({ canvasElement }) => {
    const expectedText = 'Have not claimed a health check in the past nine months';
    const canvas = within(canvasElement);

    const instructionsTextElement = await canvas.findByText(expectedText, { exact: true });
    expect(instructionsTextElement.textContent).toBe(expectedText);

    const computedStyle = window.getComputedStyle(instructionsTextElement);
    expect(computedStyle.fontSize).toBe('12px');
    expect(computedStyle.fontWeight).toBe('500');
    expect(computedStyle.lineHeight).toBe('18px');
    expect(computedStyle.color).toBe('rgb(66, 66, 66)');
  }
}) as Story;

export const OpenLabel: Story = createStory({
  args: {
    questionnaire: qOpenLabel
  }
}) as Story;

export const Hidden: Story = createStory({
  args: {
    questionnaire: qHidden
  },
  play: async ({ canvasElement }) => {
    const expectedText = "If hidden works, you wouldn't see the question below!";
    const canvas = within(canvasElement);

    const displayTextElement = await canvas.findByText(expectedText, { exact: true });
    expect(displayTextElement.textContent).toBe(expectedText);

    expect(canvas.queryByText('Hidden string field', { exact: true })).toBeNull();
  }
}) as Story;

// ── Questionnaire.title rendering extensions (Issue #1794) ───────────────────

export const RenderingStyleTitle: Story = createStory({
  args: {
    questionnaire: qRenderingStyleTitle
  }
}) as Story;

export const RenderingMarkdownTitle: Story = createStory({
  args: {
    questionnaire: qRenderingMarkdownTitle
  }
}) as Story;

export const RenderingXHTMLTitle: Story = createStory({
  args: {
    questionnaire: qRenderingXhtmlTitle
  }
}) as Story;

// ── Questionnaire.item.prefix rendering extensions (Issue #1794) ─────────────

export const RenderingStylePrefix: Story = createStory({
  args: {
    questionnaire: qRenderingStylePrefix
  }
}) as Story;

export const RenderingMarkdownPrefix: Story = createStory({
  args: {
    questionnaire: qRenderingMarkdownPrefix
  }
}) as Story;

export const RenderingXHTMLPrefix: Story = createStory({
  args: {
    questionnaire: qRenderingXhtmlPrefix
  }
}) as Story;

export const PrefixOnlyNoText: Story = createStory({
  args: {
    questionnaire: qPrefixOnlyNoText
  }
}) as Story;
