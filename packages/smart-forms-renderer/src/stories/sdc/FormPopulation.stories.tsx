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
import PrePopWrapper from '../PrePopWrapper';
import { qInitialExpressionBasic } from '../assets/questionnaires/QFormPopulation';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'Component/SDC/12 Form Population',
  component: PrePopWrapper,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: []
} satisfies Meta<typeof PrePopWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

// Forms Server endpoint
const formsServerUrl = 'https://smartforms.csiro.au/api/fhir';

// EHR endpoint
const iss = 'https://proxy.smartforms.io/v/r4/fhir';

// This must be the same as defined in EHR
const clientId = 'smart-forms-storybook';

// This must be the same as defined in EHR
const scope =
  'fhirUser online_access openid profile patient/Condition.rs patient/Observation.rs launch patient/Encounter.rs patient/Patient.rs';

// This must be a patient ID that exists in the EHR
const patientId = 'pat-sf';

// This must be a practitioner ID that exists in the EHR
const userId = 'primary-peter';

export const InitialExpression: Story = {
  args: {
    questionnaire: qInitialExpressionBasic,
    formsServerUrl,
    iss,
    clientId,
    scope,
    patientId,
    userId
  }
};
