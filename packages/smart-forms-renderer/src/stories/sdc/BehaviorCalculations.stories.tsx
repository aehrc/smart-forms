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
  qCalculatedExpressionCvdRiskCalculator,
  qInitialExpression,
  qLaunchContext,
  qVariable
} from '../assets/questionnaires';
import {
  calculatedExpressionExtFactory,
  questionnaireFactory,
  variableExtFactory
} from '../testUtils';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/9.1.3 Form Behavior Calculations',
  component: BuildFormWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const LaunchContext: Story = {
  args: {
    questionnaire: qLaunchContext
  }
};

export const Variable: Story = {
  args: {
    questionnaire: qVariable
  }
};

export const InitialExpression: Story = {
  args: {
    questionnaire: qInitialExpression
  }
};

const heightLinkId = 'patient-height';
const weightLinkId = 'patient-weight';
const bmiLinkIdCalc = 'bmi-result';
const bmiGroupLinkId = 'bmi-calculation';

const qCalculatedExpressionBMICalculator = questionnaireFactory([
  {
    linkId: bmiGroupLinkId,
    type: 'group',
    extension: [
      variableExtFactory('height', `item.where(linkId='${heightLinkId}').answer.value`),
      variableExtFactory('weight', `item.where(linkId='${weightLinkId}').answer.value`)
    ],
    item: [
      {
        linkId: heightLinkId,
        text: 'Height',
        type: 'decimal',
        readOnly: false
      },
      {
        linkId: weightLinkId,
        text: 'Weight',
        type: 'decimal',
        readOnly: false
      },
      {
        extension: [calculatedExpressionExtFactory('(%weight/((%height/100).power(2))).round(1)')],
        linkId: bmiLinkIdCalc,
        text: 'Value',
        type: 'decimal',
        readOnly: true
      }
    ]
  }
]);

export const CalculatedExpressionBMICalculator: Story = {
  args: {
    questionnaire: qCalculatedExpressionBMICalculator
  }
};

export const CalculatedExpressionCvdRiskCalculator: Story = {
  args: {
    questionnaire: qCalculatedExpressionCvdRiskCalculator
  }
};
