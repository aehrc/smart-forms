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
import { createStory } from '../storybookWrappers/createStory';

import {
  chooseSelectOption,
  questionnaireFactory,
  variableExtFactory,
  сqfExpressionFactory
} from '../testUtils';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/10.1.3 Behavior > Calculations/CqfExpression Calculations',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

/* Basic */
const targetLinkId = 'gender-controller';
const targetCoding = {
  system: 'http://hl7.org/fhir/administrative-gender',
  code: 'Female',
  display: 'Female'
};
const targetDisplayCalc = 'Selected gender: ' + targetCoding.display;

const qDisplayCalculationBasic = questionnaireFactory(
  [
    {
      linkId: targetLinkId,
      type: 'choice',
      text: 'Gender',
      answerOption: [
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'female',
            display: 'Female'
          }
        },
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'male',
            display: 'Male'
          }
        },
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'other',
            display: 'Other'
          }
        },
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'unknown',
            display: 'Unknown'
          }
        }
      ]
    },
    {
      linkId: 'gender-display',
      type: 'display',
      _text: {
        extension: [сqfExpressionFactory("'Selected gender: '+ %gender")]
      }
    }
  ],
  {
    extension: [
      variableExtFactory('gender', `item.where(linkId = '${targetLinkId}').answer.valueCoding.code`)
    ]
  }
);

export const DisplayCalculationBasic: Story = createStory({
  args: {
    questionnaire: qDisplayCalculationBasic
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, targetLinkId, targetCoding.display);

    const element = within(canvasElement);
    expect(element.queryAllByText(targetDisplayCalc)).toBeDefined();
  }
}) as Story;

/* Styled */
const qDisplayCalculationStyled = structuredClone(qDisplayCalculationBasic);
qDisplayCalculationStyled.item[1]._text.extension.push({
  url: 'http://hl7.org/fhir/StructureDefinition/rendering-style',
  valueString: 'margin-bottom: 1rem; font-size: 0.875rem; color: #2E7D32; font-weight: 700;'
});

export const DisplayCalculationStyled: Story = createStory({
  args: {
    questionnaire: qDisplayCalculationStyled
  }
}) as Story;
