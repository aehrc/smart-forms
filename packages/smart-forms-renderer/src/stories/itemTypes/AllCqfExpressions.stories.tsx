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
import { chooseSelectOption } from '@aehrc/testing-toolkit';
import { questionnaireFactory, variableExtFactory, сqfExpressionFactory } from '../testUtils';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'ItemType/CqfExpressionScenario',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

const displayTargetLinkId = 'gender-controller';
const genderTargetCoding = {
  system: 'http://hl7.org/fhir/administrative-gender',
  code: 'Female',
  display: 'Female'
};
const qDisplayCalculation = questionnaireFactory(
  [
    {
      linkId: displayTargetLinkId,
      type: 'choice',
      answerOption: [
        {
          valueCoding: genderTargetCoding
        },
        {
          valueCoding: {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'Male',
            display: 'Male'
          }
        }
      ]
    },
    {
      linkId: 'gender-display',
      type: 'display',
      _text: {
        extension: [сqfExpressionFactory("'Gender: '+ %gender")]
      }
    }
  ],
  {
    extension: [
      variableExtFactory(
        'gender',
        `item.where(linkId = '${displayTargetLinkId}').answer.valueCoding.code`
      )
    ]
  }
);
const displayTargetText = 'Gender: ' + genderTargetCoding.display;

export const DisplayCalculation: Story = {
  args: {
    questionnaire: qDisplayCalculation
  },
  play: async ({ canvasElement }) => {
    await chooseSelectOption(canvasElement, displayTargetLinkId, genderTargetCoding.display);

    const element = within(canvasElement);
    expect(element.queryAllByText(displayTargetText)).toBeDefined();
  }
};
