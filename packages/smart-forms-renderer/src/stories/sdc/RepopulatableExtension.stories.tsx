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
import { qRepopulatableExtension } from '../assets/questionnaires';
import { mockFhirClient } from '../assets/fhirClient/mockFhirClient';
import { patSmartForm } from '../assets/patients/PatSmartForm';
import { pracPrimaryPeter } from '../assets/practitioners/PracPrimaryPeter';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/Questionnaire Initial Expression Repopulatable Extension',
  component: PrePopWrapperForStorybook,
  parameters: {
    docs: {
      description: {
        component: `
This story demonstrates the custom questionnaire-initialExpression-repopulatable extension that allows individual fields to be manually repopulated with fresh data from the FHIR server.

**Extension URL:** \`https://smartforms.csiro.au/ig/StructureDefinition/questionnaire-initialExpression-repopulatable\`

**Usage:**
- When \`valueCode: 'manual'\`, a sync button appears next to the field
- The field must also have an \`initialExpression\` extension to be repopulatable
- Clicking the sync button will re-evaluate the initial expression and update the field value

**Benefits:**
- Granular repopulation of individual fields without affecting the entire form
- Allows users to refresh specific data points when needed
- Provides fine-grained control over data synchronization

**Requirements:**
- The field must have both \`initialExpression\` and \`questionnaire-initialExpression-repopulatable\` extensions
- The \`questionnaire-initialExpression-repopulatable\` extension must have \`valueCode: 'manual'\`
- The form must be pre-populated to see the repopulate buttons

This form shows several fields with repopulate buttons:
1. Patient Name - Repopulated from patient data
2. Patient Age - Calculated from birth date
3. Patient Gender - From patient gender field
4. BMI - Static value (for demonstration)
5. Blood Pressure - Static value (for demonstration)
6. Normal Field - Has initial expression but no repopulate button
        `
      }
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof PrePopWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RepopulatableExtensionDemo: Story = {
  args: {
    questionnaire: qRepopulatableExtension,
    fhirClient: mockFhirClient,
    patient: patSmartForm,
    user: pracPrimaryPeter
  },
  parameters: {
    docs: {
      description: {
        story: `
This form demonstrates the questionnaire-initialExpression-repopulatable extension in action:

**Patient Information Section:**
- **Patient Name** - Shows sync button, repopulates from patient data
- **Patient Age** - Shows sync button, calculates age from birth date
- **Patient Gender** - Shows sync button, repopulates from patient gender

**Medical Information Section:**
- **BMI** - Shows sync button, repopulates with static value
- **Blood Pressure** - Shows sync button, repopulates with static value
- **Normal Field** - No sync button (has initial expression but no repopulate extension)

**Try this:**
1. Click the "Pre-populate" button to populate the form with initial data
2. Notice the sync buttons (🔄) appear next to repopulatable fields
3. Modify some field values manually
4. Click the sync buttons to repopulate individual fields
5. Notice that only the clicked field gets updated, not the entire form

**Note:** The repopulate buttons only appear after the form has been pre-populated and the fields have initial expressions with the repopulatable extension.
        `
      }
    }
  }
};