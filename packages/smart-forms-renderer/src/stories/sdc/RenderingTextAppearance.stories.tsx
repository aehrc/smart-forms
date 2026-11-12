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
  qRenderingXhtmlTitle,
  qWrappingItemLabels
} from '../assets/questionnaires';
import { createStory } from '../storybookWrappers/createStory';
import { expect } from 'storybook/test';

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

// ── Wrapping item labels (Issue #2048) ───────────────────────────────────────

export const WrappingItemLabels: Story = createStory({
  args: {
    questionnaire: qWrappingItemLabels
  },
  play: async ({ canvasElement }) => {
    // Client rects of every glyph run inside an element, top-most first. Ranges over the element
    // itself are no good here - they also report zero-width rects for the empty inlines that xhtml
    // rendering introduces, which sit above the text they wrap.
    function getTextLineTops(element: Element): number[] {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const tops = new Set<number>();

      let textNode = walker.nextNode();
      while (textNode) {
        if (textNode.textContent?.trim()) {
          const range = document.createRange();
          range.selectNodeContents(textNode);
          for (const rect of range.getClientRects()) {
            if (rect.height > 0 && rect.width > 0) {
              tops.add(rect.top);
            }
          }
        }
        textNode = walker.nextNode();
      }

      return [...tops].sort((a, b) => a - b);
    }

    // A label that wraps onto multiple lines must still start at the top of its row, in line with
    // its field, rather than being pushed below it.
    for (const linkId of [
      'wrapping-label-plain',
      'wrapping-label-xhtml',
      'wrapping-label-string'
    ]) {
      const row = canvasElement.querySelector(`[data-linkid="${linkId}"]`);
      if (!row) {
        throw new Error(`Row was not found for [data-linkid="${linkId}"]`);
      }

      const label = row.querySelector(`#label-${linkId}`);
      if (!label) {
        throw new Error(`Label was not found for #label-${linkId}`);
      }

      const lineTops = getTextLineTops(label);

      // Confirm the label actually wraps, otherwise this story isn't testing anything
      expect(lineTops.length).toBeGreaterThan(1);

      // Only ItemLabel's 4px nudge and the line's half-leading may sit above the first line of text
      const offsetFromRowTop = lineTops[0] - row.getBoundingClientRect().top;
      expect(offsetFromRowTop).toBeLessThanOrEqual(12);
    }
  }
}) as Story;
