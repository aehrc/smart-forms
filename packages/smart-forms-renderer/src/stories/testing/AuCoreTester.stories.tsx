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
import { createStory } from '../storybookWrappers/createStory';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Testing/AU Core Tester',
  component: PrePopWrapperForStorybook,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof PrePopWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const AuCoreAllergyIntolerance: Story = createStory({
  args: {
    questionnaire: QAuCoreAllergyIntolerance,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;

export const AuCoreCondition: Story = createStory({
  args: {
    questionnaire: QAuCoreCondition,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;

export const AuCoreEncounter: Story = createStory({
  args: {
    questionnaire: QAuCoreEncounter,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;

export const AuCoreImmunization: Story = createStory({
  args: {
    questionnaire: QAuCoreImmunization,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;

export const AuCoreMedicationRequest: Story = createStory({
  args: {
    questionnaire: QAuCoreMedicationRequest,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;

export const AuCorePatient: Story = createStory({
  args: {
    questionnaire: QAuCorePatient,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;

export const AuCorePractitioner: Story = createStory({
  args: {
    questionnaire: QAuCorePractitioner,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;

export const AuCorePractitionerRole: Story = createStory({
  args: {
    questionnaire: QAuCorePractitionerRole,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;

export const AuCoreProcedure: Story = createStory({
  args: {
    questionnaire: QAuCoreProcedure,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;

export const AuCoreObservationBP: Story = createStory({
  args: {
    questionnaire: QAuCoreObservationBP,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;

export const AuCoreObservationBodyHeight: Story = createStory({
  args: {
    questionnaire: QAuCoreObservationBodyHeight,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;

export const AuCoreObservationBodyWeight: Story = createStory({
  args: {
    questionnaire: QAuCoreObservationBodyWeight,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;

export const AuCoreObservationHeartRate: Story = createStory({
  args: {
    questionnaire: QAuCoreObservationHeartRate,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;
export const AuCoreObservationRespirationRate: Story = createStory({
  args: {
    questionnaire: QAuCoreObservationRespirationRate,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;

export const AuCoreObservationSmokingStatus: Story = createStory({
  args: {
    questionnaire: QAuCoreObservationSmokingStatus,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;

export const AuCoreObservationWaistCircumference: Story = createStory({
  args: {
    questionnaire: QAuCoreObservationWaistCircumference,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  }
}) as Story;
