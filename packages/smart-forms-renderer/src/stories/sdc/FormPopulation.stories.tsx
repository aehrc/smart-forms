/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import type { Meta, StoryObj } from '@storybook/react';
import PrePopWrapperForStorybook from '../storybookWrappers/PrePopWrapperForStorybook';
import {
  qCalculatedExpressionBMICalculatorPrepop,
  qCalculatedExpressionCvdRiskCalculatorPrepop,
  qInitialExpressionBasic,
  qItemPopulationContextHomeAddress,
  qItemPopulationContextMedicalHistory,
  qSourceQueriesBMICalculator
} from '../assets/questionnaires/QFormPopulation';
import { mockFhirClient } from '../assets/fhirClient/mockFhirClient';
import { patSmartForm } from '../assets/patients/PatSmartForm';
import { pracPrimaryPeter } from '../assets/practitioners/PracPrimaryPeter';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Component/SDC/12 Form Population',
  component: PrePopWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof PrePopWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const InitialExpression: Story = {
  args: {
    questionnaire: qInitialExpressionBasic,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const CalculatedExpressionBMICalculatorPrepop: Story = {
  args: {
    questionnaire: qCalculatedExpressionBMICalculatorPrepop,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const CalculatedExpressionCvdRiskCalculatorPrepop: Story = {
  args: {
    questionnaire: qCalculatedExpressionCvdRiskCalculatorPrepop,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const ItemPopulationContextHomeAddress: Story = {
  args: {
    questionnaire: qItemPopulationContextHomeAddress,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const ItemPopulationContextMedicalHistory: Story = {
  args: {
    questionnaire: qItemPopulationContextMedicalHistory,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const SourceQueriesBMICalculator: Story = {
  args: {
    questionnaire: qSourceQueriesBMICalculator,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};
