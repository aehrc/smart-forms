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
import { qQuestionnaireItemTextHidden } from '../assets/questionnaires';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/Questionnaire Item Text Hidden Extension',
  component: BuildFormWrapperForStorybook,
  parameters: {
    docs: {
      description: {
        component: `
This story demonstrates the custom QuestionnaireItemTextHidden extension that allows hiding the text label of questionnaire items from the UI.

**Extension URL:** \`https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden\`

**Usage:**
- When \`valueBoolean: true\`, the item text is hidden from the UI
- When \`valueBoolean: false\` or extension is not present, the text is visible

**Benefits:**
- Hide internal fields that shouldn't be visible to users
- Create cleaner UI by hiding unnecessary labels
- Support use cases where field labels are not needed

This form shows three different scenarios:
1. Normal field - Text is visible (no extension)
2. Hidden field - Text is hidden (extension: true)
3. Visible field - Text is visible (extension: false)
4. Normal field - Text is visible (no extension)

**Note:** The extension must be placed in the \`_text.extension\` property of the questionnaire item, not the regular \`extension\` property.
        `
      }
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

export const QuestionnaireItemTextHiddenDemo: Story = {
  args: {
    questionnaire: qQuestionnaireItemTextHidden
  },
  parameters: {
    docs: {
      description: {
        story: `
This form demonstrates the QuestionnaireItemTextHidden extension in action:

**Patient Details Section:**
- **Full Name** - Normal field with visible text
- **Age** - Normal field with visible text  
- **Hidden Field** - Text is hidden (extension: true)
- **Visible Field** - Text is visible (extension: false)
- **Normal Field** - Text is visible (no extension)

**Medical History Section:**
- **List any medical conditions** - Normal field with visible text
- **Internal Note** - Text is hidden (extension: true)

**Try this:**
1. Notice that some fields appear without labels
2. The hidden fields still function normally for data entry
3. This is useful for internal fields that don't need user-facing labels
        `
      }
    }
  }
};