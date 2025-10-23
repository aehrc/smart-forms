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
import { qNestedRepeatQuestionnaire, qNestedRepeatQuestionnaireWithInitial } from '../assets/questionnaires/QNestedRepeatTester';
import { getAnswers, inputText } from '../testUtils';
import { expect } from 'storybook/test';

const parentLinkId = 'parent';
const childZeroLinkId = 'child-0';
const childOneLinkId = 'child-1';

// Helper function to get nested item by linkId
function getNestedItem(parentAnswer: any, linkId: string) {
  return parentAnswer.item?.find((item: any) => item.linkId === linkId);
}

// Helper function to get nested item's answer value
function getNestedItemValue(parentAnswer: any, linkId: string) {
  const item = getNestedItem(parentAnswer, linkId);
  return item?.answer?.[0];
}

// Helper function to validate nested item structure
function validateNestedItem(
  parentAnswer: any,
  linkId: string,
  expectedValue: number,
  expectedText: string
) {
  const item = getNestedItem(parentAnswer, linkId);
  
  expect(item).toBeDefined();
  expect(item.linkId).toBe(linkId);
  expect(item.text).toBe(expectedText);
  expect(item.answer).toHaveLength(1);
  expect(item.answer[0].valueDecimal).toBe(expectedValue);
}

function validateNestedStringItem(
  parentAnswer: any,
  linkId: string,
  expectedValue: string,
  expectedText: string
) {
  const item = getNestedItem(parentAnswer, linkId);
  
  expect(item).toBeDefined();
  expect(item.linkId).toBe(linkId);
  expect(item.text).toBe(expectedText);
  expect(item.answer).toHaveLength(1);
  expect(item.answer[0].valueString).toBe(expectedValue);
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Testing/Nested Repeat Items',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const NestedRepeatItems: Story = {
  args: {
    questionnaire: qNestedRepeatQuestionnaire
  },
  play: async ({ canvasElement }) => {
    // Input values
    await inputText(canvasElement, parentLinkId, '1');
    await inputText(canvasElement, childZeroLinkId, '2');
    await inputText(canvasElement, childOneLinkId, '3');

    // Get the parent answer
    const answers = await getAnswers(parentLinkId);

    // Validate we have one parent answer
    expect(answers).toHaveLength(1);
    const parentAnswer = answers[0];

    // Validate parent level valueDecimal
    expect(parentAnswer.valueDecimal).toBe(1);

    // Validate parent has nested items
    expect(parentAnswer.item).toBeDefined();
    expect(parentAnswer.item).toHaveLength(2);

    // Validate child-0
    validateNestedItem(parentAnswer, childZeroLinkId, 2, 'Nested 0');

    // Validate child-1
    validateNestedItem(parentAnswer, childOneLinkId, 3, 'Nested 1');

    // Alternative: Direct value checks if you don't need full validation
    const childZeroValue = getNestedItemValue(parentAnswer, childZeroLinkId);
    const childOneValue = getNestedItemValue(parentAnswer, childOneLinkId);
    
    expect(childZeroValue?.valueDecimal).toBe(2);
    expect(childOneValue?.valueDecimal).toBe(3);
    debugger;
  }
};

export const NestedRepeatItemsWithInitial: Story = {
  args: {
    questionnaire: qNestedRepeatQuestionnaireWithInitial
  },
  play: async ({}) => {
    
    // Get the parent answers - should have 2 initial answers
  const answers = await getAnswers('parent-decimal');

  // Validate we have two parent answers (from initial values)
  expect(answers).toHaveLength(2);

  // Validate first parent answer
  const firstParentAnswer = answers[0];
  expect(firstParentAnswer.valueDecimal).toBe(1);
  expect(firstParentAnswer.item).toBeDefined();
  expect(firstParentAnswer.item).toHaveLength(1);

  validateNestedStringItem(firstParentAnswer, 'child-string', 'child value', 'Child string with initial');

  const secondParentAnswer = answers[1];
  expect(secondParentAnswer.valueDecimal).toBe(2);
  expect(secondParentAnswer.item).toBeDefined();
  expect(secondParentAnswer.item).toHaveLength(1);

  validateNestedStringItem(secondParentAnswer, 'child-string', 'child value', 'Child string with initial');

  }
};