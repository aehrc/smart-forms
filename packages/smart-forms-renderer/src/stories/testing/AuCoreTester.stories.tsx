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
import { mockFhirClient } from '../assets/fhirClient/mockFhirClient';
import { patSmartForm } from '../assets/patients/PatSmartForm';
import { pracPrimaryPeter } from '../assets/practitioners/PracPrimaryPeter';
import {
  QAuCoreAllergyIntolerance,
  QAuCoreCondition,
  QAuCoreEncounter,
  QAuCoreImmunization,
  QAuCoreMedicationRequest
} from '../assets/questionnaires/QAuCoreTesting';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Component/Testing/AU Core Tester',
  component: PrePopWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof PrePopWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const AuCoreAllergyIntolerance: Story = {
  args: {
    questionnaire: QAuCoreAllergyIntolerance,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const AuCoreCondition: Story = {
  args: {
    questionnaire: QAuCoreCondition,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const AuCoreEncounter: Story = {
  args: {
    questionnaire: QAuCoreEncounter,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const AuCoreImmunization: Story = {
  args: {
    questionnaire: QAuCoreImmunization,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const AuCoreMedicationRequest: Story = {
  args: {
    questionnaire: QAuCoreMedicationRequest,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};
