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
import { qGroupHideAddItemButton } from '../assets/questionnaires';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'SDC/Group Hide Add Item Button Extension',
  component: BuildFormWrapperForStorybook,
  parameters: {
    docs: {
      description: {
        component: `
This story demonstrates the custom GroupHideAddItemButton extension that allows hiding the "Add Item" button for repeating groups and group tables.

**Extension URL:** \`https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton\`

**Usage:**
- When \`valueBoolean: true\`, the Add Item/Add Row button is hidden
- When \`valueBoolean: false\` or extension is not present, the button is visible

**Benefits:**
- Prevents users from adding new rows/items to a Repeating Group or Group Table when not appropriate
- Supports use cases with static tables where users shouldn't be allowed to add new rows

This form shows four different scenarios:
1. Normal Repeating Group - Add Item button is visible
2. Repeating Group with Extension - Add Item button is hidden
3. Normal Group Table - Add Row button is visible  
4. Group Table with Extension - Add Row button is hidden
        `
      }
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof BuildFormWrapperForStorybook>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const GroupHideAddItemButtonDemo: Story = {
  args: {
    questionnaire: qGroupHideAddItemButton
  }
}; 