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
  QAuCoreMedicationRequest,
  QAuCoreObservationBodyHeight,
  QAuCoreObservationBodyWeight,
  QAuCoreObservationBP,
  QAuCoreObservationHeartRate,
  QAuCoreObservationRespirationRate,
  QAuCoreObservationSmokingStatus,
  QAuCoreObservationWaistCircumference,
  QAuCorePatient,
  QAuCorePractitioner,
  QAuCorePractitionerRole,
  QAuCoreProcedure
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

export const AuCorePatient: Story = {
  args: {
    questionnaire: QAuCorePatient,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const AuCorePractitioner: Story = {
  args: {
    questionnaire: QAuCorePractitioner,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const AuCorePractitionerRole: Story = {
  args: {
    questionnaire: QAuCorePractitionerRole,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const AuCoreProcedure: Story = {
  args: {
    questionnaire: QAuCoreProcedure,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const AuCoreObservationBP: Story = {
  args: {
    questionnaire: QAuCoreObservationBP,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const AuCoreObservationBodyHeight: Story = {
  args: {
    questionnaire: QAuCoreObservationBodyHeight,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const AuCoreObservationBodyWeight: Story = {
  args: {
    questionnaire: QAuCoreObservationBodyWeight,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const AuCoreObservationHeartRate: Story = {
  args: {
    questionnaire: QAuCoreObservationHeartRate,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};
export const AuCoreObservationRespirationRate: Story = {
  args: {
    questionnaire: QAuCoreObservationRespirationRate,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const AuCoreObservationSmokingStatus: Story = {
  args: {
    questionnaire: QAuCoreObservationSmokingStatus,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};

export const AuCoreObservationWaistCircumference: Story = {
  args: {
    questionnaire: QAuCoreObservationWaistCircumference,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
};
